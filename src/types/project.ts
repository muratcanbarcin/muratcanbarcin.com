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

export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle: LocalizedString;
  category: ProjectCategory;
  summary: LocalizedString;
  description: LocalizedString;
  keyMetrics: string[];
  techStack: string[];
  architectureFlow: ArchitectureStep[];
  media: MediaAsset[];
  links: ProjectLink[];
  status: ProjectStatus;
  featured: boolean;
  /** Competition or distinction rendered as a prominent mark, separate from metrics. */
  award?: LocalizedString;
}
