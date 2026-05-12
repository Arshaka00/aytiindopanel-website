import { createHmac, timingSafeEqual } from "node:crypto";

import type { NextRequest } from "next/server";

import { isGalleryAdminLocalhostRequest } from "@/lib/gallery-admin-localhost";

const ADMIN_COOKIE_NAME = "gp_admin_session";
const DEVICE_COOKIE_NAME = "gp_admin_device_bound";
const ADMIN_SESSION_TTL_SEC = 60 * 30;
const DEVICE_BINDING_TTL_SEC = 60 * 60 * 24 * 365;

export type CookieReader = {
  get(name: string): { value: string } | undefined;
};

function getEnv(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function getSessionSecret(): string {
  return getEnv("GALLERY_ADMIN_SESSION_SECRET");
}

function getAdminPassword(): string {
  return getEnv("GALLERY_ADMIN_PASSWORD");
}

function getDeviceCookieSecret(): string {
  return getEnv("GALLERY_ADMIN_DEVICE_COOKIE_SECRET") || getSessionSecret();
}

function getDeviceBindSecret(): string {
  return getEnv("GALLERY_ADMIN_DEVICE_BIND_SECRET");
}

function signSession(value: string): string {
  const secret = getSessionSecret();
  return createHmac("sha256", secret).update(value).digest("hex");
}

function signDevice(value: string): string {
  const secret = getDeviceCookieSecret();
  if (!secret) return "";
  return createHmac("sha256", `${secret}:device`).update(value).digest("hex");
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

function getUserAgent(headersObj: Headers): string {
  return headersObj.get("user-agent") ?? "";
}

function makeUaHash(headersObj: Headers): string {
  return createHmac("sha256", "ua").update(getUserAgent(headersObj)).digest("hex");
}

export function getDeviceCookieName(): string {
  return DEVICE_COOKIE_NAME;
}

export function getDeviceBindingTtlSec(): number {
  return DEVICE_BINDING_TTL_SEC;
}

export function createDeviceBindingToken(): string | null {
  const secret = getDeviceCookieSecret();
  if (!secret) return null;
  const payload = JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + DEVICE_BINDING_TTL_SEC,
    v: 1,
  });
  const enc = base64UrlEncode(payload);
  const sig = signDevice(enc);
  if (!sig) return null;
  return `${enc}.${sig}`;
}

export function verifyDeviceBindingToken(token: string): boolean {
  if (!token || !getDeviceCookieSecret()) return false;
  const [enc, sig] = token.split(".");
  if (!enc || !sig) return false;
  const expected = signDevice(enc);
  if (!expected || !safeEqual(expected, sig)) return false;
  try {
    const payloadRaw = base64UrlDecode(enc);
    const payload = JSON.parse(payloadRaw) as { exp?: number; v?: number };
    if (payload.v !== 1 || !payload.exp || typeof payload.exp !== "number") return false;
    if (payload.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}

export function hasValidDeviceBindingCookie(cookies: CookieReader): boolean {
  const token = cookies.get(DEVICE_COOKIE_NAME)?.value ?? "";
  return verifyDeviceBindingToken(token);
}

/**
 * Device boleh admin jika:
 * - Env `GALLERY_ADMIN_DEVICE_SERIAL` diset: header `x-device-serial` cocok ATAU cookie binding sah (setelah POST /api/gallery-admin/device-bind).
 * - Serial tidak diset: cookie binding sah ATAU host dev lokal (localhost / LAN privat di development) ATAU user agent macOS desktop (bukan iPhone/Android).
 */
export function isAllowedAdminDevice(headersObj: Headers, cookies?: CookieReader): boolean {
  const requiredSerial = getEnv("GALLERY_ADMIN_DEVICE_SERIAL");

  if (requiredSerial) {
    const incomingSerial = headersObj.get("x-device-serial")?.trim() ?? "";
    if (incomingSerial && safeEqual(incomingSerial, requiredSerial)) return true;
    if (cookies && hasValidDeviceBindingCookie(cookies)) return true;
    return false;
  }

  if (cookies && hasValidDeviceBindingCookie(cookies)) return true;

  if (isGalleryAdminLocalhostRequest(headersObj.get("host"), headersObj.get("x-forwarded-host"))) {
    return true;
  }

  const ua = getUserAgent(headersObj).toLowerCase();
  return ua.includes("macintosh") && !ua.includes("iphone") && !ua.includes("android");
}

export function createAdminSessionToken(headersObj: Headers): string | null {
  if (!getSessionSecret()) return null;
  const payload = JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SEC,
    ua: makeUaHash(headersObj),
  });
  const enc = base64UrlEncode(payload);
  const sig = signSession(enc);
  return `${enc}.${sig}`;
}

export function verifyAdminSessionToken(token: string, headersObj: Headers): boolean {
  if (!token || !getSessionSecret()) return false;
  const [enc, sig] = token.split(".");
  if (!enc || !sig) return false;
  const expected = signSession(enc);
  if (!safeEqual(expected, sig)) return false;

  try {
    const payloadRaw = base64UrlDecode(enc);
    const payload = JSON.parse(payloadRaw) as { exp?: number; ua?: string };
    if (!payload.exp || typeof payload.exp !== "number") return false;
    if (payload.exp < Math.floor(Date.now() / 1000)) return false;
    return payload.ua === makeUaHash(headersObj);
  } catch {
    return false;
  }
}

export function isPasswordValid(password: string): boolean {
  const expected = getAdminPassword();
  if (!expected) return false;
  return safeEqual(password, expected);
}

export function getAdminCookieName(): string {
  return ADMIN_COOKIE_NAME;
}

export function getAdminSessionTtlSec(): number {
  return ADMIN_SESSION_TTL_SEC;
}

export function getGalleryAdminBindSecret(): string {
  return getDeviceBindSecret();
}

export function hasValidAdminSessionFromRequest(req: NextRequest): boolean {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value ?? "";
  return verifyAdminSessionToken(token, req.headers);
}

export function hasValidAdminSession(headers: Headers, cookies: CookieReader): boolean {
  const token = cookies.get(ADMIN_COOKIE_NAME)?.value ?? "";
  return verifyAdminSessionToken(token, headers);
}
