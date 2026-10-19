import type { Instrumentation } from "next";
import { persistSystemLog } from "@/lib/logger";

/**
 * Next.js 15+ registers this file automatically. The old
 * `experimental.instrumentationHook` flag is not part of the Next.js 16 config.
 */
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const message = error instanceof Error ? error.message : "Unhandled server exception";
  const digest =
    typeof error === "object" && error !== null && "digest" in error && error.digest != null
      ? String(error.digest)
      : undefined;

  await persistSystemLog("error", message, {
    route: request.path,
    error,
    metadata: {
      method: request.method,
      routerKind: context.routerKind,
      routePath: context.routePath,
      routeType: context.routeType,
      renderSource: context.renderSource,
      digest,
    },
  });
};
