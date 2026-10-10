import type { CertificationCategory } from "./certification";
import type { EmploymentType } from "./experience";
import type { ProjectCategory, ProjectStatus } from "./project";
import type { ProjectLinkType } from "./media";
import type { TerminalCommandName } from "./terminal";

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
    research: string;
    skills: string;
    certifications: string;
    contact: string;
    primary: string;
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
    /** Supports a `{shortcut}` placeholder. */
    shortcutHint: string;
    title: string;
    prompt: string;
    placeholder: string;
    inputLabel: string;
    outputLabel: string;
    /** Supports a `{name}` placeholder. */
    welcome: string;
    welcomeHint: string;
    /** Supports a `{command}` placeholder. */
    notFound: string;
    notFoundHint: string;
    helpTitle: string;
    helpFooter: string;
    completions: string;
    commands: Record<TerminalCommandName, string>;
    labels: {
      role: string;
      location: string;
      status: string;
      email: string;
    };
    resumeOpening: string;
    /** Supports an `{email}` placeholder. */
    resumeFallback: string;
  };
  github: {
    latestPush: string;
    loading: string;
    unavailable: string;
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
    viewDoi: string;
    viewCredential: string;
    requestResume: string;
    requestFullResume: string;
    exploreProjects: string;
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
  sectionIntros: {
    projects: string;
    experience: string;
    research: string;
    skills: string;
  };
  projects: {
    featured: string;
    architectureTab: string;
    mediaTab: string;
    /** Supports a `{count}` placeholder. */
    pipelineStages: string;
    mediaPending: string;
    placeholderCaption: string;
    /** Supports `{index}` and `{total}` placeholders. */
    showMedia: string;
    linkTypes: Record<ProjectLinkType, string>;
  };
  experience: {
    education: string;
    rootCommit: string;
    proofs: string;
  };
  research: {
    authors: string;
    abstract: string;
    /** Supports a `{date}` placeholder. */
    submitted: string;
  };
  common: {
    present: string;
    techStack: string;
    keyMetrics: string;
    highlights: string;
    gpa: string;
    comingSoon: string;
    /** Supports a `{count}` placeholder (month count). */
    duration: string;
    readMore: string;
    showLess: string;
    links: string;
  };
  footer: {
    /** Supports `{year}` and `{name}` placeholders. */
    copyright: string;
    builtWith: string;
    viewSource: string;
    contactTitle: string;
    contactPitch: string;
  };
}

type DictionaryLeafPaths<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${DictionaryLeafPaths<T[K]>}`;
}[keyof T & string];

/** Dot-notated path to any string in the dictionary, e.g. `"nav.projects"`. */
export type TranslationKey = DictionaryLeafPaths<Dictionary>;

export type TranslationParams = Record<string, string | number>;
