const POST = ["POST"] as const;
const GET = ["GET"] as const;
const READ = ["GET", "HEAD"] as const;

const EXACT_METHODS: Record<string, readonly string[]> = {
  "/api/chat": POST,
  "/api/contact": POST,
  "/api/makas/support": POST,
  "/api/resume-request": POST,
  "/api/test-log": GET,
};

const PROJECT_ID = /^[a-z0-9-]{1,64}$/;
const PROJECT_README = /^\/api\/projects\/[a-z0-9-]{1,64}\/readme$/;

export function isProjectReadmeId(id: string): boolean {
  return PROJECT_ID.test(id);
}

export function allowedMethodsForPath(pathname: string): readonly string[] | null {
  const path = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  const exact = EXACT_METHODS[path];
  if (exact) return exact;
  if (PROJECT_README.test(path)) return READ;
  return null;
}

export function methodNotAllowed(allowed: readonly string[]): Response {
  return new Response(null, {
    status: 405,
    headers: {
      Allow: allowed.join(", "),
      "Cache-Control": "no-store",
    },
  });
}
