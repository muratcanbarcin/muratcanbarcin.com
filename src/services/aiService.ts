import { APICallError, streamText, type ModelMessage } from "ai";
import { createGoogleGenerativeAI, type GoogleLanguageModelOptions } from "@ai-sdk/google";
import { resolveGeminiApiKey } from "@/lib/geminiCredentials";
import type { ChatTurn, LocalizedString, PortfolioData } from "@/types";
import { portfolioData } from "@/data/portfolioData";
import {
  AI_FAILOVER_LOG,
  FALLBACK_MODEL_ID,
  PRIMARY_MODEL_ID,
  TIER1_TIMEOUT_MS,
  TIER2_QUOTA_ALERT,
  TIER2_TIMEOUT_MS,
  type AiModelId,
} from "@/lib/aiModels";
import { runAfterResponse } from "@/lib/background";
import { reserveTier2Slot } from "@/lib/quotaTracker";
import { insertChatLog } from "@/lib/supabase";
import { loadGithubPromptContext } from "@/services/githubService";
import { sendInteractionAlert, sendTelegramAlert } from "@/services/telegramService";

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
  /** Isolated per tier. Tier 2 must never receive Tier 1's signal. */
  abortSignal: AbortSignal;
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
  failover?: { status?: number; name?: string; error: unknown };
}

/** Thrown when gemini-3.8-flash failed over and gemini-3.5-flash-lite also failed. */
export class Tier2ModelError extends Error {
  readonly tier1Error: unknown;
  readonly tier2Error: unknown;

  constructor(tier1Error: unknown, tier2Error: unknown) {
    const message = tier2Error instanceof Error ? tier2Error.message : `${FALLBACK_MODEL_ID} failed`;
    super(message);
    this.name = "Tier2ModelError";
    this.tier1Error = tier1Error;
    this.tier2Error = tier2Error;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function isTier2ModelError(error: unknown): error is Tier2ModelError {
  return error instanceof Tier2ModelError;
}

const CONSTRAINED_OUTPUT_TOKENS = 180;

/**
 * Dual-model fallback. The primary stream is probed until the first text token or a terminal
 * failure. Quota, rate-limit, timeout, and HTTP 4xx/5xx failures switch to the lite model before any
 * byte is written to the client, so the visitor only observes one continuous token stream.
 * Tier 1 has its own 10s AbortController. Timeout, abort, and HTTP 4xx/5xx switch to
 * Tier 2, which receives a new controller with a 27s budget and never observes Tier 1's signal.
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
  const system = await composeSystemPrompt();
  const tier1 = createTierAttempt(TIER1_TIMEOUT_MS);

  try {
    const served = await serveModel(
      PRIMARY_MODEL_ID,
      messages,
      system,
      MAX_OUTPUT_TOKENS,
      tier1.signal,
      false,
      openStream,
      audit,
    );
    return { ...served, failedOver: false };
  } catch (error) {
    tier1.dispose();
    if (!isFailoverError(error)) throw error;
    console.error("[Tier-1 Gemini 3.8 Error Details]:", error);
    console.warn(AI_FAILOVER_LOG);

    const tier2 = createTierAttempt(TIER2_TIMEOUT_MS);
    try {
      const quota = await reserveTier2Slot(new Date(now()));
      if (quota.shouldAlert) sendTelegramAlert(TIER2_QUOTA_ALERT);
      const constrained = quota.constrained ? `${system}\n\n${quotaGuardrail()}` : system;
      const tokens = quota.constrained ? CONSTRAINED_OUTPUT_TOKENS : MAX_OUTPUT_TOKENS;
      const served = await serveModel(
        FALLBACK_MODEL_ID,
        messages,
        constrained,
        tokens,
        tier2.signal,
        true,
        openStream,
        audit,
      );
      return { ...served, failedOver: true, failover: summarizeFailover(error) };
    } catch (tier2Error) {
      console.error("[Tier-2 Gemini 3.5 Error Details]:", tier2Error);
      throw new Tier2ModelError(error, tier2Error);
    } finally {
      tier2.dispose();
    }
  } finally {
    tier1.dispose();
  }
}

interface TierAttempt {
  signal: AbortSignal;
  dispose: () => void;
}

/** Dedicated timer and signal. `dispose` only clears the timer; it does not abort the sibling tier. */
function createTierAttempt(timeoutMs: number): TierAttempt {
  const controller = new AbortController();
  let settled = false;
  const timer = setTimeout(() => {
    if (!settled) controller.abort();
  }, timeoutMs);
  return {
    signal: controller.signal,
    dispose: () => {
      settled = true;
      clearTimeout(timer);
    },
  };
}

export function isFailoverError(error: unknown): boolean {
  const status = readStatusCode(error);
  if (status !== undefined && status >= 400 && status <= 599) return true;
  return isAbortLike(error);
}

function isAbortLike(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  if (error.name === "TimeoutError" || error.name === "AbortError") return true;
  const cause = error.cause instanceof Error ? error.cause : null;
  if (cause?.name === "TimeoutError" || cause?.name === "AbortError") return true;

  const message = `${error.message} ${cause?.message ?? ""}`.toLowerCase();
  return (
    message.includes("429") ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("rate-limit") ||
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("abort")
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
  abortSignal: AbortSignal,
  isFailover: boolean,
  openStream: ModelStreamOpener,
  audit: ChatAuditContext | undefined,
): Promise<Omit<PortfolioChatStream, "failedOver" | "failover">> {
  const opened = await openStream({
    modelId,
    messages,
    system,
    maxOutputTokens,
    abortSignal,
    onFinish: (text) => {
      if (!audit || !text.trim()) return;
      runAfterResponse(insertChatLog({ ...audit, aiResponse: text, modelUsed: modelId }));
      sendInteractionAlert({
        prompt: audit.userPrompt,
        response: text,
        model: modelId,
        isFailover,
        locale: audit.locale,
        sessionId: audit.sessionId,
      });
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

async function openGoogleModelStream(request: ModelStreamRequest): Promise<OpenedModelStream> {
  let served = false;
  let finished: string | null = null;

  const flush = () => {
    if (!served || finished === null) return;
    const text = finished;
    finished = null;
    request.onFinish?.(text);
  };

  const apiKey = resolveGeminiApiKey() ?? undefined;
  const result = streamText({
    model: createGoogleGenerativeAI({ apiKey })(request.modelId),
    system: request.system,
    messages: [...request.messages],
    maxRetries: 0,
    maxOutputTokens: request.maxOutputTokens,
    abortSignal: request.abortSignal,
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

function summarizeFailover(error: unknown): { status?: number; name?: string; error: unknown } {
  const status = readStatusCode(error);
  const name = error instanceof Error ? error.name : undefined;
  return { status, name, error };
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
    "FLAGSHIP VENTURE: MAKAS (Multi-Tenant Salon Booking Platform)",
    "- Role: Co-Founder & Lead Backend/System Architect",
    "- High-Concurrency Architecture:",
    "  * Concurrency & Race Conditions: Redis atomic slot locking (SET NX with 120s TTL) prevents simultaneous double-bookings; database row locking (SELECT ... FOR UPDATE) assigns optimal personnel.",
    "  * Decoupled Microservices: Node.js WhatsApp bot handles state transitions and Meta Graph API; FastAPI serves as single source of truth for scheduling math, tenant isolation, and analytics.",
    "  * Reliability & Security: Tenant isolation at application level (BOLA/IDOR protection), WhatsApp OTP verification (2-min TTL), HMAC-SHA256 signature validation, and SKIP LOCKED reminder claiming.",
    "  * Notification Pipeline: High-priority, audible background notifications via Expo Push Service on new/cancelled bookings.",
    "- Distribution: not publicly released yet. It will be on the Apple App Store, Google Play Store, and WhatsApp very soon. Do not say it is already live. The codebase is proprietary. Explain the architectural patterns only. Do not invent a repository URL or store listing URLs.",
    "- Support and account deletion live at /makas/support. Salon owners delete the account in the mobile app via Ayarlar > Hesabı Sil, or by submitting that form with the subject Hesap Silme Talebi. Shop data, staff records, and credentials are removed within 48 hours.",
    "",
    "CONVERSATIONAL DIRECTIVES",
    "- Deliver structured, technically profound, and succinct responses: at most ~180 words unless the visitor explicitly asks for depth. Project architecture answers follow the 150-word guideline below. Never meander; long prose risks client timeouts.",
    "- Use bullet points, **bold** key architectures, and cite concrete metrics from the context below.",
    "- Lead with the general Software Engineering / Backend & AI identity. Drill into Edge AI or Enterprise SAP only when the question is about them.",
    "- Backend questions (APIs, microservices, databases, scale, Java, Spring Boot) are answered from the Backend Engineering Domain first — Sun Group, Turkcell Sardis, Enterprise Agent for SSO — not from edge or IoT projects.",
    "- Questions about Makas, salon booking, WhatsApp, slot locking, or multi-tenant isolation are answered from the FLAGSHIP VENTURE section.",
    "- Strictly respect language parity: Turkish for Turkish queries, English for English queries.",
    "- Strictly bound your knowledge to Murat Can's education, enterprise experience, research, and project portfolio.",
    "- The site also offers a local shell inside this console: visitors can type /help, /projects, /exp, /skills, /whoami, or /resume. Mention it when a visitor asks how to navigate.",
    "- OUT-OF-SCOPE BOUNDARY: If a user asks general programming challenges, weather, politics, or unrelated queries, politely decline: 'I am specifically designed to answer inquiries regarding Murat Can Barçin's engineering career, backend systems, and AI portfolio. Would you like to know more about his work at Sun Group, Turkcell, Makas, or his Teknofest C4ISR system?'",
    "- When the visitor writes in Turkish, decline with the same boundary in Turkish: 'Murat Can Barçin'in mühendislik kariyeri, backend sistemleri ve yapay zeka portföyü hakkındaki soruları yanıtlamak için tasarlandım. Sun Group, Turkcell, Makas veya Teknofest C4ISR sistemi üzerindeki çalışmaları hakkında bilgi ister misiniz?'",
    `- Never hallucinate contact phone numbers or direct PDF links. If asked for a resume, guide the user to click the 'Request Resume' button, which opens an in-site request form.`,
    "- Do not invent employers, dates, metrics, publications, credentials, or coursework that are absent from the portfolio context below.",
    "",
    "PROJECT ARCHITECTURE COMMUNICATION GUIDELINES:",
    "- Keep responses concise, articulate, structured (bulleted), and strictly under 150 words.",
    "- Frame answers using an Executive Engineering Structure:",
    "  1. Business/Operational Problem",
    "  2. Core Architecture & Tech Stack",
    "  3. Measurable Impact / Innovation",
    "- Do NOT dump tedious low-level syntax trivia or full code files.",
    "- For public projects (C4ISR Prototype, Enterprise Agent for SSO, Karma), conclude naturally with: \"You can inspect the full architectural README directly in the documentation drawer on this site, or explore the source repository on GitHub: [Repo URL]\". When the visitor writes in Turkish, give that same invitation in Turkish and keep the repository URL unchanged.",
    "- For proprietary/research projects (Makas, Sun Group Expense SaaS, SleepFlow.AI), clarify that the codebase is proprietary or academic and explain only the architectural patterns. Do not invent a repository URL.",
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
    const sync = project.githubSync;
    if (sync?.enabled && project.githubUrl) {
      lines.push(`  Visibility: public. In-app documentation drawer. Repository: ${project.githubUrl}`);
    } else {
      const restriction = project.statusBadge ? bilingual(project.statusBadge) : "not public";
      lines.push(`  Visibility: ${restriction}. Explain architectural patterns only. Do not invent a repository URL.`);
    }
    if (project.links.length > 0) {
      const links = project.links.map((link) => `${link.label ?? link.type}: ${link.url}`).join("; ");
      lines.push(`  Links: ${links}`);
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
