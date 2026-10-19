import { runAfterResponse } from "@/lib/background";
import { getSupabaseAdmin } from "@/lib/supabase";

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
 */
export function persistSystemLog(level: LogLevel, message: string, context?: ErrorLogContext): Promise<void> {
  return writeSystemLog(level, message, context);
}

function dispatch(level: LogLevel, message: string, context?: ErrorLogContext): void {
  runAfterResponse(writeSystemLog(level, message, context));
}

async function writeSystemLog(level: LogLevel, message: string, context?: ErrorLogContext): Promise<void> {
  const row = toRow(level, message, context);
  mirrorToConsole(level, row.message);

  try {
    const client = getSupabaseAdmin();
    if (!client) {
      console.error("[Logger] Supabase client is unreachable. Entry kept in the server log only.", row.message);
      return;
    }

    const { error } = await client.from("system_logs").insert(row);
    if (error) console.error("[Logger] system_logs insert failed", error.message);
  } catch (error) {
    console.error("[Logger] system_logs insert failed", error);
  }
}

function toRow(level: LogLevel, message: string, context?: ErrorLogContext) {
  const metadata = sanitizeMetadata(context);
  return {
    level,
    message: message.slice(0, MESSAGE_LIMIT),
    route: context?.route ?? null,
    error_stack: errorStack(context?.error),
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
