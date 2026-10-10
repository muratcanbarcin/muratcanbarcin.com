import type { MailtoTemplate } from "@/types";

/** RFC 6068 requires CRLF line breaks inside a `mailto:` body. */
const ENCODED_CRLF = "%0D%0A";

export function buildMailtoHref({ recipient, subject, bodyLines }: MailtoTemplate): string {
  const body = bodyLines.map(encodeURIComponent).join(ENCODED_CRLF);
  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${body}`;
}
