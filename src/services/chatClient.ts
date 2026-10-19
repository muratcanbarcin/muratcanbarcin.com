import type { ChatErrorKind, ChatTurn, Locale } from "@/types";

/** Slightly above the route's `maxDuration`, which already covers the server-side model failover. */
const RESPONSE_TIMEOUT_MS = 32_000;
/** Once tokens flow, a gap this long means the stream has stalled. */
const IDLE_TIMEOUT_MS = 15_000;

export type ChatStreamResult =
  | { status: "completed"; content: string }
  | { status: "failed"; kind: ChatErrorKind; content: string }
  | { status: "aborted" };

interface StreamChatOptions {
  signal: AbortSignal;
  onText: (content: string) => void;
  locale?: Locale;
}

/** Streams one MCB.ai reply. A watchdog aborts stalled requests so the UI never waits indefinitely. */
export async function streamChatReply(
  turns: readonly ChatTurn[],
  { signal, onText, locale }: StreamChatOptions,
): Promise<ChatStreamResult> {
  const watchdog = new AbortController();
  let timer = setTimeout(() => watchdog.abort(), RESPONSE_TIMEOUT_MS);
  const rearm = () => {
    clearTimeout(timer);
    timer = setTimeout(() => watchdog.abort(), IDLE_TIMEOUT_MS);
  };

  let content = "";
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/plain" },
      body: JSON.stringify({ messages: turns, locale }),
      signal: AbortSignal.any([signal, watchdog.signal]),
    });
    if (!response.ok || !response.body) return { status: "failed", kind: errorKindFor(response.status), content };

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    rearm();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      rearm();
      content += decoder.decode(value, { stream: true });
      onText(content);
    }

    const tail = decoder.decode();
    if (tail) {
      content += tail;
      onText(content);
    }
    return content.trim() ? { status: "completed", content } : { status: "failed", kind: "generic", content };
  } catch {
    if (signal.aborted) return { status: "aborted" };
    return { status: "failed", kind: watchdog.signal.aborted ? "stalled" : "generic", content };
  } finally {
    clearTimeout(timer);
  }
}

function errorKindFor(status: number): ChatErrorKind {
  if (status === 429) return "rate";
  if (status === 503) return "unavailable";
  return "generic";
}
