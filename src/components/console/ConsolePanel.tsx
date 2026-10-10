"use client";

import { ArrowUp, Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useId, useMemo, useRef } from "react";
import type { FormEvent, KeyboardEvent, RefObject } from "react";
import type { ConsoleEntry, PromptChip } from "@/types";
import type { UnifiedConsoleSession } from "@/hooks/useUnifiedConsole";
import { useShortcutLabel } from "@/hooks/useConsoleShortcut";
import { useLocale } from "@/hooks/useLocale";
import { isCommandInput } from "@/services/consoleRouter";
import { renderCommandOutput, type TerminalContext } from "@/services/terminalCommands";
import { ChatMarkdown } from "@/components/ai/ChatMarkdown";
import { cn } from "@/lib/utils";
import { TerminalOutput } from "./TerminalOutput";

const INPUT_MAX_CHARS = 4_000;
const ASSISTANT_BUBBLE =
  "rounded-2xl rounded-tl-md border border-zinc-800 bg-zinc-900/80 px-3.5 py-3 text-sm leading-relaxed break-words text-zinc-200";

interface ConsolePanelProps {
  session: UnifiedConsoleSession;
  chips: readonly PromptChip[];
  onChip: (chip: PromptChip) => void;
  titleId: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  className?: string;
}

/** Presentation-only; the owning container keeps session state so docked and focus views share it. */
export function ConsolePanel({
  session,
  chips,
  onChip,
  titleId,
  isExpanded,
  onToggleExpand,
  inputRef,
  className,
}: ConsolePanelProps) {
  const { t, localize, dictionary, currentLocale } = useLocale();
  const shortcutLabel = useShortcutLabel();
  const inputId = useId();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const localInputRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = inputRef ?? localInputRef;

  const context = useMemo<TerminalContext>(() => ({ dictionary, locale: currentLocale }), [dictionary, currentLocale]);
  const isStreaming = session.status === "streaming";
  const commandLike = isCommandInput(session.input);
  const canSubmit = session.input.trim().length > 0 && (commandLike || !isStreaming);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }, [session.entries, session.errorKind]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSubmit) session.submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSubmit) session.submit();
    } else if ((event.key === "ArrowUp" || event.key === "ArrowDown") && !session.input.includes("\n")) {
      event.preventDefault();
      session.navigateHistory(event.key === "ArrowUp" ? "older" : "newer");
    } else if (event.key === "Tab" && !event.shiftKey) {
      if (session.complete()) event.preventDefault();
    } else if (event.key.toLowerCase() === "l" && event.ctrlKey) {
      event.preventDefault();
      session.clear();
    }
  };

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/80 shadow-2xl shadow-black/40 backdrop-blur-md",
        className,
      )}
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-zinc-800 py-2 pr-1 pl-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <h2 id={titleId} className="shrink-0 font-mono text-sm font-semibold tracking-tight text-zinc-100">
              {t("console.title")}
            </h2>
            <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 font-mono text-[10px] tracking-wide text-emerald-300 uppercase">
              <span aria-hidden="true" className="relative flex size-1.5 shrink-0">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
              </span>
              {t("console.statusOnline")}
            </span>
          </div>
          <p className="truncate font-mono text-[10px] text-zinc-500 sm:text-right">{t("console.modeHint")}</p>
        </div>
        {session.entries.length > 0 && (
          <button
            type="button"
            onClick={session.clear}
            className="inline-flex h-11 items-center px-2 font-mono text-[11px] text-zinc-500 outline-none hover:text-zinc-200 focus-visible:text-zinc-200"
          >
            {t("console.clear")}
          </button>
        )}
        <button
          type="button"
          onClick={onToggleExpand}
          aria-label={isExpanded ? t("console.collapse") : t("console.expand", { shortcut: shortcutLabel })}
          title={isExpanded ? t("console.collapse") : t("console.expand", { shortcut: shortcutLabel })}
          aria-keyshortcuts="Meta+K Control+K"
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
          {isStreaming ? t("console.responding") : ""}
        </p>

        {session.entries.length === 0 && (
          <article className="flex max-w-[95%] flex-col items-start gap-1.5">
            <p className="font-mono text-[11px] font-medium text-emerald-400">{t("console.title")}</p>
            <p className={ASSISTANT_BUBBLE}>{t("console.welcome")}</p>
          </article>
        )}

        {session.entries.map((entry) => (
          <TranscriptEntry key={entry.id} entry={entry} context={context} />
        ))}

        {session.errorKind && (
          <p role="alert" className="rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-400">
            {dictionary.console.errors[session.errorKind]}
          </p>
        )}
      </div>

      <div className="shrink-0 border-t border-zinc-800 px-3 py-3">
        <form
          onSubmit={submit}
          className="flex items-end gap-2 rounded-lg border border-zinc-700/80 bg-zinc-900/90 p-2.5 transition-colors focus-within:border-emerald-500/60"
        >
          <label htmlFor={inputId} className="sr-only">
            {t("console.inputLabel")}
          </label>
          <textarea
            id={inputId}
            ref={textareaRef}
            value={session.input}
            rows={1}
            maxLength={INPUT_MAX_CHARS}
            onChange={(event) => session.setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("console.placeholder")}
            enterKeyHint="send"
            autoComplete="off"
            autoCapitalize={commandLike ? "none" : "sentences"}
            spellCheck={!commandLike}
            className="max-h-28 min-h-11 flex-1 resize-none bg-transparent py-2 font-mono text-base text-zinc-100 caret-emerald-400 outline-none placeholder:text-zinc-500 sm:text-sm"
          />
          <button
            type="submit"
            aria-label={t("console.send")}
            disabled={!canSubmit}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-950 outline-none transition-shadow hover:bg-white hover:shadow-[0_0_18px_rgb(16_185_129/0.45)] focus-visible:ring-2 focus-visible:ring-emerald-400/60 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none"
          >
            <ArrowUp aria-hidden="true" className="size-4" />
          </button>
        </form>

        <ul
          aria-label={t("console.suggestionsLabel")}
          className="mt-2.5 flex gap-2 overflow-x-auto [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden"
        >
          {chips.map((chip) => (
            <li key={chip.id} className="shrink-0">
              <button
                type="button"
                disabled={chip.kind === "query" && isStreaming}
                onClick={() => onChip(chip)}
                className="inline-flex h-11 items-center gap-1.5 rounded-full border border-zinc-800 px-3 text-xs whitespace-nowrap text-zinc-400 outline-none transition-all hover:border-emerald-500/50 hover:bg-zinc-900 hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-emerald-400/50 disabled:cursor-not-allowed disabled:opacity-50 lg:h-8"
              >
                {localize(chip.label)}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function TranscriptEntry({ entry, context }: { entry: ConsoleEntry; context: TerminalContext }) {
  const { t } = useLocale();

  if (entry.kind === "user") {
    return (
      <p className="ml-auto max-w-[90%] rounded-2xl rounded-tr-md bg-zinc-100 px-3.5 py-2.5 text-sm leading-relaxed break-words text-zinc-950">
        {entry.content}
      </p>
    );
  }

  if (entry.kind === "assistant") {
    return (
      <article className="flex max-w-[95%] flex-col items-start gap-1.5">
        <p className="font-mono text-[11px] font-medium text-emerald-400">{t("console.title")}</p>
        <div className={ASSISTANT_BUBBLE}>
          {entry.content ? (
            <ChatMarkdown content={entry.content} />
          ) : (
            <span className="inline-flex items-center gap-2 font-mono text-xs text-zinc-500">
              <span
                aria-hidden="true"
                className="size-1.5 animate-pulse rounded-full bg-emerald-400 motion-reduce:animate-none"
              />
              {t("console.responding")}
            </span>
          )}
        </div>
      </article>
    );
  }

  return (
    <div className="font-mono text-[13px] leading-6">
      <p className="flex gap-2 break-all">
        <span aria-hidden="true" className="shrink-0 text-emerald-400">
          {t("terminal.prompt")}
        </span>
        <span className="text-zinc-100">{entry.input}</span>
      </p>
      {entry.kind === "command" ? (
        <TerminalOutput lines={renderCommandOutput(entry.command, context)} />
      ) : (
        <TerminalOutput lines={[{ text: `${t("terminal.completions")} ${entry.matches.join("  ")}`, tone: "muted" }]} />
      )}
    </div>
  );
}
