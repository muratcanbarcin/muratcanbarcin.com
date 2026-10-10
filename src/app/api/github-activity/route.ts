import type { GitHubActivityResponse } from "@/types";
import { portfolioData } from "@/data/portfolioData";
import { getLatestPushActivity } from "@/services/githubActivity";

export async function GET() {
  const github = portfolioData.profile.socials.find((social) => social.platform === "github");
  const activity = github ? await getLatestPushActivity(github.handle) : null;

  const body: GitHubActivityResponse = activity ? { status: "ok", activity } : { status: "unavailable" };
  return Response.json(body);
}
