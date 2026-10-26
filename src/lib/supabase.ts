import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { adaptiveWrite, missingSchemaColumn, parseOpenApiTables } from "@/lib/supabaseSchema";

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
 * may be `request_count` or `count`, `alert_sent` may be absent, and the stack may be
 * `error_stack` or `stack_trace`. The OpenAPI catalog is read once per isolate. Writes
 * send only columns that exist and retry quietly when the catalog is stale.
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
const QUOTA_TABLE = "tier2_daily_usage";
const CHAT_TABLE = "chat_logs";

type DateColumn = (typeof DATE_COLUMNS)[number];

/** Columns already rejected by `tier2_daily_usage`. Later reads and writes skip them. */
const missingQuotaColumns = new Set<string>();
/** NOT NULL columns on `tier2_daily_usage` that must not be sent as null. */
const quotaNullFallbacks = new Set<string>();
/** Columns already rejected by `chat_logs`. */
const missingChatColumns = new Set<string>();
const chatNullFallbacks = new Set<string>();

const CATALOG_RETRY_MS = 60_000;
let catalog: Map<string, ReadonlySet<string>> | null = null;
let catalogFailedAt = 0;
let catalogInflight: Promise<Map<string, ReadonlySet<string>> | null> | null = null;

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

/** Columns PostgREST advertises for `table`. Null when the catalog cannot be read; callers then adapt per error. */
export async function loadTableColumns(table: string): Promise<ReadonlySet<string> | null> {
  try {
    const tables = await loadCatalog();
    return tables?.get(table) ?? null;
  } catch {
    catalogFailedAt = Date.now();
    return null;
  }
}

export async function insertChatLog(entry: ChatLogInsert): Promise<void> {
  try {
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

    const columns = await loadTableColumns(CHAT_TABLE);
    const result = await adaptiveWrite({
      columns,
      missing: missingChatColumns,
      nullAs: chatNullFallbacks,
      build: (nullAs) => ({
        session_id: entry.sessionId,
        user_prompt: entry.userPrompt,
        ai_response: entry.aiResponse,
        model_used: entry.modelUsed,
        locale: entry.locale,
        ip_hash: entry.ipHash == null && nullAs.has("ip_hash") ? "" : entry.ipHash,
      }),
      execute: (payload) => client.from(CHAT_TABLE).insert(payload),
    });
    if (!result.ok) console.error("[Chat Log] Insert failed", result.error);
  } catch (error) {
    console.error("[Chat Log] Insert failed", error);
  }
}

export async function readTier2Usage(usageDate: string): Promise<Tier2UsageRow | null> {
  try {
    const client = getSupabaseAdmin();
    if (!client) return null;

    const columns = await loadTableColumns(QUOTA_TABLE);
    const dates = dateColumns(columns);
    if (dates.length === 0) {
      console.error("[Quota] Could not read daily usage. Using the in-memory counter.");
      return null;
    }

    let emptyRow: Tier2UsageRow | null = null;
    for (const column of dates) {
      const outcome = await readUsageRow(client, column, usageDate);
      if (outcome.kind === "missing") continue;
      if (outcome.kind === "failed") {
        if (emptyRow) return emptyRow;
        console.error("[Quota] Could not read daily usage. Using the in-memory counter.", outcome.error);
        return null;
      }
      if (isEmptyUsage(outcome.row)) {
        emptyRow = outcome.row;
        continue;
      }
      return outcome.row;
    }
    if (emptyRow) return emptyRow;

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

    const columns = await loadTableColumns(QUOTA_TABLE);
    const result = await adaptiveWrite({
      columns,
      missing: missingQuotaColumns,
      nullAs: quotaNullFallbacks,
      build: () => quotaPayload(usageDate, count, alertSent),
      execute: (payload) => {
        if (!hasQuotaIdentity(payload)) {
          return Promise.resolve({ error: new Error("Neither a day column nor a counter column can be written") });
        }
        return client.from(QUOTA_TABLE).upsert(payload);
      },
    });

    if (result.ok) return true;
    console.error("[Quota] Could not persist daily usage. Using the in-memory counter.", result.error);
    return false;
  } catch (error) {
    console.error("[Quota] Could not persist daily usage. Using the in-memory counter.", error);
    return false;
  }
}

async function loadCatalog(): Promise<Map<string, ReadonlySet<string>> | null> {
  if (catalog) return catalog;
  if (catalogFailedAt > 0 && Date.now() - catalogFailedAt < CATALOG_RETRY_MS) return null;
  if (!catalogInflight) {
    catalogInflight = fetchCatalog()
      .then((tables) => {
        if (tables && tables.size > 0) catalog = tables;
        else catalogFailedAt = Date.now();
        return tables;
      })
      .finally(() => {
        catalogInflight = null;
      });
  }
  return catalogInflight;
}

async function fetchCatalog(): Promise<Map<string, ReadonlySet<string>> | null> {
  try {
    const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || "");
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
    if (!url || !key) return null;

    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: "application/openapi+json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(2_500),
    });
    if (!response.ok) return null;
    const spec: unknown = await response.json();
    return parseOpenApiTables(spec);
  } catch {
    return null;
  }
}

type UsageRead = { kind: "row"; row: Tier2UsageRow } | { kind: "missing" } | { kind: "failed"; error: unknown };

async function readUsageRow(client: SupabaseClient, column: DateColumn, usageDate: string): Promise<UsageRead> {
  try {
    const { data, error } = await client.from(QUOTA_TABLE).select("*").eq(column, usageDate).maybeSingle();
    if (error) {
      if (isMissingQuotaColumn(error, column)) {
        missingQuotaColumns.add(column);
        return { kind: "missing" };
      }
      return { kind: "failed", error };
    }
    return { kind: "row", row: normalizeUsage(data) };
  } catch (error) {
    if (isMissingQuotaColumn(error, column)) {
      missingQuotaColumns.add(column);
      return { kind: "missing" };
    }
    return { kind: "failed", error };
  }
}

function isEmptyUsage(row: Tier2UsageRow): boolean {
  return row.request_count == null && row.count == null && row.usage_date == null && row.date == null;
}

function quotaPayload(usageDate: string, count: number, alertSent: boolean): Record<string, unknown> {
  const payload: Record<string, unknown> = { alert_sent: alertSent };
  for (const column of DATE_COLUMNS) payload[column] = usageDate;
  for (const column of COUNT_COLUMNS) payload[column] = count;
  return payload;
}

function hasQuotaIdentity(payload: Record<string, unknown>): boolean {
  const hasDay = DATE_COLUMNS.some((column) => owns(payload, column));
  const hasCount = COUNT_COLUMNS.some((column) => owns(payload, column));
  return hasDay && hasCount;
}

function dateColumns(columns: ReadonlySet<string> | null): DateColumn[] {
  const available = DATE_COLUMNS.filter((column) => !missingQuotaColumns.has(column));
  if (!columns) return [...available];
  const known = available.filter((column) => columns.has(column));
  return known.length > 0 ? known : [...available];
}

function isMissingQuotaColumn(error: unknown, column: string): boolean {
  const missing = missingSchemaColumn(error);
  if (missing === column) return true;
  if (missing != null) return false;
  const code = readErrorCode(error);
  return code === "42703" || code === "PGRST204";
}

function readErrorCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("code" in error)) return null;
  const code: unknown = Reflect.get(error, "code");
  return typeof code === "string" ? code : null;
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
