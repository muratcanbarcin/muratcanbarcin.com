"use client";

import { useCallback, useRef, useState } from "react";
import type { ChatErrorKind, ConsoleEntry, ConsoleStatus, TerminalEffect } from "@/types";
import { useLocale } from "@/hooks/useLocale";
import { streamChatReply } from "@/services/chatClient";
import { completeConsoleInput, routeConsoleInput, toChatTurns } from "@/services/consoleRouter";
import { getCommandEffect } from "@/services/terminalCommands";

export type HistoryDirection = "older" | "newer";
export type ConsoleSideEffect = Exclude<TerminalEffect, "clear">;

export interface UnifiedConsoleSession {
  entries: readonly ConsoleEntry[];
  input: string;
  setInput: (value: string) => void;
  status: ConsoleStatus;
  errorKind: ChatErrorKind | null;
  /** Routes the current input: a command stays local, anything else goes to MCB.ai. */
  submit: () => void;
  /** Runs a raw line through the same router without touching the input field. */
  run: (raw: string) => void;
  /** Sends text to MCB.ai regardless of the active mode. */
  ask: (text: string) => void;
  navigateHistory: (direction: HistoryDirection) => void;
  /** Returns `true` when the input was a command token and Tab was consumed. */
  complete: () => boolean;
  clear: () => void;
}

/**
 * One transcript for both personalities of the console. Commands resolve synchronously in the
 * browser; only natural-language turns are streamed from `/api/chat`.
 */
export function useUnifiedConsole({ onEffect }: { onEffect: (effect: ConsoleSideEffect) => void }): UnifiedConsoleSession {
  const [entries, setEntries] = useState<ConsoleEntry[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<ConsoleStatus>("idle");
  const [errorKind, setErrorKind] = useState<ChatErrorKind | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const nextId = useRef(0);
  const requestId = useRef(0);
  const inflight = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const { currentLocale } = useLocale();

  const clear = useCallback(() => {
    requestId.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    inflight.current = false;
    setEntries([]);
    setStatus("idle");
    setErrorKind(null);
  }, []);

  const remember = useCallback((line: string) => {
    setHistoryIndex(null);
    setHistory((previous) => (previous.at(-1) === line ? previous : [...previous, line]));
  }, []);

  const execute = useCallback(
    (line: string, command: string) => {
      const effect = getCommandEffect(command);
      if (effect === "clear") {
        clear();
        return;
      }
      const id = nextId.current++;
      setEntries((previous) => [...previous, { id, kind: "command", input: line, command }]);
      if (effect) onEffect(effect);
    },
    [clear, onEffect],
  );

  const ask = useCallback(
    (raw: string) => {
      const content = raw.trim();
      if (!content || inflight.current) return;

      inflight.current = true;
      const request = ++requestId.current;
      const controller = new AbortController();
      abortRef.current = controller;

      const userEntry: ConsoleEntry = { id: nextId.current++, kind: "user", content };
      const assistantId = nextId.current++;
      const turns = toChatTurns([...entries, userEntry]);

      setEntries((previous) => [...previous, userEntry, { id: assistantId, kind: "assistant", content: "" }]);
      setStatus("streaming");
      setErrorKind(null);

      const writeAssistant = (text: string) =>
        setEntries((previous) =>
          previous.map((entry) => (entry.id === assistantId && entry.kind === "assistant" ? { ...entry, content: text } : entry)),
        );

      void streamChatReply(turns, {
        signal: controller.signal,
        locale: currentLocale,
        onText: (text) => {
          if (requestId.current === request) writeAssistant(text);
        },
      }).then((result) => {
        if (requestId.current !== request || result.status === "aborted") return;
        if (result.status === "failed") {
          if (!result.content.trim()) setEntries((previous) => previous.filter((entry) => entry.id !== assistantId));
          setErrorKind(result.kind);
        }
        abortRef.current = null;
        inflight.current = false;
        setStatus("idle");
      });
    },
    [currentLocale, entries],
  );

  const run = useCallback(
    (raw: string) => {
      const intent = routeConsoleInput(raw);
      if (intent.kind === "empty") return;
      remember(raw.trim());
      if (intent.kind === "command") execute(raw.trim(), intent.command);
      else ask(intent.text);
    },
    [ask, execute, remember],
  );

  const submit = useCallback(() => {
    const intent = routeConsoleInput(input);
    if (intent.kind === "query" && inflight.current) return;
    setInput("");
    run(input);
  }, [input, run]);

  const navigateHistory = useCallback(
    (direction: HistoryDirection) => {
      if (history.length === 0) return;
      const lastIndex = history.length - 1;
      let nextIndex: number | null;
      if (direction === "older") {
        nextIndex = historyIndex === null ? lastIndex : Math.max(0, historyIndex - 1);
      } else {
        nextIndex = historyIndex === null || historyIndex >= lastIndex ? null : historyIndex + 1;
      }
      setHistoryIndex(nextIndex);
      setInput(nextIndex === null ? "" : (history[nextIndex] ?? ""));
    },
    [history, historyIndex],
  );

  const complete = useCallback(() => {
    const completion = completeConsoleInput(input);
    if (completion.kind === "none") return false;
    if (completion.kind === "replace") {
      setInput(completion.value);
      return true;
    }
    const id = nextId.current++;
    const prefix = input.trim();
    setEntries((previous) => [...previous, { id, kind: "completions", input: prefix, matches: completion.matches }]);
    return true;
  }, [input]);

  return {
    entries,
    input,
    setInput,
    status,
    errorKind,
    submit,
    run,
    ask,
    navigateHistory,
    complete,
    clear,
  };
}
