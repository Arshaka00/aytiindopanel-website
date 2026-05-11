import { NextResponse, type NextRequest } from "next/server";

import { rateLimitRequest } from "@/lib/api-rate-limit";
import { canPublish, resolveCmsRole } from "@/lib/cms-role";
import { hasValidCsrf } from "@/lib/csrf";
import { executeGlobalPublish } from "@/lib/global-publish-orchestrator";
import { hasValidAdminSessionFromRequest, isAllowedAdminDevice, hasValidDeviceBindingCookie } from "@/lib/gallery-admin-auth";
import { captureException } from "@/lib/observability";
import { siteSettingsGateAuthorized, siteSettingsGateForbiddenResponse } from "@/lib/site-settings-gate";

/** Pastikan `process.env` deploy hook = runtime Vercel, bukan Edge. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isAllowedAdminDevice(req.headers, req.cookies) || !hasValidAdminSessionFromRequest(req)) {
    return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 401 });
  }
  const role = resolveCmsRole(req);
  if (!canPublish(role)) {
    return NextResponse.json({ error: "Role tidak memiliki izin publish." }, { status: 403 });
  }
  if (!hasValidCsrf(req)) {
    return NextResponse.json({ error: "CSRF token tidak valid." }, { status: 403 });
  }
  if (!rateLimitRequest(req, "site-content-global-publish", 8, 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak publish global. Tunggu sebentar." }, { status: 429 });
  }
  if (!siteSettingsGateAuthorized(req)) {
    return siteSettingsGateForbiddenResponse();
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const userAgent = req.headers.get("user-agent") ?? "unknown";
  const deviceBound = hasValidDeviceBindingCookie(req.cookies);

  try {
    const result = await executeGlobalPublish({
      actorRole: role,
      actorId: role,
      ip,
      userAgent,
      deviceBound,
    });

    if (!result.ok) {
      const status =
        result.code === "LOCK_BUSY" ? 409 : result.code === "DEBOUNCED" ? 429 : result.code === "PUBLISH_FAILED" ? 400 : 500;
      return NextResponse.json({ ok: false, code: result.code, error: result.message }, { status });
    }

    /** Jangan kirim `content` penuh — JSON bisa terlalu besar untuk respons serverless (413/500). UI memakai router.refresh + API site-content. */
    return NextResponse.json({
      ok: true,
      mode: "live" as const,
      revalidated: result.revalidated,
      deployHook: result.deployHook,
      deployHookHttpStatus: result.deployHookHttpStatus,
      deployHookMessage: result.deployHookMessage,
      deployHookAttempts: result.deployHookAttempts,
      deployHookSkipKind: result.deployHookSkipKind,
      vercelDeploymentUid: result.vercelDeploymentUid,
      vercelDeploymentReadyState: result.vercelDeploymentReadyState,
      storageVersion: result.storageVersion,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    void captureException(err, { area: "global-publish-route", reason: "executeGlobalPublish" });
    return NextResponse.json({ ok: false, code: "UNKNOWN" as const, error: message }, { status: 500 });
  }
}
