import { readClientAddress, resumeRequestRateLimiter } from "@/lib/rateLimit";
import { collectInvalidFields, resumeRequestSchema } from "@/lib/resumeRequestSchema";
import { sendResumeRequestNotification } from "@/services/emailService";
import { recordResumeRequest } from "@/services/resumeRequestInbox";
import { formatResumeAlert, sendTelegramAlert } from "@/services/telegramService";

const NO_STORE = { "Cache-Control": "no-store" } as const;

export async function POST(request: Request) {
  const limit = resumeRequestRateLimiter.consume(readClientAddress(request));
  if (!limit.allowed) {
    return Response.json(
      { error: "rate_limited" },
      { status: 429, headers: { ...NO_STORE, "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "invalid_request", fields: [] }, { status: 400, headers: NO_STORE });
  }

  const parsed = resumeRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { error: "invalid_request", fields: collectInvalidFields(parsed.error) },
      { status: 400, headers: NO_STORE },
    );
  }

  sendTelegramAlert(formatResumeAlert({ company: parsed.data.company, email: parsed.data.email }));

  try {
    await recordResumeRequest(parsed.data);
    await sendResumeRequestNotification(parsed.data);
  } catch (error) {
    console.error("[Resume Request] Failed to deliver request", error);
    return Response.json({ error: "unavailable" }, { status: 502, headers: NO_STORE });
  }

  return Response.json({ status: "received" }, { status: 202, headers: NO_STORE });
}
