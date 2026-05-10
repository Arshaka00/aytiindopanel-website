import { NextResponse, type NextRequest } from "next/server";

import { rateLimitRequest } from "@/lib/api-rate-limit";
import { hasValidCsrf } from "@/lib/csrf";
import { hasValidAdminSessionFromRequest, isAllowedAdminDevice } from "@/lib/gallery-admin-auth";
import {
  clearLegacySiteSettingsGateCookie,
  createSiteSettingsGateToken,
  isSiteSettingsGatePasswordValid,
} from "@/lib/site-settings-gate";

export async function POST(req: NextRequest) {
  if (!rateLimitRequest(req, "site-settings-gate", 20, 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak percobaan." }, { status: 429 });
  }
  if (!isAllowedAdminDevice(req.headers, req.cookies)) {
    return NextResponse.json(
      { error: "Perangkat ini tidak diizinkan untuk akses admin." },
      { status: 403 },
    );
  }
  if (!hasValidAdminSessionFromRequest(req)) {
    return NextResponse.json(
      {
        error:
          "Session admin Panel belum aktif. Setelah jendela login muncul, masukkan sandi admin Panel (bukan sandi pengaturan situs). Atau buka beranda, aktifkan mode edit, dan login dari sana.",
      },
      { status: 401 },
    );
  }
  if (!hasValidCsrf(req)) {
    return NextResponse.json({ error: "CSRF token tidak valid." }, { status: 403 });
  }
  const body = (await req.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";
  if (!isSiteSettingsGatePasswordValid(password)) {
    return NextResponse.json({ error: "Sandi pengaturan situs salah." }, { status: 401 });
  }
  const token = createSiteSettingsGateToken();
  if (!token) {
    return NextResponse.json({ error: "Konfigurasi server tidak lengkap (rahasia sesi)." }, { status: 500 });
  }
  const res = NextResponse.json({ ok: true, token });
  clearLegacySiteSettingsGateCookie(res);
  return res;
}
