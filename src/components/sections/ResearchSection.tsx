"use client";

import { ArrowUpRight, BookOpen, FileText } from "lucide-react";
import { useId, useState } from "react";
import type { ComponentType, SVGProps } from "react";
import type { Publication } from "@/types";
import { portfolioData } from "@/data/portfolioData";
import { useLocale } from "@/hooks/useLocale";
import { GitHubIcon } from "@/components/common/BrandIcons";
import { SectionHeader } from "@/components/common/SectionHeader";
import { TechTagList } from "@/components/common/TechTag";
import { actionVariants } from "@/components/ui/action";
import { formatYearMonth } from "@/lib/date";
import { cn } from "@/lib/utils";

const { publications, profile } = portfolioData;
const OWN_SURNAME = profile.name.split(" ").at(-1) ?? profile.name;

export function ResearchSection() {
  const { t } = useLocale();
  if (publications.length === 0) return null;

  return (
    <section id="research" aria-labelledby="research-title" className="scroll-mt-24">
      <SectionHeader
        index="03"
        command="cat ./research/*.md"
        title={t("sections.publications")}
        description={t("sectionIntros.research")}
        titleId="research-title"
      />
      <ul className="flex flex-col gap-4">
        {publications.map((publication) => (
          <li key={publication.id}>
            <PublicationCard publication={publication} />
          </li>
        ))}
      </ul>
    </section>
  );
}

interface PublicationLink {
  href: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

function buildPublicationLinks(
  publication: Publication,
  labels: { paper: string; code: string; doi: string },
): PublicationLink[] {
  const links: PublicationLink[] = [];
  if (publication.paperUrl) links.push({ href: publication.paperUrl, label: labels.paper, Icon: FileText });
  if (publication.codeUrl) links.push({ href: publication.codeUrl, label: labels.code, Icon: GitHubIcon });
  if (publication.doi) {
    links.push({ href: `https://doi.org/${publication.doi}`, label: labels.doi, Icon: BookOpen });
  }
  return links;
}

function PublicationCard({ publication }: { publication: Publication }) {
  const { t, localize, currentLocale } = useLocale();
  const [isExpanded, setIsExpanded] = useState(false);
  const abstractId = useId();

  const links = buildPublicationLinks(publication, {
    paper: t("cta.readPaper"),
    code: t("cta.sourceCode"),
    doi: t("cta.viewDoi"),
  });

  return (
    <article className="relative overflow-hidden rounded-xl border border-zinc-800 bg-linear-to-br from-zinc-900/80 via-zinc-900/40 to-zinc-950 p-5 sm:p-8">
      <span
        aria-hidden="true"
        className="absolute inset-x-8 -top-px h-px bg-linear-to-r from-transparent via-amber-400/50 to-transparent"
      />

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-10">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-0.5 text-amber-300">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-amber-400" />
              {localize(publication.status)}
            </span>
            <span className="text-zinc-300">{publication.journal}</span>
            <span className="text-zinc-500">
              {t("research.submitted", { date: formatYearMonth(publication.submissionDate, currentLocale) })}
            </span>
          </div>

          <h3 className="text-xl font-semibold tracking-tight text-balance text-zinc-100 sm:text-2xl">
            {publication.title}
          </h3>

          <div className="flex flex-col gap-2">
            <h4 className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">{t("research.abstract")}</h4>
            <p
              id={abstractId}
              className={cn("text-sm leading-relaxed text-pretty text-zinc-400 sm:text-base", !isExpanded && "line-clamp-4")}
            >
              {localize(publication.abstract)}
            </p>
            <button
              type="button"
              onClick={() => setIsExpanded((expanded) => !expanded)}
              aria-expanded={isExpanded}
              aria-controls={abstractId}
              className="inline-flex min-h-11 w-fit items-center font-mono text-xs text-zinc-300 underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-zinc-500/60 sm:min-h-8"
            >
              {isExpanded ? t("common.showLess") : t("common.readMore")}
            </button>
          </div>
        </div>

        <aside className="flex flex-col gap-5 border-t border-zinc-800/80 pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          <div className="flex flex-col gap-2">
            <h4 className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">{t("research.authors")}</h4>
            <ul className="flex flex-col gap-1 text-sm">
              {publication.authors.map((author) => (
                <li
                  key={author}
                  className={author.includes(OWN_SURNAME) ? "font-medium text-zinc-100" : "text-zinc-400"}
                >
                  {author}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">{t("common.techStack")}</h4>
            <TechTagList items={publication.keyTech} label={t("common.techStack")} />
          </div>

          {links.length > 0 && (
            <ul aria-label={t("common.links")} className="flex flex-wrap gap-2">
              {links.map(({ href, label, Icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(actionVariants({ intent: "secondary", size: "md" }), "font-mono text-xs")}
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                    {label}
                    <ArrowUpRight aria-hidden="true" className="size-3.5 text-zinc-500" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </article>
  );
}
