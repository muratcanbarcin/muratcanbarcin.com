import { z } from "zod";
import type { ContactInquiryField, ContactInquiryPayload } from "@/types";
import { boundedEmail, boundedText } from "@/lib/userText";

export const CONTACT_INQUIRY_LIMITS = {
  name: 120,
  email: 254,
  message: 2_000,
} as const satisfies Record<ContactInquiryField, number>;

export const contactInquirySchema = z.object({
  name: boundedText(CONTACT_INQUIRY_LIMITS.name, 1),
  email: boundedEmail(CONTACT_INQUIRY_LIMITS.email),
  message: boundedText(CONTACT_INQUIRY_LIMITS.message, 1),
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
