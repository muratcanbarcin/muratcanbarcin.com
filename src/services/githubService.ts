import { portfolioData } from "@/data/portfolioData";
import type { MediaAsset, Project } from "@/types";

/** README content stays fresh for 24 hours, then Next.js revalidates it. */
export const GITHUB_REVALIDATE_SECONDS = 86_400;

const DEFAULT_BRANCH = "main";
const REPO_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const DIAGRAM_HOSTS = new Set(["raw.githubusercontent.com", "github.com"]);

export interface ReadmeDiagram {
  alt: string;
  url: string;
}

export interface SyncedRepository {
  projectId: string;
  repo: string;
  branch: string;
  summary: string;
  diagrams: readonly ReadmeDiagram[];
  source: "github" | "fallback";
}

export interface ProjectReadmeDocument {
  title: string;
  githubUrl: string;
  branch: string;
  /** Clean markdown with absolute diagram URLs, safe to render in the documentation modal. */
  markdown: string;
  diagrams: readonly ReadmeDiagram[];
}

/** Projects whose config explicitly turns GitHub sync on. Everything else is ignored. */
export function selectWhitelistedProjects(projects: readonly Project[]): Project[] {
  return projects.filter((project) => {
    const sync = project.githubSync;
    return Boolean(sync && sync.enabled && sync.repo.length > 0);
  });
}

/**
 * Fetches README content only for projects with `githubSync.enabled === true`.
 * A 403, 404, or invalid repository falls back to the local description and leaves media untouched.
 */
export async function syncWhitelistedProjects(
  projects: readonly Project[] = portfolioData.projects,
): Promise<ReadonlyMap<string, SyncedRepository>> {
  const synced = new Map<string, SyncedRepository>();
  const eligible = selectWhitelistedProjects(projects);

  await Promise.all(
    eligible.map(async (project) => {
      const config = project.githubSync;
      if (!config?.enabled) return;
      synced.set(project.id, await syncProject(project, config.repo, config.branch));
    }),
  );

  return synced;
}

/** MCB.ai context. Only enabled projects with `injectToAI !== false` are included. */
export async function loadGithubPromptContext(
  projects: readonly Project[] = portfolioData.projects,
): Promise<string> {
  const synced = await syncWhitelistedProjects(projects);
  const blocks: string[] = [];

  for (const project of projects) {
    const config = project.githubSync;
    if (!config?.enabled || config.injectToAI === false) continue;
    const row = synced.get(project.id);
    const repositoryUrl = project.githubUrl ?? `https://github.com/${config.repo}`;
    blocks.push(`[SYNCHRONIZED REPOSITORY CONTEXT: ${project.title}]`);
    blocks.push(`Repository: ${repositoryUrl}`);
    blocks.push("Architectural summary only. Do not recite file trees, commands, or low-level syntax.");
    blocks.push(row?.summary || localSummary(project));
  }

  return blocks.join("\n\n");
}

/**
 * README for one whitelisted project. Disabled, proprietary, and unknown ids return null
 * before any network call.
 */
export async function loadProjectDocumentation(projectId: string): Promise<ProjectReadmeDocument | null> {
  const project = portfolioData.projects.find((item) => item.id === projectId);
  const sync = project?.githubSync;
  if (!project || !sync?.enabled || sync.repo.length === 0) return null;

  const branch = sync.branch?.trim() || DEFAULT_BRANCH;
  const githubUrl = project.githubUrl ?? `https://github.com/${sync.repo}`;
  const fallback = localDocumentation(project);
  const coordinates = parseRepo(sync.repo);
  if (!coordinates) return { title: project.title, githubUrl, branch, markdown: fallback, diagrams: [] };

  try {
    const raw = await fetchReadmeMarkdown(coordinates.owner, coordinates.name, branch);
    if (!raw) return { title: project.title, githubUrl, branch, markdown: fallback, diagrams: [] };
    const prepared = prepareReadme(raw, sync.repo, branch);
    return {
      title: project.title,
      githubUrl,
      branch,
      markdown: prepared.markdown || fallback,
      diagrams: prepared.diagrams,
    };
  } catch (error) {
    console.warn(`[GitHub] README unavailable for ${project.id}. Using the local architecture summary.`, error);
    return { title: project.title, githubUrl, branch, markdown: fallback, diagrams: [] };
  }
}

/** Appends remote architecture diagrams onto local media. Failed syncs keep the static media array. */
export async function loadShowcaseProjects(
  projects: readonly Project[] = portfolioData.projects,
): Promise<readonly Project[]> {
  try {
    const synced = await syncWhitelistedProjects(projects);
    return applySyncedArchitectureMedia(projects, synced);
  } catch (error) {
    console.warn("[GitHub] Media sync skipped. Using local project media.", error);
    return projects;
  }
}

export function applySyncedArchitectureMedia(
  projects: readonly Project[],
  synced: ReadonlyMap<string, SyncedRepository>,
): readonly Project[] {
  return projects.map((project) => {
    const config = project.githubSync;
    if (!config?.enabled || config.syncArchitectureMedia === false) return project;
    const row = synced.get(project.id);
    if (!row || row.source !== "github" || row.diagrams.length === 0) return project;

    const remote = row.diagrams.filter((diagram) => isShowcaseHost(diagram.url)).map((diagram) => toMediaAsset(project, diagram));
    if (remote.length === 0) return project;
    return { ...project, media: [...project.media, ...remote] };
  });
}

export function parseReadme(
  markdown: string,
  repo: string,
  branch: string,
): { summary: string; diagrams: ReadmeDiagram[] } {
  const diagrams: ReadmeDiagram[] = [];
  for (const match of markdown.matchAll(/!\[([^\]]*)\]\(([^)\s]+)\)/g)) {
    const alt = (match[1] ?? "").trim();
    const target = match[2] ?? "";
    if (!/architecture|topology/i.test(alt) && !/architecture|topology/i.test(target)) continue;
    const url = absoluteDiagramUrl(repo, branch, target);
    if (!url) continue;
    diagrams.push({ alt: alt || "Architecture", url });
  }

  return { summary: sanitizeReadme(markdown).slice(0, 400), diagrams };
}

async function syncProject(project: Project, repo: string, branch: string | undefined): Promise<SyncedRepository> {
  const resolvedBranch = branch?.trim() || DEFAULT_BRANCH;
  const fallback = fallbackSync(project, repo, resolvedBranch);
  const coordinates = parseRepo(repo);
  if (!coordinates) {
    console.warn(`[GitHub] Skipping ${project.id}. Repository must be owner/name.`);
    return fallback;
  }

  try {
    const markdown = await fetchReadmeMarkdown(coordinates.owner, coordinates.name, resolvedBranch);
    if (markdown === null) return fallback;
    const wantsMedia = project.githubSync?.syncArchitectureMedia !== false;
    const parsed = parseReadme(markdown, `${coordinates.owner}/${coordinates.name}`, resolvedBranch);
    return {
      projectId: project.id,
      repo: `${coordinates.owner}/${coordinates.name}`,
      branch: resolvedBranch,
      summary: parsed.summary || fallback.summary,
      diagrams: wantsMedia ? parsed.diagrams : [],
      source: "github",
    };
  } catch (error) {
    console.warn(`[GitHub] Ingestion failed for ${project.id}. Using the local portfolio summary.`, error);
    return fallback;
  }
}

async function fetchReadmeMarkdown(owner: string, name: string, branch: string): Promise<string | null> {
  const url = `https://api.github.com/repos/${owner}/${name}/readme?ref=${encodeURIComponent(branch)}`;
  const response = await fetch(url, {
    headers: githubHeaders(),
    next: { revalidate: GITHUB_REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(4_000),
  });
  if (response.status === 403 || response.status === 404 || !response.ok) return null;
  return response.text();
}

function fallbackSync(project: Project, repo: string, branch: string): SyncedRepository {
  return {
    projectId: project.id,
    repo,
    branch,
    summary: localSummary(project),
    diagrams: [],
    source: "fallback",
  };
}

function localSummary(project: Project): string {
  return project.description.en.replace(/\s+/g, " ").trim().slice(0, 400);
}

function localDocumentation(project: Project): string {
  const steps = project.architectureFlow
    .map((step) => `${step.step}. **${step.title}** — ${step.description.en} (${step.technology})`)
    .join("\n");
  return [`# ${project.title}`, "", project.summary.en, "", "## Architecture", "", steps].join("\n");
}

function prepareReadme(raw: string, repo: string, branch: string): { markdown: string; diagrams: ReadmeDiagram[] } {
  const stripped = raw.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/javascript:/gi, "");
  const markdown = stripped.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_match, alt: string, target: string) => {
    const url = absoluteDiagramUrl(repo, branch, target);
    return url ? `![${alt}](${url})` : "";
  });
  return { markdown: markdown.trim(), diagrams: parseReadme(markdown, repo, branch).diagrams };
}

function sanitizeReadme(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[#>*_`[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseRepo(repo: string): { owner: string; name: string } | null {
  const trimmed = repo.trim();
  if (!REPO_PATTERN.test(trimmed)) return null;
  const [owner, name] = trimmed.split("/");
  if (!owner || !name) return null;
  return { owner, name };
}

function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.raw+json",
    "User-Agent": "muratcanbarcin.com",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function absoluteDiagramUrl(repo: string, branch: string, url: string): string | null {
  if (/^https?:\/\//i.test(url)) return url;
  const coordinates = parseRepo(repo);
  if (!coordinates) return null;
  const path = url.replace(/^\.\//, "").replace(/^\//, "");
  if (!path || path.includes("..")) return null;
  const encoded = path.split("/").map((segment) => encodeURIComponent(segment)).join("/");
  return `https://raw.githubusercontent.com/${coordinates.owner}/${coordinates.name}/${encodeURIComponent(branch)}/${encoded}`;
}

function isShowcaseHost(url: string): boolean {
  try {
    return DIAGRAM_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

function toMediaAsset(project: Project, diagram: ReadmeDiagram): MediaAsset {
  const label = diagram.alt || `${project.title} architecture`;
  return {
    type: "diagram",
    url: diagram.url,
    alt: { en: label, tr: label },
  };
}
