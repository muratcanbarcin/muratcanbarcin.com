import type { Localized, LocalizedString } from "./locale";
import type { ProofLink } from "./media";

export type EmploymentType = "Full-time" | "Part-time" | "Internship" | "Instructor" | "Leadership";

export interface Period {
  /** `YYYY-MM` */
  start: string;
  /** `YYYY-MM`, or `"Present"` for ongoing roles. */
  end: string | "Present";
}

export interface Experience {
  id: string;
  role: LocalizedString;
  company: string;
  location: string;
  companyUrl?: string;
  type: EmploymentType;
  period: Period;
  highlights: Localized<string[]>;
  techStack: string[];
  proofs?: ProofLink[];
}
