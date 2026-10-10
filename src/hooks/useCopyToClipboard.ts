"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CopyStatus = "idle" | "copied" | "failed";

const RESET_AFTER_MS = 2_000;

export function useCopyToClipboard(): { status: CopyStatus; copy: (value: string) => Promise<void> } {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const copy = useCallback(async (value: string) => {
    let next: CopyStatus;
    try {
      await navigator.clipboard.writeText(value);
      next = "copied";
    } catch {
      next = "failed";
    }
    setStatus(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus("idle"), RESET_AFTER_MS);
  }, []);

  return { status, copy };
}
