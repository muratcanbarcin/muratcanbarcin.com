import { z } from "zod";

/** C0 controls, line/paragraph separators, and bidi overrides. Newlines and tabs stay. */
const UNSAFE_TEXT =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u2028\u2029\u202A-\u202E\u2066-\u2069]/g;

/** Drops characters that break out of HTML, mail headers, or Telegram tags. Keeps interior spacing. */
export function stripUnsafeText(value: string): string {
  return value.replace(UNSAFE_TEXT, "");
}

/** Trimmed plain text for stored fields and schema limits. */
export function sanitizeUserText(value: string): string {
  return stripUnsafeText(value).trim();
}

/** One physical header line. Collapses every whitespace run, including CR/LF. */
export function emailHeader(value: string): string {
  return stripUnsafeText(value).replace(/\s+/g, " ").trim();
}

export function boundedText(max: number, min = 0) {
  return z.string().transform(sanitizeUserText).pipe(z.string().min(min).max(max));
}

export function boundedEmail(max: number) {
  return z.string().transform(sanitizeUserText).pipe(z.string().max(max).pipe(z.email()));
}
