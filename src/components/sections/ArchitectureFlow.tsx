"use client";

import type { ArchitectureStep } from "@/types";
import { useLocale } from "@/hooks/useLocale";

const TECHNOLOGY_SEPARATOR = " · ";

const padStep = (step: number) => String(step).padStart(2, "0");

/**
 * Vertical stepper by default; switches to a horizontal pipeline once the enclosing card's
 * `@container` is wide enough, independent of the viewport.
 */
export function ArchitectureFlow({ steps }: { steps: readonly ArchitectureStep[] }) {
  const { t, localize } = useLocale();

  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-[11px] text-zinc-600">
        {t("projects.pipelineStages", { count: steps.length })}
      </p>

      <ol className="flex flex-col @3xl:flex-row @3xl:gap-4">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          return (
            <li
              key={step.step}
              className="group/step relative flex gap-3 pb-4 last:pb-0 @3xl:flex-1 @3xl:flex-col @3xl:gap-2.5 @3xl:pb-0"
            >
              {!isLast && (
                <>
                  <span
                    aria-hidden="true"
                    className="absolute top-7 bottom-1 left-[11px] w-px bg-zinc-800 @3xl:hidden"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute top-3 -right-4 left-8 hidden h-px bg-zinc-800 after:absolute after:-top-[3px] after:right-0 after:border-y-[3.5px] after:border-l-[5px] after:border-y-transparent after:border-l-zinc-700 @3xl:block"
                  />
                </>
              )}

              <span className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-md border border-zinc-700/80 bg-zinc-950 font-mono text-[10px] text-zinc-400 transition-colors group-hover/step:border-emerald-500/50 group-hover/step:text-emerald-300">
                {padStep(step.step)}
              </span>

              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="leading-5">
                  <h4 className="text-[13px] font-medium text-zinc-100">{step.title}</h4>
                  <p className="text-xs text-zinc-500">{localize(step.description)}</p>
                </div>
                <ul className="flex flex-wrap gap-1">
                  {step.technology.split(TECHNOLOGY_SEPARATOR).map((technology) => (
                    <li
                      key={technology}
                      className="rounded border border-emerald-500/15 bg-emerald-500/5 px-1.5 font-mono text-[10px] leading-4 text-emerald-300/80"
                    >
                      {technology}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
