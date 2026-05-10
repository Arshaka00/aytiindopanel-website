import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";

import { rateLimitRequest } from "@/lib/api-rate-limit";
import { canEditContent, resolveCmsRole } from "@/lib/cms-role";
import { hasValidCsrf } from "@/lib/csrf";
import { hasValidAdminSessionFromRequest, isAllowedAdminDevice } from "@/lib/gallery-admin-auth";
import { restoreDraftSiteContent, validateSiteContentPayload } from "@/lib/site-content";
import { appendAuditLog } from "@/lib/site-content-storage";

export async function POST(req: NextRequest) {
  if (!isAllowedAdminDevice(req.headers, req.cookies) || !hasValidAdminSessionFromRequest(req)) {
    return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 401 });
  }
  const role = resolveCmsRole(req);
  if (!canEditContent(role)) {
    return NextResponse.json({ error: "Role tidak memiliki izin restore." }, { status: 403 });
  }
  if (!hasValidCsrf(req)) {
    return NextResponse.json({ error: "CSRF token tidak valid." }, { status: 403 });
  }
  if (!rateLimitRequest(req, "site-content-restore", 40, 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Tunggu sebentar." }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as { content?: unknown } | null;
  if (!body || body.content == null || typeof body.content !== "object") {
    return NextResponse.json({ error: "Field content wajib berisi objek konten." }, { status: 400 });
  }

  const validated = validateSiteContentPayload(body.content);
  if (!validated.ok || !validated.content) {
    return NextResponse.json(
      {
        error: "Konten tidak valid.",
        details: validated.errors ?? [],
      },
      { status: 400 },
    );
  }
  await restoreDraftSiteContent(validated.content);
  await appendAuditLog({
    id: randomUUID(),
    at: new Date().toISOString(),
    action: "draft_restored",
    actorRole: role,
    actorId: role,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
    userAgent: req.headers.get("user-agent") ?? "unknown",
    deviceBound: true,
  });
  return NextResponse.json({ ok: true, content: validated.content, mode: "draft" });
}
