"use client";

import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import type { Experience } from "@/types";
import { careerHighlights, isProfessionalRole } from "@/data/experiences";
import { portfolioData } from "@/data/portfolioData";
import { useLocale } from "@/hooks/useLocale";
import { SectionHeader } from "@/components/common/SectionHeader";
import { TechTagList } from "@/components/common/TechTag";
import { formatYearMonth, monthsBetweenInclusive, roundedYearCount } from "@/lib/date";
import { shortHash } from "@/lib/hash";
import { cn } from "@/lib/utils";

const { experiences } = portfolioData;

export function ExperienceSection() {
  const { t } = useLocale();

  return (
    <section id="experience" aria-labelledby="experience-title" className="scroll-mt-24">
      <SectionHeader
        index="01"
        command="git log --graph --oneline career"
        title={t("sections.experience")}
        titleId="experience-title"
      />
      <ExperienceSummary />
      <ExperienceList experiences={experiences.filter(isProfessionalRole)} markHead />
      <LeadershipList experiences={experiences.filter((experience) => !isProfessionalRole(experience))} />
    </section>
  );
}

interface CommitShellProps {
  hash: string;
  isHead?: boolean;
  refLabel?: string;
  meta: ReactNode;
  children: ReactNode;
}

function ExperienceSummary() {
  const { t, localize } = useLocale();
  const work = experiences.filter(isProfessionalRole);
  const months = work.reduce((total, experience) => {
    if (experience.period.end === "Present") return total;
    return total + (monthsBetweenInclusive(experience.period.start, experience.period.end) ?? 0);
  }, 0);
  const years = roundedYearCount(months);
  const companies = [...new Set(work.map((experience) => experience.company))].join(" · ");

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
      <div className="flex flex-col gap-3 border-b border-zinc-800/80 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">{t("experience.tenureLabel")}</p>
          <p className="mt-1 font-mono text-3xl font-semibold tracking-tight text-zinc-50">
            {t(years === 1 ? "experience.tenureYear" : "experience.tenureYears", { count: years })}
          </p>
        </div>
        <p className="max-w-md text-sm text-zinc-400">{companies}</p>
      </div>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-4">
        {careerHighlights.map((item) => (
          <li key={item.id} className="flex flex-col gap-1 border-t border-zinc-800/80 px-5 py-4 sm:px-6">
            <p className="font-mono text-xl font-semibold tracking-tight text-emerald-300">{item.figure}</p>
            <p className="text-sm text-zinc-200">{localize(item.label)}</p>
            <p className="font-mono text-[11px] text-zinc-500">{localize(item.context)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExperienceList({
  experiences: items,
  markHead,
}: {
  experiences: readonly Experience[];
  markHead: boolean;
}) {
  return (
    <ol className="relative flex flex-col gap-6">
      <span
        aria-hidden="true"
        className="absolute top-3 bottom-3 left-[11px] w-px bg-linear-to-b from-emerald-500/40 via-zinc-800 to-zinc-800"
      />
      {items.map((experience, index) => (
        <ExperienceCommit key={experience.id} experience={experience} isHead={markHead && index === 0} />
      ))}
    </ol>
  );
}

function LeadershipList({ experiences: items }: { experiences: readonly Experience[] }) {
  const { t } = useLocale();
  if (items.length === 0) return null;

  return (
    <div className="mt-12 flex flex-col gap-5">
      <div className="flex flex-col gap-1 pl-9">
        <h3 className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">{t("experience.leadership")}</h3>
        <p className="text-sm text-zinc-500">{t("experience.leadershipNote")}</p>
      </div>
      <ExperienceList experiences={items} markHead={false} />
    </div>
  );
}

function CommitShell({ hash, isHead = false, refLabel, meta, children }: CommitShellProps) {
  return (
    <li className="relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3 sm:gap-5">
      <span
        aria-hidden="true"
        className={cn(
          "relative z-10 mt-5 flex size-[23px] items-center justify-center rounded-full border-2 bg-zinc-950",
          isHead ? "border-emerald-400/80" : "border-zinc-700",
        )}
      >
        <span className={cn("size-[7px] rounded-full", isHead ? "bg-emerald-400" : "bg-zinc-600")} />
      </span>

      <article className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 transition-colors hover:border-zinc-700 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[11px]">
          <span className="text-zinc-500">
            commit <span className="text-amber-300/80">{hash}</span>
          </span>
          {refLabel && (
            <span className={isHead ? "text-emerald-400" : "text-sky-300/80"}>({refLabel})</span>
          )}
          <span className="text-zinc-500 sm:ml-auto">{meta}</span>
        </div>
        {children}
      </article>
    </li>
  );
}

function ExperienceCommit({ experience, isHead }: { experience: Experience; isHead: boolean }) {
  const { t, localize, currentLocale, dictionary } = useLocale();
  const { period } = experience;
  const isOngoing = period.end === "Present";
  const end = isOngoing ? t("common.present") : formatYearMonth(period.end, currentLocale);
  const months = isOngoing ? null : monthsBetweenInclusive(period.start, period.end);

  return (
    <CommitShell
      hash={shortHash(experience.id)}
      isHead={isHead}
      refLabel={isHead ? "HEAD -> main" : undefined}
      meta={
        <>
          <time dateTime={period.start}>{formatYearMonth(period.start, currentLocale)}</time>
          {" — "}
          {isOngoing ? end : <time dateTime={period.end}>{end}</time>}
          {months !== null && <span className="text-zinc-600"> · {t("common.duration", { count: months })}</span>}
        </>
      }
    >
      <header className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold tracking-tight text-zinc-100 sm:text-lg">
            {localize(experience.role)}
          </h3>
          <span className="rounded-md border border-zinc-800 bg-zinc-950/60 px-1.5 py-px font-mono text-[10px] text-zinc-400">
            {dictionary.filters.employment[experience.type]}
          </span>
        </div>
        <p className="text-sm text-zinc-400">
          {experience.companyUrl ? (
            <a
              href={experience.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="-my-3 inline-flex items-center gap-0.5 py-3 text-zinc-200 underline-offset-4 hover:underline"
            >
              {experience.company}
              <ArrowUpRight aria-hidden="true" className="size-3.5 text-zinc-500" />
            </a>
          ) : (
            <span className="text-zinc-200">{experience.company}</span>
          )}
          <span className="text-zinc-600"> · </span>
          {experience.location}
        </p>
      </header>

      <ul aria-label={t("common.highlights")} className="flex flex-col gap-2">
        {localize(experience.highlights).map((highlight) => (
          <li key={highlight} className="grid grid-cols-[1rem_minmax(0,1fr)] text-sm leading-relaxed text-zinc-400">
            <span aria-hidden="true" className="font-mono text-emerald-400/80">
              +
            </span>
            {highlight}
          </li>
        ))}
      </ul>

      {(experience.techStack.length > 0 || experience.proofs) && (
        <footer className="flex flex-wrap items-center gap-3">
          <TechTagList items={experience.techStack} label={t("common.techStack")} />
          {experience.proofs && (
            <ul aria-label={t("experience.proofs")} className="flex flex-wrap gap-3">
              {experience.proofs.map((proof) => (
                <li key={proof.url}>
                  <a
                    href={proof.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-1 font-mono text-xs text-zinc-300 underline-offset-4 hover:underline sm:min-h-0"
                  >
                    {proof.title}
                    <ArrowUpRight aria-hidden="true" className="size-3.5 text-zinc-500" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </footer>
      )}
    </CommitShell>
  );
}
