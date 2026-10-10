"use client";

import type { ReactNode } from "react";
import { ArrowDownRight } from "lucide-react";
import { portfolioData } from "@/data/portfolioData";
import { useLocale } from "@/hooks/useLocale";
import { actionVariants } from "@/components/ui/action";
import { RequestResumeLink } from "@/components/common/RequestResumeLink";
import { SocialLinks } from "@/components/common/SocialLinks";
import { GitHubActivity } from "@/components/common/GitHubActivity";
import { cn } from "@/lib/utils";

const { profile } = portfolioData;

export function HeroSection() {
  const { t, localize, dictionary } = useLocale();
  const focusTags = Object.values(dictionary.hero.focusTags);

  return (
    <section id="top" aria-labelledby="hero-title" className="relative scroll-mt-24 pt-6 sm:pt-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-4 -top-12 -z-10 h-[30rem] bg-[linear-gradient(to_right,rgb(39_39_42/0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgb(39_39_42/0.45)_1px,transparent_1px)] mask-[radial-gradient(ellipse_at_top,black_20%,transparent_70%)] bg-size-[48px_48px] sm:-inset-x-8"
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
        <div className="flex flex-col items-start gap-6">
          <p className="inline-flex items-center gap-2.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 py-1.5 pr-3.5 pl-3 font-mono text-[11px] text-emerald-300 sm:text-xs">
            <span aria-hidden="true" className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            {t("hero.availability")}
          </p>

          <div className="flex flex-col gap-3">
            <p className="font-mono text-xs text-zinc-500">
              <span className="text-emerald-400/80">$</span> whoami
            </p>
            <h1
              id="hero-title"
              className="text-4xl font-semibold tracking-tight text-balance text-zinc-50 sm:text-6xl"
            >
              {profile.name}
            </h1>
            <p className="font-mono text-base text-zinc-400 sm:text-xl">{localize(profile.headline)}</p>
          </div>

          <p className="max-w-xl text-lg leading-relaxed text-balance text-zinc-400 sm:text-xl">
            {localize(profile.valueProposition)}
          </p>

          <div className="flex w-full flex-col gap-3 pt-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <a href="#projects" className={cn(actionVariants({ intent: "primary", size: "lg" }), "font-mono text-[13px]")}>
              <span aria-hidden="true" className="text-zinc-500">
                [
              </span>
              {t("cta.exploreProjects")}
              <ArrowDownRight aria-hidden="true" />
              <span aria-hidden="true" className="text-zinc-500">
                ]
              </span>
            </a>
            <RequestResumeLink
              labelKey="cta.requestFullResume"
              intent="secondary"
              size="lg"
              className="font-mono text-[13px]"
            />
            <SocialLinks className="sm:ml-1" />
          </div>

          <GitHubActivity className="mt-2" />
        </div>

        <aside
          aria-label={t("hero.roleTag")}
          className="hidden overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 font-mono text-xs lg:block"
        >
          <div className="flex items-center gap-1.5 border-b border-zinc-800 px-4 py-3">
            <span aria-hidden="true" className="size-2 rounded-full bg-zinc-700" />
            <span aria-hidden="true" className="size-2 rounded-full bg-zinc-700" />
            <span aria-hidden="true" className="size-2 rounded-full bg-zinc-700" />
            <span className="ml-2 text-zinc-500">profile.json</span>
          </div>
          <dl className="flex flex-col gap-2.5 p-4 leading-relaxed">
            <ProfileField name="status">
              <span className="text-emerald-400">open_to_work</span>
            </ProfileField>
            <ProfileField name="role">{t("hero.roleTag")}</ProfileField>
            <ProfileField name="location">{profile.location}</ProfileField>
            <ProfileField name="focus">
              <ul className="flex flex-col">
                {focusTags.map((tag) => (
                  <li key={tag} className="before:text-zinc-600 before:content-['-_']">
                    {tag}
                  </li>
                ))}
              </ul>
            </ProfileField>
          </dl>
        </aside>
      </div>
    </section>
  );
}

function ProfileField({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] gap-2">
      <dt className="text-zinc-500">{name}:</dt>
      <dd className="text-zinc-300">{children}</dd>
    </div>
  );
}
