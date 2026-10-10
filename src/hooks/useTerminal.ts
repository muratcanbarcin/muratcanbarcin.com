"use client";

import { useCallback, useRef, useState } from "react";
import type { TerminalEntry } from "@/types";
import { getResumeRequestHref } from "@/services/resumeRequest";
import { completeCommand, getCommandEffect, longestCommonPrefix } from "@/services/terminalCommands";

export type HistoryDirection = "older" | "newer";

export interface TerminalSession {
  entries: readonly TerminalEntry[];
  showWelcome: boolean;
  input: string;
  setInput: (value: string) => void;
  submit: () => void;
  navigateHistory: (direction: HistoryDirection) => void;
  complete: () => void;
  clear: () => void;
}

export function useTerminal({ onClose }: { onClose: () => void }): TerminalSession {
  const [entries, setEntries] = useState<TerminalEntry[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const nextId = useRef(0);

  const clear = useCallback(() => {
    setEntries([]);
    setShowWelcome(false);
  }, []);

  const submit = useCallback(() => {
    const command = input.trim();
    setInput("");
    setHistoryIndex(null);
    if (command) setHistory((previous) => (previous.at(-1) === command ? previous : [...previous, command]));

    const effect = getCommandEffect(command);
    if (effect === "clear") {
      clear();
      return;
    }

    const id = nextId.current++;
    setEntries((previous) => [...previous, { id, kind: "command", input: command }]);
    if (effect === "close") onClose();
    if (effect === "request-resume") window.location.assign(getResumeRequestHref());
  }, [clear, input, onClose]);

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
    const prefix = input.trimStart();
    if (!prefix || /\s/.test(prefix)) return;
    const matches = completeCommand(prefix);
    if (matches.length === 0) return;
    if (matches.length === 1) {
      setInput(matches[0] ?? prefix);
      return;
    }
    const shared = longestCommonPrefix(matches);
    if (shared.length > prefix.length) {
      setInput(shared);
      return;
    }
    const id = nextId.current++;
    setEntries((previous) => [...previous, { id, kind: "completions", input: prefix, matches }]);
  }, [input]);

  return { entries, showWelcome, input, setInput, submit, navigateHistory, complete, clear };
}
