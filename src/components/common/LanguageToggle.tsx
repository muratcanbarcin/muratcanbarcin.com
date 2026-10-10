"use client";

import type { Locale } from "@/types";
import { useLocale } from "@/hooks/useLocale";
import { LOCALES } from "@/lib/i18n";
import { actionVariants } from "@/components/ui/action";
import { cn } from "@/lib/utils";

const nextLocale = (current: Locale): Locale => (current === "en" ? "tr" : "en");

export function LanguageToggle({ className }: { className?: string }) {
  const { currentLocale, setLocale, t } = useLocale();
  const target = nextLocale(currentLocale);

  return (
    <button
      type="button"
      onClick={() => setLocale(target)}
      aria-label={`${t("meta.switchLanguage")} (${target.toUpperCase()})`}
      className={cn(actionVariants({ intent: "ghost", size: "md" }), "gap-1 px-2.5 font-mono text-xs", className)}
    >
      {LOCALES.map((locale, index) => (
        <span key={locale} className="flex items-center gap-1">
          {index > 0 && (
            <span aria-hidden="true" className="text-zinc-700">
              /
            </span>
          )}
          <span
            className={cn(
              "uppercase transition-colors",
              locale === currentLocale ? "text-zinc-100" : "text-zinc-500",
            )}
          >
            {locale}
          </span>
        </span>
      ))}
    </button>
  );
}
