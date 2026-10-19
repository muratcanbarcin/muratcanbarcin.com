import type { LocalizedString } from "./locale";
import type { MediaAsset, ProjectLink } from "./media";

export type ProjectCategory =
  | "defense-edge"
  | "enterprise-saas"
  | "applied-ai"
  | "iot-fullstack"
  | "academic-research";

export type ProjectStatus = "production" | "completed" | "under-review" | "in-progress";

export interface ArchitectureStep {
  step: number;
  title: string;
  description: LocalizedString;
  technology: string;
  inputOutput?: string;
}

/** Opt-in GitHub binding. Absent or `enabled: false` means the API is never called. */
export interface GitHubSyncConfig {
  enabled: boolean;
  /** Exact repository, `owner/name`. */
  repo: string;
  /** Defaults to `main` when omitted. */
  branch?: string;
  /** Feed the parsed README into MCB.ai. Defaults to true. */
  injectToAI?: boolean;
  /** Pull architecture and topology images into the project media showcase. Defaults to true. */
  syncArchitectureMedia?: boolean;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle: LocalizedString;
  category: ProjectCategory;
  summary: LocalizedString;
  description: LocalizedString;
  keyMetrics: LocalizedString[];
  techStack: string[];
  architectureFlow: ArchitectureStep[];
  media: MediaAsset[];
  links: ProjectLink[];
  status: ProjectStatus;
  featured: boolean;
  /** Competition or distinction rendered as a prominent mark, separate from metrics. */
  award?: LocalizedString;
  githubSync?: GitHubSyncConfig;
}
