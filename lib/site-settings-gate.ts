import { createHmac, timingSafeEqual } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const GATE_HEADER = "x-site-settings-gate";
/** Cookie lama — dibersihkan saat verifikasi gate sukses; otorisasi hanya lewat header. */
const LEGACY_COOKIE_NAME = "site_settings_unlock";
const TOKEN_VERSION = 3;
const TTL_SEC = 60 * 60 * 4;

function getEnv(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function getGateSecret(): string {
  return getEnv("SITE_SETTINGS_GATE_SECRET") || getEnv("GALLERY_ADMIN_SESSION_SECRET");
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function signGate(value: string): string {
  const secret = getGateSecret();
  if (!secret) return "";
  return createHmac("sha256", `${secret}:site-settings-gate`).update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

/** Override dengan `SITE_SETTINGS_PASSWORD` di env jika perlu. */
export function getSiteSettingsGatePassword(): string {
  return getEnv("SITE_SETTINGS_PASSWORD") || "DY9NYPV9TH";
}

export function isSiteSettingsGatePasswordValid(password: string): boolean {
  const expected = getSiteSettingsGatePassword();
  if (!expected) return false;
  return safeEqual(password, expected);
}

export function createSiteSettingsGateToken(): string | null {
  if (!getGateSecret()) return null;
  const payload = JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + TTL_SEC,
    v: TOKEN_VERSION,
  });
  const enc = base64UrlEncode(payload);
  const sig = signGate(enc);
  if (!sig) return null;
  return `${enc}.${sig}`;
}

export function verifySiteSettingsGateToken(token: string): boolean {
  if (!token || !getGateSecret()) return false;
  const [enc, sig] = token.split(".");
  if (!enc || !sig) return false;
  const expected = signGate(enc);
  if (!expected || !safeEqual(expected, sig)) return false;
  try {
    const payloadRaw = base64UrlDecode(enc);
    const payload = JSON.parse(payloadRaw) as { exp?: number; v?: number };
    if (payload.v !== TOKEN_VERSION || !payload.exp || typeof payload.exp !== "number") return false;
    if (payload.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}

export function getSiteSettingsGateHeaderName(): string {
  return GATE_HEADER;
}

/** Token gate hanya dikirim lewat header (memori klien); tidak memakai cookie agar refresh selalu meminta sandi lagi. */
export function siteSettingsGateAuthorized(req: NextRequest): boolean {
  const raw = req.headers.get(GATE_HEADER)?.trim() ?? "";
  return Boolean(raw && verifySiteSettingsGateToken(raw));
}

export function clearLegacySiteSettingsGateCookie(res: NextResponse) {
  res.cookies.set(LEGACY_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function siteSettingsGateForbiddenResponse() {
  return NextResponse.json(
    {
      error:
        "Sandi pengaturan situs diperlukan. Buka halaman Pengaturan Situs dan masukkan sandi untuk membuka kunci.",
    },
    { status: 403 },
  );
}
