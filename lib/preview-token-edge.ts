const PREVIEW_COOKIE = "cms_preview_token";
const PREVIEW_TTL_SEC = 60 * 60 * 12;

function getSecret(): string {
  return (
    process.env.CMS_PREVIEW_SECRET?.trim() ||
    process.env.GALLERY_ADMIN_SESSION_SECRET?.trim() ||
    ""
  );
}

function b64UrlToBytes(input: string): Uint8Array {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "===".slice((base64.length + 3) % 4);
  const raw = atob(padded);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function decodePayload<T>(enc: string): T | null {
  try {
    const raw = new TextDecoder().decode(b64UrlToBytes(enc));
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function sign(enc: string): Promise<string> {
  const secret = getSecret();
  const keyData = new TextEncoder().encode(`${secret}:preview`);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(enc));
  return bytesToHex(new Uint8Array(sig));
}

export function getPreviewCookieNameEdge(): string {
  return PREVIEW_COOKIE;
}

export function getPreviewTtlSecEdge(): number {
  return PREVIEW_TTL_SEC;
}

export async function verifyPreviewTokenEdge(token: string): Promise<boolean> {
  if (!token || !getSecret()) return false;
  const [enc, sig] = token.split(".");
  if (!enc || !sig) return false;
  const payload = decodePayload<{ exp?: number; v?: number }>(enc);
  if (!payload || payload.v !== 1 || typeof payload.exp !== "number") return false;
  if (payload.exp < Math.floor(Date.now() / 1000)) return false;
  const expected = await sign(enc);
  return safeEqualHex(sig, expected);
}
