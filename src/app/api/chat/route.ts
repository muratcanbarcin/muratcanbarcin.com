import { createTextStreamResponse } from "ai";
import { z } from "zod";
import { AI_FAILOVER_LOG, FALLBACK_MODEL_ID, PRIMARY_MODEL_ID } from "@/lib/aiModels";
import { digestKey } from "@/lib/digest";
import { resolveGeminiApiKey } from "@/lib/geminiCredentials";
import { inferLocale, isLocale } from "@/lib/i18n";
import { logError, logWarn } from "@/lib/logger";
import { chatRateLimiter, readClientAddress } from "@/lib/rateLimit";
import { createTokenStream, isTier2ModelError, streamPortfolioChat } from "@/services/aiService";

const CHAT_ROUTE = "/api/chat";

const MESSAGE_WINDOW = 12;

/**
 * Serverless execution ceiling: Tier 1 and Tier 2 each wait for a first visible token
 * (20s + 25s) inside a 55s active budget, with slack for a length continuation,
 * stream close, Supabase, and the Telegram card.
 * `export const dynamic` is not valid while `cacheComponents` is enabled (Next.js 16).
 * POST handlers are uncached, and every response sends `Cache-Control: no-store`.
 */
export const maxDuration = 60;

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
    const result = await streamPortfolioChat(
      messages,
      undefined,
      undefined,
      {
        sessionId,
        userPrompt,
        locale,
        ipHash,
      },
      request.signal,
    );
    if (result.failedOver) {
      const error = result.failover?.error;
      console.error("[Tier-1 Gemini 3.8 Error Details]:", error);
      console.warn(AI_FAILOVER_LOG);
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
    if (request.signal.aborted) {
      return new Response(null, { status: 499, headers: { "Cache-Control": "no-store" } });
    }
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

/** Yields tokens to the visitor. Persistence and the Telegram card run from the model `onFinish`. */
function watchChatStream(source: AsyncIterable<string>, modelId: string): AsyncIterable<string> {
  return {
    async *[Symbol.asyncIterator]() {
      try {
        for await (const chunk of source) yield chunk;
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
