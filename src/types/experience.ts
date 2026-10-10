import type { Localized, LocalizedString } from "./locale";
import type { ProofLink } from "./media";

export type EmploymentType = "Full-time" | "Part-time" | "Internship" | "Instructor" | "Leadership";

export interface Period {
  /** `YYYY-MM` */
  start: string;
  /** `YYYY-MM`, or `"Present"` for ongoing roles. */
  end: string | "Present";
}

/** A scannable outcome that only makes sense next to the role it came from. */
export interface ExperienceMetric {
  id: string;
  figure: string;
  label: LocalizedString;
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
  /** Figures and outcomes rendered on the role card, not in a detached strip. */
  metrics?: readonly ExperienceMetric[];
  proofs?: ProofLink[];
}
