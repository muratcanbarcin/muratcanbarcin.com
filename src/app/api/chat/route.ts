import { createTextStreamResponse } from "ai";
import { z } from "zod";
import { digestKey } from "@/lib/digest";
import { inferLocale, isLocale } from "@/lib/i18n";
import { chatRateLimiter, readClientAddress } from "@/lib/rateLimit";
import { createTokenStream, streamPortfolioChat } from "@/services/aiService";

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
    return Response.json({ error: "invalid_request" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const parsed = chatRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ error: "invalid_request" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
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
    return createTextStreamResponse({
      headers: {
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
      stream: createTokenStream(result.text),
    });
  } catch (error) {
    console.error("[AI Chat] Request failed", error);
    return Response.json({ error: "unavailable" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
