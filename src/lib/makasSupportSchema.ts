import { z } from "zod";
import type { MakasSupportField, MakasSupportPayload } from "@/types";
import { MAKAS_SUPPORT_SUBJECTS } from "@/types/makasSupport";

export const MAKAS_SUPPORT_LIMITS = {
  name: 120,
  email: 254,
  phone: 32,
  shopName: 120,
  message: 2_000,
} as const;

const optionalText = (max: number) =>
  z.preprocess((value) => (typeof value === "string" ? value : ""), z.string().trim().max(max));

export const makasSupportSchema = z.object({
  name: z.string().trim().min(1).max(MAKAS_SUPPORT_LIMITS.name),
  email: z.string().trim().max(MAKAS_SUPPORT_LIMITS.email).pipe(z.email()),
  phone: optionalText(MAKAS_SUPPORT_LIMITS.phone),
  shopName: optionalText(MAKAS_SUPPORT_LIMITS.shopName),
  subject: z.enum(MAKAS_SUPPORT_SUBJECTS),
  message: z.string().trim().min(1).max(MAKAS_SUPPORT_LIMITS.message),
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
