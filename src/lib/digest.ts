import { createHash } from "node:crypto";

/** Stable short digest for visitor addresses. The raw address is never stored. */
export function digestKey(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}
