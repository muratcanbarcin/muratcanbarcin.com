import { runAfterResponse } from "@/lib/background";

const TELEGRAM_TEXT_LIMIT = 4_000;
let missingCredentialsWarned = false;

export interface InteractionAlertInput {
  prompt: string;
  response: string;
  model: string;
  isFailover?: boolean;
  locale?: string;
  sessionId?: string;
}

export function sendTelegramAlert(message: string): void {
  runAfterResponse(deliverTelegramAlert(message));
}

/**
 * Rich HTML card for a finished MCB.ai turn. Scheduled after the response and never rejects:
 * a Telegram outage must not fail the visitor stream.
 */
export function sendInteractionAlert(params: InteractionAlertInput): void {
  try {
    runAfterResponse(deliverTelegramAlert(formatInteractionAlert(params)));
  } catch (error) {
    console.error("[Telegram] Interaction alert failed", error);
  }
}

export async function deliverTelegramAlert(message: string): Promise<void> {
  try {
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
  } catch (error) {
    console.error("[Telegram] sendMessage failed", error);
  }
}

export function formatResumeAlert(input: { company: string; email: string }): string {
  return [
    "<b>Resume request</b>",
    `Company: ${escapeTelegramHtml(input.company)}`,
    `Recruiter: ${escapeTelegramHtml(input.email)}`,
  ].join("\n");
}

const RESPONSE_PREVIEW_LIMIT = 300;

function formatInteractionAlert(params: InteractionAlertInput): string {
  const formattedTime = new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
  const preview =
    params.response.length > RESPONSE_PREVIEW_LIMIT
      ? `${params.response.slice(0, RESPONSE_PREVIEW_LIMIT)}...`
      : params.response;
  const locale = (params.locale || "TR").toUpperCase();
  const session = params.sessionId?.slice(0, 8) || "anonymous";
  const modelNote = params.isFailover ? "(⚠️ <i>Failover</i>)" : "(Tier 1)";

  const rendered = renderInteraction(params.prompt, preview, params.model, modelNote, formattedTime, locale, session);
  if (rendered.length <= TELEGRAM_TEXT_LIMIT) return rendered;

  // Escaped prompt text is the only elastic field. Shrink it until the HTML card still parses.
  let low = 0;
  let high = params.prompt.length;
  let fitted = rendered.slice(0, TELEGRAM_TEXT_LIMIT);
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const candidate = renderInteraction(
      `${params.prompt.slice(0, mid)}…`,
      preview,
      params.model,
      modelNote,
      formattedTime,
      locale,
      session,
    );
    if (candidate.length <= TELEGRAM_TEXT_LIMIT) {
      fitted = candidate;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return fitted;
}

function renderInteraction(
  prompt: string,
  preview: string,
  model: string,
  modelNote: string,
  formattedTime: string,
  locale: string,
  session: string,
): string {
  const escapedPrompt = escapeTelegramHtml(prompt);
  const escapedPreview = escapeTelegramHtml(preview);
  return [
    "🤖 <b>MCB.ai Interaction Report</b>",
    "━━━━━━━━━━━━━━━━━━━━",
    "❓ <b>Question:</b>",
    `<i>${escapedPrompt}</i>`,
    "",
    "💡 <b>Response Preview:</b>",
    `<i>${escapedPreview}</i>`,
    "",
    `⚙️ <b>Model:</b> <code>${escapeTelegramHtml(model)}</code>${modelNote}`,
    `⏱️ <b>Time:</b> <code>${escapeTelegramHtml(formattedTime)}</code>`,
    `🌍 <b>Locale:</b> <code>${escapeTelegramHtml(locale)}</code>`,
    `🆔 <b>Session:</b> <code>${escapeTelegramHtml(session)}</code>`,
  ].join("\n");
}

function escapeTelegramHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
