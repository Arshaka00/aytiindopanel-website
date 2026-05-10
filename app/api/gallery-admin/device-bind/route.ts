import { timingSafeEqual } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import {
  createDeviceBindingToken,
  getDeviceBindingTtlSec,
  getDeviceCookieName,
  getGalleryAdminBindSecret,
} from "@/lib/gallery-admin-auth";

function getEnv(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export async function POST(req: NextRequest) {
  const bindSecretConfigured = getGalleryAdminBindSecret();
  if (!bindSecretConfigured) {
    return NextResponse.json({ error: "Bind device belum dikonfigurasi di server." }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as {
    serial?: unknown;
    bindSecret?: unknown;
  } | null;

  const bindSecret = typeof body?.bindSecret === "string" ? body.bindSecret : "";
  if (!safeEqual(bindSecret, bindSecretConfigured)) {
    return NextResponse.json({ error: "Token bind tidak valid." }, { status: 403 });
  }

  const requiredSerial = getEnv("GALLERY_ADMIN_DEVICE_SERIAL");
  if (requiredSerial) {
    const serial = typeof body?.serial === "string" ? body.serial.trim() : "";
    if (!serial || !safeEqual(serial, requiredSerial)) {
      return NextResponse.json({ error: "Serial perangkat tidak cocok." }, { status: 403 });
    }
  }

  const token = createDeviceBindingToken();
  if (!token) {
    return NextResponse.json({ error: "Secret cookie device belum disetel." }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(getDeviceCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getDeviceBindingTtlSec(),
  });
  return res;
}
