const GOOGLE_GENERATIVE_AI_API_KEY = "GOOGLE_GENERATIVE_AI_API_KEY";
const GEMINI_API_KEY = "GEMINI_API_KEY";

function readEnv(name: string): string {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Accepts `GOOGLE_GENERATIVE_AI_API_KEY` or `GEMINI_API_KEY`.
 * The AI SDK reads the first name, so an alias-only environment is mirrored onto it.
 * The returned key is what callers pass into the provider.
 */
export function resolveGeminiApiKey(): string | null {
  const googleKey = readEnv(GOOGLE_GENERATIVE_AI_API_KEY);
  const geminiKey = readEnv(GEMINI_API_KEY);
  const key = googleKey || geminiKey;
  if (!key) return null;

  if (!googleKey) {
    try {
      process.env[GOOGLE_GENERATIVE_AI_API_KEY] = key;
    } catch (error) {
      console.error("[Gemini] Failed to bind GEMINI_API_KEY onto GOOGLE_GENERATIVE_AI_API_KEY.", error);
    }
  }

  return key;
}
