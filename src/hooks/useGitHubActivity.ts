"use client";

import { useEffect, useState } from "react";
import type { GitHubPushActivity } from "@/types";
import { parseActivityResponse } from "@/lib/github";

const ACTIVITY_ENDPOINT = "/api/github-activity";

export type GitHubActivityState =
  | { status: "loading" }
  | { status: "ready"; activity: GitHubPushActivity; fetchedAt: number }
  | { status: "unavailable" };

export function useGitHubActivity(): GitHubActivityState {
  const [state, setState] = useState<GitHubActivityState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    fetch(ACTIVITY_ENDPOINT, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: unknown) => {
        const result = parseActivityResponse(data);
        setState(
          result.status === "ok"
            ? { status: "ready", activity: result.activity, fetchedAt: Date.now() }
            : { status: "unavailable" },
        );
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: "unavailable" });
      });

    return () => controller.abort();
  }, []);

  return state;
}
