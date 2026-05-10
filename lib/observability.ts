import { logEvent } from "@/lib/structured-log";

type ObsContext = Record<string, unknown>;

export async function captureException(error: unknown, context: ObsContext = {}): Promise<void> {
  const message = error instanceof Error ? error.message : String(error);
  logEvent("error", "exception", { message, ...context });
  try {
    const importDynamic = new Function("m", "return import(m)") as (m: string) => Promise<unknown>;
    const sentry = (await importDynamic("@sentry/nextjs").catch(() => null)) as
      | { captureException?: (e: unknown, opts?: unknown) => void }
      | null;
    if (sentry?.captureException) {
      sentry.captureException(error, { extra: context });
    }
  } catch {
    // noop
  }
}
