export const PRIMARY_MODEL_ID = "gemini-3.8-flash";
export const FALLBACK_MODEL_ID = "gemini-3.5-flash-lite";

/** Tier 1 is capped by the provider at 20 requests/day; 429 fails over to Tier 2. */
export const TIER2_DAILY_LIMIT = 500;
/** 85% of the Tier-2 daily cap. Crossing this tightens replies and alerts once. */
export const TIER2_GUARD_AT = 425;

export const TIER2_QUOTA_ALERT = "⚠️ MCB.ai Tier-2 quota has reached 85% capacity today.";

export type AiModelId = typeof PRIMARY_MODEL_ID | typeof FALLBACK_MODEL_ID;

/** Server log emitted when the primary model is replaced before any client token is sent. */
export const AI_FAILOVER_LOG =
  `[AI Failover]: Switched from ${PRIMARY_MODEL_ID} to ${FALLBACK_MODEL_ID}`;
