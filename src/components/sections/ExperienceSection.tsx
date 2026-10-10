"use client";

import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import type { Education, Experience } from "@/types";
import { portfolioData } from "@/data/portfolioData";
import { useLocale } from "@/hooks/useLocale";
import { SectionHeader } from "@/components/common/SectionHeader";
import { TechTagList } from "@/components/common/TechTag";
import { formatYearMonth, monthsBetweenInclusive } from "@/lib/date";
import { shortHash } from "@/lib/hash";
import { cn } from "@/lib/utils";

const { experiences, education } = portfolioData;

export function ExperienceSection() {
  const { t } = useLocale();

  return (
    <section id="experience" aria-labelledby="experience-title" className="scroll-mt-24">
      <SectionHeader
        index="02"
        command="git log --graph --oneline career"
        title={t("sections.experience")}
        description={t("sectionIntros.experience")}
        titleId="experience-title"
      />
      <ol className="relative flex flex-col gap-6">
        <span
          aria-hidden="true"
          className="absolute top-3 bottom-3 left-[11px] w-px bg-linear-to-b from-emerald-500/40 via-zinc-800 to-zinc-800"
        />
        {experiences.map((experience, index) => (
          <ExperienceCommit key={experience.id} experience={experience} isHead={index === 0} />
        ))}
        {education.map((entry) => (
          <EducationCommit key={entry.institution} education={entry} />
        ))}
      </ol>
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

function EducationCommit({ education }: { education: Education }) {
  const { t, localize } = useLocale();

  return (
    <CommitShell
      hash={shortHash(education.institution)}
      refLabel={`tag: ${t("experience.rootCommit")}`}
      meta={education.period}
    >
      <header className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold tracking-tight text-zinc-100 sm:text-lg">
            {localize(education.degree)}
          </h3>
          <span className="rounded-md border border-zinc-800 bg-zinc-950/60 px-1.5 py-px font-mono text-[10px] text-zinc-400">
            {t("experience.education")}
          </span>
        </div>
        <p className="text-sm text-zinc-200">{education.institution}</p>
      </header>

      <dl className="flex flex-wrap gap-2 font-mono text-[11px]">
        <div className="flex gap-1.5 rounded-md border border-zinc-800 bg-zinc-950/60 px-2 py-1">
          <dt className="text-zinc-500">{t("common.gpa")}</dt>
          <dd className="text-zinc-200">
            {education.gpa}
            <span className="text-zinc-600"> / {education.maxGpa}</span>
          </dd>
        </div>
        {education.honors && (
          <div className="flex rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 text-emerald-300">
            <dt className="sr-only">{t("common.highlights")}</dt>
            <dd>{localize(education.honors)}</dd>
          </div>
        )}
      </dl>

      {education.coursework && education.coursework.length > 0 && (
        <TechTagList items={education.coursework} label={t("common.highlights")} />
      )}
    </CommitShell>
  );
}
