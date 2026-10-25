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
 * Live projects are not uniform: the day column may be `usage_date` or `date`, the counter
 * may be `request_count` or `count`, and the stack may be `error_stack` or `stack_trace`.
 * Readers probe the row shape and writers send only columns the table actually has, so a
 * missing column (Postgres 42703) is not queried again.
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
  /** Null when the live table has no `usage_date` column. */
  usage_date: string | null;
  /** Null when the live table has no `date` column. */
  date: string | null;
  alert_sent: boolean;
}

const DATE_COLUMNS = ["usage_date", "date"] as const;
const COUNT_COLUMNS = ["request_count", "count"] as const;
type DateColumn = (typeof DATE_COLUMNS)[number];
type CountColumn = (typeof COUNT_COLUMNS)[number];

/** Columns already rejected by `tier2_daily_usage`. Later reads and writes skip them. */
const missingQuotaColumns = new Set<string>();
/** Columns observed on a real row. Empty until the table shape is known. */
let knownDateColumns: readonly DateColumn[] | null = null;
let knownCountColumns: readonly CountColumn[] | null = null;
/** `false` once a row proves `alert_sent` is absent. `null` until a row is seen. */
let knownAlertColumn: boolean | null = null;

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
    if (!knownDateColumns) await probeQuotaShape(client);

    for (const column of dateColumnCandidates()) {
      const { data, error } = await client.from("tier2_daily_usage").select("*").eq(column, usageDate).maybeSingle();
      if (!error) {
        if (isRecord(data)) {
          rememberQuotaShape(data);
          return normalizeUsage(data);
        }
        rememberDateColumn(column);
        const alternateExists = knownDateColumns?.some((item) => item !== column && !missingQuotaColumns.has(item)) ?? false;
        if (alternateExists) continue;
        return normalizeUsage(data);
      }

      if (isMissingQuotaColumn(error, column)) {
        missingQuotaColumns.add(column);
        knownDateColumns = knownDateColumns?.filter((item) => item !== column) ?? null;
        console.warn(`[Quota] ${column} is not on tier2_daily_usage. Using the alternate day column.`);
        continue;
      }

      console.error("[Quota] Could not read daily usage. Using the in-memory counter.", error);
      return null;
    }

    console.error("[Quota] Could not read daily usage. Using the in-memory counter.");
    return null;
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
    if (!hasQuotaIdentity(payload)) {
      console.error("[Quota] Neither request_count nor count can be written. Using the in-memory counter.");
      return false;
    }

    for (let attempt = 0; attempt < 4; attempt += 1) {
      const error = await quotaWriteError(client.from("tier2_daily_usage").upsert(payload));
      if (!error) {
        rememberWrittenColumns(payload);
        return true;
      }

      const missing = missingSchemaColumn(error);
      if (missing && owns(payload, missing) && !missingQuotaColumns.has(missing)) {
        missingQuotaColumns.add(missing);
        if (isDateColumn(missing)) knownDateColumns = knownDateColumns?.filter((item) => item !== missing) ?? null;
        if (isCountColumn(missing)) knownCountColumns = knownCountColumns?.filter((item) => item !== missing) ?? null;
        console.warn(`[Quota] ${missing} is not on tier2_daily_usage. Retrying with the alternate column.`);
        payload = quotaPayload(usageDate, count, alertSent);
        if (!hasQuotaIdentity(payload)) {
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
  /could not find the '([^']+)' column|could not find the "([^"]+)" column|column "([^"]+)"(?: of relation "[^"]+")? does not exist|column ([a-zA-Z_][a-zA-Z0-9_]*) does not exist/i;

const QUOTA_COLUMN_NAMES = ["usage_date", "date", "request_count", "count", "alert_sent"] as const;

const NULL_COLUMN_PATTERN = /null value in column "([^"]+)"/i;

/** Column named by a PostgREST schema-cache error or a Postgres undefined-column error (42703). */
export function missingSchemaColumn(error: unknown): string | null {
  const text = schemaErrorText(error);
  if (isUndefinedColumnError(error)) {
    const known = QUOTA_COLUMN_NAMES.find((column) => text.includes(column));
    if (known) return known;
  }
  const match = MISSING_COLUMN_PATTERN.exec(text);
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? match?.[4] ?? null;
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
  const payload: Record<string, unknown> = {};
  for (const column of dateColumnsToWrite()) payload[column] = usageDate;
  for (const column of countColumnsToWrite()) payload[column] = count;
  if (knownAlertColumn !== false && !missingQuotaColumns.has("alert_sent")) payload.alert_sent = alertSent;
  return payload;
}

function hasQuotaIdentity(payload: Record<string, unknown>): boolean {
  const hasDay = owns(payload, "usage_date") || owns(payload, "date");
  const hasCount = owns(payload, "request_count") || owns(payload, "count");
  return hasDay && hasCount;
}

function dateColumnCandidates(): readonly DateColumn[] {
  const known = knownDateColumns?.filter((column) => !missingQuotaColumns.has(column));
  if (known && known.length > 0) return known;
  return DATE_COLUMNS.filter((column) => !missingQuotaColumns.has(column));
}

function dateColumnsToWrite(): readonly DateColumn[] {
  const known = knownDateColumns?.filter((column) => !missingQuotaColumns.has(column));
  if (known && known.length > 0) return known;
  return dateColumnCandidates().slice(0, 1);
}

function countColumnsToWrite(): readonly CountColumn[] {
  const known = knownCountColumns?.filter((column) => !missingQuotaColumns.has(column));
  if (known && known.length > 0) return known;
  const remaining = COUNT_COLUMNS.filter((column) => !missingQuotaColumns.has(column));
  return remaining.slice(0, 1);
}

async function probeQuotaShape(client: SupabaseClient): Promise<void> {
  try {
    const { data, error } = await client.from("tier2_daily_usage").select("*").limit(1);
    if (error || !Array.isArray(data)) return;
    const sample = data.find(isRecord);
    if (sample) rememberQuotaShape(sample);
  } catch (error) {
    console.warn("[Quota] Could not inspect tier2_daily_usage columns.", error);
  }
}

function rememberQuotaShape(row: Record<string, unknown>): void {
  const dates = DATE_COLUMNS.filter((column) => Object.prototype.hasOwnProperty.call(row, column));
  const counts = COUNT_COLUMNS.filter((column) => Object.prototype.hasOwnProperty.call(row, column));
  if (dates.length > 0) knownDateColumns = dates;
  if (counts.length > 0) knownCountColumns = counts;
  knownAlertColumn = Object.prototype.hasOwnProperty.call(row, "alert_sent");
}

function rememberDateColumn(column: DateColumn): void {
  if (missingQuotaColumns.has(column)) return;
  if (!knownDateColumns) {
    knownDateColumns = [column];
    return;
  }
  if (!knownDateColumns.includes(column)) knownDateColumns = [...knownDateColumns, column];
}

function rememberWrittenColumns(payload: Record<string, unknown>): void {
  const dates = DATE_COLUMNS.filter((column) => owns(payload, column));
  const counts = COUNT_COLUMNS.filter((column) => owns(payload, column));
  if (dates.length > 0) knownDateColumns = dates;
  if (counts.length > 0) knownCountColumns = counts;
}

function isDateColumn(column: string): column is DateColumn {
  return column === "usage_date" || column === "date";
}

function isCountColumn(column: string): column is CountColumn {
  return column === "request_count" || column === "count";
}

function isMissingQuotaColumn(error: unknown, column: string): boolean {
  const missing = missingSchemaColumn(error);
  return missing === column || (missing == null && isUndefinedColumnError(error));
}

function isUndefinedColumnError(error: unknown): boolean {
  const code = readErrorCode(error);
  if (code === "42703" || code === "PGRST204") return true;
  const text = schemaErrorText(error);
  return text.includes("42703") || text.includes("PGRST204");
}

function readErrorCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("code" in error)) return null;
  return typeof error.code === "string" ? error.code : null;
}

function owns(payload: Record<string, unknown>, column: string): boolean {
  return Object.prototype.hasOwnProperty.call(payload, column);
}

function normalizeUsage(data: unknown): Tier2UsageRow {
  if (!isRecord(data)) {
    return { request_count: null, count: null, usage_date: null, date: null, alert_sent: false };
  }
  return {
    request_count: finiteNumber(data.request_count),
    count: finiteNumber(data.count),
    usage_date: dateCell(data.usage_date),
    date: dateCell(data.date),
    alert_sent: data.alert_sent === true,
  };
}

function dateCell(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const day = value.trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null;
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
