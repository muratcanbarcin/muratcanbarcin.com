"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useLocale } from "@/hooks/useLocale";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme } = useTheme();
  const { t } = useLocale();

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t("meta.toggleTheme")}
      className={cn(
        "relative inline-flex size-11 shrink-0 items-center justify-center rounded-full border transition-[color,background-color,border-color,box-shadow] duration-200 outline-none lg:size-9",
        "border-[#e4e4e7] bg-[#f4f4f5] text-[#18181b] hover:border-[#a1a1aa] hover:shadow-[0_0_16px_rgb(9_9_11/0.12)]",
        "dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:shadow-[0_0_18px_rgb(244_244_245/0.16)]",
        "focus-visible:ring-2 focus-visible:ring-zinc-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <Sun
        aria-hidden="true"
        className="absolute size-4 scale-100 rotate-0 opacity-100 transition-all duration-300 ease-out motion-reduce:transition-none dark:scale-0 dark:-rotate-90 dark:opacity-0"
      />
      <Moon
        aria-hidden="true"
        className="absolute size-4 scale-0 rotate-90 opacity-0 transition-all duration-300 ease-out motion-reduce:transition-none dark:scale-100 dark:rotate-0 dark:opacity-100"
      />
    </button>
  );
}
