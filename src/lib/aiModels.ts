export const PRIMARY_MODEL_ID = "gemini-3.8-flash";
export const FALLBACK_MODEL_ID = "gemini-3.5-flash-lite";

export type AiModelId = typeof PRIMARY_MODEL_ID | typeof FALLBACK_MODEL_ID;

/** Server log emitted when the primary model is replaced before any client token is sent. */
export const AI_FAILOVER_LOG =
  `[AI Failover]: Switched from ${PRIMARY_MODEL_ID} to ${FALLBACK_MODEL_ID}`;
