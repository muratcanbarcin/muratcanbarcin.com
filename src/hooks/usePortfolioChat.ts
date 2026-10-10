"use client";

import { useCallback, useRef, useState } from "react";
import type { ChatTurn } from "@/types";

export interface ChatMessage extends ChatTurn {
  id: string;
}

export type ChatErrorKind = "rate" | "generic" | null;

interface UsePortfolioChatResult {
  messages: readonly ChatMessage[];
  input: string;
  setInput: (value: string) => void;
  status: "idle" | "streaming" | "error";
  activeModelId: string | null;
  errorKind: ChatErrorKind;
  send: (content: string) => Promise<void>;
  clear: () => void;
}

export function usePortfolioChat(): UsePortfolioChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<UsePortfolioChatResult["status"]>("idle");
  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<ChatErrorKind>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inflight = useRef(false);
  const requestId = useRef(0);

  const clear = useCallback(() => {
    requestId.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    inflight.current = false;
    setMessages([]);
    setInput("");
    setStatus("idle");
    setActiveModelId(null);
    setErrorKind(null);
  }, []);

  const send = useCallback(async (raw: string) => {
    const content = raw.trim();
    if (!content || inflight.current) return;

    const request = ++requestId.current;
    inflight.current = true;
    const history: ChatMessage[] = [...messages, { id: crypto.randomUUID(), role: "user", content }];
    const assistantId = crypto.randomUUID();
    const controller = new AbortController();
    abortRef.current = controller;

    setMessages([...history, { id: assistantId, role: "assistant", content: "" }]);
    setInput("");
    setStatus("streaming");
    setErrorKind(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/plain" },
        body: JSON.stringify({
          messages: history.map(({ role, content: text }) => ({ role, content: text })),
        }),
        signal: controller.signal,
      });

      if (requestId.current !== request) return;

      if (!response.ok || !response.body) {
        setMessages(history);
        setErrorKind(response.status === 429 ? "rate" : "generic");
        setStatus("error");
        return;
      }

      const modelId = response.headers.get("X-MCB-Model");
      if (modelId) setActiveModelId(modelId);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        if (requestId.current !== request) return;
        const snapshot = accumulated;
        setMessages((current) =>
          current.map((message) => (message.id === assistantId ? { ...message, content: snapshot } : message)),
        );
      }

      if (requestId.current !== request) return;

      accumulated += decoder.decode();
      if (!accumulated.trim()) {
        setMessages(history);
        setErrorKind("generic");
        setStatus("error");
        return;
      }

      setStatus("idle");
    } catch (error) {
      if (requestId.current !== request) return;
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessages((current) => {
        const assistant = current.find((message) => message.id === assistantId);
        if (assistant?.content.trim()) return current;
        return history;
      });
      setErrorKind("generic");
      setStatus("error");
    } finally {
      if (requestId.current === request) {
        if (abortRef.current === controller) abortRef.current = null;
        inflight.current = false;
      }
    }
  }, [messages]);

  return { messages, input, setInput, status, activeModelId, errorKind, send, clear };
}
