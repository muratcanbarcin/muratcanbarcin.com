export interface GitHubPushActivity {
  /** `owner/name` */
  repo: string;
  repoUrl: string;
  /** First line of the head commit message. */
  message: string;
  commitUrl: string;
  /** ISO 8601 timestamp of the push. */
  pushedAt: string;
}

export type GitHubActivityResponse =
  | { status: "ok"; activity: GitHubPushActivity }
  | { status: "unavailable" };
