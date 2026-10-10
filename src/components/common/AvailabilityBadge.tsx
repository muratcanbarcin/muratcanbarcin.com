"use client";

import { MapPin } from "lucide-react";
import { portfolioData } from "@/data/portfolioData";
import { useLocale } from "@/hooks/useLocale";
import { cn } from "@/lib/utils";

const { profile, contact } = portfolioData;

/** Location plus remote/relocation status; the single source for every surface that shows availability. */
export function AvailabilityBadge({ className }: { className?: string }) {
  const { t, localize } = useLocale();

  return (
    <p
      className={cn(
        "inline-flex w-fit max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 font-mono text-[11px] text-zinc-400",
        className,
      )}
    >
      <MapPin aria-hidden="true" className="size-3.5 shrink-0 text-emerald-400/80" />
      <span className="sr-only">{t("contact.locationLabel")}: </span>
      <span className="text-zinc-200">{profile.location}</span>
      <span aria-hidden="true" className="text-zinc-600">
        •
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-emerald-400" />
        {localize(contact.availability)}
      </span>
    </p>
  );
}
