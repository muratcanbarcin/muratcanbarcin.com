import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Run once in the Supabase SQL editor. Chat logs outlive Vercel's one-hour runtime log.
 *
 * ```sql
 * CREATE TABLE IF NOT EXISTS chat_logs (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   session_id TEXT NOT NULL,
 *   user_prompt TEXT NOT NULL,
 *   ai_response TEXT NOT NULL,
 *   model_used TEXT NOT NULL,
 *   locale TEXT NOT NULL,
 *   ip_hash TEXT
 * );
 *
 * CREATE TABLE IF NOT EXISTS tier2_daily_usage (
 *   usage_date DATE PRIMARY KEY,
 *   request_count INTEGER NOT NULL DEFAULT 0,
 *   alert_sent BOOLEAN NOT NULL DEFAULT FALSE
 * );
 *
 * CREATE TABLE IF NOT EXISTS system_logs (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   level TEXT NOT NULL CHECK (level IN ('error', 'warn', 'info')),
 *   message TEXT NOT NULL,
 *   route TEXT,
 *   error_stack TEXT,
 *   metadata JSONB
 * );
 * ```
 *
 * Live projects are not uniform: the daily counter may be `request_count` or `count`,
 * and the stack may be `error_stack` or `stack_trace`. Writers send both and drop a column the schema does not have.
 */

export interface ChatLogInsert {
  sessionId: string;
  userPrompt: string;
  aiResponse: string;
  modelUsed: string;
  locale: string;
  ipHash: string | null;
}

export interface Tier2UsageRow {
  /** Null when the live table has no `request_count` column or the cell is not a number. */
  request_count: number | null;
  /** Null when the live table has no `count` column or the cell is not a number. */
  count: number | null;
  alert_sent: boolean;
}

/** Columns already rejected by `tier2_daily_usage`. Later writes skip them. */
const missingQuotaColumns = new Set<string>();

let cached: { url: string; key: string; client: SupabaseClient } | null = null;
let missingCredentialsWarned = false;

/**
 * Project URL only. A copied REST base (`https://<ref>.supabase.co/rest/v1`)
 * makes the client request `/rest/v1/rest/v1/...` and Supabase returns 404.
 */
function normalizeSupabaseUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  let previous = "";
  while (url !== previous) {
    previous = url;
    url = url.replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
  }
  return url;
}

/** Server-side client. Returns null when credentials are absent so build and local dev keep running. Never throws. */
export function getSupabaseAdmin(): SupabaseClient | null {
  try {
    const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || "");
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
    if (!url || !key) {
      if (!missingCredentialsWarned) {
        missingCredentialsWarned = true;
        console.warn(
          "[Supabase] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. Chat logs and quota persistence are disabled.",
        );
      }
      return null;
    }

    if (cached?.url === url && cached.key === key) return cached.client;
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    cached = { url, key, client };
    return client;
  } catch (error) {
    console.error("[Supabase] Client initialization failed.", error);
    return null;
  }
}

export async function insertChatLog(entry: ChatLogInsert): Promise<void> {
  const client = getSupabaseAdmin();
  if (!client) {
    console.info(
      "[Chat Log] Supabase is not configured. Interaction kept in the server log only.",
      JSON.stringify({
        sessionId: entry.sessionId,
        modelUsed: entry.modelUsed,
        locale: entry.locale,
        ipHash: entry.ipHash,
        userPrompt: entry.userPrompt.slice(0, 500),
        aiResponse: entry.aiResponse.slice(0, 500),
      }),
    );
    return;
  }

  const { error } = await client.from("chat_logs").insert({
    session_id: entry.sessionId,
    user_prompt: entry.userPrompt,
    ai_response: entry.aiResponse,
    model_used: entry.modelUsed,
    locale: entry.locale,
    ip_hash: entry.ipHash,
  });
  if (error) console.error("[Chat Log] Insert failed", error.message);
}

export async function readTier2Usage(usageDate: string): Promise<Tier2UsageRow | null> {
  try {
    const client = getSupabaseAdmin();
    if (!client) return null;

    const { data, error } = await client.from("tier2_daily_usage").select("*").eq("usage_date", usageDate).maybeSingle();

    if (error) {
      console.error("[Quota] Could not read daily usage. Using the in-memory counter.", error);
      return null;
    }
    return normalizeUsage(data);
  } catch (error) {
    console.error("[Quota] Could not read daily usage. Using the in-memory counter.", error);
    return null;
  }
}

export async function writeTier2Usage(usageDate: string, count: number, alertSent: boolean): Promise<boolean> {
  try {
    const client = getSupabaseAdmin();
    if (!client) return false;

    let payload = quotaPayload(usageDate, count, alertSent);
    if (!hasQuotaCounter(payload)) {
      console.error("[Quota] Neither request_count nor count can be written. Using the in-memory counter.");
      return false;
    }

    for (let attempt = 0; attempt < 4; attempt += 1) {
      const error = await quotaWriteError(client.from("tier2_daily_usage").upsert(payload));
      if (!error) return true;

      const missing = missingSchemaColumn(error);
      if (missing && owns(payload, missing) && !missingQuotaColumns.has(missing)) {
        missingQuotaColumns.add(missing);
        console.error("[Quota] Could not persist daily usage. Retrying without the missing column.", error);
        payload = quotaPayload(usageDate, count, alertSent);
        if (!hasQuotaCounter(payload)) {
          console.error("[Quota] Neither request_count nor count can be written. Using the in-memory counter.");
          return false;
        }
        continue;
      }

      console.error("[Quota] Could not persist daily usage. Using the in-memory counter.", error);
      return false;
    }

    console.error("[Quota] Could not persist daily usage. Using the in-memory counter.");
    return false;
  } catch (error) {
    console.error("[Quota] Could not persist daily usage. Using the in-memory counter.", error);
    return false;
  }
}

const MISSING_COLUMN_PATTERN =
  /could not find the '([^']+)' column|could not find the "([^"]+)" column|column "([^"]+)"(?: of relation "[^"]+")? does not exist/i;

const NULL_COLUMN_PATTERN = /null value in column "([^"]+)"/i;

/** Column named by a PostgREST schema-cache error or a Postgres undefined-column error. */
export function missingSchemaColumn(error: unknown): string | null {
  const match = MISSING_COLUMN_PATTERN.exec(schemaErrorText(error));
  if (!match) return null;
  return match[1] ?? match[2] ?? match[3] ?? null;
}

/** Column named by a Postgres NOT NULL violation. */
export function nullConstraintColumn(error: unknown): string | null {
  const match = NULL_COLUMN_PATTERN.exec(schemaErrorText(error));
  return match?.[1] ?? null;
}

async function quotaWriteError(write: PromiseLike<{ error: unknown }>): Promise<unknown> {
  try {
    const { error } = await write;
    return error;
  } catch (error) {
    return error;
  }
}

function quotaPayload(usageDate: string, count: number, alertSent: boolean): Record<string, unknown> {
  const payload: Record<string, unknown> = { usage_date: usageDate };
  if (!missingQuotaColumns.has("request_count")) payload.request_count = count;
  if (!missingQuotaColumns.has("count")) payload.count = count;
  if (!missingQuotaColumns.has("alert_sent")) payload.alert_sent = alertSent;
  return payload;
}

function hasQuotaCounter(payload: Record<string, unknown>): boolean {
  return owns(payload, "request_count") || owns(payload, "count");
}

function owns(payload: Record<string, unknown>, column: string): boolean {
  return Object.prototype.hasOwnProperty.call(payload, column);
}

function normalizeUsage(data: unknown): Tier2UsageRow {
  if (!isRecord(data)) return { request_count: null, count: null, alert_sent: false };
  return {
    request_count: finiteNumber(data.request_count),
    count: finiteNumber(data.count),
    alert_sent: data.alert_sent === true,
  };
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function schemaErrorText(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error !== "object" || error === null) return "";
  const parts: string[] = [];
  if ("message" in error && typeof error.message === "string") parts.push(error.message);
  if ("details" in error && typeof error.details === "string") parts.push(error.details);
  if ("hint" in error && typeof error.hint === "string") parts.push(error.hint);
  return parts.join(" ");
}
