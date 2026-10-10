import type { LocalizedString } from "./locale";

export type ConsoleEntry =
  | { id: number; kind: "command"; input: string; command: string }
  | { id: number; kind: "completions"; input: string; matches: readonly string[] }
  | { id: number; kind: "user"; content: string }
  | { id: number; kind: "assistant"; content: string };

export type ConsoleIntent =
  | { kind: "empty" }
  | { kind: "command"; command: string }
  | { kind: "query"; text: string };

export type ConsoleStatus = "idle" | "streaming";

export type ChatErrorKind = "rate" | "stalled" | "unavailable" | "generic";

export type PromptChip =
  | { id: string; kind: "query"; label: LocalizedString; prompt: LocalizedString }
  | { id: string; kind: "command"; label: LocalizedString; command: string };

export type ConsoleRequest = { action: "open" } | { action: "toggle" };
