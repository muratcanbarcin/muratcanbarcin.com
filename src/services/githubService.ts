import { portfolioData } from "@/data/portfolioData";
import type { Project } from "@/types";

/** README and repository metadata stay fresh for 24 hours, then Next.js revalidates them. */
export const GITHUB_REVALIDATE_SECONDS = 86_400;

const GITHUB_OWNER = "muratcanbarcin";

export interface ReadmeDiagram {
  alt: string;
  url: string;
}

export interface ProjectReadme {
  repoName: string;
  projectTitle: string;
  summary: string;
  diagrams: ReadmeDiagram[];
  repositoryUrl: string | null;
  source: "github" | "fallback";
}

interface RepoMetadata {
  htmlUrl: string | null;
  description: string | null;
}

/** Pulls one repository README. A 403, 404, or private repository returns the local portfolio summary. */
export async function fetchProjectReadme(repoName: string): Promise<ProjectReadme> {
  const project = findProject(repoName);
  const fallback = fallbackReadme(repoName, project);
  try {
    const [markdown, metadata] = await Promise.all([fetchReadmeMarkdown(repoName), fetchRepoMetadata(repoName)]);
    if (markdown === null) {
      return { ...fallback, repositoryUrl: metadata.htmlUrl ?? fallback.repositoryUrl };
    }
    const parsed = parseReadme(markdown, repoName);
    return {
      repoName,
      projectTitle: project?.title ?? repoName,
      summary: parsed.summary || metadata.description || fallback.summary,
      diagrams: parsed.diagrams,
      repositoryUrl: metadata.htmlUrl ?? `https://github.com/${GITHUB_OWNER}/${repoName}`,
      source: "github",
    };
  } catch (error) {
    console.warn(`[GitHub] Ingestion failed for ${repoName}. Using the local portfolio summary.`, error);
    return fallback;
  }
}

/** Cached repository context appended to the MCB.ai system prompt. */
export async function loadGithubPromptContext(): Promise<string> {
  const reads = await Promise.all(portfolioData.projects.map((project) => fetchProjectReadme(project.slug)));
  const lines = ["REPOSITORY CONTEXT (refreshed every 24 hours)", "Use these README summaries and topology links. Do not invent repositories."];
  for (const read of reads) {
    lines.push(`- ${read.projectTitle} (${GITHUB_OWNER}/${read.repoName}) [${read.source}]`);
    lines.push(`  Summary: ${read.summary}`);
    if (read.repositoryUrl) lines.push(`  Repository: ${read.repositoryUrl}`);
    if (read.diagrams.length === 0) {
      lines.push("  Topology: none published");
    } else {
      for (const diagram of read.diagrams) lines.push(`  Topology: ${diagram.alt} — ${diagram.url}`);
    }
  }
  return lines.join("\n");
}

export function parseReadme(markdown: string, repoName: string): { summary: string; diagrams: ReadmeDiagram[] } {
  const diagrams: ReadmeDiagram[] = [];
  for (const match of markdown.matchAll(/!\[([^\]]*)\]\(([^)\s]+)\)/g)) {
    const alt = (match[1] ?? "").trim();
    const target = match[2] ?? "";
    if (!/architecture|topology/i.test(alt)) continue;
    diagrams.push({ alt, url: absoluteDiagramUrl(repoName, target) });
  }

  const prose = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[#>*_`[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return { summary: prose.slice(0, 400), diagrams };
}

function findProject(repoName: string): Project | undefined {
  return portfolioData.projects.find((project) => project.slug === repoName || project.id === repoName);
}

function fallbackReadme(repoName: string, project: Project | undefined): ProjectReadme {
  const summary = project
    ? project.description.en.replace(/\s+/g, " ").trim().slice(0, 400)
    : "Repository metadata is unavailable.";
  return {
    repoName,
    projectTitle: project?.title ?? repoName,
    summary,
    diagrams: [],
    repositoryUrl: null,
    source: "fallback",
  };
}

async function fetchReadmeMarkdown(repoName: string): Promise<string | null> {
  const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${repoName}/readme`, {
    headers: githubHeaders("application/vnd.github.raw+json"),
    next: { revalidate: GITHUB_REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(4_000),
  });
  if (response.status === 403 || response.status === 404 || !response.ok) return null;
  return response.text();
}

async function fetchRepoMetadata(repoName: string): Promise<RepoMetadata> {
  const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${repoName}`, {
    headers: githubHeaders("application/vnd.github+json"),
    next: { revalidate: GITHUB_REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(4_000),
  });
  if (!response.ok) return { htmlUrl: null, description: null };
  const body: unknown = await response.json();
  if (!isRecord(body)) return { htmlUrl: null, description: null };
  return {
    htmlUrl: typeof body.html_url === "string" ? body.html_url : null,
    description: typeof body.description === "string" ? body.description : null,
  };
}

function githubHeaders(accept: string): HeadersInit {
  const headers: Record<string, string> = {
    Accept: accept,
    "User-Agent": "muratcanbarcin.com",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function absoluteDiagramUrl(repoName: string, url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  const path = url.replace(/^\.?\//, "");
  return `https://github.com/${GITHUB_OWNER}/${repoName}/raw/HEAD/${path}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
