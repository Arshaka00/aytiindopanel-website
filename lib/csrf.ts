import { randomBytes, timingSafeEqual } from "node:crypto";

import type { NextRequest } from "next/server";

const CSRF_COOKIE_NAME = "cms_csrf_token";
const CSRF_HEADER_NAME = "x-cms-csrf-token";

export function getCsrfCookieName(): string {
  return CSRF_COOKIE_NAME;
}

export function createCsrfToken(): string {
  return randomBytes(24).toString("hex");
}

function safeEqual(a: string, b: string): boolean {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  if (aa.length !== bb.length) return false;
  return timingSafeEqual(aa, bb);
}

export function hasValidCsrf(req: NextRequest): boolean {
  const cookieToken = req.cookies.get(CSRF_COOKIE_NAME)?.value ?? "";
  const headerToken = req.headers.get(CSRF_HEADER_NAME) ?? "";
  if (!cookieToken || !headerToken) return false;
  return safeEqual(cookieToken, headerToken);
}
