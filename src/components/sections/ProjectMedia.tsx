"use client";

import Image from "next/image";
import { useState } from "react";
import type { MediaAsset, Project } from "@/types";
import { useLocale } from "@/hooks/useLocale";
import { cn } from "@/lib/utils";

export function ProjectMedia({ project }: { project: Project }) {
  if (project.media.length === 0) return <BlueprintPlaceholder project={project} />;
  return <MediaViewer media={project.media} />;
}

function MediaViewer({ media }: { media: readonly MediaAsset[] }) {
  const { t, localize } = useLocale();
  const [activeIndex, setActiveIndex] = useState(0);
  const asset = media[activeIndex] ?? media[0];
  if (!asset) return null;
  const caption = asset.caption && localize(asset.caption);

  return (
    <figure className="flex flex-col gap-3">
      <div className="relative aspect-video overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
        {asset.type === "video" ? (
          <video
            key={asset.url}
            src={asset.url}
            controls
            playsInline
            preload="metadata"
            aria-label={localize(asset.alt)}
            className="size-full object-cover"
          />
        ) : (
          <Image
            src={asset.url}
            alt={localize(asset.alt)}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className={asset.type === "diagram" ? "object-contain p-4" : "object-cover"}
          />
        )}
      </div>

      {(caption || media.length > 1) && (
        <div className="flex items-center justify-between gap-3">
          {caption && <figcaption className="text-xs text-zinc-500">{caption}</figcaption>}
          {media.length > 1 && (
            <div className="ml-auto flex items-center">
              {media.map((item, index) => (
                <button
                  key={item.url}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-pressed={index === activeIndex}
                  aria-label={t("projects.showMedia", { index: index + 1, total: media.length })}
                  className="flex size-11 items-center justify-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-zinc-500/60 sm:size-8"
                >
                  <span
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      index === activeIndex ? "w-4 bg-zinc-200" : "w-1.5 bg-zinc-700",
                    )}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </figure>
  );
}

const CORNER_MARKS = [
  "top-2 left-2 border-t border-l",
  "top-2 right-2 border-t border-r",
  "bottom-2 left-2 border-b border-l",
  "right-2 bottom-2 border-r border-b",
] as const;

/** Schematic generated from the architecture flow, shown until topology diagrams and walkthroughs ship. */
function BlueprintPlaceholder({ project }: { project: Project }) {
  const { t } = useLocale();
  const steps = project.architectureFlow;

  return (
    <figure className="relative flex flex-1 flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(rgb(63_63_70/0.55)_1px,transparent_1px)] bg-size-[14px_14px]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(16_185_129/0.06),transparent_65%)]"
      />
      {CORNER_MARKS.map((position) => (
        <span key={position} aria-hidden="true" className={cn("absolute size-3 border-zinc-600", position)} />
      ))}

      <div className="relative flex min-h-60 flex-1 flex-col justify-between gap-6 p-5">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="truncate font-mono text-[10px] tracking-wider text-zinc-500 uppercase">
              fig.01 — {project.slug}
            </span>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-md border border-amber-300/50 bg-amber-400/15 px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wide text-amber-100">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 animate-pulse rounded-full bg-amber-300 motion-reduce:animate-none"
              />
              {t("projects.mediaPending")}
            </span>
          </div>
          <figcaption className="max-w-prose text-sm leading-relaxed text-pretty text-zinc-100">
            {t("projects.placeholderCaption")}
          </figcaption>
        </div>

        <ol className="flex flex-wrap items-center justify-center gap-y-3">
          {steps.map((step, index) => (
            <li key={step.step} className="flex items-center">
              <span className="rounded border border-dashed border-zinc-700 bg-zinc-900/90 px-2.5 py-1.5 font-mono text-[10px] text-zinc-400 shadow-[0_0_0_3px_rgb(9_9_11)]">
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <span aria-hidden="true" className="mx-1.5 w-4 border-t border-dashed border-zinc-600 sm:w-6" />
              )}
            </li>
          ))}
        </ol>
      </div>
    </figure>
  );
}
