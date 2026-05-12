import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import { rateLimitRequest } from "@/lib/api-rate-limit";
import { canPublish, resolveCmsRole } from "@/lib/cms-role";
import { hasValidCsrf } from "@/lib/csrf";
import { hasValidAdminSessionFromRequest, isAllowedAdminDevice } from "@/lib/gallery-admin-auth";
import { publishSiteContentDraft } from "@/lib/site-content";
import { siteSettingsGateAuthorized, siteSettingsGateForbiddenResponse } from "@/lib/site-settings-gate";
import { appendAuditLog } from "@/lib/site-content-storage";

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
  if (!rateLimitRequest(req, "site-content-publish", 20, 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak publish. Tunggu sebentar." }, { status: 429 });
  }
  if (!siteSettingsGateAuthorized(req)) {
    return siteSettingsGateForbiddenResponse();
  }
  try {
    const live = await publishSiteContentDraft();
    await appendAuditLog({
      id: randomUUID(),
      at: new Date().toISOString(),
      action: "draft_published",
      actorRole: role,
      actorId: role,
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
      userAgent: req.headers.get("user-agent") ?? "unknown",
      deviceBound: true,
    });
    return NextResponse.json(
      { ok: true, content: live, mode: "live" },
      { headers: { "cache-control": "private, no-store, max-age=0, must-revalidate" } },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal publish draft." },
      { status: 400, headers: { "cache-control": "private, no-store, max-age=0, must-revalidate" } },
    );
  }
}
