import { cacheLife } from "next/cache";
import type { GitHubPushActivity } from "@/types";
import { findLatestPushEvent, readCommitHeadline } from "@/lib/github";

const GITHUB_API = "https://api.github.com";
const GITHUB_WEB = "https://github.com";

async function githubGet(path: string): Promise<unknown> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "muratcanbarcin.com",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(`${GITHUB_API}${path}`, { headers });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

/**
 * Cached server-side so every visitor shares one upstream request per window, keeping well
 * under GitHub's unauthenticated rate limit. Failures are cached briefly so they recover fast.
 */
export async function getLatestPushActivity(username: string): Promise<GitHubPushActivity | null> {
  "use cache";

  const push = findLatestPushEvent(await githubGet(`/users/${username}/events/public?per_page=30`));
  const message = push && readCommitHeadline(await githubGet(`/repos/${push.repo}/commits/${push.head}`));

  if (!push || !message) {
    cacheLife("minutes");
    return null;
  }

  cacheLife("hours");
  return {
    repo: push.repo,
    repoUrl: `${GITHUB_WEB}/${push.repo}`,
    message,
    commitUrl: `${GITHUB_WEB}/${push.repo}/commit/${push.head}`,
    pushedAt: push.createdAt,
  };
}
