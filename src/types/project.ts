import type { LocalizedString } from "./locale";
import type { MediaAsset, ProjectLink } from "./media";

export type ProjectStatus = "production" | "completed" | "under-review" | "in-progress";

export interface ArchitectureStep {
  step: number;
  title: string;
  description: LocalizedString;
  technology: string;
  inputOutput?: string;
}

interface GitHubSyncFields {
  /** Defaults to `main` when omitted. */
  branch?: string;
  /** Feed the parsed README into MCB.ai. Defaults to true. */
  injectToAI?: boolean;
  /** Pull architecture and topology images into the project media showcase. Defaults to true. */
  syncArchitectureMedia?: boolean;
}

/** Opt-in GitHub binding. `enabled: false` means the API is never called. */
export type GitHubSyncConfig =
  | (GitHubSyncFields & {
      enabled: true;
      /** Exact repository, `owner/name`. */
      repo: string;
    })
  | (GitHubSyncFields & {
      enabled: false;
    });

export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle: LocalizedString;
  /** Subject headings drawn from the project README or, when unpublished, the portfolio description. */
  topics: readonly LocalizedString[];
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
  /** Canonical repository page. Present only for whitelisted public projects. */
  githubUrl?: string;
  /** Shown instead of documentation actions when the repository is not public. */
  statusBadge?: LocalizedString;
  githubSync?: GitHubSyncConfig;
}
