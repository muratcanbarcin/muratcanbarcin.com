import "server-only";

/**
 * Production never writes. Local `next dev` keeps the existing insert.
 * Preview and any other hosted runtime need `DIAGNOSTIC_SECRET` via `x-diagnostic-token`.
 */
export function canWriteDiagnostics(request: Request): boolean {
  if (isProductionDeployment()) return false;
  if (process.env.NODE_ENV === "development" && !process.env.VERCEL) return true;
  return diagnosticSecretMatches(request);
}

function isProductionDeployment(): boolean {
  const vercelEnv = process.env.VERCEL_ENV?.trim();
  if (vercelEnv) return vercelEnv === "production";
  return process.env.NODE_ENV === "production";
}

function diagnosticSecretMatches(request: Request): boolean {
  const expected = process.env.DIAGNOSTIC_SECRET?.trim() ?? "";
  if (!expected) return false;
  return fixedEquals(request.headers.get("x-diagnostic-token") ?? "", expected);
}

function fixedEquals(provided: string, expected: string): boolean {
  const encoder = new TextEncoder();
  const left = encoder.encode(provided);
  const right = encoder.encode(expected);
  const length = Math.max(left.length, right.length, 1);
  let mismatch = left.length === right.length ? 0 : 1;
  for (let index = 0; index < length; index += 1) {
    mismatch |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return mismatch === 0;
}
