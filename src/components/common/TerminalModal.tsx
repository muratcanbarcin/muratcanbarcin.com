"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { TerminalLine, TerminalTone } from "@/types";
import { useLocale } from "@/hooks/useLocale";
import { useModalDialog } from "@/hooks/useModalDialog";
import { useTerminal } from "@/hooks/useTerminal";
import { subscribeToTerminalOpen } from "@/services/terminalEvents";
import { renderCommandOutput, renderWelcome, type TerminalContext } from "@/services/terminalCommands";
import { cn } from "@/lib/utils";

const TONE_CLASSES: Record<TerminalTone, string> = {
  default: "text-zinc-300",
  muted: "text-zinc-500",
  accent: "text-emerald-300",
  heading: "font-semibold text-zinc-100",
  error: "text-red-400",
  success: "text-emerald-400",
};

const WINDOW_DOTS = ["bg-red-500/80", "bg-amber-400/80", "bg-emerald-500/80"] as const;

export function TerminalModal() {
  const { t, dictionary, currentLocale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => setIsOpen(false), []);
  const terminal = useTerminal({ onClose: close });

  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const { dialogRef, onBackdropClick } = useModalDialog({ isOpen, onClose: close, initialFocusRef: inputRef });

  const context = useMemo<TerminalContext>(
    () => ({ dictionary, locale: currentLocale }),
    [dictionary, currentLocale],
  );

  useEffect(() => subscribeToTerminalOpen(() => setIsOpen(true)), []);

  useEffect(() => {
    const output = outputRef.current;
    if (output) output.scrollTop = output.scrollHeight;
  }, [terminal.entries, isOpen]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      terminal.submit();
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      terminal.navigateHistory(event.key === "ArrowUp" ? "older" : "newer");
    } else if (event.key === "Tab") {
      event.preventDefault();
      terminal.complete();
    } else if (event.key.toLowerCase() === "l" && event.ctrlKey) {
      event.preventDefault();
      terminal.clear();
    }
  };

  const focusInputUnlessSelecting = () => {
    if (!window.getSelection()?.toString()) inputRef.current?.focus();
  };

  const prompt = (
    <span aria-hidden="true" className="shrink-0 text-emerald-400">
      {t("terminal.prompt")}
    </span>
  );

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="terminal-title"
      onClose={close}
      onClick={onBackdropClick}
      className={cn(
        "m-auto h-[min(34rem,calc(100dvh-2rem))] w-[calc(100%-1.5rem)] max-w-3xl overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/90 p-0 text-zinc-300 shadow-2xl shadow-black/60 backdrop-blur-xl",
        "backdrop:bg-zinc-950/60 backdrop:backdrop-blur-sm",
        "scale-[0.98] opacity-0 transition-[opacity,scale,display,overlay] transition-discrete duration-200 open:scale-100 open:opacity-100 starting:open:scale-[0.98] starting:open:opacity-0 motion-reduce:transition-none",
      )}
    >
      <div className="flex h-full flex-col">
        <header className="flex h-11 shrink-0 items-center gap-3 border-b border-zinc-800 pl-4">
          <div aria-hidden="true" className="flex gap-1.5">
            {WINDOW_DOTS.map((color) => (
              <span key={color} className={cn("size-2.5 rounded-full", color)} />
            ))}
          </div>
          <h2 id="terminal-title" className="flex-1 truncate text-center font-mono text-xs text-zinc-400">
            {t("terminal.title")}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label={t("terminal.close")}
            className="flex h-11 items-center px-4 font-mono text-[11px] text-zinc-500 outline-none hover:text-zinc-200 focus-visible:text-zinc-200"
          >
            [ESC]
          </button>
        </header>

        <div
          ref={outputRef}
          onClick={focusInputUnlessSelecting}
          className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 font-mono text-[13px] leading-6"
        >
          <div role="log" aria-live="polite" aria-label={t("terminal.outputLabel")} className="flex flex-col gap-2">
            {terminal.showWelcome && <TerminalOutput lines={renderWelcome(context)} />}
            {terminal.entries.map((entry) => (
              <div key={entry.id}>
                <p className="flex gap-2 break-all">
                  {prompt}
                  <span className="text-zinc-100">{entry.input}</span>
                </p>
                {entry.kind === "command" ? (
                  <TerminalOutput lines={renderCommandOutput(entry.input, context)} />
                ) : (
                  <TerminalOutput
                    lines={[{ text: `${t("terminal.completions")} ${entry.matches.join("  ")}`, tone: "muted" }]}
                  />
                )}
              </div>
            ))}
          </div>

          <label className="mt-2 flex items-center gap-2">
            {prompt}
            <span className="sr-only">{t("terminal.inputLabel")}</span>
            <input
              ref={inputRef}
              value={terminal.input}
              onChange={(event) => terminal.setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("terminal.placeholder")}
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="send"
              className="min-w-0 flex-1 bg-transparent text-base text-zinc-100 caret-emerald-400 outline-none placeholder:text-zinc-700 sm:text-[13px]"
            />
          </label>
        </div>
      </div>
    </dialog>
  );
}

const MAX_LABEL_CHARS = 20;
const LABEL_SLACK_CH = 2;

function measureLabelColumn(lines: readonly TerminalLine[]): string | undefined {
  const longest = lines.reduce((max, line) => Math.max(max, line.label?.length ?? 0), 0);
  if (longest === 0) return undefined;
  return `min(${Math.min(longest, MAX_LABEL_CHARS) + LABEL_SLACK_CH}ch, 50%)`;
}

function TerminalOutput({ lines }: { lines: readonly TerminalLine[] }) {
  if (lines.length === 0) return null;
  const labelWidth = measureLabelColumn(lines);
  return (
    <div className="flex flex-col">
      {lines.map((line, index) => (
        <div key={index} className="flex min-h-6 gap-3">
          {line.label !== undefined && (
            <span style={{ width: labelWidth }} className="shrink-0 truncate text-zinc-500">
              {line.label}
            </span>
          )}
          <span className={cn("min-w-0 break-words", TONE_CLASSES[line.tone ?? "default"])}>
            {line.href ? (
              <a
                href={line.href}
                {...(!line.href.startsWith("mailto:") && { target: "_blank", rel: "noopener noreferrer" })}
                className="underline decoration-zinc-700 underline-offset-4 hover:text-zinc-100 hover:decoration-zinc-400"
              >
                {line.text}
              </a>
            ) : (
              line.text
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
