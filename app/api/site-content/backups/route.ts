import { NextResponse, type NextRequest } from "next/server";

import { resolveCmsRole } from "@/lib/cms-role";
import { hasValidAdminSessionFromRequest, isAllowedAdminDevice } from "@/lib/gallery-admin-auth";
import { listBackups, readBackupFile } from "@/lib/site-content-storage";
import { siteSettingsGateAuthorized, siteSettingsGateForbiddenResponse } from "@/lib/site-settings-gate";

export async function GET(req: NextRequest) {
  if (!isAllowedAdminDevice(req.headers, req.cookies) || !hasValidAdminSessionFromRequest(req)) {
    return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 401 });
  }
  if (!siteSettingsGateAuthorized(req)) {
    return siteSettingsGateForbiddenResponse();
  }
  const role = resolveCmsRole(req);
  const download = req.nextUrl.searchParams.get("download");
  if (download) {
    const raw = await readBackupFile(download);
    if (!raw) return NextResponse.json({ error: "Backup tidak ditemukan." }, { status: 404 });
    return new NextResponse(raw, {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="${download}"`,
      },
    });
  }
  const backups = await listBackups();
  return NextResponse.json({ backups, role });
}
