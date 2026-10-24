"use client";

import { LifeBuoy } from "lucide-react";
import Link from "next/link";
import { makasVenture, MAKAS_MARK_SRC } from "@/data/makasVenture";
import { useLocale } from "@/hooks/useLocale";
import { SectionHeader } from "@/components/common/SectionHeader";
import { TechTagList } from "@/components/common/TechTag";
import { actionVariants } from "@/components/ui/action";
import { cn } from "@/lib/utils";
import { ArchitectureFlow } from "./ArchitectureFlow";

export function MakasSection() {
  const { localize, t } = useLocale();

  return (
    <section id="makas" aria-labelledby="makas-title" className="scroll-mt-24">
      <SectionHeader index="04" command={makasVenture.command} title={makasVenture.title} titleId="makas-title" />

      <article className="@container relative flex flex-col gap-5 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <img
            src={MAKAS_MARK_SRC}
            alt=""
            width={512}
            height={512}
            className="size-20 shrink-0 rounded-lg object-contain sm:size-24"
          />
          <header className="flex min-w-0 flex-col gap-3">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-balance text-zinc-100 sm:text-xl">
                {localize(makasVenture.product)}
              </h3>
              <p className="mt-1 text-sm text-zinc-500">{localize(makasVenture.role)}</p>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-pretty text-zinc-400">
              {localize(makasVenture.summary)}
            </p>
          </header>
        </div>

        <ul aria-label={t("common.keyMetrics")} className="flex flex-wrap gap-2">
          {makasVenture.channels.map((channel) => (
            <li
              key={channel.en}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-950/70 px-2 py-1 font-mono text-[11px] text-zinc-200"
            >
              <span aria-hidden="true" className="text-emerald-400">
                ▸
              </span>
              {localize(channel)}
            </li>
          ))}
        </ul>

        <ArchitectureFlow steps={makasVenture.architecture} />

        <footer className="flex flex-col gap-4 border-t border-zinc-800/80 pt-4">
          <TechTagList items={makasVenture.stack} label={t("common.techStack")} />
          <Link
            href={makasVenture.supportHref}
            className={cn(actionVariants({ intent: "secondary", size: "md" }), "w-fit font-mono text-xs")}
          >
            <LifeBuoy className="size-3.5" aria-hidden="true" />
            {localize(makasVenture.supportLabel)}
          </Link>
        </footer>
      </article>
    </section>
  );
}
