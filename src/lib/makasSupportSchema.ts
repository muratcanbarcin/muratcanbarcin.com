import { z } from "zod";
import type { MakasSupportField, MakasSupportPayload } from "@/types";
import { MAKAS_SUPPORT_SUBJECTS } from "@/types/makasSupport";
import { boundedEmail, boundedText, sanitizeUserText } from "@/lib/userText";

export const MAKAS_SUPPORT_LIMITS = {
  name: 120,
  email: 254,
  phone: 32,
  shopName: 120,
  message: 2_000,
} as const;

const optionalText = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" ? sanitizeUserText(value) : ""),
    z.string().max(max),
  );

export const makasSupportSchema = z.object({
  name: boundedText(MAKAS_SUPPORT_LIMITS.name, 1),
  email: boundedEmail(MAKAS_SUPPORT_LIMITS.email),
  phone: optionalText(MAKAS_SUPPORT_LIMITS.phone),
  shopName: optionalText(MAKAS_SUPPORT_LIMITS.shopName),
  subject: z.enum(MAKAS_SUPPORT_SUBJECTS),
  message: boundedText(MAKAS_SUPPORT_LIMITS.message, 1),
}) satisfies z.ZodType<MakasSupportPayload>;

const isMakasSupportField = (key: PropertyKey): key is MakasSupportField =>
  key === "name" ||
  key === "email" ||
  key === "phone" ||
  key === "shopName" ||
  key === "subject" ||
  key === "message";

export function collectInvalidMakasSupportFields(error: z.ZodError): MakasSupportField[] {
  const fields = new Set<MakasSupportField>();
  for (const issue of error.issues) {
    const [key] = issue.path;
    if (key !== undefined && isMakasSupportField(key)) fields.add(key);
  }
  return [...fields];
}
