import { loadProjectDocumentation } from "@/services/githubService";

interface ReadmeRouteContext {
  params: Promise<{ id: string }>;
}

/** Cached README for a whitelisted public project. Proprietary and unknown ids never reach GitHub. */
export async function GET(_request: Request, context: ReadmeRouteContext) {
  const { id } = await context.params;
  const document = await loadProjectDocumentation(id);
  if (!document) {
    return Response.json({ error: "Documentation is not available for this project." }, { status: 404 });
  }

  return Response.json({
    markdown: document.markdown,
    githubUrl: document.githubUrl,
    title: document.title,
    branch: document.branch,
  });
}
