import { collectInvalidContactFields, contactInquirySchema } from "@/lib/contactInquirySchema";
import { logError } from "@/lib/logger";
import { contactInquiryRateLimiter, readClientAddress } from "@/lib/rateLimit";
import { sendContactNotification } from "@/services/emailService";

const CONTACT_ROUTE = "/api/contact";

const NO_STORE = { "Cache-Control": "no-store" } as const;

export async function POST(request: Request) {
  const limit = contactInquiryRateLimiter.consume(readClientAddress(request));
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

  const parsed = contactInquirySchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { error: "invalid_request", fields: collectInvalidContactFields(parsed.error) },
      { status: 400, headers: NO_STORE },
    );
  }

  try {
    console.info("[Contact Inquiry]", JSON.stringify({ ...parsed.data, receivedAt: new Date().toISOString() }));
    await sendContactNotification(parsed.data);
  } catch (error) {
    logError("Contact inquiry delivery failed", {
      route: CONTACT_ROUTE,
      error,
      metadata: { status: 502 },
    });
    return Response.json({ error: "unavailable" }, { status: 502, headers: NO_STORE });
  }

  return Response.json({ status: "received" }, { status: 202, headers: NO_STORE });
}
