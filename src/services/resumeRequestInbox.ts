import type { ResumeRequestPayload } from "@/types";

export interface ResumeRequestRecord extends ResumeRequestPayload {
  receivedAt: string;
}

/**
 * Server-only audit trail for validated resume requests. Emits one structured log line per
 * request so nothing is lost even when the email notification is skipped or rejected.
 */
export async function recordResumeRequest(
  payload: ResumeRequestPayload,
  receivedAt: Date = new Date(),
): Promise<ResumeRequestRecord> {
  const record: ResumeRequestRecord = { ...payload, receivedAt: receivedAt.toISOString() };
  console.info("[Resume Request]", JSON.stringify(record));
  return record;
}
