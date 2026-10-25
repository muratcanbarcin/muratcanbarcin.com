export const PRIMARY_MODEL_ID = "gemini-3.8-flash";
export const FALLBACK_MODEL_ID = "gemini-3.5-flash-lite";

/** Tier 1 is aborted at this mark. The controller is discarded before Tier 2 starts. */
export const TIER1_TIMEOUT_MS = 10_000;
/** Fresh budget for the lite model. It never shares Tier 1's AbortSignal. */
export const TIER2_TIMEOUT_MS = 27_000;
/** Slack inside the 40s route ceiling for stream close, Supabase, and Telegram. */
export const CHAT_CLEANUP_RESERVE_MS = 3_000;

/** Tier 1 is capped by the provider at 20 requests/day; 429 fails over to Tier 2. */
export const TIER2_DAILY_LIMIT = 500;
/** 85% of the Tier-2 daily cap. Crossing this tightens replies and alerts once. */
export const TIER2_GUARD_AT = 425;

export const TIER2_QUOTA_ALERT = "⚠️ MCB.ai Tier-2 quota has reached 85% capacity today.";

export type AiModelId = typeof PRIMARY_MODEL_ID | typeof FALLBACK_MODEL_ID;

/** Server log emitted when the primary model is replaced before any client token is sent. */
export const AI_FAILOVER_LOG =
  `[AI Failover]: Switched from ${PRIMARY_MODEL_ID} to ${FALLBACK_MODEL_ID}`;
