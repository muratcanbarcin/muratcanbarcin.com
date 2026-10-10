import type { CertificationCategory } from "./certification";
import type { EmploymentType } from "./experience";
import type { ProjectCategory, ProjectStatus } from "./project";

export interface Dictionary {
  meta: {
    languageName: string;
    switchLanguage: string;
  };
  nav: {
    home: string;
    about: string;
    experience: string;
    projects: string;
    publications: string;
    certifications: string;
    contact: string;
    openMenu: string;
    closeMenu: string;
  };
  hero: {
    status: string;
    availability: string;
    roleTag: string;
    focusTags: {
      backend: string;
      ai: string;
      iot: string;
    };
  };
  terminal: {
    open: string;
    close: string;
    title: string;
    prompt: string;
    placeholder: string;
    send: string;
    thinking: string;
    rateLimited: string;
    error: string;
    suggestions: {
      architecture: string;
      experience: string;
      stack: string;
    };
  };
  filters: {
    label: string;
    all: string;
    categories: Record<ProjectCategory, string>;
    statuses: Record<ProjectStatus, string>;
    certifications: Record<CertificationCategory, string>;
    employment: Record<EmploymentType, string>;
  };
  cta: {
    viewProject: string;
    viewArchitecture: string;
    sourceCode: string;
    liveDemo: string;
    readPaper: string;
    viewCredential: string;
    downloadCv: string;
    contactMe: string;
    backToTop: string;
  };
  sections: {
    experience: string;
    projects: string;
    publications: string;
    education: string;
    certifications: string;
    skills: string;
  };
  common: {
    present: string;
    techStack: string;
    keyMetrics: string;
    highlights: string;
    gpa: string;
    comingSoon: string;
  };
  footer: {
    /** Supports `{year}` and `{name}` placeholders. */
    copyright: string;
    builtWith: string;
    viewSource: string;
  };
}

type DictionaryLeafPaths<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${DictionaryLeafPaths<T[K]>}`;
}[keyof T & string];

/** Dot-notated path to any string in the dictionary, e.g. `"nav.projects"`. */
export type TranslationKey = DictionaryLeafPaths<Dictionary>;

export type TranslationParams = Record<string, string | number>;
