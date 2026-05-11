import { NextResponse, type NextRequest } from "next/server";

import { rateLimitRequest } from "@/lib/api-rate-limit";
import { readGlobalPublishStatus, writeGlobalPublishStatus } from "@/lib/global-publish-status";
import { getVercelDeploymentByUid, resolveVercelApiToken, resolveVercelTeamId } from "@/lib/vercel-deployment-api";
import { hasValidAdminSessionFromRequest, isAllowedAdminDevice } from "@/lib/gallery-admin-auth";
import { logEvent } from "@/lib/structured-log";

/**
 * Polling status build Vercel (server → Vercel API; token tidak pernah dikirim ke browser).
 * Query `uid` opsional — default dari `global-publish-status.json`.
 */
export async function GET(req: NextRequest) {
  if (!isAllowedAdminDevice(req.headers, req.cookies) || !hasValidAdminSessionFromRequest(req)) {
    return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 401 });
  }
  if (!rateLimitRequest(req, "vercel-deployment-status", 45, 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan status." }, { status: 429 });
  }

  const token = resolveVercelApiToken();
  if (!token) {
    return NextResponse.json(
      { ok: true, enabled: false, message: "Set CMS_VERCEL_API_TOKEN atau VERCEL_API_TOKEN untuk monitoring." },
      { headers: { "cache-control": "no-store" } },
    );
  }

  const uidParam = req.nextUrl.searchParams.get("uid")?.trim();
  const st = await readGlobalPublishStatus();
  const uid = uidParam || st.vercelDeploymentUid;
  if (!uid) {
    return NextResponse.json(
      { ok: true, enabled: true, uid: null, readyState: null, message: "Belum ada UID deployment (publish global + hook sukses)." },
      { headers: { "cache-control": "no-store" } },
    );
  }

  const d = await getVercelDeploymentByUid({ token, teamId: resolveVercelTeamId(), uid });
  if (!d.ok) {
    /** UID usang / salah tim → API Vercel 404 `{"error":{"code":"not_found",...}}`; bersihkan KV agar polling berhenti. */
    if (d.httpStatus === 404) {
      await writeGlobalPublishStatus({
        ...st,
        vercelDeploymentUid: null,
        vercelDeploymentReadyState: null,
        vercelDeploymentInspectorUrl: null,
        vercelDeploymentErrorMessage: null,
        vercelDeploymentTrackedAt: null,
      }).catch(() => {});
      return NextResponse.json(
        {
          ok: true,
          enabled: true,
          uid: null,
          readyState: null,
          message:
            "Deployment tidak ditemukan di Vercel (404) — UID tercatat mungkin usang. Status monitoring direset; jalankan Publish Global lagi setelah hook memicu build baru.",
        },
        { headers: { "cache-control": "no-store" } },
      );
    }
    return NextResponse.json(
      { ok: false, enabled: true, uid, httpStatus: d.httpStatus, error: d.error },
      { status: 502, headers: { "cache-control": "no-store" } },
    );
  }

  const terminal = new Set(["READY", "ERROR", "CANCELED", "DELETED"]);
  if (terminal.has(d.readyState)) {
    logEvent("info", "vercel_deployment_poll_terminal", { uid: d.uid, readyState: d.readyState });
  }

  if (
    d.readyState !== st.vercelDeploymentReadyState ||
    d.inspectorUrl !== st.vercelDeploymentInspectorUrl ||
    d.errorMessage !== st.vercelDeploymentErrorMessage
  ) {
    await writeGlobalPublishStatus({
      ...st,
      vercelDeploymentUid: uid,
      vercelDeploymentReadyState: d.readyState,
      vercelDeploymentInspectorUrl: d.inspectorUrl ?? st.vercelDeploymentInspectorUrl,
      vercelDeploymentErrorMessage: d.errorMessage ?? null,
      vercelDeploymentTrackedAt: new Date().toISOString(),
    }).catch(() => {});
  }

  return NextResponse.json(
    {
      ok: true,
      enabled: true,
      uid: d.uid,
      readyState: d.readyState,
      url: d.url,
      inspectorUrl: d.inspectorUrl,
      errorMessage: d.errorMessage,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
