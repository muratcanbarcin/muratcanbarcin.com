import type { LocalizedString } from "./locale";

export interface Education {
  institution: string;
  degree: LocalizedString;
  gpa: string;
  maxGpa: string;
  honors?: LocalizedString;
  period: string;
  coursework?: readonly LocalizedString[];
  transcriptUrl?: string;
}
