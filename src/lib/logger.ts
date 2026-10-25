import type { SupabaseClient } from "@supabase/supabase-js";
import { runAfterResponse } from "@/lib/background";
import { getSupabaseAdmin, missingSchemaColumn, nullConstraintColumn } from "@/lib/supabase";

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
 * Sends both `stack_trace` and `error_stack`. A column the live schema does not have is removed and the insert is retried.
 * A NOT NULL stack column that received null is retried with an empty string. Failures are logged and never thrown.
 */
async function insertSystemLog(client: SupabaseClient, row: SystemLogRow): Promise<void> {
  let payload = logPayload(row);

  try {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const error = await thrownOrReturned(client.from("system_logs").insert(payload));
      if (!error) return;

      const missing = missingSchemaColumn(error);
      if (missing && owns(payload, missing) && !missingLogColumns.has(missing)) {
        missingLogColumns.add(missing);
        console.error("[Logger] system_logs insert failed", error);
        payload = logPayload(row);
        continue;
      }

      const nullColumn = nullConstraintColumn(error);
      const nullValue = nullColumn ? payload[nullColumn] : undefined;
      if (nullColumn && owns(payload, nullColumn) && (nullValue === null || nullValue === undefined) && !emptyStackColumns.has(nullColumn)) {
        emptyStackColumns.add(nullColumn);
        console.error("[Logger] system_logs insert failed", error);
        payload = logPayload(row);
        continue;
      }

      console.error("[Logger] system_logs insert failed", error);
      return;
    }
  } catch (error) {
    console.error("[Logger] system_logs insert failed", error);
  }
}

/** Supabase reports schema mismatches on `{ error }` or, less often, by rejecting. Both stay inside this function. */
async function thrownOrReturned(write: PromiseLike<{ error: unknown }>): Promise<unknown> {
  try {
    const { error } = await write;
    return error;
  } catch (error) {
    return error;
  }
}

function logPayload(row: SystemLogRow): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    level: row.level,
    message: row.message,
    route: row.route,
    metadata: row.metadata,
  };
  if (!missingLogColumns.has("stack_trace")) payload.stack_trace = coerceStack("stack_trace", row.stack_trace);
  if (!missingLogColumns.has("error_stack")) payload.error_stack = coerceStack("error_stack", row.error_stack);
  return payload;
}

function coerceStack(column: string, value: string | null): string | null {
  if (value === null && emptyStackColumns.has(column)) return "";
  return value;
}

function owns(payload: Record<string, unknown>, column: string): boolean {
  return Object.prototype.hasOwnProperty.call(payload, column);
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
