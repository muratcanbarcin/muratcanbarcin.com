import { APICallError, streamText, type ModelMessage } from "ai";
import { google, type GoogleLanguageModelOptions } from "@ai-sdk/google";
import type { ChatTurn, LocalizedString, PortfolioData } from "@/types";
import { portfolioData } from "@/data/portfolioData";
import {
  AI_FAILOVER_LOG,
  FALLBACK_MODEL_ID,
  PRIMARY_MODEL_ID,
  TIER2_QUOTA_ALERT,
  type AiModelId,
} from "@/lib/aiModels";
import { runAfterResponse } from "@/lib/background";
import { reserveTier2Slot } from "@/lib/quotaTracker";
import { insertChatLog, type ChatLogInsert } from "@/lib/supabase";
import { loadGithubPromptContext } from "@/services/githubService";
import { deliverTelegramAlert, formatChatAlert, sendTelegramAlert } from "@/services/telegramService";

/** Both model attempts share this wall-clock budget, kept below the route's `maxDuration` of 30s. */
export const CHAT_STREAM_BUDGET_MS = 26_000;
const FIRST_CHUNK_TIMEOUT_MS = 8_000;
const MAX_OUTPUT_TOKENS = 700;

/** Thinking tokens are billed against `maxOutputTokens` and delay the first visible token. */
const PROVIDER_OPTIONS = {
  google: { thinkingConfig: { thinkingLevel: "low" } } satisfies GoogleLanguageModelOptions,
};

export interface ModelStreamEvent {
  type: string;
  text?: string;
  error?: unknown;
  reason?: string;
}

export interface ModelTimeout {
  totalMs: number;
  firstChunkMs: number;
}

/** Visitor context recorded after the served stream finishes. Raw IP addresses are never included. */
export interface ChatAuditContext {
  sessionId: string;
  userPrompt: string;
  locale: string;
  ipHash: string | null;
}

export interface ModelStreamRequest {
  modelId: AiModelId;
  messages: readonly ModelMessage[];
  timeout: ModelTimeout;
  system: string;
  maxOutputTokens: number;
  onFinish?: (text: string) => void;
}

export interface OpenedModelStream {
  events: AsyncIterable<ModelStreamEvent>;
  /** Called once the first visible token is committed to the visitor. */
  markServed: () => void;
}

/** Opens a provider stream. Tests substitute this to simulate quota and transport failures. */
export type ModelStreamOpener = (request: ModelStreamRequest) => Promise<OpenedModelStream>;

export interface PortfolioChatStream {
  modelId: AiModelId;
  text: AsyncIterable<string>;
  failedOver: boolean;
  /** Present when the primary model failed and the lite model is serving the reply. */
  failover?: { status?: number; name?: string };
}

const CONSTRAINED_OUTPUT_TOKENS = 180;

/**
 * Dual-model fallback. The primary stream is probed until the first text token or a terminal
 * failure. Quota, rate-limit, timeout, and 5xx failures switch to the lite model before any
 * byte is written to the client, so the visitor only observes one continuous token stream.
 * The fallback only receives whatever remains of the shared budget, so a slow primary can
 * never push the request past the serverless execution limit.
 * Tier 2 usage is counted before that second attempt. At 85% of its daily cap the prompt
 * collapses to a short reply that points recruiters at email or Request Resume.
 */
export async function streamPortfolioChat(
  turns: readonly ChatTurn[],
  openStream: ModelStreamOpener = openGoogleModelStream,
  now: () => number = Date.now,
  audit?: ChatAuditContext,
): Promise<PortfolioChatStream> {
  const messages = toModelMessages(turns);
  const deadline = now() + CHAT_STREAM_BUDGET_MS;
  const system = await composeSystemPrompt();

  try {
    const served = await serveModel(PRIMARY_MODEL_ID, messages, system, MAX_OUTPUT_TOKENS, deadline, now, openStream, audit);
    return { ...served, failedOver: false };
  } catch (error) {
    if (!isFailoverError(error)) throw error;
    console.error(AI_FAILOVER_LOG);
    const quota = await reserveTier2Slot(new Date(now()));
    if (quota.shouldAlert) sendTelegramAlert(TIER2_QUOTA_ALERT);
    const constrained = quota.constrained ? `${system}\n\n${quotaGuardrail()}` : system;
    const tokens = quota.constrained ? CONSTRAINED_OUTPUT_TOKENS : MAX_OUTPUT_TOKENS;
    const served = await serveModel(FALLBACK_MODEL_ID, messages, constrained, tokens, deadline, now, openStream, audit);
    return { ...served, failedOver: true, failover: summarizeFailover(error) };
  }
}

export function budgetTimeout(deadline: number, current: number): ModelTimeout {
  const totalMs = Math.max(1_000, deadline - current);
  return { totalMs, firstChunkMs: Math.min(FIRST_CHUNK_TIMEOUT_MS, totalMs) };
}

export function isFailoverError(error: unknown): boolean {
  const status = readStatusCode(error);
  if (status === 408 || status === 429) return true;
  if (status !== undefined && status >= 500 && status <= 599) return true;

  if (!(error instanceof Error)) return false;
  if (error.name === "TimeoutError" || error.name === "AbortError") return true;

  const message = error.message.toLowerCase();
  return (
    message.includes("429") ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("rate-limit") ||
    message.includes("timeout") ||
    message.includes("timed out")
  );
}

export function createTokenStream(tokens: AsyncIterable<string>): ReadableStream<string> {
  const iterator = tokens[Symbol.asyncIterator]();
  return new ReadableStream<string>({
    async pull(controller) {
      try {
        const next = await iterator.next();
        if (next.done) {
          controller.close();
          return;
        }
        controller.enqueue(next.value);
      } catch (error) {
        controller.error(error);
      }
    },
    async cancel() {
      await iterator.return?.();
    },
  });
}

async function serveModel(
  modelId: AiModelId,
  messages: readonly ModelMessage[],
  system: string,
  maxOutputTokens: number,
  deadline: number,
  now: () => number,
  openStream: ModelStreamOpener,
  audit: ChatAuditContext | undefined,
): Promise<Omit<PortfolioChatStream, "failedOver" | "failover">> {
  const opened = await openStream({
    modelId,
    messages,
    system,
    maxOutputTokens,
    timeout: budgetTimeout(deadline, now()),
    onFinish: (text) => {
      if (!audit || !text.trim()) return;
      runAfterResponse(recordCompletedChat({ ...audit, aiResponse: text, modelUsed: modelId }));
    },
  });
  const text = await commitTextStream(opened.events);
  opened.markServed();
  return { modelId, text };
}

async function composeSystemPrompt(): Promise<string> {
  try {
    const repositoryContext = await loadGithubPromptContext();
    const base = buildSystemPrompt(portfolioData);
    return repositoryContext ? `${base}\n\n${repositoryContext}` : base;
  } catch (error) {
    console.warn("[GitHub] Prompt enrichment skipped.", error);
    return buildSystemPrompt(portfolioData);
  }
}

function quotaGuardrail(): string {
  const email = portfolioData.contact.email;
  return [
    "QUOTA GUARDRAIL (active)",
    "Daily Tier-2 capacity is above 85%.",
    "Answer in under 80 words.",
    `Guide the recruiter to ${email} or the Request Resume button on this site.`,
    "Do not elaborate beyond that.",
  ].join("\n");
}

async function recordCompletedChat(entry: ChatLogInsert): Promise<void> {
  await insertChatLog(entry);
  await deliverTelegramAlert(
    formatChatAlert({ prompt: entry.userPrompt, model: entry.modelUsed, locale: entry.locale }),
  );
}

async function openGoogleModelStream(request: ModelStreamRequest): Promise<OpenedModelStream> {
  let served = false;
  let finished: string | null = null;

  const flush = () => {
    if (!served || finished === null) return;
    const text = finished;
    finished = null;
    request.onFinish?.(text);
  };

  const result = streamText({
    model: google(request.modelId),
    system: request.system,
    messages: [...request.messages],
    maxRetries: 0,
    maxOutputTokens: request.maxOutputTokens,
    timeout: request.timeout,
    providerOptions: PROVIDER_OPTIONS,
    onFinish: (event) => {
      finished = event.text ?? "";
      flush();
    },
  });

  return {
    events: result.stream,
    markServed: () => {
      served = true;
      flush();
    },
  };
}

/**
 * Reads provider events until the first visible token. Errors and aborts before that token
 * reject the promise so the caller can open the fallback model without flushing a partial reply.
 */
async function commitTextStream(source: AsyncIterable<ModelStreamEvent>): Promise<AsyncIterable<string>> {
  const iterator = source[Symbol.asyncIterator]();
  const buffered: string[] = [];

  while (true) {
    const step = await iterator.next();
    if (step.done) return replay(buffered, iterator);

    const part = step.value;
    if (part.type === "error") throw part.error;
    if (part.type === "abort") {
      const timeout = new Error(part.reason ?? "timeout");
      timeout.name = "TimeoutError";
      throw timeout;
    }
    if (part.type === "text-delta" && part.text) {
      buffered.push(part.text);
      return replay(buffered, iterator);
    }
  }
}

function replay(
  buffered: readonly string[],
  iterator: AsyncIterator<ModelStreamEvent>,
): AsyncIterable<string> {
  return {
    async *[Symbol.asyncIterator]() {
      yield* buffered;
      while (true) {
        const step = await iterator.next();
        if (step.done) return;
        const part = step.value;
        if (part.type === "text-delta" && part.text) yield part.text;
        if (part.type === "error") throw part.error;
      }
    },
  };
}

function summarizeFailover(error: unknown): { status?: number; name?: string } {
  const status = readStatusCode(error);
  const name = error instanceof Error ? error.name : undefined;
  return { status, name };
}

function readStatusCode(error: unknown): number | undefined {
  if (APICallError.isInstance(error)) return error.statusCode;
  if (typeof error === "object" && error !== null && "statusCode" in error) {
    const status = error.statusCode;
    if (typeof status === "number") return status;
  }
  return undefined;
}

function toModelMessages(turns: readonly ChatTurn[]): ModelMessage[] {
  return turns.map((turn) => ({ role: turn.role, content: turn.content }));
}

function bilingual(value: LocalizedString): string {
  return `${value.en} / ${value.tr}`;
}

function buildSystemPrompt(data: PortfolioData): string {
  const email = data.contact.email;
  const lines: string[] = [
    "You are MCB.ai, the official technical AI assistant representing Murat Can Barçin (Software Engineer - Backend & AI).",
    "- Identify only as MCB.ai. Never name or speculate about the underlying model, vendor, or provider; if asked, say you are MCB.ai, Murat Can's portfolio agent.",
    "",
    "IDENTITY & CORE ANCHOR (deductive hierarchy: reason from the apex down, never from a branch up)",
    "- Apex Title: Software Engineer (Backend & AI).",
    "- Core Engineering Foundations: architecting high-throughput distributed backend systems, modular microservices, relational/NoSQL database design, and end-to-end Applied AI engineering.",
    "",
    "SPECIALIZED BRANCHES",
    "1. Backend Engineering Domain:",
    "   - Enterprise solutions & legacy integrations (SAP workflows, multi-level corporate approvals as delivered at Sun Group).",
    "   - Identity & security architecture (Risk-Based Access Control (RBAC), automated SSO escalation).",
    "   - Resilient polyglot microservice ecosystems (Java Spring Boot & Python FastAPI).",
    "   - High-scale transaction handling and payment/subscription lifecycle APIs (Turkcell Sardis).",
    "2. Applied AI & Data Engineering Domain:",
    "   - Edge computing & IoT (Raspberry Pi 5 nodes, OpenCV real-time edge inference as a TEKNOFEST C4ISR finalist).",
    "   - Multi-source sensor & data fusion algorithms.",
    "   - Financial and access anomaly detection (Isolation Forest, XGBoost, SHAP, forensic reporting).",
    "   - LLM inference & optimization pipelines (QLoRA, Llama 3.1 8B fine-tuning, local agentic workflows).",
    "",
    "CONVERSATIONAL DIRECTIVES",
    "- Deliver structured, technically profound, and succinct responses: at most ~180 words unless the visitor explicitly asks for depth. Never meander; long prose risks client timeouts.",
    "- Use bullet points, **bold** key architectures, and cite concrete metrics from the context below.",
    "- Lead with the general Software Engineering / Backend & AI identity. Drill into Edge AI or Enterprise SAP only when the question is about them.",
    "- Backend questions (APIs, microservices, databases, scale, Java, Spring Boot) are answered from the Backend Engineering Domain first — Sun Group, Turkcell Sardis, Enterprise Agent for SSO — not from edge or IoT projects.",
    "- Strictly respect language parity: Turkish for Turkish queries, English for English queries.",
    "- Strictly bound your knowledge to Murat Can's education, enterprise experience, research, and project portfolio.",
    "- The site also offers a local shell inside this console: visitors can type /help, /projects, /exp, /skills, /whoami, or /resume. Mention it when a visitor asks how to navigate.",
    "- OUT-OF-SCOPE BOUNDARY: If a user asks general programming challenges, weather, politics, or unrelated queries, politely decline: 'I am specifically designed to answer inquiries regarding Murat Can Barçin's engineering career, backend systems, and AI portfolio. Would you like to know more about his work at Sun Group, Turkcell, or his Teknofest C4ISR system?'",
    "- When the visitor writes in Turkish, decline with the same boundary in Turkish: 'Murat Can Barçin'in mühendislik kariyeri, backend sistemleri ve yapay zeka portföyü hakkındaki soruları yanıtlamak için tasarlandım. Sun Group, Turkcell veya Teknofest C4ISR sistemi üzerindeki çalışmaları hakkında bilgi ister misiniz?'",
    `- Never hallucinate contact phone numbers or direct PDF links. If asked for a resume, guide the user to click the 'Request Resume' button, which opens an in-site request form.`,
    "- Do not invent employers, dates, metrics, publications, credentials, or coursework that are absent from the portfolio context below.",
    "",
    "PORTFOLIO CONTEXT",
    `Name: ${data.profile.name}`,
    `Headline: ${bilingual(data.profile.headline)}`,
    `Location: ${data.profile.location}`,
    `Summary: ${bilingual(data.profile.summary)}`,
    `Contact email: ${email}`,
    `Availability: ${bilingual(data.contact.availability)}`,
    "Resume delivery: there is no public phone number and no direct PDF URL. Use the Request Resume button; the contact email is for general inquiries.",
    "",
    "EDUCATION",
  ];

  for (const entry of data.education) {
    const honors = entry.honors ? ` | Honors: ${bilingual(entry.honors)}` : "";
    const courses = entry.coursework?.map((course) => bilingual(course)).join("; ");
    lines.push(
      `- ${entry.institution} | ${bilingual(entry.degree)} | ${entry.period} | GPA ${entry.gpa}/${entry.maxGpa}${honors}`,
    );
    if (courses) lines.push(`  Coursework: ${courses}`);
  }

  lines.push("", "EXPERIENCE");
  for (const experience of data.experiences) {
    lines.push(
      `- ${experience.company} (${experience.location}) | ${bilingual(experience.role)} | ${experience.type} | ${experience.period.start} → ${experience.period.end}`,
    );
    lines.push(`  EN: ${experience.highlights.en.join(" ")}`);
    lines.push(`  TR: ${experience.highlights.tr.join(" ")}`);
    if (experience.techStack.length > 0) lines.push(`  Stack: ${experience.techStack.join(", ")}`);
  }

  lines.push("", "PROJECTS");
  for (const project of data.projects) {
    lines.push(`- ${project.title} | ${bilingual(project.subtitle)} | ${project.status}`);
    lines.push(`  Summary: ${bilingual(project.summary)}`);
    lines.push(`  Detail EN: ${project.description.en}`);
    lines.push(`  Detail TR: ${project.description.tr}`);
    lines.push(`  Metrics: ${project.keyMetrics.map((metric) => bilingual(metric)).join("; ")}`);
    lines.push(`  Stack: ${project.techStack.join(", ")}`);
    if (project.architectureFlow.length > 0) {
      const flow = project.architectureFlow
        .map((stage) => `${stage.step}. ${stage.title} (${stage.technology})`)
        .join(" → ");
      lines.push(`  Architecture: ${flow}`);
    }
  }

  lines.push("", "RESEARCH");
  for (const publication of data.publications) {
    const submitted = publication.submissionDate ? ` | submitted ${publication.submissionDate}` : "";
    lines.push(
      `- "${publication.title}" | ${publication.authors.map((author) => (author.academic ? `${author.name} (academic)` : author.name)).join(", ")} | ${publication.journal} | ${bilingual(publication.status)}${submitted}`,
    );
    lines.push(`  Abstract: ${bilingual(publication.abstract)}`);
    lines.push(`  Key tech: ${publication.keyTech.join(", ")}`);
  }

  lines.push("", "TECHNICAL STACK");
  for (const group of data.skills) {
    lines.push(`- ${bilingual(group.label)}: ${group.skills.join(", ")}`);
  }

  if (data.certifications.length > 0) {
    lines.push("", "CERTIFICATIONS");
    for (const certification of data.certifications) {
      const award = certification.award ? ` | ${bilingual(certification.award)}` : "";
      lines.push(`- ${certification.title} | ${certification.issuer} | ${certification.issueDate}${award}`);
    }
  }

  return lines.join("\n");
}
