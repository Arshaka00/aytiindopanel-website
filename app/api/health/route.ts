import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

import { getSiteContentVersionToken } from "@/lib/site-content";

export async function GET() {
  const storagePath = path.join(process.cwd(), "data", "site-content");
  const storageStatus = await fs
    .access(storagePath)
    .then(() => "ok")
    .catch(() => "degraded");
  const cmsStatus = process.env.GALLERY_ADMIN_PASSWORD ? "ok" : "degraded";
  const payload = {
    status: storageStatus === "ok" ? "ok" : "degraded",
    app: "ok",
    cms: cmsStatus,
    storage: storageStatus,
    version: await getSiteContentVersionToken(),
    now: new Date().toISOString(),
  };
  return NextResponse.json(payload);
}
