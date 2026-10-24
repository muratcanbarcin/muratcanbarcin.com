import type { MakasSupportField, MakasSupportPayload } from "@/types";

export type MakasSupportResult =
  | { outcome: "received" }
  | { outcome: "invalid"; fields: readonly MakasSupportField[] }
  | { outcome: "rate-limited" }
  | { outcome: "error" };

function isFieldList(value: unknown): value is MakasSupportField[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export async function submitMakasSupport(
  payload: MakasSupportPayload,
  signal?: AbortSignal,
): Promise<MakasSupportResult> {
  try {
    const response = await fetch("/api/makas/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });
    if (response.ok) return { outcome: "received" };
    if (response.status === 429) return { outcome: "rate-limited" };
    if (response.status === 400) {
      const body: unknown = await response.json().catch(() => null);
      const fields =
        body && typeof body === "object" && "fields" in body && isFieldList(body.fields) ? body.fields : [];
      return { outcome: "invalid", fields };
    }
    return { outcome: "error" };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    return { outcome: "error" };
  }
}
