import { z } from "zod";
import type { ContactInquiryField, ContactInquiryPayload } from "@/types";

export const CONTACT_INQUIRY_LIMITS = {
  name: 120,
  email: 254,
  message: 2_000,
} as const satisfies Record<ContactInquiryField, number>;

export const contactInquirySchema = z.object({
  name: z.string().trim().min(1).max(CONTACT_INQUIRY_LIMITS.name),
  email: z.string().trim().max(CONTACT_INQUIRY_LIMITS.email).pipe(z.email()),
  message: z.string().trim().min(1).max(CONTACT_INQUIRY_LIMITS.message),
}) satisfies z.ZodType<ContactInquiryPayload>;

const isContactInquiryField = (key: PropertyKey): key is ContactInquiryField =>
  key === "name" || key === "email" || key === "message";

export function collectInvalidContactFields(error: z.ZodError): ContactInquiryField[] {
  const fields = new Set<ContactInquiryField>();
  for (const issue of error.issues) {
    const [key] = issue.path;
    if (key !== undefined && isContactInquiryField(key)) fields.add(key);
  }
  return [...fields];
}
