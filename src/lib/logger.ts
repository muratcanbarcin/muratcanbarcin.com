import type { SupabaseClient } from "@supabase/supabase-js";
import { runAfterResponse } from "@/lib/background";
import { getSupabaseAdmin, loadTableColumns } from "@/lib/supabase";
import { adaptiveWrite } from "@/lib/supabaseSchema";

export type LogLevel = "error" | "warn" | "info";

export interface LogContext {
  route?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorLogContext extends LogContext {
  error?: unknown;
}

const MESSAGE_LIMIT = 2_000;
const STACK_LIMIT = 8_000;

/** Columns the live `system_logs` table does not have. Remembered so later requests skip the bad write. */
const missingLogColumns = new Set<string>();
/** Stack columns that reject NULL. Later writes send an empty string instead. */
const emptyStackColumns = new Set<string>();

interface SystemLogRow {
  level: LogLevel;
  message: string;
  route: string | null;
  stack_trace: string | null;
  error_stack: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/** Schedules an error row. The HTTP response is not held for the database write. */
export function logError(message: string, context?: ErrorLogContext): void {
  dispatch("error", message, context);
}

export function logWarn(message: string, context?: LogContext): void {
  dispatch("warn", message, context);
}

export function logInfo(message: string, context?: LogContext): void {
  dispatch("info", message, context);
}

/**
 * Await this from `onRequestError` only. Next.js drops work that is still pending when that hook returns.
 * Route handlers should use the fire-and-forget helpers above.
 * The returned promise never rejects.
 */
export function persistSystemLog(level: LogLevel, message: string, context?: ErrorLogContext): Promise<void> {
  return writeSystemLog(level, message, context).catch((error: unknown) => {
    console.error("[Logger] system_logs insert failed", error);
  });
}

function dispatch(level: LogLevel, message: string, context?: ErrorLogContext): void {
  const task = writeSystemLog(level, message, context).catch((error: unknown) => {
    console.error("[Logger] system_logs insert failed", error);
  });
  runAfterResponse(task);
}

async function writeSystemLog(level: LogLevel, message: string, context?: ErrorLogContext): Promise<void> {
  try {
    const row = toRow(level, message, context);
    mirrorToConsole(level, row.message);

    const client = getSupabaseAdmin();
    if (!client) {
      console.error("[Logger] Supabase client is unreachable. Entry kept in the server log only.", row.message);
      return;
    }

    await insertSystemLog(client, row);
  } catch (error) {
    console.error("[Logger] system_logs insert failed", error);
  }
}

/**
 * Sends both `stack_trace` and `error_stack`. Columns the live table does not have are dropped
 * before the insert when the catalog is known, and dropped after a schema error when it is not.
 * A NOT NULL stack or metadata column that received null is retried with an empty fallback.
 * Recovered mismatches are not logged. The returned promise never rejects.
 */
async function insertSystemLog(client: SupabaseClient, row: SystemLogRow): Promise<void> {
  try {
    const columns = await loadTableColumns("system_logs");
    const result = await adaptiveWrite({
      columns,
      missing: missingLogColumns,
      nullAs: emptyStackColumns,
      build: (nullAs) => logPayload(row, nullAs),
      execute: (payload) => client.from("system_logs").insert(payload),
    });
    if (!result.ok) console.error("[Logger] system_logs insert failed", result.error);
  } catch (error) {
    console.error("[Logger] system_logs insert failed", error);
  }
}

function logPayload(row: SystemLogRow, nullAs: ReadonlySet<string>): Record<string, unknown> {
  return {
    level: row.level,
    message: row.message,
    route: row.route == null && nullAs.has("route") ? "" : row.route,
    metadata: row.metadata == null && nullAs.has("metadata") ? {} : row.metadata,
    created_at: row.created_at,
    stack_trace: row.stack_trace == null && nullAs.has("stack_trace") ? "" : row.stack_trace,
    error_stack: row.error_stack == null && nullAs.has("error_stack") ? "" : row.error_stack,
  };
}

function toRow(level: LogLevel, message: string, context?: ErrorLogContext): SystemLogRow {
  const metadata = sanitizeMetadata(context);
  const stack = errorStack(context?.error);
  const text = typeof message === "string" ? message : safeString(message);
  return {
    level,
    message: text.slice(0, MESSAGE_LIMIT),
    route: context?.route ?? null,
    stack_trace: stack,
    error_stack: stack,
    metadata,
    created_at: new Date().toISOString(),
  };
}

function sanitizeMetadata(context?: ErrorLogContext): Record<string, unknown> | null {
  const metadata: Record<string, unknown> = {};
  if (context?.metadata) Object.assign(metadata, jsonSafe(context.metadata));

  const described = describeError(context?.error);
  if (described) {
    metadata.errorName = described.name;
    metadata.errorMessage = described.message;
  }

  return Object.keys(metadata).length > 0 ? metadata : null;
}

function jsonSafe(value: Record<string, unknown>): Record<string, unknown> {
  try {
    const json = JSON.stringify(value, (_key, item: unknown) => {
      if (typeof item === "bigint") return item.toString();
      if (typeof item === "function" || typeof item === "symbol") return undefined;
      if (item instanceof Error) return { name: item.name, message: item.message };
      return item;
    });
    if (!json) return {};
    const parsed: unknown = JSON.parse(json);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return { note: "metadata could not be serialized" };
  }
}

function describeError(error: unknown): { name: string; message: string } | null {
  if (error == null) return null;
  if (error instanceof Error) return { name: error.name, message: error.message };
  return { name: "UnknownError", message: safeString(error) };
}

function errorStack(error: unknown): string | null {
  if (!(error instanceof Error) || typeof error.stack !== "string") return null;
  return error.stack.slice(0, STACK_LIMIT);
}

function safeString(value: unknown): string {
  try {
    return typeof value === "string" ? value : JSON.stringify(value);
  } catch {
    return Object.prototype.toString.call(value);
  }
}

function mirrorToConsole(level: LogLevel, message: string): void {
  const line = `[system_logs:${level}] ${message}`;
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
