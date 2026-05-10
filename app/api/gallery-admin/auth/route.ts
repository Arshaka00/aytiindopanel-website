import { NextResponse, type NextRequest } from "next/server";

import { rateLimitRequest } from "@/lib/api-rate-limit";
import { createCsrfToken, getCsrfCookieName } from "@/lib/csrf";
import {
  createAdminSessionToken,
  getAdminCookieName,
  getAdminSessionTtlSec,
  isAllowedAdminDevice,
  isPasswordValid,
} from "@/lib/gallery-admin-auth";

export async function POST(req: NextRequest) {
  if (!rateLimitRequest(req, "gallery-admin-auth", 12, 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak percobaan login." }, { status: 429 });
  }
  if (!isAllowedAdminDevice(req.headers, req.cookies)) {
    return NextResponse.json({ error: "Akses admin tidak diizinkan pada device ini." }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";
  if (!isPasswordValid(password)) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }

  const token = createAdminSessionToken(req.headers);
  if (!token) {
    return NextResponse.json({ error: "Konfigurasi admin belum lengkap di server." }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(getAdminCookieName(), token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getAdminSessionTtlSec(),
  });
  res.cookies.set(getCsrfCookieName(), createCsrfToken(), {
    httpOnly: false,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 6,
  });
  return res;
}
