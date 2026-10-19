import { after } from "next/server";

/**
 * Starts work immediately and asks the platform to keep it alive after the response.
 * A missing request scope must not reject the visitor request.
 */
export function runAfterResponse(task: Promise<unknown>): void {
  const guarded = task.catch((error: unknown) => {
    console.error("[Background] Task failed", error);
  });
  try {
    after(() => guarded);
  } catch (error) {
    console.warn("[Background] after() is unavailable. The task continues detached.", error);
  }
}
