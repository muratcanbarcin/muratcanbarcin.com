import type { ResumeRequestPayload } from "@/types";

export interface ResumeRequestRecord extends ResumeRequestPayload {
  receivedAt: string;
}

/**
 * Server-only sink for validated resume requests. Emits one structured log line per request;
 * swap the body for a transactional email or CRM call without touching the route or the UI.
 */
export async function recordResumeRequest(
  payload: ResumeRequestPayload,
  receivedAt: Date = new Date(),
): Promise<ResumeRequestRecord> {
  const record: ResumeRequestRecord = { ...payload, receivedAt: receivedAt.toISOString() };
  console.info("[Resume Request]", JSON.stringify(record));
  return record;
}
