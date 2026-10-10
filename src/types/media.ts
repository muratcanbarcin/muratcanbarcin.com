import type { LocalizedString } from "./locale";

export type MediaAssetType = "image" | "video" | "diagram";

export interface MediaAsset {
  type: MediaAssetType;
  /** Absolute public path (e.g. `/assets/projects/<slug>/overview.png`) or remote URL. */
  url: string;
  alt: LocalizedString;
  caption?: LocalizedString;
}

export type ProjectLinkType = "github" | "live-demo" | "paper" | "figma" | "docs";

export interface ProjectLink {
  type: ProjectLinkType;
  url: string;
  label?: string;
}

export interface ProofLink {
  title: string;
  url: string;
}
