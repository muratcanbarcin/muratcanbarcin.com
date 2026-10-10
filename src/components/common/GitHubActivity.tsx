"use client";

import { GitCommitHorizontal } from "lucide-react";
import { portfolioData } from "@/data/portfolioData";
import { useGitHubActivity } from "@/hooks/useGitHubActivity";
import { useLocale } from "@/hooks/useLocale";
import { formatRelativeTime } from "@/lib/date";
import { cn } from "@/lib/utils";

const GITHUB_PROFILE_URL =
  portfolioData.profile.socials.find((social) => social.platform === "github")?.url ?? "https://github.com";

const STRIP_CLASSES =
  "group inline-flex h-11 max-w-full min-w-0 items-center gap-2.5 rounded-full border border-zinc-800/80 bg-zinc-900/30 px-3.5 font-mono text-xs transition-colors sm:h-9";

export function GitHubActivity({ className }: { className?: string }) {
  const { t, currentLocale } = useLocale();
  const state = useGitHubActivity();

  return (
    <div aria-live="polite" className={cn("flex w-full min-w-0", className)}>
      {state.status === "loading" && (
        <span className={cn(STRIP_CLASSES, "text-zinc-600")}>
          <GitCommitHorizontal aria-hidden="true" className="size-3.5 shrink-0 animate-pulse" />
          {t("github.loading")}
        </span>
      )}

      {state.status === "unavailable" && (
        <a
          href={GITHUB_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(STRIP_CLASSES, "text-zinc-500 hover:border-zinc-700 hover:text-zinc-300")}
        >
          <GitCommitHorizontal aria-hidden="true" className="size-3.5 shrink-0" />
          {t("github.unavailable")}
        </a>
      )}

      {state.status === "ready" && (
        <a
          href={state.activity.commitUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={state.activity.message}
          className={cn(STRIP_CLASSES, "hover:border-zinc-700")}
        >
          <span aria-hidden="true" className="relative flex size-3.5 shrink-0 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30 motion-reduce:animate-none" />
            <GitCommitHorizontal className="relative size-3.5 text-emerald-400" />
          </span>
          <span className="hidden shrink-0 text-zinc-600 sm:inline">{t("github.latestPush")}</span>
          <span className="min-w-0 truncate text-zinc-300 group-hover:text-zinc-100 md:shrink-0">
            {state.activity.repo}
          </span>
          <span className="hidden min-w-0 truncate text-zinc-500 md:inline">“{state.activity.message}”</span>
          <time dateTime={state.activity.pushedAt} className="shrink-0 text-zinc-600">
            {formatRelativeTime(state.activity.pushedAt, state.fetchedAt, currentLocale)}
          </time>
        </a>
      )}
    </div>
  );
}
