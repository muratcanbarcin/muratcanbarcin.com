"use client";

import { ArrowUp, Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import type { FormEvent, RefObject } from "react";
import type { PortfolioChat } from "@/hooks/usePortfolioChat";
import { useLocale } from "@/hooks/useLocale";
import { cn } from "@/lib/utils";
import { ChatMarkdown } from "./ChatMarkdown";

const SUGGESTION_KEYS = ["experience", "c4isr", "stack"] as const;

interface ChatConsoleProps {
  chat: PortfolioChat;
  titleId: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  className?: string;
}

/** Presentation-only console; the owning container keeps chat state so inline and expanded views share it. */
export function ChatConsole({ chat, titleId, isExpanded, onToggleExpand, inputRef, className }: ChatConsoleProps) {
  const { t } = useLocale();
  const inputId = useId();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const suggestions = SUGGESTION_KEYS.map((key) => t(`chat.suggestions.${key}`));
  const isStreaming = chat.status === "streaming";

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }, [chat.messages]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void chat.send(chat.input);
  };

  const errorMessage =
    chat.errorKind === "rate" ? t("chat.rateLimited") : chat.errorKind === "generic" ? t("chat.error") : null;

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/80 shadow-2xl shadow-black/40 backdrop-blur-md",
        className,
      )}
    >
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-zinc-800 pr-1 pl-4">
        <span aria-hidden="true" className="relative flex size-2 shrink-0">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-50 motion-reduce:animate-none" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
        </span>
        <h2 id={titleId} className="min-w-0 flex-1 truncate font-mono text-xs">
          <span className="font-semibold text-zinc-100">{t("chat.title")}</span>
          <span aria-hidden="true" className="text-zinc-600">
            {" // "}
          </span>
          <span className="sr-only"> — </span>
          <span className="text-zinc-400">{t("chat.badge")}</span>
        </h2>
        {chat.messages.length > 0 && (
          <button
            type="button"
            onClick={chat.clear}
            className="inline-flex h-11 items-center px-2 font-mono text-[11px] text-zinc-500 outline-none hover:text-zinc-200 focus-visible:text-zinc-200"
          >
            {t("chat.clear")}
          </button>
        )}
        <button
          type="button"
          onClick={onToggleExpand}
          aria-label={t(isExpanded ? "chat.collapse" : "chat.expand")}
          title={t(isExpanded ? "chat.collapse" : "chat.expand")}
          className="inline-flex size-11 items-center justify-center text-zinc-500 outline-none hover:text-zinc-200 focus-visible:text-zinc-200"
        >
          {isExpanded ? (
            <Minimize2 aria-hidden="true" className="size-4" />
          ) : (
            <Maximize2 aria-hidden="true" className="size-4" />
          )}
        </button>
      </header>

      <div
        ref={scrollerRef}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-4"
      >
        <p className="sr-only" aria-live="polite">
          {isStreaming ? t("chat.responding") : ""}
        </p>

        {chat.messages.length === 0 && (
          <div className="flex flex-col gap-2 font-mono text-xs leading-relaxed">
            <p className="text-zinc-500">
              <span className="text-emerald-400/80">mcb.ai</span> ready
              <span aria-hidden="true" className="ml-1 inline-block h-3.5 w-1.5 translate-y-0.5 animate-blink bg-emerald-400/80 motion-reduce:animate-none" />
            </p>
            <p className="font-sans text-sm text-zinc-400">{t("chat.welcome")}</p>
          </div>
        )}

        {chat.messages.map((message) => (
          <article
            key={message.id}
            className={cn(
              "max-w-full text-sm leading-relaxed break-words",
              message.role === "user"
                ? "self-end rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-200"
                : "self-start text-zinc-300",
            )}
          >
            {message.role === "assistant" ? (
              message.content ? (
                <ChatMarkdown content={message.content} />
              ) : (
                <span className="inline-flex items-center gap-2 font-mono text-xs text-zinc-500">
                  <span
                    aria-hidden="true"
                    className="size-1.5 animate-pulse rounded-full bg-emerald-400 motion-reduce:animate-none"
                  />
                  {t("chat.responding")}
                </span>
              )
            ) : (
              message.content
            )}
          </article>
        ))}

        {errorMessage && (
          <p role="alert" className="rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-400">
            {errorMessage}
          </p>
        )}
      </div>

      <div className="shrink-0 border-t border-zinc-800">
        <form onSubmit={submit} className="flex items-end gap-2 px-3 pt-3 pb-2">
          <span aria-hidden="true" className="flex h-11 items-center pl-1 font-mono text-sm text-emerald-400">
            ›
          </span>
          <label htmlFor={inputId} className="sr-only">
            {t("chat.inputLabel")}
          </label>
          <textarea
            id={inputId}
            ref={inputRef}
            value={chat.input}
            rows={1}
            onChange={(event) => chat.setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void chat.send(chat.input);
              }
            }}
            placeholder={t("chat.placeholder")}
            enterKeyHint="send"
            className="max-h-28 min-h-11 flex-1 resize-none bg-transparent py-2.5 text-base text-zinc-100 caret-emerald-400 outline-none placeholder:text-zinc-600 sm:text-sm"
          />
          <button
            type="submit"
            aria-label={t("chat.send")}
            disabled={isStreaming || chat.input.trim().length === 0}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-950 outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-zinc-400/60 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            <ArrowUp aria-hidden="true" className="size-4" />
          </button>
        </form>

        <ul
          aria-label={t("chat.suggestionsLabel")}
          className="flex gap-2 overflow-x-auto px-3 pb-3 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden"
        >
          {suggestions.map((suggestion) => (
            <li key={suggestion} className="shrink-0">
              <button
                type="button"
                disabled={isStreaming}
                onClick={() => void chat.send(suggestion)}
                className="inline-flex h-11 items-center rounded-full border border-zinc-800 bg-zinc-900/50 px-3 font-mono text-[11px] whitespace-nowrap text-zinc-400 outline-none transition-colors hover:border-zinc-700 hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-zinc-400/60 disabled:cursor-not-allowed disabled:opacity-50 lg:h-8"
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
