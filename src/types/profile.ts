import type { Localized, LocalizedString } from "./locale";

export type SocialPlatform = "github" | "linkedin" | "email";

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  handle: string;
}

export interface SkillGroup {
  id: string;
  label: LocalizedString;
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
  socials: SocialLink[];
  /** Public CV per locale; omit a locale until its PDF exists under `public/assets/documents/`. */
  resumeUrl?: Partial<Localized<string>>;
  languages: SpokenLanguage[];
}
