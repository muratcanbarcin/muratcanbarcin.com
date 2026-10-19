import { connection } from "next/server";
import { logError, logInfo } from "@/lib/logger";

const TEST_ROUTE = "/api/test-log";

/** Probe used to confirm `system_logs` receives both an error and an info row. */
export async function GET() {
  await connection();

  logError("Test error from /api/test-log", {
    route: TEST_ROUTE,
    error: new Error("Intentional telemetry probe"),
    metadata: { probe: true },
  });
  logInfo("Test info from /api/test-log", {
    route: TEST_ROUTE,
    metadata: { probe: true },
  });

  return Response.json(
    { success: true, message: "Logs dispatched to Supabase" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
