export const PRIMARY_MODEL_ID = "gemini-3.8-flash";
export const FALLBACK_MODEL_ID = "gemini-3.5-flash-lite";

/**
 * Deadline for the first visible token. Gemini reasons before that token;
 * the controller is released as soon as text starts so the rest of the answer is not aborted.
 */
export const TIER1_TIMEOUT_MS = 20_000;
/** Fresh time-to-first-token budget for the lite model. It never shares Tier 1's AbortSignal. */
export const TIER2_TIMEOUT_MS = 25_000;
/** One extra generation when the provider stops because the token ceiling was hit. */
export const CONTINUATION_TIMEOUT_MS = 20_000;
/** Active work must finish inside the route's 60s platform ceiling. */
export const CHAT_ROUTE_BUDGET_MS = 55_000;
/** Slack inside that ceiling for stream close, Supabase, and Telegram. */
export const CHAT_CLEANUP_RESERVE_MS = 5_000;

/**
 * Thinking tokens are billed against `maxOutputTokens`. A 700-token ceiling
 * let reasoning consume the budget and stopped the visible answer mid-sentence.
 * The reserve covers a low or minimal reasoning pass; the remainder is the reply.
 */
export const THINKING_TOKEN_RESERVE = 8_192;
export const VISIBLE_OUTPUT_TOKENS = 4_096;
export const MAX_OUTPUT_TOKENS = THINKING_TOKEN_RESERVE + VISIBLE_OUTPUT_TOKENS;
/** The quota guardrail asks for a short reply. The ceiling still has to outlast reasoning. */
export const CONSTRAINED_VISIBLE_TOKENS = 1_024;
export const CONSTRAINED_OUTPUT_TOKENS = THINKING_TOKEN_RESERVE + CONSTRAINED_VISIBLE_TOKENS;

/** Tier 1 is capped by the provider at 20 requests/day; 429 fails over to Tier 2. */
export const TIER2_DAILY_LIMIT = 500;
/** 85% of the Tier-2 daily cap. Crossing this tightens replies and alerts once. */
export const TIER2_GUARD_AT = 425;

export const TIER2_QUOTA_ALERT = "⚠️ MCB.ai Tier-2 quota has reached 85% capacity today.";

export type AiModelId = typeof PRIMARY_MODEL_ID | typeof FALLBACK_MODEL_ID;

/** Server log emitted when the primary model is replaced before any client token is sent. */
export const AI_FAILOVER_LOG =
  `[AI Failover]: Switched from ${PRIMARY_MODEL_ID} to ${FALLBACK_MODEL_ID}`;
