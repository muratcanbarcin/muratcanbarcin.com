"use client";

import { useEffect, useSyncExternalStore } from "react";
import { requestConsole } from "@/services/consoleEvents";

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
function isConsoleShortcut(event: KeyboardEvent): boolean {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") return true;

  const isBackquoteKey = event.code === "Backquote" || event.key === "`" || event.key === "~";
  // AltGr reports as Ctrl+Alt on Windows, so `~` typed via AltGr must still count.
  const hasBlockingModifier = event.metaKey || (event.ctrlKey && !event.altKey);
  return isBackquoteKey && !hasBlockingModifier && !isEditableTarget(event.target);
}

/** Platform-specific label for the focus shortcut; safe to call from any number of components. */
export function useShortcutLabel(): string {
  const isApple = useSyncExternalStore(subscribeNever, getIsApplePlatform, getServerIsApplePlatform);
  return isApple ? "⌘K" : "Ctrl K";
}

/** Registers the global focus-mode toggle. Mount exactly once, or a single keypress toggles twice. */
export function useConsoleShortcut(): string {
  const label = useShortcutLabel();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || !isConsoleShortcut(event)) return;
      event.preventDefault();
      requestConsole({ action: "toggle" });
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return label;
}
