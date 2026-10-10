"use client";

import { useCallback, useId, useRef, useState } from "react";
import { useModalDialog } from "@/hooks/useModalDialog";
import { usePortfolioChat } from "@/hooks/usePortfolioChat";
import { cn } from "@/lib/utils";
import { ChatConsole } from "./ChatConsole";

/** Embedded MCB.ai console that can lift into a focused full-screen dialog without losing the conversation. */
export function MCBAIChat({ className }: { className?: string }) {
  const chat = usePortfolioChat();
  const [isExpanded, setIsExpanded] = useState(false);
  const expandedInputRef = useRef<HTMLTextAreaElement>(null);
  const inlineTitleId = useId();
  const expandedTitleId = useId();

  const expand = useCallback(() => setIsExpanded(true), []);
  const collapse = useCallback(() => setIsExpanded(false), []);
  const { dialogRef, onBackdropClick } = useModalDialog({
    isOpen: isExpanded,
    onClose: collapse,
    initialFocusRef: expandedInputRef,
  });

  return (
    <>
      <ChatConsole
        chat={chat}
        titleId={inlineTitleId}
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
          "backdrop:bg-zinc-950/70 backdrop:backdrop-blur-sm",
          "scale-[0.98] opacity-0 transition-[opacity,scale,display,overlay] transition-discrete duration-200 open:scale-100 open:opacity-100 starting:open:scale-[0.98] starting:open:opacity-0 motion-reduce:transition-none",
        )}
      >
        {isExpanded && (
          <ChatConsole
            chat={chat}
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
