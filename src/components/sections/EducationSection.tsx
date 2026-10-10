"use client";

import { portfolioData } from "@/data/portfolioData";
import { useLocale } from "@/hooks/useLocale";
import { SectionHeader } from "@/components/common/SectionHeader";
import { TechTagList } from "@/components/common/TechTag";

const { education } = portfolioData;

export function EducationSection() {
  const { t, localize } = useLocale();

  return (
    <section id="education" aria-labelledby="education-title" className="scroll-mt-24">
      <SectionHeader
        index="02"
        command="cat ./education.json"
        title={t("sections.education")}
        titleId="education-title"
      />
      <ul className="flex flex-col gap-4">
        {education.map((entry) => (
          <li key={entry.institution}>
            <article className="flex flex-col gap-5 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 sm:p-6">
              <header className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono text-[11px] tracking-wide text-zinc-500 uppercase">{entry.period}</p>
                  {entry.honors && (
                    <p className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 font-mono text-[11px] text-emerald-300">
                      <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-400" />
                      {t("education.honor")}
                      <span className="sr-only">. {localize(entry.honors)}</span>
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-semibold tracking-tight text-zinc-100 sm:text-lg">
                    {entry.institution}
                  </h3>
                  <p className="text-sm text-zinc-400">{localize(entry.degree)}</p>
                </div>
              </header>

              <dl className="flex flex-wrap gap-2 font-mono text-[11px]">
                <div className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-950/60 px-2.5 py-1">
                  <dt className="text-zinc-500">{t("common.gpa")}</dt>
                  <dd className="text-zinc-200">
                    {entry.gpa}
                    <span className="text-zinc-600"> / {entry.maxGpa}</span>
                  </dd>
                </div>
              </dl>

              {entry.coursework && entry.coursework.length > 0 && (
                <TechTagList
                  items={entry.coursework.map((course) => localize(course))}
                  label={t("education.coursework")}
                />
              )}
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
