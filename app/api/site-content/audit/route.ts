import { NextResponse, type NextRequest } from "next/server";

import { resolveCmsRole } from "@/lib/cms-role";
import { hasValidAdminSessionFromRequest, isAllowedAdminDevice } from "@/lib/gallery-admin-auth";
import { listAuditLog } from "@/lib/site-content-storage";

export async function GET(req: NextRequest) {
  if (!isAllowedAdminDevice(req.headers, req.cookies) || !hasValidAdminSessionFromRequest(req)) {
    return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 401 });
  }
  const role = resolveCmsRole(req);
  const limit = Number(req.nextUrl.searchParams.get("limit") || "100");
  const logs = await listAuditLog(Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 500) : 100);
  return NextResponse.json({ logs, role });
}
