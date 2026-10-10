import type { TranslationKey } from "./i18n";

export type SectionId = "top" | "projects" | "experience" | "research" | "skills" | "contact";

export interface NavItem {
  id: SectionId;
  labelKey: TranslationKey;
}
