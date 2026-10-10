import type { ConsoleRequest } from "@/types";

/**
 * Decouples console triggers (navbar badge, keyboard shortcut) from the console itself, which
 * mounts in the hero and subscribes via `subscribeToConsoleRequests`.
 */
const CONSOLE_REQUEST_EVENT = "mcb:console-request";

export function requestConsole(request: ConsoleRequest): void {
  window.dispatchEvent(new CustomEvent<ConsoleRequest>(CONSOLE_REQUEST_EVENT, { detail: request }));
}

export function subscribeToConsoleRequests(onRequest: (request: ConsoleRequest) => void): () => void {
  const listener = (event: Event) => {
    if (event instanceof CustomEvent && isConsoleRequest(event.detail)) onRequest(event.detail);
  };
  window.addEventListener(CONSOLE_REQUEST_EVENT, listener);
  return () => window.removeEventListener(CONSOLE_REQUEST_EVENT, listener);
}

function isConsoleRequest(value: unknown): value is ConsoleRequest {
  if (typeof value !== "object" || value === null || !("action" in value)) return false;
  return value.action === "open" || value.action === "toggle";
}
