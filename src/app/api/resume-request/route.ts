import { logError, logWarn } from "@/lib/logger";
import { readClientAddress, resumeRequestRateLimiter } from "@/lib/rateLimit";

const RESUME_ROUTE = "/api/resume-request";
import { collectInvalidFields, resumeRequestSchema } from "@/lib/resumeRequestSchema";
import { sendResumeRequestNotification } from "@/services/emailService";
import { recordResumeRequest } from "@/services/resumeRequestInbox";
import { formatResumeAlert, sendTelegramAlert } from "@/services/telegramService";

const NO_STORE = { "Cache-Control": "no-store" } as const;

export async function POST(request: Request) {
  const limit = resumeRequestRateLimiter.consume(readClientAddress(request));
  if (!limit.allowed) {
    logWarn("Resume request rate limit reached", {
      route: RESUME_ROUTE,
      metadata: { status: 429, retryAfterSeconds: limit.retryAfterSeconds },
    });
    return Response.json(
      { error: "rate_limited" },
      { status: 429, headers: { ...NO_STORE, "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    logWarn("Resume request body was not valid JSON", { route: RESUME_ROUTE, metadata: { status: 400 } });
    return Response.json({ error: "invalid_request", fields: [] }, { status: 400, headers: NO_STORE });
  }

  const parsed = resumeRequestSchema.safeParse(payload);
  if (!parsed.success) {
    logWarn("Resume request failed validation", {
      route: RESUME_ROUTE,
      metadata: { status: 400, fields: collectInvalidFields(parsed.error) },
    });
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
    logError("Resume request delivery failed", { route: RESUME_ROUTE, error, metadata: { status: 502 } });
    return Response.json({ error: "unavailable" }, { status: 502, headers: NO_STORE });
  }

  return Response.json({ status: "received" }, { status: 202, headers: NO_STORE });
}
