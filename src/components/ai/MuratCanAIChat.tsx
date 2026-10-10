"use client";

import { ArrowUp, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { FALLBACK_MODEL_ID, PRIMARY_MODEL_ID } from "@/lib/aiModels";
import { useLocale } from "@/hooks/useLocale";
import { usePortfolioChat } from "@/hooks/usePortfolioChat";
import { cn } from "@/lib/utils";
import { ChatMarkdown } from "./ChatMarkdown";

const SUGGESTION_KEYS = ["experience", "c4isr", "stack"] as const;

export function MuratCanAIChat() {
  const { t } = useLocale();
  const chat = usePortfolioChat();
  const [isOpen, setIsOpen] = useState(false);
  const inputId = useId();
  const titleId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  const suggestions = SUGGESTION_KEYS.map((key) => t(`chat.suggestions.${key}`));
  const telemetry =
    chat.activeModelId === PRIMARY_MODEL_ID
      ? t("chat.modelPrimary")
      : chat.activeModelId === FALLBACK_MODEL_ID
        ? t("chat.modelFallback")
        : t("chat.telemetry");

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (wasOpen.current && !isOpen) launcherRef.current?.focus();
    wasOpen.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollTop = scroller.scrollHeight;
  }, [chat.messages, isOpen]);

  const close = () => setIsOpen(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void chat.send(chat.input);
  };

  const errorMessage =
    chat.errorKind === "rate"
      ? t("chat.rateLimited")
      : chat.errorKind === "generic"
        ? t("chat.error")
        : null;

  return (
    <>
      {isOpen && (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[60] flex h-[min(36rem,calc(100dvh-4.5rem))] flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/95 shadow-2xl shadow-black/50 backdrop-blur-md sm:inset-x-auto sm:right-4 sm:w-[24rem]"
        >
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-zinc-800 pr-1.5 pl-4">
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="font-mono text-sm text-zinc-100">
                {t("chat.title")}
              </h2>
              <p className="truncate font-mono text-[10px] tracking-wide text-emerald-300/90">
                {telemetry}
              </p>
            </div>
            <button
              type="button"
              onClick={chat.clear}
              className="inline-flex h-11 items-center px-2.5 font-mono text-[11px] text-zinc-500 outline-none hover:text-zinc-200 focus-visible:text-zinc-200"
            >
              {t("chat.clear")}
            </button>
            <button
              type="button"
              onClick={close}
              aria-label={t("chat.close")}
              className="inline-flex size-11 items-center justify-center text-zinc-500 outline-none hover:text-zinc-200 focus-visible:text-zinc-200"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </header>

          <div ref={scrollerRef} className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-4">
            <p className="sr-only" aria-live="polite">
              {chat.status === "streaming" ? t("chat.responding") : ""}
            </p>

            {chat.messages.length === 0 && (
              <ul aria-label={t("chat.suggestionsLabel")} className="flex flex-col gap-2">
                {suggestions.map((suggestion) => (
                  <li key={suggestion}>
                    <button
                      type="button"
                      onClick={() => void chat.send(suggestion)}
                      className="min-h-11 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 text-left text-sm text-zinc-300 outline-none transition-colors hover:border-zinc-700 hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-zinc-400/60"
                    >
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
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
                      <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-emerald-400 motion-reduce:animate-none" />
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

          <form onSubmit={submit} className="flex items-end gap-2 border-t border-zinc-800 p-3">
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
              className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-1 py-2.5 text-base text-zinc-100 outline-none placeholder:text-zinc-600 sm:text-sm"
            />
            <button
              type="submit"
              aria-label={t("chat.send")}
              disabled={chat.status === "streaming" || chat.input.trim().length === 0}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-950 outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-zinc-400/60 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              <ArrowUp aria-hidden="true" className="size-4" />
            </button>
          </form>
        </section>
      )}

      {!isOpen && (
        <button
          ref={launcherRef}
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[60] inline-flex min-h-11 items-center gap-2.5 rounded-full border border-zinc-800 bg-zinc-950/90 py-2 pr-4 pl-3 font-mono text-xs text-zinc-200 shadow-lg shadow-black/40 backdrop-blur-md outline-none hover:border-zinc-700 focus-visible:ring-2 focus-visible:ring-zinc-400/60"
        >
          <span aria-hidden="true" className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
          </span>
          {t("chat.open")}
        </button>
      )}
    </>
  );
}
