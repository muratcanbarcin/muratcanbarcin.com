import { NextResponse, type NextRequest } from "next/server";
import { allowedMethodsForPath, methodNotAllowed } from "@/lib/apiPolicy";

/**
 * Same-origin API only. Unsupported methods stop here with 405.
 * No `Access-Control-Allow-Origin` is set, so browsers do not treat these routes as public CORS endpoints.
 */
export function proxy(request: NextRequest) {
  const allowed = allowedMethodsForPath(request.nextUrl.pathname);
  if (!allowed || allowed.includes(request.method)) return NextResponse.next();
  return methodNotAllowed(allowed);
}

export const config = {
  matcher: "/api/:path*",
};
