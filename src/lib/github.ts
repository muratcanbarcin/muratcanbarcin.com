import type { GitHubActivityResponse, GitHubPushActivity } from "@/types";

/** The fields of a public `PushEvent` we rely on; GitHub no longer embeds commit summaries. */
export interface PushEventRef {
  repo: string;
  head: string;
  createdAt: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** Picks the most recent `PushEvent` from a `/users/:user/events` response. */
export function findLatestPushEvent(events: unknown): PushEventRef | null {
  if (!Array.isArray(events)) return null;
  for (const event of events) {
    if (!isRecord(event) || event.type !== "PushEvent") continue;
    const repo = isRecord(event.repo) ? readString(event.repo, "name") : null;
    const head = isRecord(event.payload) ? readString(event.payload, "head") : null;
    const createdAt = readString(event, "created_at");
    if (repo && head && createdAt) return { repo, head, createdAt };
  }
  return null;
}

/** Extracts the first line of the message from a `/repos/:repo/commits/:sha` response. */
export function readCommitHeadline(commit: unknown): string | null {
  if (!isRecord(commit) || !isRecord(commit.commit)) return null;
  const message = readString(commit.commit, "message");
  return message?.split("\n", 1)[0]?.trim() || null;
}

function isPushActivity(value: unknown): value is GitHubPushActivity {
  return (
    isRecord(value) &&
    ["repo", "repoUrl", "message", "commitUrl", "pushedAt"].every((key) => typeof value[key] === "string")
  );
}

export function parseActivityResponse(value: unknown): GitHubActivityResponse {
  if (isRecord(value) && value.status === "ok" && isPushActivity(value.activity)) {
    return { status: "ok", activity: value.activity };
  }
  return { status: "unavailable" };
}
