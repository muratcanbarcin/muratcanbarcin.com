"use client";

import { LifeBuoy } from "lucide-react";
import Link from "next/link";
import { makasVenture, MAKAS_MARK_SRC } from "@/data/makasVenture";
import { useLocale } from "@/hooks/useLocale";
import { SectionHeader } from "@/components/common/SectionHeader";
import { TechTagList } from "@/components/common/TechTag";
import { actionVariants } from "@/components/ui/action";
import { cn } from "@/lib/utils";

export function MakasSection() {
  const { localize, t } = useLocale();

  return (
    <section id="makas" aria-labelledby="makas-title" className="scroll-mt-24">
      <SectionHeader index="04" command={makasVenture.command} title={makasVenture.title} titleId="makas-title" />

      <article className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30">
        <div className="grid lg:grid-cols-[16rem_minmax(0,1fr)]">
          <div className="flex items-center justify-center border-b border-zinc-800 bg-zinc-950 px-8 py-10 lg:border-r lg:border-b-0">
            <img
              src={MAKAS_MARK_SRC}
              alt=""
              width={512}
              height={512}
              className="size-40 object-contain sm:size-44"
            />
          </div>

          <div className="flex flex-col gap-5 p-5 sm:p-7">
            <div className="flex flex-col gap-3">
              <p className="inline-flex w-fit items-center rounded-md border border-zinc-700 bg-zinc-950/70 px-3 py-1.5 font-mono text-[11px] tracking-wide text-zinc-300">
                {localize(makasVenture.status)}
              </p>
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-balance text-zinc-100 sm:text-2xl">
                  {localize(makasVenture.product)}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">{localize(makasVenture.role)}</p>
              </div>
              <p className="max-w-2xl text-sm leading-relaxed text-pretty text-zinc-400">
                {localize(makasVenture.summary)}
              </p>
            </div>

            <p className="font-mono text-[11px] leading-relaxed text-zinc-500">{makasVenture.flow}</p>
            <TechTagList items={makasVenture.stack} label={t("common.techStack")} />

            <Link
              href={makasVenture.supportHref}
              className={cn(actionVariants({ intent: "secondary", size: "md" }), "w-fit font-mono text-xs")}
            >
              <LifeBuoy className="size-3.5" aria-hidden="true" />
              {localize(makasVenture.supportLabel)}
            </Link>
          </div>
        </div>

        <ul className="grid border-t border-zinc-800 md:grid-cols-3">
          {makasVenture.pillars.map((pillar, index) => (
            <li
              key={pillar.title.en}
              className={cn(
                "flex flex-col gap-2 px-5 py-5 sm:px-6",
                index > 0 && "border-t border-zinc-800 md:border-t-0 md:border-l",
              )}
            >
              <h4 className="text-sm font-medium text-zinc-100">{localize(pillar.title)}</h4>
              <p className="text-sm leading-relaxed text-pretty text-zinc-400">{localize(pillar.body)}</p>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
