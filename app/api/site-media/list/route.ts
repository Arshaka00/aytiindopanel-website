import { promises as fs } from "node:fs";
import path from "node:path";

import { NextResponse, type NextRequest } from "next/server";

import { rateLimitRequest } from "@/lib/api-rate-limit";
import { hasValidAdminSessionFromRequest, isAllowedAdminDevice } from "@/lib/gallery-admin-auth";
import {
  MEDIA_LIBRARY_SCOPES,
  MEDIA_SCOPE_TO_DIR,
  type MediaLibraryScope,
  PUBLIC_MEDIA_BASE,
} from "@/lib/site-media-constants";

const IMAGE_EXT = /\.(webp|jpg|jpeg|png|gif|svg)$/i;
const VIDEO_EXT = /\.(mp4|webm)$/i;

export async function GET(req: NextRequest) {
  if (!isAllowedAdminDevice(req.headers, req.cookies) || !hasValidAdminSessionFromRequest(req)) {
    return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 401 });
  }
  if (!rateLimitRequest(req, "media-list", 60, 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan." }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const scopeParam = searchParams.get("scope") as MediaLibraryScope | null;
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();

  const scopes: MediaLibraryScope[] =
    scopeParam && MEDIA_SCOPE_TO_DIR[scopeParam]
      ? [scopeParam]
      : [...MEDIA_LIBRARY_SCOPES];

  const items: Array<{
    scope: MediaLibraryScope;
    url: string;
    thumbUrl?: string;
    kind: "image" | "video";
    name: string;
  }> = [];

  for (const sc of scopes) {
    const dirName = MEDIA_SCOPE_TO_DIR[sc];
    const absDir = path.join(process.cwd(), "public", "media", dirName);
    let names: string[] = [];
    try {
      names = await fs.readdir(absDir);
    } catch {
      continue;
    }
    for (const name of names) {
      if (name.startsWith(".") || name.startsWith("thumb-")) continue;
      const lower = name.toLowerCase();
      const isVid = VIDEO_EXT.test(lower);
      const isImg = IMAGE_EXT.test(lower);
      if (!isVid && !isImg) continue;
      if (q && !name.toLowerCase().includes(q)) continue;
      const base = `${PUBLIC_MEDIA_BASE}/${dirName}/${encodeURIComponent(name)}`;
      let thumbUrl: string | undefined;
      if (isImg && lower.endsWith(".webp")) {
        const stem = path.parse(name).name;
        const thumbName = `thumb-${stem}.webp`;
        const thumbAbs = path.join(absDir, thumbName);
        try {
          await fs.access(thumbAbs);
          thumbUrl = `${PUBLIC_MEDIA_BASE}/${dirName}/${encodeURIComponent(thumbName)}`;
        } catch {
          thumbUrl = undefined;
        }
      }
      items.push({
        scope: sc,
        url: base,
        thumbUrl,
        kind: isVid ? "video" : "image",
        name,
      });
    }
  }

  items.sort((a, b) => b.name.localeCompare(a.name));

  return NextResponse.json({ ok: true, items });
}
