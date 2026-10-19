import { runAfterResponse } from "@/lib/background";

const TELEGRAM_TEXT_LIMIT = 4_000;
let missingCredentialsWarned = false;

export function sendTelegramAlert(message: string): void {
  runAfterResponse(deliverTelegramAlert(message));
}

export async function deliverTelegramAlert(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) {
    if (!missingCredentialsWarned) {
      missingCredentialsWarned = true;
      console.warn("[Telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing. Alerts are logged locally.");
    }
    console.info("[Telegram] Alert", message);
    return;
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message.slice(0, TELEGRAM_TEXT_LIMIT),
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("[Telegram] sendMessage failed", response.status, detail.slice(0, 300));
  }
}

export function formatChatAlert(input: { prompt: string; model: string; locale: string }): string {
  return [
    "<b>MCB.ai question</b>",
    `Model: <code>${escapeTelegramHtml(input.model)}</code>`,
    `Locale: ${escapeTelegramHtml(input.locale)}`,
    `<pre>${escapeTelegramHtml(clip(input.prompt, 700))}</pre>`,
  ].join("\n");
}

export function formatResumeAlert(input: { company: string; email: string }): string {
  return [
    "<b>Resume request</b>",
    `Company: ${escapeTelegramHtml(input.company)}`,
    `Recruiter: ${escapeTelegramHtml(input.email)}`,
  ].join("\n");
}

function clip(value: string, max: number): string {
  const trimmed = value.trim();
  return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max - 1)}…`;
}

function escapeTelegramHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
