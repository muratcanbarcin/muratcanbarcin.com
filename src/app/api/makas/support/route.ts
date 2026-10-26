import { collectInvalidMakasSupportFields, makasSupportSchema } from "@/lib/makasSupportSchema";
import { logError } from "@/lib/logger";
import { makasSupportRateLimiter, readClientAddress } from "@/lib/rateLimit";
import { BODY_LIMITS, readSameOriginJson } from "@/lib/requestGuard";
import { sendMakasSupportNotification } from "@/services/emailService";

const ROUTE = "/api/makas/support";
const NO_STORE = { "Cache-Control": "no-store" } as const;

export async function POST(request: Request) {
  const limit = makasSupportRateLimiter.consume(readClientAddress(request));
  if (!limit.allowed) {
    return Response.json(
      { success: false, error: "rate_limited" },
      { status: 429, headers: { ...NO_STORE, "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const incoming = await readSameOriginJson(request, BODY_LIMITS.form);
  if (!incoming.ok) {
    return Response.json(
      { success: false, error: incoming.status === 403 ? "forbidden" : "invalid_request", fields: [] },
      { status: incoming.status, headers: NO_STORE },
    );
  }
  const payload = incoming.value;

  const parsed = makasSupportSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: "invalid_request", fields: collectInvalidMakasSupportFields(parsed.error) },
      { status: 400, headers: NO_STORE },
    );
  }

  try {
    await sendMakasSupportNotification(parsed.data);
  } catch (error) {
    logError("Makas support ticket handler failed", {
      route: ROUTE,
      error,
      metadata: { subject: parsed.data.subject, email: parsed.data.email },
    });
  }

  return Response.json({ success: true }, { headers: NO_STORE });
}
