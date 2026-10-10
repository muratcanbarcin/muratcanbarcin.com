"use client";

import { ArrowDownRight } from "lucide-react";
import { portfolioData } from "@/data/portfolioData";
import { useLocale } from "@/hooks/useLocale";
import { actionVariants } from "@/components/ui/action";
import { UnifiedConsole } from "@/components/console/UnifiedConsole";
import { AvailabilityBadge } from "@/components/common/AvailabilityBadge";
import { RequestResumeButton } from "@/components/common/RequestResumeButton";
import { SocialLinks } from "@/components/common/SocialLinks";
import { GitHubActivity } from "@/components/common/GitHubActivity";
import { cn } from "@/lib/utils";

const { profile } = portfolioData;

/** Splits "Role (Focus)" so the focus clause can carry its own accent without duplicating copy. */
function splitHeadline(headline: string): { role: string; focus: string | null } {
  const match = headline.match(/^(.*?)\s*(\([^)]+\))\s*$/);
  if (!match?.[1] || !match[2]) return { role: headline, focus: null };
  return { role: match[1], focus: match[2] };
}

export function HeroSection() {
  const { t, localize } = useLocale();
  const { role, focus } = splitHeadline(localize(profile.headline));

  return (
    <section id="top" aria-labelledby="hero-title" className="relative scroll-mt-24 pt-2 sm:pt-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-4 -top-12 -z-10 h-[34rem] bg-[linear-gradient(to_right,rgb(39_39_42/0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgb(39_39_42/0.45)_1px,transparent_1px)] mask-[radial-gradient(ellipse_at_top,black_20%,transparent_70%)] bg-size-[48px_48px] sm:-inset-x-8"
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-12">
        <div className="flex min-w-0 flex-col items-start gap-6">
          <div className="flex flex-col gap-3">
            <p className="font-mono text-xs text-zinc-500">
              <span className="text-emerald-400/80">$</span> whoami
            </p>
            <h1
              id="hero-title"
              className="text-4xl font-semibold tracking-tight text-balance text-zinc-50 sm:text-5xl xl:text-6xl"
            >
              {profile.name}
            </h1>
            <p className="text-xl font-semibold tracking-tight text-balance text-zinc-100 sm:text-2xl md:text-3xl">
              {role}
              {focus ? (
                <>
                  {" "}
                  <span className="font-mono text-lg font-medium text-emerald-400 sm:text-xl">{focus}</span>
                </>
              ) : null}
            </p>
            <AvailabilityBadge className="mt-1" />
          </div>

          <p className="max-w-xl text-lg leading-relaxed text-balance text-zinc-400">
            {localize(profile.valueProposition)}
          </p>

          <div className="flex w-full flex-col gap-3 pt-1 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <RequestResumeButton intent="primary" size="lg" bracketed className="font-mono text-[13px]" />
            <a
              href="#projects"
              className={cn(actionVariants({ intent: "secondary", size: "lg" }), "font-mono text-[13px]")}
            >
              <span aria-hidden="true" className="text-emerald-400/80">
                #
              </span>
              {t("cta.exploreProjects")}
              <ArrowDownRight aria-hidden="true" />
            </a>
            <SocialLinks className="sm:ml-1" />
          </div>

          <GitHubActivity className="mt-1" />
        </div>

        <UnifiedConsole className="h-[32rem] sm:h-[34rem]" />
      </div>
    </section>
  );
}
