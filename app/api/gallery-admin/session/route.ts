import { NextResponse, type NextRequest } from "next/server";

import { createCsrfToken, getCsrfCookieName, hasValidCsrf } from "@/lib/csrf";
import {
  getAdminCookieName,
  hasValidAdminSessionFromRequest,
  isAllowedAdminDevice,
} from "@/lib/gallery-admin-auth";

export async function GET(req: NextRequest) {
  const deviceOk = isAllowedAdminDevice(req.headers, req.cookies);
  const sessionOk = deviceOk && hasValidAdminSessionFromRequest(req);
  const res = NextResponse.json({ deviceOk, sessionOk });
  const csrfName = getCsrfCookieName();
  if (!req.cookies.get(csrfName)) {
    res.cookies.set(csrfName, createCsrfToken(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 6,
    });
  }
  return res;
}

/** Menghapus session admin Panel (misalnya sebelum membuka kunci Pengaturan Situs agar sandi admin diminta lagi). */
export async function DELETE(req: NextRequest) {
  if (!isAllowedAdminDevice(req.headers, req.cookies)) {
    return NextResponse.json({ error: "Akses tidak diizinkan." }, { status: 403 });
  }
  if (!hasValidCsrf(req)) {
    return NextResponse.json({ error: "CSRF token tidak valid." }, { status: 403 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(getAdminCookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return res;
}
