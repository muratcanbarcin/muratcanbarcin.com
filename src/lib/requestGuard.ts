export const BODY_LIMITS = {
  chat: 384 * 1024,
  form: 32 * 1024,
} as const;

export type BodyReadResult =
  | { ok: true; value: unknown }
  | {
      ok: false;
      status: 400 | 403 | 413 | 415;
      error: "invalid_request" | "forbidden" | "payload_too_large" | "unsupported_media_type";
    };

/**
 * Browsers set `Sec-Fetch-Site` and scripts cannot override it.
 * A missing header is a non-browser client. `none` is a user-initiated navigation.
 */
export function isCrossSiteBrowserRequest(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site === null || site === "same-origin" || site === "none") return false;
  return true;
}

/** JSON body for a same-origin browser call or a non-browser client. Cross-site browser calls stop here. */
export async function readSameOriginJson(request: Request, maxBytes: number): Promise<BodyReadResult> {
  if (isCrossSiteBrowserRequest(request)) {
    return { ok: false, status: 403, error: "forbidden" };
  }
  return readJsonBody(request, maxBytes);
}

async function readJsonBody(request: Request, maxBytes: number): Promise<BodyReadResult> {
  const mediaType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (mediaType !== "application/json") {
    return { ok: false, status: 415, error: "unsupported_media_type" };
  }

  const declared = request.headers.get("content-length");
  if (declared !== null) {
    const size = declared.trim();
    if (!/^\d+$/.test(size)) return { ok: false, status: 400, error: "invalid_request" };
    if (Number(size) > maxBytes) return { ok: false, status: 413, error: "payload_too_large" };
  }

  if (!request.body) return { ok: false, status: 400, error: "invalid_request" };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value || value.byteLength === 0) continue;
      received += value.byteLength;
      if (received > maxBytes) {
        await reader.cancel().catch(() => undefined);
        return { ok: false, status: 413, error: "payload_too_large" };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400, error: "invalid_request" };
  }

  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return { ok: true, value: JSON.parse(new TextDecoder().decode(bytes)) as unknown };
  } catch {
    return { ok: false, status: 400, error: "invalid_request" };
  }
}
