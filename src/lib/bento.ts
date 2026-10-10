import type { Project } from "@/types";

export type BentoSpan = "full" | "wide" | "narrow";

export interface BentoTile {
  project: Project;
  span: BentoSpan;
}

/** Each pipeline stage renders as a full block, so it outweighs raw character counts. */
const STEP_WEIGHT = 120;

/** Rough rendered-height proxy used to give the denser card of a pair the wider cell. */
export function contentWeight(project: Project): number {
  const stepText = project.architectureFlow.reduce((sum, step) => sum + step.description.en.length, 0);
  return (
    project.architectureFlow.length * STEP_WEIGHT +
    stepText +
    project.summary.en.length +
    project.keyMetrics.join("").length
  );
}

/**
 * Featured projects lead. The first tile spans the full row; the rest pair up so the denser
 * card gets the wide cell (balancing row heights), with the wide cell alternating sides per row.
 * An unpaired last tile spans the full row.
 */
export function buildBentoLayout(projects: readonly Project[]): BentoTile[] {
  const ordered = [
    ...projects.filter((project) => project.featured),
    ...projects.filter((project) => !project.featured),
  ];
  const [lead, ...rest] = ordered;
  if (!lead) return [];

  const tiles: BentoTile[] = [{ project: lead, span: "full" }];
  for (let index = 0; index < rest.length; index += 2) {
    const first = rest[index];
    const second = rest[index + 1];
    if (!first) break;
    if (!second) {
      tiles.push({ project: first, span: "full" });
      break;
    }

    const [dense, light] = contentWeight(first) >= contentWeight(second) ? [first, second] : [second, first];
    const wide: BentoTile = { project: dense, span: "wide" };
    const narrow: BentoTile = { project: light, span: "narrow" };
    const wideLeads = (index / 2) % 2 === 0;
    tiles.push(...(wideLeads ? [wide, narrow] : [narrow, wide]));
  }
  return tiles;
}
