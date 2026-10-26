import { z } from "zod";
import type { ResumeRequestField, ResumeRequestPayload } from "@/types";
import { boundedEmail, boundedText } from "@/lib/userText";

export const RESUME_REQUEST_LIMITS = {
  email: 254,
  company: 120,
  message: 1_000,
} as const satisfies Record<ResumeRequestField, number>;

/** Shared by the modal and `/api/resume-request` so both sides reject exactly the same input. */
export const resumeRequestSchema = z.object({
  email: boundedEmail(RESUME_REQUEST_LIMITS.email),
  company: boundedText(RESUME_REQUEST_LIMITS.company, 1),
  message: boundedText(RESUME_REQUEST_LIMITS.message).default(""),
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
