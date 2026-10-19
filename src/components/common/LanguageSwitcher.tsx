"use client";

import type { Locale } from "@/types";
import { useLocale } from "@/hooks/useLocale";
import { LOCALES } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { currentLocale, setLocale, t } = useLocale();

  return (
    <div
      role="group"
      aria-label={t("meta.switchLanguage")}
      className={cn(
        "inline-flex h-[50px] shrink-0 items-center rounded-full border p-0.5 lg:h-9",
        "border-[#e4e4e7] bg-[#f4f4f5]",
        "dark:border-zinc-800 dark:bg-zinc-900",
        className,
      )}
    >
      {LOCALES.map((locale, index) => (
        <span key={locale} className="inline-flex h-full items-center">
          {index > 0 && (
            <span aria-hidden="true" className="mx-px h-3.5 w-px shrink-0 bg-[#d4d4d8] dark:bg-zinc-700" />
          )}
          <LocaleSegment locale={locale} active={locale === currentLocale} onSelect={setLocale} />
        </span>
      ))}
    </div>
  );
}

function LocaleSegment({
  locale,
  active,
  onSelect,
}: {
  locale: Locale;
  active: boolean;
  onSelect: (locale: Locale) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(locale)}
      aria-pressed={active}
      className={cn(
        "inline-flex h-full min-w-11 items-center justify-center gap-1.5 rounded-full px-2.5 font-mono text-[11px] font-medium tracking-wide uppercase transition-[color,background-color,box-shadow,transform] duration-150 outline-none active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 lg:min-w-9",
        "focus-visible:ring-2 focus-visible:ring-emerald-500/50",
        active
          ? "bg-white text-[#09090b] shadow-[0_1px_2px_rgb(9_9_11/0.08),0_0_0_1px_rgb(9_9_11/0.04)] dark:bg-zinc-800 dark:text-zinc-50 dark:shadow-[0_1px_2px_rgb(0_0_0/0.45)]"
          : "text-[#71717a] hover:text-[#09090b] dark:text-zinc-500 dark:hover:text-zinc-200",
      )}
    >
      {active && (
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full bg-emerald-600 shadow-[0_0_8px_rgb(5_150_105/0.65)] dark:bg-emerald-400 dark:shadow-[0_0_8px_rgb(52_211_153/0.85)]"
        />
      )}
      {locale}
    </button>
  );
}
