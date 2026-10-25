import { connection, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * Writes one `system_logs` row and returns the Supabase result.
 * `connection()` keeps the insert on a real request: this app uses Cache Components,
 * which removes `export const dynamic` and would otherwise prerender the GET.
 */
export async function GET() {
  await connection();

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json(
      {
        success: false,
        error: "Supabase client is null. Check environment variables.",
        env: {
          has_url: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
          has_service_key: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        },
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
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
    return NextResponse.json(
      { success: false, supabase_error: error },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { success: true, message: "Log inserted successfully", row: data },
    { headers: { "Cache-Control": "no-store" } },
  );
}
