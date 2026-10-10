import { Resend } from "resend";
import type { ContactInquiryPayload, ResumeRequestPayload } from "@/types";
import { contact } from "@/data/contact";

const DEFAULT_SENDER = "MCB Portfolio <onboarding@resend.dev>";

export type EmailDelivery = { status: "sent"; id: string } | { status: "skipped"; reason: "not-configured" };

interface NotificationMessage {
  subject: string;
  replyTo: string;
  text: string;
  tag: "resume-request" | "contact-inquiry";
}

/** Raised when Resend is configured but rejects the message, so routes can surface a retryable error. */
export class EmailDeliveryError extends Error {
  constructor(
    message: string,
    readonly statusCode: number | null,
  ) {
    super(message);
    this.name = "EmailDeliveryError";
  }
}

let cachedClient: { key: string; client: Resend } | null = null;

/** `new Resend()` throws without a key, so the client is only built once a key is present. */
function readClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  if (cachedClient?.key !== key) cachedClient = { key, client: new Resend(key) };
  return cachedClient.client;
}

export function sendResumeRequestNotification(payload: ResumeRequestPayload): Promise<EmailDelivery> {
  return deliver({
    tag: "resume-request",
    subject: `Resume request — ${singleLine(payload.company)}`,
    replyTo: payload.email,
    text: formatFields([
      ["Email", payload.email],
      ["Company", payload.company],
      ["Message", payload.message || "—"],
    ]),
  });
}

export function sendContactNotification(payload: ContactInquiryPayload): Promise<EmailDelivery> {
  return deliver({
    tag: "contact-inquiry",
    subject: `Contact inquiry — ${singleLine(payload.name)}`,
    replyTo: payload.email,
    text: formatFields([
      ["Name", payload.name],
      ["Email", payload.email],
      ["Message", payload.message],
    ]),
  });
}

async function deliver(message: NotificationMessage): Promise<EmailDelivery> {
  const client = readClient();
  if (!client) {
    console.info(`[Email] RESEND_API_KEY not set; skipped ${message.tag} notification`, {
      subject: message.subject,
      replyTo: message.replyTo,
    });
    return { status: "skipped", reason: "not-configured" };
  }

  const { data, error } = await client.emails.send({
    from: process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_SENDER,
    to: contact.email,
    replyTo: message.replyTo,
    subject: message.subject,
    text: message.text,
    tags: [{ name: "category", value: message.tag }],
  });

  if (error || !data?.id) {
    throw new EmailDeliveryError(error?.message ?? "Resend returned no message id", error?.statusCode ?? null);
  }
  return { status: "sent", id: data.id };
}

function singleLine(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, 120);
}

function formatFields(fields: ReadonlyArray<readonly [label: string, value: string]>): string {
  return [...fields.map(([label, value]) => `${label}:\n${value}`), `Received: ${new Date().toISOString()}`].join(
    "\n\n",
  );
}
