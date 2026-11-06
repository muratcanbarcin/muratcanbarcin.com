"use client";

import { CodeXml, Cpu, Database, Layers, Server, type LucideIcon } from "lucide-react";
import type { SkillGroupIcon } from "@/types";
import { portfolioData } from "@/data/portfolioData";
import { useLocale } from "@/hooks/useLocale";
import { SectionHeader } from "@/components/common/SectionHeader";
import { skillProjectCopy } from "@/data/skillProjects";
import { SkillProjectPopover } from "./SkillProjectPopover";

const SKILL_ICONS: Record<SkillGroupIcon, LucideIcon> = {
  code: CodeXml,
  server: Server,
  cpu: Cpu,
  database: Database,
  layers: Layers,
};

const toHexIndex = (index: number) => `0x${(index + 1).toString(16).padStart(2, "0")}`;

export function SkillsSection() {
  const { t, localize } = useLocale();

  return (
    <section id="skills" aria-labelledby="skills-title" className="scroll-mt-24">
      <SectionHeader
        index="06"
        command="cat ./stack.yaml"
        title={t("sections.skills")}
        titleId="skills-title"
      />
      <p className="mb-4 text-sm text-zinc-500">{localize(skillProjectCopy.hint)}</p>
      <ul className="grid gap-px overflow-hidden rounded-xl border border-zinc-800 bg-zinc-800 md:grid-cols-2">
        {portfolioData.skills.map((group, index) => {
          const Icon = SKILL_ICONS[group.icon];
          return (
            <li
              key={group.id}
              className="group flex flex-col gap-5 bg-zinc-950 p-5 transition-colors hover:bg-zinc-900/70 sm:p-6"
            >
              <div className="flex items-start gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors group-hover:border-emerald-500/30 group-hover:text-emerald-300">
                  <Icon aria-hidden="true" className="size-4.5" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-base font-semibold tracking-tight text-zinc-100">{localize(group.label)}</h3>
                    <span aria-hidden="true" className="font-mono text-[10px] text-zinc-600">
                      {toHexIndex(index)}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500">{localize(group.description)}</p>
                </div>
              </div>
              <ul className="flex flex-wrap gap-1.5">
                {group.skills.map((skill) => (
                  <li key={skill}>
                    <SkillProjectPopover skill={skill} />
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
        <h3 className="text-sm font-medium text-zinc-400">{localize(skillProjectCopy.languages)}</h3>
        {portfolioData.profile.languages.map((language) => (
          <p key={language.name.en} className="font-mono text-xs text-zinc-200">
            {localize(language.name)} <span className="text-emerald-300">{localize(language.level)}</span>
          </p>
        ))}
      </div>
    </section>
  );
}
