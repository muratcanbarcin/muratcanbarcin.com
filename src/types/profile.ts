import type { LocalizedString } from "./locale";

export type SocialPlatform = "github" | "linkedin" | "email";

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  handle: string;
}

/** Semantic icon key; the UI layer owns the mapping to a concrete icon component. */
export type SkillGroupIcon = "server" | "cpu" | "database" | "layers";

export interface SkillGroup {
  id: string;
  label: LocalizedString;
  description: LocalizedString;
  icon: SkillGroupIcon;
  skills: string[];
}

export interface SpokenLanguage {
  name: LocalizedString;
  level: LocalizedString;
}

export interface Profile {
  name: string;
  headline: LocalizedString;
  location: string;
  summary: LocalizedString;
  /** One-paragraph pitch rendered in the hero. */
  valueProposition: LocalizedString;
  /** Short proof points rendered as hero chips (e.g. honors, employers, awards). */
  credentials: LocalizedString[];
  socials: SocialLink[];
  languages: SpokenLanguage[];
}
