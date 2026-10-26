import "server-only";
import { APICallError, streamText, type ModelMessage } from "ai";
import { createGoogleGenerativeAI, type GoogleLanguageModelOptions } from "@ai-sdk/google";
import { resolveGeminiApiKey } from "@/lib/geminiCredentials";
import type { ChatTurn, LocalizedString, PortfolioData } from "@/types";
import { portfolioData } from "@/data/portfolioData";
import {
  AI_FAILOVER_LOG,
  CHAT_ROUTE_BUDGET_MS,
  CONSTRAINED_OUTPUT_TOKENS,
  CONTINUATION_TIMEOUT_MS,
  FALLBACK_MODEL_ID,
  MAX_OUTPUT_TOKENS,
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

/**
 * Gemini 3.8 Flash cannot reason below `low`. The lite failover model can stay at `minimal`,
 * so a capacity failover spends fewer thinking tokens and reaches visible text sooner.
 * Thoughts are not included in the visitor stream; they still count toward `maxOutputTokens`.
 */
function thinkingOptions(modelId: AiModelId): GoogleLanguageModelOptions {
  if (modelId === FALLBACK_MODEL_ID) {
    return { thinkingConfig: { thinkingLevel: "minimal" } };
  }
  return { thinkingConfig: { thinkingLevel: "low" } };
}

export interface ModelStreamEvent {
  type: string;
  text?: string;
  /** Some provider chunks use `delta` until the AI SDK normalizes them to `text`. */
  delta?: string;
  error?: unknown;
  reason?: string;
  finishReason?: string;
  rawFinishReason?: string;
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
  /** Tier 1 stays at 0 so a 503 fails over immediately. Tier 2 retries one capacity blip. */
  maxRetries?: number;
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

/**
 * Dual-model fallback. The primary stream is probed until the first visible token or a terminal
 * failure. Quota, rate-limit, timeout, and HTTP 4xx/5xx failures switch to the lite model before any
 * byte is written to the client, so the visitor only observes one continuous token stream.
 * Each tier has its own AbortSignal. The deadline covers silent reasoning up to the first text token
 * and is released at that token, so a long technical answer is not cut off by the probe timer.
 * Tier 2 usage is counted before that second attempt. At 85% of its daily cap the prompt
 * collapses to a short reply that points recruiters at email or Request Resume.
 */
export async function streamPortfolioChat(
  turns: readonly ChatTurn[],
  openStream: ModelStreamOpener = openGoogleModelStream,
  now: () => number = Date.now,
  audit?: ChatAuditContext,
  visitorSignal?: AbortSignal,
): Promise<PortfolioChatStream> {
  if (visitorSignal?.aborted) throw visitorAbortError();

  const messages = toModelMessages(turns);
  const system = await composeSystemPrompt();
  const startedAt = now();
  const tier1 = createTierAttempt(remainingAttemptMs(TIER1_TIMEOUT_MS, startedAt, now));

  try {
    const served = await serveModel({
      modelId: PRIMARY_MODEL_ID,
      messages,
      system,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      attempt: tier1,
      visitorSignal,
      isFailover: false,
      openStream,
      audit,
      startedAt,
      now,
      maxRetries: 0,
    });
    return { ...served, failedOver: false };
  } catch (error) {
    tier1.dispose();
    if (visitorSignal?.aborted || !isFailoverError(error)) throw error;
    console.error("[Tier-1 Gemini 3.8 Error Details]:", error);
    console.warn(AI_FAILOVER_LOG);
    return serveFallback({
      messages,
      system,
      openStream,
      audit,
      visitorSignal,
      startedAt,
      now,
      tier1Error: error,
    });
  } finally {
    tier1.dispose();
  }
}

interface TierAttempt {
  signal: AbortSignal;
  /** Stops the deadline from aborting an answer that has already produced visible text. */
  dispose: () => void;
}

interface FinishState {
  reason?: string;
}

interface ServeRequest {
  modelId: AiModelId;
  messages: readonly ModelMessage[];
  system: string;
  maxOutputTokens: number;
  attempt: TierAttempt;
  visitorSignal?: AbortSignal;
  isFailover: boolean;
  openStream: ModelStreamOpener;
  audit?: ChatAuditContext;
  startedAt: number;
  now: () => number;
  maxRetries: number;
}

interface FallbackRequest {
  messages: readonly ModelMessage[];
  system: string;
  openStream: ModelStreamOpener;
  audit?: ChatAuditContext;
  visitorSignal?: AbortSignal;
  startedAt: number;
  now: () => number;
  tier1Error: unknown;
}

/**
 * The probe timer aborts a linked signal. `dispose` detaches that link before the timer can fire,
 * including when the timer callback is already queued, so the provider request keeps running.
 */
function createTierAttempt(timeoutMs: number): TierAttempt {
  const deadline = new AbortController();
  const attempt = new AbortController();
  const onDeadline = () => {
    if (!attempt.signal.aborted) attempt.abort();
  };

  if (timeoutMs <= 0) {
    attempt.abort();
    return { signal: attempt.signal, dispose: () => undefined };
  }

  deadline.signal.addEventListener("abort", onDeadline);
  const timer = setTimeout(() => deadline.abort(), timeoutMs);
  let disposed = false;
  return {
    signal: attempt.signal,
    dispose: () => {
      if (disposed) return;
      disposed = true;
      clearTimeout(timer);
      deadline.signal.removeEventListener("abort", onDeadline);
    },
  };
}

function remainingAttemptMs(preferred: number, startedAt: number, now: () => number): number {
  const remaining = CHAT_ROUTE_BUDGET_MS - (now() - startedAt);
  return Math.max(0, Math.min(preferred, remaining));
}

async function serveFallback(request: FallbackRequest): Promise<PortfolioChatStream> {
  const timeout = remainingAttemptMs(TIER2_TIMEOUT_MS, request.startedAt, request.now);
  if (timeout < 1_000) throw request.tier1Error;

  const tier2 = createTierAttempt(timeout);
  try {
    const quota = await reserveTier2Slot(new Date(request.now()));
    if (quota.shouldAlert) sendTelegramAlert(TIER2_QUOTA_ALERT);
    const constrained = quota.constrained ? `${request.system}\n\n${quotaGuardrail()}` : request.system;
    const tokens = quota.constrained ? CONSTRAINED_OUTPUT_TOKENS : MAX_OUTPUT_TOKENS;
    const served = await serveModel({
      modelId: FALLBACK_MODEL_ID,
      messages: request.messages,
      system: constrained,
      maxOutputTokens: tokens,
      attempt: tier2,
      visitorSignal: request.visitorSignal,
      isFailover: true,
      openStream: request.openStream,
      audit: request.audit,
      startedAt: request.startedAt,
      now: request.now,
      maxRetries: 1,
    });
    return { ...served, failedOver: true, failover: summarizeFailover(request.tier1Error) };
  } catch (tier2Error) {
    console.error("[Tier-2 Gemini 3.5 Error Details]:", tier2Error);
    throw new Tier2ModelError(request.tier1Error, tier2Error);
  } finally {
    tier2.dispose();
  }
}

/** Thrown when the provider closed the stream before any visible text, so the caller can fail over. */
class PrematureStreamEndError extends Error {
  constructor(message = "Model stream ended before any visible text") {
    super(message);
    this.name = "PrematureStreamEndError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function isFailoverError(error: unknown): boolean {
  if (error instanceof PrematureStreamEndError) return true;
  const status = readStatusCode(error);
  if (status !== undefined && status >= 400 && status <= 599) return true;
  if (isAbortLike(error)) return true;
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  return (
    message.includes("502") ||
    message.includes("503") ||
    message.includes("504") ||
    message.includes("overloaded") ||
    message.includes("capacity") ||
    message.includes("service unavailable") ||
    message.includes("currently unavailable")
  );
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

async function serveModel(request: ServeRequest): Promise<Omit<PortfolioChatStream, "failedOver" | "failover">> {
  const finish: FinishState = {};
  const opened = await request.openStream({
    modelId: request.modelId,
    messages: request.messages,
    system: request.system,
    maxOutputTokens: request.maxOutputTokens,
    abortSignal: linkSignals(request.attempt.signal, request.visitorSignal),
    maxRetries: request.maxRetries,
  });
  const probed = await commitTextStream(opened.events, () => {
    request.attempt.dispose();
    opened.markServed();
  }, finish);
  const continued = continueOnLength(probed, finish, request);
  const text = collectAudit(continued, (full) => recordAudit(request, full));
  return { modelId: request.modelId, text };
}

function linkSignals(attempt: AbortSignal, visitor?: AbortSignal): AbortSignal {
  if (!visitor) return attempt;
  return AbortSignal.any([attempt, visitor]);
}

function recordAudit(request: ServeRequest, text: string): void {
  const audit = request.audit;
  if (!audit || !text.trim()) return;
  try {
    runAfterResponse(insertChatLog({ ...audit, aiResponse: text, modelUsed: request.modelId }));
    sendInteractionAlert({
      prompt: audit.userPrompt,
      response: text,
      model: request.modelId,
      isFailover: request.isFailover,
      locale: audit.locale,
      sessionId: audit.sessionId,
    });
  } catch (error) {
    console.error("[Chat] Audit dispatch failed", error);
  }
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
    maxRetries: request.maxRetries ?? 0,
    maxOutputTokens: request.maxOutputTokens,
    abortSignal: request.abortSignal,
    providerOptions: { google: thinkingOptions(request.modelId) },
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
 * The deadline is released on that first token, before the iterator is handed back.
 */
async function commitTextStream(
  source: AsyncIterable<ModelStreamEvent>,
  onVisible: () => void,
  finish: FinishState,
): Promise<AsyncIterable<string>> {
  const iterator = source[Symbol.asyncIterator]();
  const buffered: string[] = [];

  while (true) {
    const step = await iterator.next();
    if (step.done) {
      if (buffered.length === 0) throw new PrematureStreamEndError(emptyStreamMessage(finish.reason));
      onVisible();
      return replay(buffered, iterator, finish);
    }

    const part = step.value;
    noteFinish(part, finish);
    if (part.type === "error") rethrowStreamError(part.error);
    if (part.type === "abort") throw abortError(part.reason);

    const text = readVisibleText(part);
    if (!text) continue;
    buffered.push(text);
    onVisible();
    return replay(buffered, iterator, finish);
  }
}

function replay(
  buffered: readonly string[],
  iterator: AsyncIterator<ModelStreamEvent>,
  finish: FinishState,
): AsyncIterable<string> {
  return {
    async *[Symbol.asyncIterator]() {
      yield* buffered;
      while (true) {
        const step = await iterator.next();
        if (step.done) return;
        const part = step.value;
        noteFinish(part, finish);
        if (part.type === "error") rethrowStreamError(part.error);
        if (part.type === "abort") throw abortError(part.reason);
        const text = readVisibleText(part);
        if (text) yield text;
      }
    },
  };
}

/**
 * A length stop means reasoning or the reply exhausted `maxOutputTokens` mid-answer.
 * One follow-up call uses a fresh ceiling and appends only the unseen tail.
 */
function continueOnLength(
  source: AsyncIterable<string>,
  finish: FinishState,
  request: ServeRequest,
): AsyncIterable<string> {
  return {
    async *[Symbol.asyncIterator]() {
      let partial = "";
      for await (const chunk of source) {
        partial += chunk;
        yield chunk;
      }
      if (finish.reason !== "length" || partial.trim().length === 0) return;

      const budget = remainingAttemptMs(CONTINUATION_TIMEOUT_MS, request.startedAt, request.now);
      if (budget < 3_000 || request.visitorSignal?.aborted) return;

      console.warn("[Chat] Output hit the token ceiling. Continuing the answer.");
      let continuation: AsyncIterable<string>;
      try {
        continuation = await openContinuation(request, partial, budget);
      } catch (error) {
        console.error("[Chat] Continuation after a length stop failed", error);
        return;
      }

      let pending = "";
      let released = false;
      try {
        for await (const chunk of continuation) {
          if (released) {
            yield chunk;
            continue;
          }
          pending += chunk;
          const stripped = stripLeadingOverlap(partial, pending);
          if (stripped.length !== pending.length || pending.length >= 280) {
            released = true;
            if (stripped) yield stripped;
          }
        }
      } catch (error) {
        console.error("[Chat] Continuation after a length stop failed", error);
      }
      if (!released && pending.length > 0) {
        const stripped = stripLeadingOverlap(partial, pending);
        if (stripped) yield stripped;
      }
    },
  };
}

async function openContinuation(request: ServeRequest, partial: string, budget: number): Promise<AsyncIterable<string>> {
  const attempt = createTierAttempt(budget);
  try {
    const opened = await request.openStream({
      modelId: request.modelId,
      messages: [
        ...request.messages,
        { role: "assistant", content: partial },
        {
          role: "user",
          content:
            "Kaldığın yerden aynı dilde devam et. Continue in the same language from the exact cutoff. Do not repeat earlier text.",
        },
      ],
      system: `${request.system}\n\nCONTINUATION\nThe previous answer stopped because the token budget was exhausted. Continue in the same language from the exact cutoff. Do not repeat text already written. Do not apologize. Finish the technical answer.`,
      maxOutputTokens: request.maxOutputTokens,
      abortSignal: linkSignals(attempt.signal, request.visitorSignal),
      maxRetries: 0,
    });
    const nested: FinishState = {};
    return await commitTextStream(opened.events, () => {
      attempt.dispose();
      opened.markServed();
    }, nested);
  } catch (error) {
    attempt.dispose();
    throw error;
  }
}

function collectAudit(source: AsyncIterable<string>, onDone: (text: string) => void): AsyncIterable<string> {
  return {
    async *[Symbol.asyncIterator]() {
      let text = "";
      try {
        for await (const chunk of source) {
          text += chunk;
          yield chunk;
        }
      } finally {
        onDone(text);
      }
    },
  };
}

function readVisibleText(part: ModelStreamEvent): string | undefined {
  if (part.type !== "text-delta" && part.type !== "text") return undefined;
  const value = part.text ?? part.delta;
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function noteFinish(part: ModelStreamEvent, finish: FinishState): void {
  if (finish.reason === "length") return;
  if (part.type !== "finish" && part.type !== "finish-step") return;
  if (part.finishReason === "length" || part.rawFinishReason === "MAX_TOKENS" || part.rawFinishReason === "length") {
    finish.reason = "length";
    return;
  }
  const reason = part.finishReason ?? part.rawFinishReason;
  if (typeof reason === "string" && reason.length > 0) finish.reason = reason;
}

function stripLeadingOverlap(prior: string, next: string): string {
  const limit = Math.min(prior.length, next.length, 400);
  for (let size = limit; size >= 24; size -= 1) {
    if (prior.endsWith(next.slice(0, size))) return next.slice(size);
  }
  return next;
}

function emptyStreamMessage(reason: string | undefined): string {
  return reason === "length"
    ? "Model stopped on length before any visible text"
    : "Model stream ended before any visible text";
}

function abortError(reason: string | undefined): Error {
  const timeout = new Error(reason ?? "timeout");
  timeout.name = "TimeoutError";
  return timeout;
}

function visitorAbortError(): Error {
  const error = new Error("The visitor aborted the chat request");
  error.name = "AbortError";
  return error;
}

function rethrowStreamError(error: unknown): never {
  if (error instanceof Error) throw error;
  const status = readStatusCode(error);
  const wrapped = new Error(streamErrorMessage(error));
  if (status !== undefined) Object.defineProperty(wrapped, "statusCode", { value: status, enumerable: true });
  throw wrapped;
}

function streamErrorMessage(error: unknown): string {
  if (typeof error === "string" && error.length > 0) return error;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message: unknown = Reflect.get(error, "message");
    if (typeof message === "string" && message.length > 0) return message;
  }
  return "Model stream failed";
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
