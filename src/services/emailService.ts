import "server-only";
import { Resend } from "resend";
import type { ContactInquiryPayload, MakasSupportPayload, ResumeRequestPayload } from "@/types";
import { contact } from "@/data/contact";
import { logError } from "@/lib/logger";
import { emailHeader, stripUnsafeText } from "@/lib/userText";

const DEFAULT_SENDER = "MCB Portfolio <onboarding@resend.dev>";
const MAKAS_FALLBACK_SENDER = "Makas Support <onboarding@resend.dev>";
const MAKAS_SUPPORT_ROUTE = "/api/makas/support";
const MAKAS_INBOX = "muratcanbarcin@gmail.com";

export type EmailDelivery =
  | { status: "sent"; id: string }
  | { status: "skipped"; reason: "not-configured" | "rejected" };

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
    replyTo: emailHeader(message.replyTo),
    subject: emailHeader(message.subject),
    text: message.text,
    tags: [{ name: "category", value: message.tag }],
  });

  if (error || !data?.id) {
    throw new EmailDeliveryError(error?.message ?? "Resend returned no message id", error?.statusCode ?? null);
  }
  return { status: "sent", id: data.id };
}

/**
 * Dispatches a Makas App Store support ticket. A missing key or a Resend rejection is recorded
 * and swallowed so the public form can still acknowledge the request.
 */
export async function sendMakasSupportNotification(payload: MakasSupportPayload): Promise<EmailDelivery> {
  const receivedAt = new Date().toISOString();
  const subject = emailHeader(`[Makas Support Ticket] - ${singleLine(payload.subject)} from ${singleLine(payload.name)}`);
  const text = [
    `Name:\n${payload.name}`,
    `Email:\n${payload.email}`,
    `Phone:\n${payload.phone || "—"}`,
    `Shop:\n${payload.shopName || "—"}`,
    `Subject:\n${payload.subject}`,
    `Message:\n${payload.message}`,
    `Received:\n${receivedAt}`,
  ].join("\n\n");
  const ticket = {
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    shopName: payload.shopName,
    subject: payload.subject,
    message: payload.message,
    receivedAt,
  };

  const client = readClient();
  if (!client) {
    logError("Makas support ticket kept in system_logs; RESEND_API_KEY is not set", {
      route: MAKAS_SUPPORT_ROUTE,
      metadata: ticket,
    });
    return { status: "skipped", reason: "not-configured" };
  }

  try {
    const { data, error } = await client.emails.send({
      from: makasSender(),
      to: MAKAS_INBOX,
      replyTo: emailHeader(payload.email),
      subject,
      text,
      html: makasSupportHtml(payload, receivedAt),
      tags: [{ name: "category", value: "makas-support" }],
    });

    if (error || !data?.id) {
      logError("Makas support ticket kept in system_logs; Resend rejected the message", {
        route: MAKAS_SUPPORT_ROUTE,
        metadata: { ...ticket, resend: error?.message ?? "no message id" },
      });
      return { status: "skipped", reason: "rejected" };
    }

    return { status: "sent", id: data.id };
  } catch (error) {
    logError("Makas support ticket kept in system_logs; Resend request failed", {
      route: MAKAS_SUPPORT_ROUTE,
      error,
      metadata: ticket,
    });
    return { status: "skipped", reason: "rejected" };
  }
}

/** Prefer the verified domain already configured for Resend, with a Makas display name. */
function makasSender(): string {
  const configured = process.env.RESEND_FROM_EMAIL?.trim();
  if (!configured) return MAKAS_FALLBACK_SENDER;
  const address = configured.match(/<([^>]+)>/)?.[1] ?? configured;
  return address.includes("@") ? `Makas Support <${address}>` : MAKAS_FALLBACK_SENDER;
}

function makasSupportHtml(payload: MakasSupportPayload, receivedAt: string): string {
  const rows: ReadonlyArray<readonly [string, string]> = [
    ["Name", payload.name],
    ["Email", payload.email],
    ["Phone", payload.phone || "—"],
    ["Shop", payload.shopName || "—"],
    ["Subject", payload.subject],
    ["Received", receivedAt],
    ["Reply-To", payload.email],
  ];
  const body = rows
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:8px 16px 8px 0;color:#71717a;font-weight:600;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</th><td style="padding:8px 0;color:#18181b;">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#fafafa;font-family:ui-sans-serif,system-ui,sans-serif;">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;padding:24px;">
<p style="margin:0 0 8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#71717a;">Makas Support</p>
<h1 style="margin:0 0 16px;font-size:18px;color:#18181b;">New support ticket</h1>
<table style="border-collapse:collapse;width:100%;font-size:14px;">${body}</table>
<h2 style="margin:20px 0 8px;font-size:13px;color:#3f3f46;">Message</h2>
<div style="white-space:pre-wrap;font-size:14px;line-height:1.5;color:#18181b;">${escapeHtml(payload.message)}</div>
</div></body></html>`;
}

function escapeHtml(value: string): string {
  return stripUnsafeText(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function singleLine(value: string): string {
  return emailHeader(value).slice(0, 120);
}

function formatFields(fields: ReadonlyArray<readonly [label: string, value: string]>): string {
  return [...fields.map(([label, value]) => `${label}:\n${value}`), `Received: ${new Date().toISOString()}`].join(
    "\n\n",
  );
}
