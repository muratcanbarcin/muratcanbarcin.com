import type { CertificationCategory } from "./certification";
import type { ChatErrorKind } from "./console";
import type { EmploymentType } from "./experience";
import type { ProjectStatus } from "./project";
import type { ProjectLinkType } from "./media";
import type { TerminalCommandName } from "./terminal";

export interface Dictionary {
  meta: {
    languageName: string;
    switchLanguage: string;
    toggleTheme: string;
  };
  nav: {
    home: string;
    about: string;
    experience: string;
    education: string;
    projects: string;
    makas: string;
    publications: string;
    research: string;
    skills: string;
    certifications: string;
    contact: string;
    primary: string;
    openMenu: string;
    closeMenu: string;
  };
  terminal: {
    open: string;
    /** Supports a `{shortcut}` placeholder. */
    shortcutHint: string;
    prompt: string;
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
      education: string;
      experience: string;
      stack: string;
      languages: string;
      email: string;
      leadership: string;
    };
    resumeOpening: string;
  };
  hero: {
    /** Short general line under the hero actions. */
    mark: string;
  };
  filters: {
    label: string;
    all: string;
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
    contact: string;
  };
  education: {
    honor: string;
    coursework: string;
  };
  console: {
    title: string;
    /** Live status beside the console title. */
    statusOnline: string;
    /** Compact header hint for focus mode and slash commands. */
    modeHint: string;
    welcome: string;
    placeholder: string;
    inputLabel: string;
    outputLabel: string;
    send: string;
    clear: string;
    /** Supports a `{shortcut}` placeholder. */
    expand: string;
    collapse: string;
    suggestionsLabel: string;
    responding: string;
    errors: Record<ChatErrorKind, string>;
  };
  resumeModal: {
    title: string;
    subtitle: string;
    close: string;
    emailLabel: string;
    emailPlaceholder: string;
    companyLabel: string;
    companyPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    optional: string;
    submit: string;
    submitting: string;
    successTitle: string;
    /** Supports an `{email}` placeholder. */
    success: string;
    done: string;
    errors: {
      email: string;
      company: string;
      /** Supports a `{max}` placeholder. */
      message: string;
      rateLimited: string;
      generic: string;
    };
  };
  contact: {
    emailLabel: string;
    copyEmail: string;
    copied: string;
    copyFailed: string;
    resumeTitle: string;
    resumeBody: string;
    locationLabel: string;
    formTitle: string;
    formBody: string;
    nameLabel: string;
    namePlaceholder: string;
    inquiryEmailLabel: string;
    inquiryEmailPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submit: string;
    submitting: string;
    success: string;
    errors: {
      name: string;
      email: string;
      messageRequired: string;
      /** Supports a `{max}` placeholder. */
      message: string;
      rateLimited: string;
      generic: string;
    };
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
    systemDocs: string;
    viewOnGitHub: string;
    github: string;
    closeDocs: string;
    docsLoading: string;
    docsError: string;
    docsDiscuss: string;
    openMcb: string;
    contactMurat: string;
    moreOnGitHub: string;
    openGitHubProfile: string;
    linkTypes: Record<ProjectLinkType, string>;
  };
  experience: {
    education: string;
    rootCommit: string;
    proofs: string;
    tenureLabel: string;
    /** Supports `{count}`. Singular and plural are separate because English inflects. */
    tenureYear: string;
    tenureYears: string;
    leadership: string;
  };
  research: {
    authors: string;
    /** Faculty co-author, distinct from student collaborators. */
    academic: string;
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
  };
}

type DictionaryLeafPaths<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${DictionaryLeafPaths<T[K]>}`;
}[keyof T & string];

/** Dot-notated path to any string in the dictionary, e.g. `"nav.projects"`. */
export type TranslationKey = DictionaryLeafPaths<Dictionary>;

export type TranslationParams = Record<string, string | number>;
