import type { LocalizedString } from "./locale";

/**
 * The resume is shared on request only — never as a public file — so visitors submit an in-app
 * request instead of downloading a PDF.
 */
export interface ContactDetails {
  email: string;
  workMode: LocalizedString;
}

export type ResumeRequestField = "email" | "company" | "message";

export type ResumeRequestPayload = Record<ResumeRequestField, string>;

export type ResumeRequestOutcome = "received" | "invalid" | "rate-limited" | "error";
