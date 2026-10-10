"use client";

import { useEffect, useState } from "react";
import type { SectionId } from "@/types";

/** A section becomes active once its top edge crosses this fraction of the viewport height. */
const ACTIVATION_LINE = 0.35;
/** Tolerance for sub-pixel rounding when detecting the bottom of the page. */
const BOTTOM_TOLERANCE_PX = 2;

/**
 * Resolves the last section whose top has passed the activation line. At the very bottom of the
 * page the final section wins, so short trailing sections (e.g. the footer) can still activate.
 */
function resolveActiveSection(ids: readonly SectionId[]): SectionId | null {
  const root = document.documentElement;
  const isAtBottom = window.innerHeight + window.scrollY >= root.scrollHeight - BOTTOM_TOLERANCE_PX;
  if (isAtBottom) return ids.at(-1) ?? null;

  const line = window.innerHeight * ACTIVATION_LINE;
  let active: SectionId | null = null;
  for (const id of ids) {
    const element = document.getElementById(id);
    if (element && element.getBoundingClientRect().top <= line) active = id;
  }
  return active;
}

export function useActiveSection(ids: readonly SectionId[]): SectionId | null {
  const [activeId, setActiveId] = useState<SectionId | null>(null);
  const [trackedIds] = useState(ids);

  useEffect(() => {
    let frame = 0;
    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setActiveId(resolveActiveSection(trackedIds)));
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [trackedIds]);

  return activeId;
}
