import type { Locale } from "@/types";

const ASSETS_ROOT = "/assets";

/** `public/assets/projects/<slug>/<file>` — screenshots, diagrams, demo videos. */
export const projectAsset = (slug: string, file: string): string =>
  `${ASSETS_ROOT}/projects/${slug}/${file}`;

/** `public/assets/certificates/<file>` — badge images and certificate PDFs. */
export const certificateAsset = (file: string): string => `${ASSETS_ROOT}/certificates/${file}`;

/** `public/assets/documents/<file>` — publicly downloadable documents. */
export const documentAsset = (file: string): string => `${ASSETS_ROOT}/documents/${file}`;

export const resumeAsset = (locale: Locale): string => documentAsset(`cv-${locale}.pdf`);
