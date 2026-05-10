import { NextResponse, type NextRequest } from "next/server";

import { canEditContent, resolveCmsRole } from "@/lib/cms-role";
import { hasValidAdminSessionFromRequest, isAllowedAdminDevice } from "@/lib/gallery-admin-auth";
import { createPreviewToken, getPreviewCookieName, getPreviewTtlSec } from "@/lib/preview-token";

export async function POST(req: NextRequest) {
  if (!isAllowedAdminDevice(req.headers, req.cookies) || !hasValidAdminSessionFromRequest(req)) {
    return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 401 });
  }
  const role = resolveCmsRole(req);
  if (!canEditContent(role)) {
    return NextResponse.json({ error: "Role tidak memiliki izin preview." }, { status: 403 });
  }
  const token = createPreviewToken();
  if (!token) return NextResponse.json({ error: "Secret preview belum dikonfigurasi." }, { status: 500 });

  const base = req.nextUrl.origin;
  const previewUrl = `${base}/?preview=${encodeURIComponent(token)}`;
  const res = NextResponse.json({ ok: true, previewUrl, expiresInSec: getPreviewTtlSec() });
  res.cookies.set(getPreviewCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getPreviewTtlSec(),
  });
  return res;
}
