import { NextResponse, type NextRequest } from "next/server";

import { hasValidCsrf } from "@/lib/csrf";
import { applySiteContentPatch } from "@/lib/site-content";
import { normalizeSiteContent } from "@/lib/site-content-normalize";
import type { SiteContent } from "@/lib/site-content-model";
import { hasValidAdminSessionFromRequest, isAllowedAdminDevice } from "@/lib/gallery-admin-auth";
import { siteSettingsGateAuthorized, siteSettingsGateForbiddenResponse } from "@/lib/site-settings-gate";

/**
 * Impor `siteSettings` dari JSON (merge ke draft + live melalui applySiteContentPatch).
 * Body: `{ siteSettings: Partial<SiteSettings> }` atau `{ siteSettings: ... }` dari export.
 */
export async function POST(req: NextRequest) {
  if (!isAllowedAdminDevice(req.headers, req.cookies) || !hasValidAdminSessionFromRequest(req)) {
    return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 401 });
  }
  if (!hasValidCsrf(req)) {
    return NextResponse.json({ error: "CSRF token tidak valid." }, { status: 403 });
  }
  if (!siteSettingsGateAuthorized(req)) return siteSettingsGateForbiddenResponse();

  const raw = (await req.json().catch(() => null)) as { siteSettings?: unknown } | null;
  const patchSs = raw?.siteSettings;
  if (!patchSs || typeof patchSs !== "object") {
    return NextResponse.json({ error: "Body harus berisi { siteSettings: { ... } }." }, { status: 400 });
  }

  const next = await applySiteContentPatch({ siteSettings: patchSs });
  if (!next) {
    return NextResponse.json({ error: "Merge gagal atau konten tidak valid." }, { status: 400 });
  }

  let normalized: SiteContent;
  try {
    normalized = normalizeSiteContent(next);
  } catch {
    return NextResponse.json({ error: "Normalisasi gagal." }, { status: 400 });
  }

  return NextResponse.json({ ok: true, siteSettings: normalized.siteSettings });
}
