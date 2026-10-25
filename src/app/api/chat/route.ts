import { createTextStreamResponse } from "ai";
import { z } from "zod";
import { FALLBACK_MODEL_ID, PRIMARY_MODEL_ID } from "@/lib/aiModels";
import { digestKey } from "@/lib/digest";
import { resolveGeminiApiKey } from "@/lib/geminiCredentials";
import { inferLocale, isLocale } from "@/lib/i18n";
import { logError, logWarn } from "@/lib/logger";
import { chatRateLimiter, readClientAddress } from "@/lib/rateLimit";
import { createTokenStream, isTier2ModelError, streamPortfolioChat } from "@/services/aiService";

const CHAT_ROUTE = "/api/chat";

const MESSAGE_WINDOW = 12;

/**
 * Serverless execution ceiling. Both model attempts in `streamPortfolioChat` share a 26s
 * budget so failover cannot overrun this route.
 * `export const dynamic = "force-dynamic"` is rejected under `cacheComponents`; POST
 * handlers are never cached, and responses already send `Cache-Control: no-store`.
 */
export const maxDuration = 30;

const chatRequestSchema = z
  .object({
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().trim().min(1).max(4_000),
        }),
      )
      .min(1)
      .max(16),
    locale: z.enum(["en", "tr"]).optional(),
  })
  .refine((body) => body.messages.at(-1)?.role === "user", {
    path: ["messages"],
    message: "The latest message must be a user message.",
  });

export async function POST(request: Request) {
  const limit = chatRateLimiter.consume(readClientAddress(request));
  if (!limit.allowed) {
    logWarn("Chat rate limit reached", {
      route: CHAT_ROUTE,
      metadata: { status: 429, retryAfterSeconds: limit.retryAfterSeconds },
    });
    return Response.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(limit.retryAfterSeconds),
          "X-RateLimit-Limit": String(limit.limit),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    logWarn("Chat request body was not valid JSON", { route: CHAT_ROUTE, metadata: { status: 400 } });
    return Response.json({ error: "invalid_request" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const parsed = chatRequestSchema.safeParse(payload);
  if (!parsed.success) {
    logWarn("Chat request failed validation", { route: CHAT_ROUTE, metadata: { status: 400 } });
    return Response.json({ error: "invalid_request" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  if (!resolveGeminiApiKey()) {
    logError("Gemini API key is not configured", {
      route: CHAT_ROUTE,
      metadata: { status: 503, accepted: ["GOOGLE_GENERATIVE_AI_API_KEY", "GEMINI_API_KEY"] },
    });
    return Response.json({ error: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const messages = parsed.data.messages.slice(-MESSAGE_WINDOW);
    const userPrompt = messages.at(-1)?.content ?? "";
    const locale = isLocale(parsed.data.locale) ? parsed.data.locale : inferLocale(userPrompt);
    const address = readClientAddress(request);
    const ipHash = address === "unknown" ? null : digestKey(address);
    const sessionId = digestKey(`${address}|${new Date().toISOString().slice(0, 10)}`);
    const result = await streamPortfolioChat(messages, undefined, undefined, {
      sessionId,
      userPrompt,
      locale,
      ipHash,
    });
    if (result.failedOver) {
      const error = result.failover?.error;
      console.error("[Tier-1 Gemini 3.8 Error Details]:", error);
      console.info("[Tier-2 Gemini 3.5] Executing gemini-3.5-flash-lite.", {
        model: result.modelId,
        fallback: FALLBACK_MODEL_ID,
        status: result.failover?.status,
        errorName: result.failover?.name,
      });
      logWarn("Gemini failover from gemini-3.8-flash to gemini-3.5-flash-lite", {
        route: CHAT_ROUTE,
        metadata: {
          model: result.modelId,
          status: result.failover?.status,
          errorName: result.failover?.name,
        },
      });
    }
    return createTextStreamResponse({
      headers: {
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
      stream: createTokenStream(watchChatStream(result.text, result.modelId)),
    });
  } catch (failure) {
    if (isTier2ModelError(failure)) {
      const error = failure.tier1Error;
      console.error("[Tier-1 Gemini 3.8 Error Details]:", error);
      console.error("[Tier-2 Gemini 3.5 Error Details]:", failure.tier2Error);
      logError("Chat request failed", {
        route: CHAT_ROUTE,
        error: failure.tier2Error,
        metadata: { status: 502, model: FALLBACK_MODEL_ID, primaryModel: PRIMARY_MODEL_ID },
      });
    } else {
      const error = failure;
      console.error("[Tier-1 Gemini 3.8 Error Details]:", error);
      logError("Chat request failed", {
        route: CHAT_ROUTE,
        error,
        metadata: { status: 502, model: PRIMARY_MODEL_ID },
      });
    }
    return Response.json({ error: "unavailable" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}

function watchChatStream(source: AsyncIterable<string>, modelId: string): AsyncIterable<string> {
  return {
    async *[Symbol.asyncIterator]() {
      try {
        yield* source;
      } catch (error) {
        if (modelId === FALLBACK_MODEL_ID) {
          console.error("[Tier-2 Gemini 3.5 Error Details]:", error);
        } else {
          console.error("[Tier-1 Gemini 3.8 Error Details]:", error);
        }
        logError("Chat stream failed after the response started", {
          route: CHAT_ROUTE,
          error,
          metadata: { model: modelId },
        });
        throw error;
      }
    },
  };
}
