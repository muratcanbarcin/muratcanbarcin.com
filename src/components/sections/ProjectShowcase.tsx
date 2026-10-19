"use client";

import type { BentoSpan } from "@/lib/bento";
import { buildBentoLayout } from "@/lib/bento";
import { portfolioData } from "@/data/portfolioData";
import { useLocale } from "@/hooks/useLocale";
import { SectionHeader } from "@/components/common/SectionHeader";
import type { Project } from "@/types";
import { ProjectCard } from "./ProjectCard";

const SPAN_CLASSES: Record<BentoSpan, string> = {
  full: "md:col-span-2 lg:col-span-12",
  wide: "lg:col-span-7",
  narrow: "lg:col-span-5",
};

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
    </section>
  );
}
