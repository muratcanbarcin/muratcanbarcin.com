/**
 * Live Supabase projects do not share one column layout.
 * `tier2_daily_usage` may use `usage_date` or `date`, `request_count` or `count`,
 * and may omit `alert_sent`. `system_logs` may store the stack as `error_stack`,
 * `stack_trace`, or neither. Writers project each payload onto the columns that
 * actually exist and retry quietly when the schema cache disagrees.
 */

const MISSING_COLUMN_PATTERN =
  /could not find the '([^']+)' column|could not find the "([^"]+)" column|column "([^"]+)"(?: of relation "[^"]+")? does not exist|column '([^']+)'(?: of relation '[^']+')? does not exist/i;

const NULL_COLUMN_PATTERN = /null value in column ["']([^"']+)["']/i;

const SCHEMA_ATTEMPTS = 6;

export interface AdaptiveWriteOptions {
  /** Columns advertised by the API catalog. Null when the catalog could not be loaded. */
  columns: ReadonlySet<string> | null;
  /** Columns already rejected. Mutated when a new rejection is observed. */
  missing: Set<string>;
  /** Columns that reject NULL. Mutated when a new NOT NULL violation is observed. */
  nullAs: Set<string>;
  build: (nullAs: ReadonlySet<string>) => Record<string, unknown>;
  execute: (payload: Record<string, unknown>) => PromiseLike<{ error: unknown }>;
}

export type AdaptiveWriteResult = { ok: true } | { ok: false; error: unknown };

/** Column named as missing. Hint text is ignored: Postgres names the column you should have used, not the one that failed. */
export function missingSchemaColumn(error: unknown): string | null {
  const parts = schemaParts(error);
  return matchColumn(parts.message) ?? matchColumn(parts.details);
}

/** Column named by a Postgres NOT NULL violation. */
export function nullConstraintColumn(error: unknown): string | null {
  const parts = schemaParts(error);
  const source = `${parts.message} ${parts.details}`;
  const match = NULL_COLUMN_PATTERN.exec(source);
  return match?.[1] ?? null;
}

/**
 * Reads table property names from a PostgREST OpenAPI document.
 * Supports the Swagger 2 `definitions` shape and the OpenAPI 3 `components.schemas` shape.
 */
export function parseOpenApiTables(spec: unknown): Map<string, ReadonlySet<string>> | null {
  if (!isRecord(spec)) return null;
  const tables = new Map<string, ReadonlySet<string>>();
  collectTables(spec.definitions, tables);
  if (isRecord(spec.components)) collectTables(spec.components.schemas, tables);
  return tables.size > 0 ? tables : null;
}

export function projectPayload(
  payload: Record<string, unknown>,
  columns: ReadonlySet<string> | null,
  missing: ReadonlySet<string>,
): Record<string, unknown> {
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (missing.has(key)) continue;
    if (columns && !columns.has(key)) continue;
    next[key] = value;
  }
  return next;
}

/**
 * Inserts or upserts, dropping unknown columns and replacing NULL on NOT NULL columns.
 * A recovered mismatch is not logged; the caller logs only a final failure.
 */
export async function adaptiveWrite(options: AdaptiveWriteOptions): Promise<AdaptiveWriteResult> {
  let sawError: unknown = null;

  for (let attempt = 0; attempt < SCHEMA_ATTEMPTS; attempt += 1) {
    const payload = projectPayload(options.build(options.nullAs), options.columns, options.missing);
    if (Object.keys(payload).length === 0) {
      return { ok: false, error: sawError ?? new Error("No writable columns remain") };
    }

    const error = await captureWriteError(options.execute(payload));
    if (!error) return { ok: true };
    sawError = error;

    const missingColumn = missingSchemaColumn(error);
    if (missingColumn && owns(payload, missingColumn) && !options.missing.has(missingColumn)) {
      options.missing.add(missingColumn);
      continue;
    }

    const nullColumn = nullConstraintColumn(error);
    if (nullColumn && owns(payload, nullColumn) && payload[nullColumn] == null && !options.nullAs.has(nullColumn)) {
      options.nullAs.add(nullColumn);
      continue;
    }

    return { ok: false, error };
  }

  return { ok: false, error: sawError ?? new Error("Schema adaptation did not converge") };
}

export async function captureWriteError(write: PromiseLike<{ error: unknown }>): Promise<unknown> {
  try {
    const { error } = await write;
    return error;
  } catch (error) {
    return error;
  }
}

function matchColumn(source: string): string | null {
  if (!source) return null;
  const match = MISSING_COLUMN_PATTERN.exec(source);
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? match?.[4] ?? null;
}

function collectTables(node: unknown, tables: Map<string, ReadonlySet<string>>): void {
  if (!isRecord(node)) return;
  for (const [name, schema] of Object.entries(node)) {
    if (!isRecord(schema) || !isRecord(schema.properties)) continue;
    const columns = Object.keys(schema.properties).filter((column) => column.length > 0);
    if (columns.length === 0) continue;
    const known = new Set(columns);
    tables.set(name, known);
    const short = name.split(".").at(-1);
    if (short && short !== name && !tables.has(short)) tables.set(short, known);
  }
}

function schemaParts(error: unknown): { message: string; details: string } {
  if (typeof error === "string") return { message: error, details: "" };
  if (typeof error !== "object" || error === null) return { message: "", details: "" };
  return { message: readField(error, "message"), details: readField(error, "details") };
}

function readField(value: object, key: string): string {
  if (!(key in value)) return "";
  const raw: unknown = Reflect.get(value, key);
  return typeof raw === "string" ? raw : "";
}

function owns(payload: Record<string, unknown>, column: string): boolean {
  return Object.prototype.hasOwnProperty.call(payload, column);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
