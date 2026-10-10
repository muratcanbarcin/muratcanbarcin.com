import type { LocalizedString } from "./locale";

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  status: LocalizedString;
  /** `YYYY-MM` */
  submissionDate: string;
  abstract: LocalizedString;
  keyTech: string[];
  paperUrl?: string;
  codeUrl?: string;
  doi?: string;
}
