"use server";

import type { NextRequest } from "next/server";

const ADMIN_COOKIE_NAME = "gp_admin_session";
const DEVICE_COOKIE_NAME = "gp_admin_device_bound";

function getEnv(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function hasAnyDeviceBindingCookie(req: NextRequest): boolean {
  return Boolean(req.cookies.get(DEVICE_COOKIE_NAME)?.value);
}

export function isAllowedAdminDeviceEdge(req: NextRequest): boolean {
  const requiredSerial = getEnv("GALLERY_ADMIN_DEVICE_SERIAL");

  if (requiredSerial) {
    const incomingSerial = req.headers.get("x-device-serial")?.trim() ?? "";
    if (incomingSerial && safeEqual(incomingSerial, requiredSerial)) return true;
    return hasAnyDeviceBindingCookie(req);
  }

  if (hasAnyDeviceBindingCookie(req)) return true;
  const ua = (req.headers.get("user-agent") ?? "").toLowerCase();
  return ua.includes("macintosh") && !ua.includes("iphone") && !ua.includes("android");
}

export function hasAdminSessionCookieEdge(req: NextRequest): boolean {
  return Boolean(req.cookies.get(ADMIN_COOKIE_NAME)?.value);
}

