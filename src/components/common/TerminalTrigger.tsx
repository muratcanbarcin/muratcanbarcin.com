"use client";

import { useLocale } from "@/hooks/useLocale";
import { requestTerminalOpen } from "@/services/terminalEvents";
import { actionVariants } from "@/components/ui/action";
import { cn } from "@/lib/utils";

interface TerminalTriggerProps {
  shortcutLabel: string;
  className?: string;
  onTrigger?: () => void;
}

export function TerminalTrigger({ shortcutLabel, className, onTrigger }: TerminalTriggerProps) {
  const { t } = useLocale();

  const handleClick = () => {
    onTrigger?.();
    requestTerminalOpen();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={t("terminal.open")}
      title={t("terminal.shortcutHint", { shortcut: shortcutLabel })}
      aria-keyshortcuts="Meta+K Control+K"
      className={cn(actionVariants({ intent: "secondary", size: "md" }), "gap-2 font-mono text-xs", className)}
    >
      <span className="text-zinc-300">
        <span className="text-emerald-400">~</span> CLI
      </span>
      <kbd className="rounded border border-zinc-700/80 bg-zinc-950 px-1.5 py-px font-mono text-[10px] text-zinc-500">
        {shortcutLabel}
      </kbd>
    </button>
  );
}
