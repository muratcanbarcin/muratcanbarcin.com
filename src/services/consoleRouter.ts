import type { ChatTurn, ConsoleEntry, ConsoleIntent } from "@/types";
import { completeCommand, longestCommonPrefix, resolveCommand } from "./terminalCommands";

export const COMMAND_PREFIX = "/";

/** Mirrors the `/api/chat` schema: at most 16 turns of 4,000 characters, ending on a user turn. */
const CHAT_TURN_WINDOW = 12;
const CHAT_TURN_MAX_CHARS = 4_000;

/**
 * One prompt for both. A `/` line, or a line that is exactly a known command, stays in the
 * browser. Every other sentence is a question for MCB.ai.
 */
export function routeConsoleInput(raw: string): ConsoleIntent {
  const text = raw.trim();
  if (!text) return { kind: "empty" };
  if (text.startsWith(COMMAND_PREFIX)) {
    const command = text.slice(COMMAND_PREFIX.length).trim();
    return { kind: "command", command: command || "help" };
  }
  if (!/\s/.test(text) && resolveCommand(text).kind === "known") return { kind: "command", command: text };
  return { kind: "query", text };
}

/** True while the visitor is typing a command token, so the prompt can stay in shell styling. */
export function isCommandInput(raw: string): boolean {
  const text = raw.trimStart();
  if (!text) return false;
  if (text.startsWith(COMMAND_PREFIX)) return true;
  if (/\s/.test(text)) return false;
  return completeCommand(text).length > 0;
}

export type ConsoleCompletion =
  | { kind: "none" }
  | { kind: "replace"; value: string }
  | { kind: "matches"; matches: readonly string[] };

/** Tab completion for command tokens. A sentence is never intercepted. */
export function completeConsoleInput(raw: string): ConsoleCompletion {
  const input = raw.trimStart();
  if (!input) return { kind: "none" };
  const hasPrefix = input.startsWith(COMMAND_PREFIX);
  if (!hasPrefix && /\s/.test(input)) return { kind: "none" };

  const prefix = hasPrefix ? COMMAND_PREFIX : "";
  const token = input.slice(prefix.length);
  if (/\s/.test(token)) return { kind: "none" };

  const matches = completeCommand(token);
  if (matches.length === 0) return { kind: "none" };
  if (matches.length === 1) return { kind: "replace", value: `${prefix}${matches[0] ?? token}` };

  const shared = longestCommonPrefix(matches);
  if (shared.length > token.length) return { kind: "replace", value: `${prefix}${shared}` };
  return { kind: "matches", matches: matches.map((match) => `${prefix}${match}`) };
}

/** Conversation turns sent to MCB.ai; local commands never leave the browser. */
export function toChatTurns(entries: readonly ConsoleEntry[]): ChatTurn[] {
  const turns: ChatTurn[] = [];
  for (const entry of entries) {
    if ((entry.kind === "user" || entry.kind === "assistant") && entry.content.trim()) {
      turns.push({ role: entry.kind, content: entry.content.slice(0, CHAT_TURN_MAX_CHARS) });
    }
  }
  const windowed = turns.slice(-CHAT_TURN_WINDOW);
  const firstUser = windowed.findIndex((turn) => turn.role === "user");
  return firstUser === -1 ? [] : windowed.slice(firstUser);
}
