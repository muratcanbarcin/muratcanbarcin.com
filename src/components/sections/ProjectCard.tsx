"use client";

import { BookOpen, ExternalLink, FileText, ImageIcon, Workflow } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import type { Project, ProjectLinkType, ProjectStatus } from "@/types";
import { useLocale } from "@/hooks/useLocale";
import { GitHubIcon } from "@/components/common/BrandIcons";
import { TechTagList } from "@/components/common/TechTag";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { actionVariants } from "@/components/ui/action";
import { ArchitectureFlow } from "./ArchitectureFlow";
import { ProjectMedia } from "./ProjectMedia";
import { cn } from "@/lib/utils";

const LINK_ICONS: Record<ProjectLinkType, ComponentType<SVGProps<SVGSVGElement>>> = {
  github: GitHubIcon,
  "live-demo": ExternalLink,
  paper: FileText,
  figma: ExternalLink,
  docs: BookOpen,
};

const STATUS_DOT: Record<ProjectStatus, string> = {
  production: "bg-emerald-400",
  completed: "bg-zinc-400",
  "under-review": "bg-amber-400",
  "in-progress": "bg-sky-400",
};

export function ProjectCard({ project }: { project: Project }) {
  const { t, localize, dictionary } = useLocale();
  const titleId = `project-${project.id}-title`;

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        "group @container relative flex h-full flex-col gap-5 rounded-xl border border-zinc-800 p-5 transition-colors hover:border-zinc-700 sm:p-6",
        project.featured ? "bg-linear-to-b from-zinc-900/80 to-zinc-900/30" : "bg-zinc-900/30",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-8 -top-px h-px bg-linear-to-r from-transparent to-transparent",
          project.award ? "via-amber-300/80" : project.featured ? "via-emerald-400/60" : "via-transparent",
        )}
      />

      <header className="flex flex-col gap-3">
        {project.award && (
          <p className="inline-flex w-fit items-center gap-2 rounded-md border border-amber-300/50 bg-amber-400/15 px-3 py-1.5 font-mono text-xs font-semibold tracking-wide text-amber-100">
            <span aria-hidden="true">★</span>
            {localize(project.award)}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <span className="rounded-md border border-zinc-800 bg-zinc-950/60 px-2 py-0.5 text-zinc-300">
            {dictionary.filters.categories[project.category]}
          </span>
          {project.featured && (
            <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
              ★ {t("projects.featured")}
            </span>
          )}
          <span className="ml-auto inline-flex items-center gap-1.5 text-zinc-500">
            <span aria-hidden="true" className={cn("size-1.5 rounded-full", STATUS_DOT[project.status])} />
            {dictionary.filters.statuses[project.status]}
          </span>
        </div>

        <div>
          <h3 id={titleId} className="text-lg font-semibold tracking-tight text-balance text-zinc-100 sm:text-xl">
            {project.title}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">{localize(project.subtitle)}</p>
        </div>
        <p className="text-sm leading-relaxed text-pretty text-zinc-400">{localize(project.summary)}</p>
      </header>

      {project.keyMetrics.length > 0 && (
        <ul aria-label={t("common.keyMetrics")} className="flex flex-wrap gap-2">
          {project.keyMetrics.map((metric) => (
            <li
              key={metric}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-950/70 px-2 py-1 font-mono text-[11px] text-zinc-200"
            >
              <span aria-hidden="true" className="text-emerald-400">
                ▸
              </span>
              {metric}
            </li>
          ))}
        </ul>
      )}

      <Tabs defaultValue="architecture" className="flex-1">
        <TabsList>
          <TabsTrigger value="architecture">
            <Workflow aria-hidden="true" />
            {t("projects.architectureTab")}
          </TabsTrigger>
          <TabsTrigger value="media">
            <ImageIcon aria-hidden="true" />
            {t("projects.mediaTab")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="architecture" className="flex flex-1 flex-col">
          <ArchitectureFlow steps={project.architectureFlow} />
        </TabsContent>
        <TabsContent value="media" className="flex flex-1 flex-col">
          <ProjectMedia project={project} />
        </TabsContent>
      </Tabs>

      <footer className="mt-auto flex flex-col gap-4 border-t border-zinc-800/80 pt-4">
        <TechTagList items={project.techStack} label={t("common.techStack")} />
        {project.links.length > 0 && (
          <ul aria-label={t("common.links")} className="flex flex-wrap gap-2">
            {project.links.map((link) => {
              const Icon = LINK_ICONS[link.type];
              return (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(actionVariants({ intent: "secondary", size: "md" }), "font-mono text-xs")}
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                    {link.label ?? dictionary.projects.linkTypes[link.type]}
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </footer>
    </article>
  );
}
