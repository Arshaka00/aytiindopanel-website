import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import { rateLimitRequest } from "@/lib/api-rate-limit";
import { canEditContent, resolveCmsRole } from "@/lib/cms-role";
import { hasValidCsrf } from "@/lib/csrf";
import { hasValidAdminSessionFromRequest, isAllowedAdminDevice } from "@/lib/gallery-admin-auth";
import { appendAuditLog, restoreFromBackup } from "@/lib/site-content-storage";
import { siteSettingsGateAuthorized, siteSettingsGateForbiddenResponse } from "@/lib/site-settings-gate";

export async function POST(req: NextRequest) {
  if (!isAllowedAdminDevice(req.headers, req.cookies) || !hasValidAdminSessionFromRequest(req)) {
    return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 401 });
  }
  const role = resolveCmsRole(req);
  if (!canEditContent(role)) return NextResponse.json({ error: "Role tidak memiliki izin restore." }, { status: 403 });
  if (!hasValidCsrf(req)) return NextResponse.json({ error: "CSRF token tidak valid." }, { status: 403 });
  if (!rateLimitRequest(req, "site-content-backup-restore", 20, 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak restore. Tunggu sebentar." }, { status: 429 });
  }
  if (!siteSettingsGateAuthorized(req)) {
    return siteSettingsGateForbiddenResponse();
  }
  const body = (await req.json().catch(() => null)) as { file?: string; mode?: "draft" | "live" } | null;
  if (!body?.file) return NextResponse.json({ error: "Field file wajib diisi." }, { status: 400 });
  const mode = body.mode === "live" ? "live" : "draft";
  try {
    const restored = await restoreFromBackup(mode, body.file);
    await appendAuditLog({
      id: randomUUID(),
      at: new Date().toISOString(),
      action: mode === "live" ? "live_restored" : "draft_restored",
      actorRole: role,
      actorId: role,
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
      userAgent: req.headers.get("user-agent") ?? "unknown",
      deviceBound: true,
      detail: { file: body.file, mode },
    });
    return NextResponse.json({ ok: true, content: restored, mode });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal restore backup." },
      { status: 400 },
    );
  }
}
