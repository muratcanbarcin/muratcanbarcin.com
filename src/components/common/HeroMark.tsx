"use client";

import { useLocale } from "@/hooks/useLocale";
import { cn } from "@/lib/utils";

/** A general line under the hero actions. Not a tool list. */
export function HeroMark({ className }: { className?: string }) {
  const { t } = useLocale();

  return (
    <p className={cn("flex items-center gap-3 text-sm tracking-wide text-zinc-400", className)}>
      <span aria-hidden="true" className="h-px w-8 shrink-0 bg-emerald-400/70" />
      {t("hero.mark")}
    </p>
  );
}
