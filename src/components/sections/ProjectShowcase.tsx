"use client";

import type { BentoSpan } from "@/lib/bento";
import { buildBentoLayout } from "@/lib/bento";
import { portfolioData } from "@/data/portfolioData";
import { useLocale } from "@/hooks/useLocale";
import { SectionHeader } from "@/components/common/SectionHeader";
import { ProjectCard } from "./ProjectCard";

const SPAN_CLASSES: Record<BentoSpan, string> = {
  full: "md:col-span-2 lg:col-span-12",
  wide: "lg:col-span-7",
  narrow: "lg:col-span-5",
};

const BENTO_TILES = buildBentoLayout(portfolioData.projects);

export function ProjectShowcase() {
  const { t } = useLocale();

  return (
    <section id="projects" aria-labelledby="projects-title" className="scroll-mt-24">
      <SectionHeader
        index="03"
        command="ls ./projects --sort=impact"
        title={t("sections.projects")}
        description={t("sectionIntros.projects")}
        titleId="projects-title"
      />
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
        {BENTO_TILES.map(({ project, span }) => (
          <li key={project.id} className={SPAN_CLASSES[span]}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </section>
  );
}
