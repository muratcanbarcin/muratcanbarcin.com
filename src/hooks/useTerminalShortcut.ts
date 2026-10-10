"use client";

import { useEffect, useSyncExternalStore } from "react";
import { requestTerminalOpen } from "@/services/terminalEvents";

const SHORTCUT_KEY = "k";

const subscribeNever = () => () => {};
const getIsApplePlatform = () => /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
const getServerIsApplePlatform = () => false;

/** Registers ⌘K / Ctrl+K to open the terminal and returns the platform-specific label. */
export function useTerminalShortcut(): string {
  const isApple = useSyncExternalStore(subscribeNever, getIsApplePlatform, getServerIsApplePlatform);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== SHORTCUT_KEY || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      requestTerminalOpen();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return isApple ? "⌘K" : "Ctrl K";
}
