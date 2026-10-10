/**
 * The resume is shared on request only — never as a public file — so the site exposes a
 * prefilled email intent instead of a download link.
 */
export interface MailtoTemplate {
  recipient: string;
  subject: string;
  /** Joined with CRLF line breaks; an empty string renders a blank line. */
  bodyLines: readonly string[];
}
