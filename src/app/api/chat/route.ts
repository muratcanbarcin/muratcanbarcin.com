import { createTextStreamResponse } from "ai";
import { z } from "zod";
import { digestKey } from "@/lib/digest";
import { inferLocale, isLocale } from "@/lib/i18n";
import { logError, logWarn } from "@/lib/logger";
import { chatRateLimiter, readClientAddress } from "@/lib/rateLimit";
import { createTokenStream, streamPortfolioChat } from "@/services/aiService";

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

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    logError("Gemini API key is not configured", { route: CHAT_ROUTE, metadata: { status: 503 } });
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
  } catch (error) {
    logError("Chat request failed", { route: CHAT_ROUTE, error, metadata: { status: 502 } });
    return Response.json({ error: "unavailable" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}

function watchChatStream(source: AsyncIterable<string>, modelId: string): AsyncIterable<string> {
  return {
    async *[Symbol.asyncIterator]() {
      try {
        yield* source;
      } catch (error) {
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
