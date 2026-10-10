import type { ResumeRequestOutcome, ResumeRequestPayload } from "@/types";

const RESUME_MODAL_OPEN_EVENT = "mcb:resume-modal-open";

/** Decouples every "Request Resume" trigger from the single modal mounted on the page. */
export function requestResumeModalOpen(): void {
  window.dispatchEvent(new Event(RESUME_MODAL_OPEN_EVENT));
}

export function subscribeToResumeModalOpen(onOpen: () => void): () => void {
  window.addEventListener(RESUME_MODAL_OPEN_EVENT, onOpen);
  return () => window.removeEventListener(RESUME_MODAL_OPEN_EVENT, onOpen);
}

export async function submitResumeRequest(
  payload: ResumeRequestPayload,
  signal?: AbortSignal,
): Promise<ResumeRequestOutcome> {
  try {
    const response = await fetch("/api/resume-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });
    if (response.ok) return "received";
    if (response.status === 429) return "rate-limited";
    if (response.status === 400) return "invalid";
    return "error";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    return "error";
  }
}
