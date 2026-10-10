import type { TranslationKey } from "./i18n";

export type SectionId = "top" | "experience" | "education" | "projects" | "research" | "skills" | "contact";

export interface NavItem {
  id: SectionId;
  labelKey: TranslationKey;
}
