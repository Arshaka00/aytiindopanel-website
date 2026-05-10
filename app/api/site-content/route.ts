import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";

import { rateLimitRequest } from "@/lib/api-rate-limit";
import { canEditContent, resolveCmsRole } from "@/lib/cms-role";
import { hasValidCsrf } from "@/lib/csrf";
import { applySiteContentPatch, getDraftSiteContent, getSiteContent } from "@/lib/site-content";
import { hasValidAdminSessionFromRequest, isAllowedAdminDevice, hasValidDeviceBindingCookie } from "@/lib/gallery-admin-auth";
import { appendAuditLog } from "@/lib/site-content-storage";
import { siteSettingsGateAuthorized, siteSettingsGateForbiddenResponse } from "@/lib/site-settings-gate";

function getClientMeta(req: NextRequest) {
  return {
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
    userAgent: req.headers.get("user-agent") ?? "unknown",
    deviceBound: hasValidDeviceBindingCookie(req.cookies),
  };
}

/** Patch `siteSettings` lain memerlukan sandi Pengaturan Situs; logo header boleh di-patch admin tanpa gate. */
function siteSettingsPatchRequiresGate(siteSettingsPatch: unknown): boolean {
  if (!siteSettingsPatch || typeof siteSettingsPatch !== "object") return true;
  const ss = siteSettingsPatch as Record<string, unknown>;
  for (const key of Object.keys(ss)) {
    if (key !== "brandAssets") return true;
  }
  const ba = ss.brandAssets;
  if (!ba || typeof ba !== "object") return true;
  for (const bk of Object.keys(ba as Record<string, unknown>)) {
    if (bk !== "logoLight" && bk !== "logoDark") return true;
  }
  return false;
}

export async function GET(req: NextRequest) {
  const role = resolveCmsRole(req);
  const mode = req.nextUrl.searchParams.get("mode") === "live" ? "live" : "draft";
  const siteSettingsContext = req.nextUrl.searchParams.get("siteSettingsContext") === "1";
  if (siteSettingsContext && !siteSettingsGateAuthorized(req)) {
    return siteSettingsGateForbiddenResponse();
  }
  const content = mode === "live" ? await getSiteContent() : await getDraftSiteContent();
  return NextResponse.json({ content, mode, role });
}

export async function PATCH(req: NextRequest) {
  if (!isAllowedAdminDevice(req.headers, req.cookies) || !hasValidAdminSessionFromRequest(req)) {
    return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 401 });
  }
  const role = resolveCmsRole(req);
  if (!canEditContent(role)) {
    return NextResponse.json({ error: "Role tidak memiliki izin edit." }, { status: 403 });
  }
  if (!hasValidCsrf(req)) {
    return NextResponse.json({ error: "CSRF token tidak valid." }, { status: 403 });
  }
  if (!rateLimitRequest(req, "site-content-patch", 80, 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak penyimpanan. Tunggu sebentar." }, { status: 429 });
  }
  const body = (await req.json().catch(() => null)) as { patch?: unknown } | null;
  if (!body || typeof body.patch === "undefined") {
    return NextResponse.json({ error: "Field patch wajib ada." }, { status: 400 });
  }
  const patchObj = body.patch as Record<string, unknown>;
  if (
    patchObj &&
    typeof patchObj === "object" &&
    Object.prototype.hasOwnProperty.call(patchObj, "siteSettings") &&
    siteSettingsPatchRequiresGate(patchObj.siteSettings) &&
    !siteSettingsGateAuthorized(req)
  ) {
    return siteSettingsGateForbiddenResponse();
  }
  try {
    const next = await applySiteContentPatch(body.patch);
    if (!next) return NextResponse.json({ error: "Patch tidak valid." }, { status: 400 });
    const meta = getClientMeta(req);
    await appendAuditLog({
      id: randomUUID(),
      at: new Date().toISOString(),
      action: "draft_patch_saved",
      actorRole: role,
      actorId: role,
      ...meta,
      detail: {
        keys: Object.keys((body.patch as Record<string, unknown>) ?? {}).slice(0, 20),
      },
    });
    return NextResponse.json({ ok: true, content: next, mode: "draft", role });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal menyimpan draft.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
