import { createTextStreamResponse } from "ai";
import { z } from "zod";
import { chatRateLimiter, readClientAddress } from "@/lib/rateLimit";
import { createTokenStream, streamPortfolioChat } from "@/services/aiService";

const MESSAGE_WINDOW = 12;

/** Gives the fallback stream room to finish on hosts that cap serverless execution. */
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
    const result = await streamPortfolioChat(parsed.data.messages.slice(-MESSAGE_WINDOW));
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
