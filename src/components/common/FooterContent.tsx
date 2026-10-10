"use client";

import { ArrowUp } from "lucide-react";
import { portfolioData } from "@/data/portfolioData";
import { useLocale } from "@/hooks/useLocale";
import { actionVariants } from "@/components/ui/action";
import { GitHubIcon } from "./BrandIcons";
import { cn } from "@/lib/utils";

const { profile, sourceRepositoryUrl } = portfolioData;

export function FooterContent({ year }: { year: number }) {
  const { t } = useLocale();

  return (
    <footer className="border-t border-zinc-800/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-sm font-semibold tracking-tight text-zinc-100">MCB</p>
          <p className="text-xs text-zinc-500">{t("footer.copyright", { year, name: profile.name })}</p>
          <p className="font-mono text-[11px] text-zinc-600">{t("footer.builtWith")}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={sourceRepositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(actionVariants({ intent: "ghost", size: "md" }), "font-mono text-xs")}
          >
            <GitHubIcon className="size-3.5" />
            {t("footer.viewSource")}
          </a>
          <a
            href="#top"
            aria-label={t("cta.backToTop")}
            title={t("cta.backToTop")}
            className={actionVariants({ intent: "secondary", size: "icon" })}
          >
            <ArrowUp aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
