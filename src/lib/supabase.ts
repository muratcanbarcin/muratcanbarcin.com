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
 */

export interface ChatLogInsert {
  sessionId: string;
  userPrompt: string;
  aiResponse: string;
  modelUsed: string;
  locale: string;
  ipHash: string | null;
}

interface Tier2UsageRow {
  request_count: number;
  alert_sent: boolean;
}

let cached: { url: string; key: string; client: SupabaseClient } | null = null;
let missingCredentialsWarned = false;

/** Server-side client. Returns null when credentials are absent so build and local dev keep running. */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
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
  cached = {
    url,
    key,
    client: createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
  };
  return cached.client;
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
  const client = getSupabaseAdmin();
  if (!client) return null;

  const { data, error } = await client
    .from("tier2_daily_usage")
    .select("request_count, alert_sent")
    .eq("usage_date", usageDate)
    .maybeSingle();

  if (error) {
    console.warn("[Quota] Could not read daily usage. Using the in-memory counter.", error.message);
    return null;
  }
  if (!data) return { request_count: 0, alert_sent: false };
  return {
    request_count: typeof data.request_count === "number" ? data.request_count : 0,
    alert_sent: data.alert_sent === true,
  };
}

export async function writeTier2Usage(usageDate: string, count: number, alertSent: boolean): Promise<boolean> {
  const client = getSupabaseAdmin();
  if (!client) return false;

  const { error } = await client.from("tier2_daily_usage").upsert({
    usage_date: usageDate,
    request_count: count,
    alert_sent: alertSent,
  });
  if (error) {
    console.warn("[Quota] Could not persist daily usage. Using the in-memory counter.", error.message);
    return false;
  }
  return true;
}
