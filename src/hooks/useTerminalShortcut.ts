"use client";

import { useEffect, useSyncExternalStore } from "react";
import { requestTerminalOpen } from "@/services/terminalEvents";

const subscribeNever = () => () => {};
const getIsApplePlatform = () => /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
const getServerIsApplePlatform = () => false;

function isEditableTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

/** ⌘K / Ctrl+K anywhere; `~` or Backquote only while the user isn't typing into a field. */
function isTerminalShortcut(event: KeyboardEvent): boolean {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") return true;

  const isBackquoteKey = event.code === "Backquote" || event.key === "`" || event.key === "~";
  // AltGr reports as Ctrl+Alt on Windows, so `~` typed via AltGr must still count.
  const hasBlockingModifier = event.metaKey || (event.ctrlKey && !event.altKey);
  return isBackquoteKey && !hasBlockingModifier && !isEditableTarget(event.target);
}

/** Registers the global terminal shortcuts and returns the platform-specific label. */
export function useTerminalShortcut(): string {
  const isApple = useSyncExternalStore(subscribeNever, getIsApplePlatform, getServerIsApplePlatform);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || !isTerminalShortcut(event)) return;
      event.preventDefault();
      requestTerminalOpen();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return isApple ? "⌘K" : "Ctrl K";
}
