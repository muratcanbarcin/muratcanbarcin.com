"use client";

import type { BentoSpan } from "@/lib/bento";
import { buildBentoLayout } from "@/lib/bento";
import { portfolioData } from "@/data/portfolioData";
import { useLocale } from "@/hooks/useLocale";
import { GitHubIcon } from "@/components/common/BrandIcons";
import { SectionHeader } from "@/components/common/SectionHeader";
import { actionVariants } from "@/components/ui/action";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./ProjectCard";

const SPAN_CLASSES: Record<BentoSpan, string> = {
  full: "md:col-span-2 lg:col-span-12",
  wide: "lg:col-span-7",
  narrow: "lg:col-span-5",
};

const GITHUB_PROFILE = portfolioData.profile.socials.find((social) => social.platform === "github");

export function ProjectShowcase({ projects = portfolioData.projects }: { projects?: readonly Project[] }) {
  const { t } = useLocale();
  const tiles = buildBentoLayout(projects);

  return (
    <section id="projects" aria-labelledby="projects-title" className="scroll-mt-24">
      <SectionHeader
        index="03"
        command="ls ./projects --sort=impact"
        title={t("sections.projects")}
        titleId="projects-title"
      />
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
        {tiles.map(({ project, span }) => (
          <li key={project.id} className={SPAN_CLASSES[span]}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
      {GITHUB_PROFILE && (
        <div className="mt-4 flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-zinc-300">{t("projects.moreOnGitHub")}</p>
          <a
            href={GITHUB_PROFILE.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(actionVariants({ intent: "primary", size: "md" }), "font-mono text-xs")}
          >
            <GitHubIcon className="size-3.5" aria-hidden="true" />
            {t("projects.openGitHubProfile")}
          </a>
        </div>
      )}
    </section>
  );
}
