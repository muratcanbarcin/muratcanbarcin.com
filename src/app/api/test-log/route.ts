import { connection, NextResponse } from "next/server";
import { canWriteDiagnostics } from "@/lib/diagnosticAccess";
import { isCrossSiteBrowserRequest } from "@/lib/requestGuard";
import { getSupabaseAdmin } from "@/lib/supabase";

const NO_STORE = { "Cache-Control": "no-store" } as const;

/**
 * Production is a read-only liveness check: no insert and no environment detail.
 * Local `next dev` can still write one `system_logs` row. Every other deployment
 * needs `DIAGNOSTIC_SECRET` in the `x-diagnostic-token` header.
 * `connection()` keeps the handler on a real request under Cache Components.
 */
export async function GET(request: Request) {
  await connection();

  if (!canWriteDiagnostics(request) || isCrossSiteBrowserRequest(request)) {
    return NextResponse.json({ ok: true, mode: "health" }, { headers: NO_STORE });
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json(
      { success: false, error: "Supabase client is null. Check environment variables." },
      { status: 500, headers: NO_STORE },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("system_logs")
    .insert({
      level: "info",
      route: "/api/test-log",
      message: "Diagnostic test write from verification route",
      metadata: { test: true, timestamp: new Date().toISOString() },
    })
    .select();

  if (error) {
    return NextResponse.json({ success: false, supabase_error: error }, { status: 500, headers: NO_STORE });
  }

  return NextResponse.json({ success: true, message: "Log inserted successfully", row: data }, { headers: NO_STORE });
}
