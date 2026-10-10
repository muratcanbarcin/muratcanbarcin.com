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
    <div className="flex flex-1 flex-col gap-4">
      <p className="flex items-center justify-between font-mono text-[11px] text-zinc-500">
        <span>{t("projects.pipelineStages", { count: steps.length })}</span>
        <span aria-hidden="true" className="text-zinc-600">
          input → output
        </span>
      </p>

      <ol className="flex flex-col @3xl:flex-row @3xl:gap-3">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          return (
            <li
              key={step.step}
              className="group/step relative flex gap-3 pb-4 last:pb-0 @3xl:flex-1 @3xl:flex-col @3xl:pb-0"
            >
              {!isLast && (
                <>
                  <span
                    aria-hidden="true"
                    className="absolute top-9 bottom-1 left-4 w-px bg-linear-to-b from-zinc-700 to-zinc-800 @3xl:hidden"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute top-4 -right-3 left-10 hidden h-px bg-zinc-700 after:absolute after:-top-[3px] after:right-0 after:border-y-[3.5px] after:border-l-[5px] after:border-y-transparent after:border-l-zinc-600 @3xl:block"
                  />
                </>
              )}

              <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-md border border-zinc-700 bg-zinc-950 font-mono text-[11px] text-zinc-300 transition-colors group-hover/step:border-emerald-500/50 group-hover/step:text-emerald-300">
                {padStep(step.step)}
              </span>

              <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3 transition-colors group-hover/step:border-zinc-700">
                <div>
                  <h4 className="text-sm font-medium text-zinc-100">{step.title}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">{localize(step.description)}</p>
                </div>
                <ul className="flex flex-wrap gap-1">
                  {step.technology.split(TECHNOLOGY_SEPARATOR).map((technology) => (
                    <li
                      key={technology}
                      className="rounded border border-emerald-500/15 bg-emerald-500/5 px-1.5 py-px font-mono text-[10px] text-emerald-300/90"
                    >
                      {technology}
                    </li>
                  ))}
                </ul>
                {step.inputOutput && (
                  <p className="font-mono text-[10px] leading-relaxed text-zinc-500">{step.inputOutput}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
