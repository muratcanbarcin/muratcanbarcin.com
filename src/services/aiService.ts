import { APICallError, streamText, type ModelMessage } from "ai";
import { google } from "@ai-sdk/google";
import type { ChatTurn, LocalizedString, PortfolioData } from "@/types";
import { portfolioData } from "@/data/portfolioData";
import { AI_FAILOVER_LOG, FALLBACK_MODEL_ID, PRIMARY_MODEL_ID, type AiModelId } from "@/lib/aiModels";

const MODEL_TIMEOUT = { totalMs: 20_000, firstChunkMs: 12_000 } as const;
const MAX_OUTPUT_TOKENS = 900;

export interface ModelStreamEvent {
  type: string;
  text?: string;
  error?: unknown;
  reason?: string;
}

/** Opens a provider stream. Tests substitute this to simulate quota and transport failures. */
export type ModelStreamOpener = (
  modelId: AiModelId,
  messages: readonly ModelMessage[],
) => Promise<AsyncIterable<ModelStreamEvent>>;

export interface PortfolioChatStream {
  modelId: AiModelId;
  text: AsyncIterable<string>;
}

const SYSTEM_PROMPT = buildSystemPrompt(portfolioData);

/**
 * Dual-model fallback. The primary stream is probed until the first text token or a terminal
 * failure. Quota, rate-limit, timeout, and 5xx failures switch to the lite model before any
 * byte is written to the client, so the visitor only observes one continuous token stream.
 */
export async function streamPortfolioChat(
  turns: readonly ChatTurn[],
  openStream: ModelStreamOpener = openGoogleModelStream,
): Promise<PortfolioChatStream> {
  const messages = toModelMessages(turns);

  try {
    const text = await commitTextStream(await openStream(PRIMARY_MODEL_ID, messages));
    return { modelId: PRIMARY_MODEL_ID, text };
  } catch (error) {
    if (!isFailoverError(error)) throw error;
    console.error(AI_FAILOVER_LOG);
    const text = await commitTextStream(await openStream(FALLBACK_MODEL_ID, messages));
    return { modelId: FALLBACK_MODEL_ID, text };
  }
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

async function openGoogleModelStream(
  modelId: AiModelId,
  messages: readonly ModelMessage[],
): Promise<AsyncIterable<ModelStreamEvent>> {
  const result = streamText({
    model: google(modelId),
    system: SYSTEM_PROMPT,
    messages: [...messages],
    maxRetries: 0,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    timeout: MODEL_TIMEOUT,
  });
  return result.stream;
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
  const email = data.resumeRequest.recipient;
  const lines: string[] = [
    "You are the official technical AI assistant representing Murat Can Barçin (Software Engineer - Backend & AI).",
    "- Maintain a concise, articulate, and deeply technical tone.",
    "- Language matching: Respond in Turkish if asked in Turkish, respond in English if asked in English.",
    "- Strictly bound your knowledge to Murat Can's education, enterprise experience, research, and project portfolio.",
    "- OUT-OF-SCOPE BOUNDARY: If a user asks general programming challenges, weather, politics, or unrelated queries, politely decline: 'I am specifically designed to answer inquiries regarding Murat Can Barçin's engineering career, backend systems, and AI portfolio. Would you like to know more about his work at Sun Group, Turkcell, or his Teknofest C4ISR system?'",
    "- When the visitor writes in Turkish, decline with the same boundary in Turkish: 'Murat Can Barçin'in mühendislik kariyeri, backend sistemleri ve yapay zeka portföyü hakkındaki soruları yanıtlamak için tasarlandım. Sun Group, Turkcell veya Teknofest C4ISR sistemi üzerindeki çalışmaları hakkında bilgi ister misiniz?'",
    `- Never hallucinate contact phone numbers or direct PDF links. If asked for a resume, guide the user to click the 'Request Resume' button or email ${email} directly.`,
    "- Do not invent employers, dates, metrics, publications, credentials, or coursework that are absent from the portfolio context below.",
    "",
    "PORTFOLIO CONTEXT",
    `Name: ${data.profile.name}`,
    `Headline: ${bilingual(data.profile.headline)}`,
    `Location: ${data.profile.location}`,
    `Summary: ${bilingual(data.profile.summary)}`,
    `Contact email: ${email}`,
    "Resume delivery: there is no public phone number and no direct PDF URL. Use the Request Resume button or the contact email.",
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
    lines.push(`  Metrics: ${project.keyMetrics.join("; ")}`);
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
    lines.push(
      `- "${publication.title}" | ${publication.authors.join(", ")} | ${publication.journal} | ${bilingual(publication.status)} | submitted ${publication.submissionDate}`,
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
