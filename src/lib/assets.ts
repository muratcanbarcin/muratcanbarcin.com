const ASSETS_ROOT = "/assets";

/** `public/assets/projects/<slug>/<file>` — screenshots, diagrams, demo videos. */
export const projectAsset = (slug: string, file: string): string =>
  `${ASSETS_ROOT}/projects/${slug}/${file}`;

/** `public/assets/certificates/<file>` — badge images and certificate PDFs. */
export const certificateAsset = (file: string): string => `${ASSETS_ROOT}/certificates/${file}`;

/**
 * `public/assets/documents/<file>` — public documents only. The resume is deliberately never
 * hosted here; it is shared on request via the in-app `RequestResumeModal`.
 */
export const documentAsset = (file: string): string => `${ASSETS_ROOT}/documents/${file}`;
