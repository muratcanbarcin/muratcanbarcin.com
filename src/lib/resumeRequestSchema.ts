import { z } from "zod";
import type { ResumeRequestField, ResumeRequestPayload } from "@/types";

export const RESUME_REQUEST_LIMITS = {
  email: 254,
  company: 120,
  message: 1_000,
} as const satisfies Record<ResumeRequestField, number>;

/** Shared by the modal and `/api/resume-request` so both sides reject exactly the same input. */
export const resumeRequestSchema = z.object({
  email: z.string().trim().max(RESUME_REQUEST_LIMITS.email).pipe(z.email()),
  company: z.string().trim().min(1).max(RESUME_REQUEST_LIMITS.company),
  message: z.string().trim().max(RESUME_REQUEST_LIMITS.message).default(""),
}) satisfies z.ZodType<ResumeRequestPayload, Partial<ResumeRequestPayload>>;

const isResumeRequestField = (key: PropertyKey): key is ResumeRequestField =>
  key === "email" || key === "company" || key === "message";

export function collectInvalidFields(error: z.ZodError): ResumeRequestField[] {
  const fields = new Set<ResumeRequestField>();
  for (const issue of error.issues) {
    const [key] = issue.path;
    if (key !== undefined && isResumeRequestField(key)) fields.add(key);
  }
  return [...fields];
}
