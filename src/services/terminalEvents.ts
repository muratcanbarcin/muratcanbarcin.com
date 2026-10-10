/**
 * Decouples terminal triggers (navbar badge, keyboard shortcut) from the terminal itself, which
 * mounts independently and subscribes via `subscribeToTerminalOpen`.
 */
const TERMINAL_OPEN_EVENT = "mcb:terminal-open";

export function requestTerminalOpen(): void {
  window.dispatchEvent(new Event(TERMINAL_OPEN_EVENT));
}

export function subscribeToTerminalOpen(onOpen: () => void): () => void {
  window.addEventListener(TERMINAL_OPEN_EVENT, onOpen);
  return () => window.removeEventListener(TERMINAL_OPEN_EVENT, onOpen);
}
