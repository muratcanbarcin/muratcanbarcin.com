import type { LocalizedString } from "./locale";

export type CertificationCategory = "competition" | "hackathon" | "training" | "academic";

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  /** `YYYY-MM` */
  issueDate: string;
  category: CertificationCategory;
  credentialUrl?: string;
  badgeImage?: string;
  award?: LocalizedString;
}
