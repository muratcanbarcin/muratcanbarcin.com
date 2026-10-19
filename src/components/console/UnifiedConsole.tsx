"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { PromptChip } from "@/types";
import { consoleSuggestions } from "@/data/consolePrompts";
import { useLocale } from "@/hooks/useLocale";
import { useModalDialog } from "@/hooks/useModalDialog";
import { useUnifiedConsole, type ConsoleSideEffect } from "@/hooks/useUnifiedConsole";
import { subscribeToConsoleRequests } from "@/services/consoleEvents";
import { requestResumeModalOpen } from "@/services/resumeRequest";
import { cn } from "@/lib/utils";
import { ConsolePanel } from "./ConsolePanel";

/**
 * MCB.ai and the developer shell in one transcript. Docked in the hero, it lifts into a focused
 * full-screen dialog (⌘K / Ctrl+K / `~`) without losing the conversation or command history.
 */
export function UnifiedConsole({ className }: { className?: string }) {
  const { localize } = useLocale();
  const [isExpanded, setIsExpanded] = useState(false);
  const expandedInputRef = useRef<HTMLTextAreaElement>(null);
  const dockedTitleId = useId();
  const expandedTitleId = useId();

  const expand = useCallback(() => setIsExpanded(true), []);
  const collapse = useCallback(() => setIsExpanded(false), []);
  const { dialogRef, onBackdropClick } = useModalDialog({
    isOpen: isExpanded,
    onClose: collapse,
    initialFocusRef: expandedInputRef,
  });

  const handleEffect = useCallback(
    (effect: ConsoleSideEffect) => {
      collapse();
      if (effect === "request-resume") requestResumeModalOpen();
    },
    [collapse],
  );

  const session = useUnifiedConsole({ onEffect: handleEffect });

  useEffect(
    () =>
      subscribeToConsoleRequests((request) => {
        if (request.action === "toggle") {
          setIsExpanded((current) => !current);
          return;
        }
        setIsExpanded(true);
      }),
    [],
  );

  const runChip = (chip: PromptChip) => {
    if (chip.kind === "query") session.ask(localize(chip.prompt));
    else session.run(chip.command);
  };

  const panelProps = {
    session,
    chips: consoleSuggestions,
    onChip: runChip,
  };

  return (
    <>
      <ConsolePanel
        {...panelProps}
        titleId={dockedTitleId}
        isExpanded={false}
        onToggleExpand={expand}
        className={className}
      />

      <dialog
        ref={dialogRef}
        aria-labelledby={expandedTitleId}
        onClose={collapse}
        onClick={onBackdropClick}
        className={cn(
          "m-auto h-[min(46rem,calc(100dvh-1.5rem))] w-[calc(100%-1.5rem)] max-w-3xl overflow-visible bg-transparent p-0",
          "backdrop:bg-black/40 backdrop:backdrop-blur-sm dark:backdrop:bg-zinc-950/70",
          "scale-[0.98] opacity-0 transition-[opacity,scale,display,overlay] transition-discrete duration-200 open:scale-100 open:opacity-100 starting:open:scale-[0.98] starting:open:opacity-0 motion-reduce:transition-none",
        )}
      >
        {isExpanded && (
          <ConsolePanel
            {...panelProps}
            titleId={expandedTitleId}
            isExpanded
            onToggleExpand={collapse}
            inputRef={expandedInputRef}
            className="h-full bg-zinc-950/95"
          />
        )}
      </dialog>
    </>
  );
}
