"use client";

import { ArrowUp } from "lucide-react";
import { portfolioData } from "@/data/portfolioData";
import { useLocale } from "@/hooks/useLocale";
import { actionVariants } from "@/components/ui/action";
import { GitHubIcon } from "./BrandIcons";
import { RequestResumeLink } from "./RequestResumeLink";
import { SocialLinks } from "./SocialLinks";
import { cn } from "@/lib/utils";

const { profile, resumeRequest, sourceRepositoryUrl } = portfolioData;

export function FooterContent({ year }: { year: number }) {
  const { t } = useLocale();

  return (
    <footer id="contact" aria-labelledby="contact-title" className="scroll-mt-24 border-t border-zinc-800/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-3">
            <p className="font-mono text-xs text-zinc-500">
              <span className="text-emerald-400/80">$</span> ./contact --open
              <span className="sr-only"> — {t("footer.contactTitle")}</span>
            </p>
            <h2 id="contact-title" className="text-2xl font-semibold tracking-tight text-zinc-100">
              {t("footer.contactPitch")}
            </h2>
            <a
              href={`mailto:${resumeRequest.recipient}`}
              className="inline-flex min-h-11 w-fit items-center font-mono text-sm text-zinc-300 underline-offset-4 hover:text-zinc-100 hover:underline sm:min-h-0"
            >
              {resumeRequest.recipient}
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <RequestResumeLink intent="primary" size="lg" />
            <SocialLinks />
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-zinc-800/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
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
      </div>
    </footer>
  );
}
