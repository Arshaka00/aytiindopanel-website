import { promises as fs } from "node:fs";
import path from "node:path";

import { NextResponse, type NextRequest } from "next/server";

import { rateLimitRequest } from "@/lib/api-rate-limit";
import { hasValidAdminSessionFromRequest, isAllowedAdminDevice } from "@/lib/gallery-admin-auth";
import { publicPathToSafeMediaFile } from "@/lib/site-media-path-validate";

export async function DELETE(req: NextRequest) {
  if (!isAllowedAdminDevice(req.headers, req.cookies) || !hasValidAdminSessionFromRequest(req)) {
    return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 401 });
  }
  if (!rateLimitRequest(req, "media-delete", 30, 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan." }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as { path?: unknown } | null;
  const publicPath = typeof body?.path === "string" ? body.path : "";
  const abs = publicPathToSafeMediaFile(publicPath);
  if (!abs) {
    return NextResponse.json({ error: "Path tidak valid." }, { status: 400 });
  }

  try {
    await fs.unlink(abs);
  } catch {
    return NextResponse.json({ error: "Berkas tidak ditemukan." }, { status: 404 });
  }

  const dir = path.dirname(abs);
  const base = path.parse(abs).name;
  const thumbGuess = path.join(dir, `thumb-${base}.webp`);
  await fs.unlink(thumbGuess).catch(() => {});

  return NextResponse.json({ ok: true });
}
