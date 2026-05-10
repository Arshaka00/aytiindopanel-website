import { NextResponse, type NextRequest } from "next/server";

import { canEditContent, resolveCmsRole } from "@/lib/cms-role";
import { hasValidCsrf } from "@/lib/csrf";
import { hasValidAdminSessionFromRequest, isAllowedAdminDevice } from "@/lib/gallery-admin-auth";
import { listBackups, restoreFromBackup } from "@/lib/site-content-storage";

export async function POST(req: NextRequest) {
  if (!isAllowedAdminDevice(req.headers, req.cookies) || !hasValidAdminSessionFromRequest(req)) {
    return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 401 });
  }
  const role = resolveCmsRole(req);
  if (!canEditContent(role)) return NextResponse.json({ error: "Role tidak memiliki izin undo." }, { status: 403 });
  if (!hasValidCsrf(req)) return NextResponse.json({ error: "CSRF token tidak valid." }, { status: 403 });

  const backups = await listBackups();
  const target = backups.find((b) => b.file.startsWith("draft-"));
  if (!target) return NextResponse.json({ error: "Backup draft tidak tersedia." }, { status: 404 });
  try {
    const restored = await restoreFromBackup("draft", target.file);
    return NextResponse.json({ ok: true, content: restored, source: target.file });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Undo gagal." },
      { status: 400 },
    );
  }
}
