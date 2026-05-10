import { createHmac, timingSafeEqual } from "node:crypto";

const PREVIEW_COOKIE = "cms_preview_token";
const PREVIEW_TTL_SEC = 60 * 60 * 12;

function getSecret(): string {
  return (
    process.env.CMS_PREVIEW_SECRET?.trim() ||
    process.env.GALLERY_ADMIN_SESSION_SECRET?.trim() ||
    ""
  );
}

function b64Encode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function b64Decode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string): string {
  const secret = getSecret();
  return createHmac("sha256", `${secret}:preview`).update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  if (aa.length !== bb.length) return false;
  return timingSafeEqual(aa, bb);
}

export function getPreviewCookieName(): string {
  return PREVIEW_COOKIE;
}

export function getPreviewTtlSec(): number {
  return PREVIEW_TTL_SEC;
}

export function createPreviewToken(): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const payload = JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + PREVIEW_TTL_SEC,
    v: 1,
  });
  const enc = b64Encode(payload);
  return `${enc}.${sign(enc)}`;
}

export function verifyPreviewToken(token: string): boolean {
  if (!token || !getSecret()) return false;
  const [enc, sig] = token.split(".");
  if (!enc || !sig) return false;
  const expected = sign(enc);
  if (!safeEqual(sig, expected)) return false;
  try {
    const payload = JSON.parse(b64Decode(enc)) as { exp?: number; v?: number };
    if (payload.v !== 1 || typeof payload.exp !== "number") return false;
    return payload.exp >= Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
