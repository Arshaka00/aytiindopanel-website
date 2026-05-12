import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";

import { ZodError } from "zod";

import { rateLimitRequest } from "@/lib/api-rate-limit";
import { canEditContent, resolveCmsRole } from "@/lib/cms-role";
import { hasValidCsrf } from "@/lib/csrf";
import { hasValidAdminSessionFromRequest, hasValidDeviceBindingCookie, isAllowedAdminDevice } from "@/lib/gallery-admin-auth";
import { appendAuditLog } from "@/lib/site-content-storage";
import { parseSeoArticlesPutBody } from "@/lib/seo-articles/schema";
import { readSeoArticlesFile, writeSeoArticlesFile } from "@/lib/seo-articles/storage";

export const dynamic = "force-dynamic";

function noStoreJson(body: unknown) {
  return NextResponse.json(body, {
    headers: { "cache-control": "private, no-store, max-age=0, must-revalidate" },
  });
}

function getClientMeta(req: NextRequest) {
  return {
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
    userAgent: req.headers.get("user-agent") ?? "unknown",
    deviceBound: hasValidDeviceBindingCookie(req.cookies),
  };
}

export async function GET(req: NextRequest) {
  if (!isAllowedAdminDevice(req.headers, req.cookies) || !hasValidAdminSessionFromRequest(req)) {
    return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 401 });
  }
  try {
    const file = await readSeoArticlesFile();
    return noStoreJson(file);
  } catch {
    return NextResponse.json({ error: "Gagal membaca artikel SEO." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAllowedAdminDevice(req.headers, req.cookies) || !hasValidAdminSessionFromRequest(req)) {
    return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 401 });
  }
  const role = resolveCmsRole(req);
  if (!canEditContent(role)) {
    return NextResponse.json({ error: "Role tidak memiliki izin edit." }, { status: 403 });
  }
  if (!hasValidCsrf(req)) {
    return NextResponse.json({ error: "CSRF token tidak valid." }, { status: 403 });
  }
  if (!rateLimitRequest(req, "seo-articles-put", 40, 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak penyimpanan. Tunggu sebentar." }, { status: 429 });
  }
  const raw = (await req.json().catch(() => null)) as unknown;
  try {
    const next = parseSeoArticlesPutBody(raw);
    await writeSeoArticlesFile(next);
    const saved = await readSeoArticlesFile();
    const meta = getClientMeta(req);
    await appendAuditLog({
      id: randomUUID(),
      at: new Date().toISOString(),
      action: "draft_patch_saved",
      actorRole: role,
      actorId: role,
      ...meta,
      detail: { keys: ["seo-articles"], articleCount: saved.articles.length },
    });
    return noStoreJson(saved);
  } catch (error) {
    if (error instanceof ZodError) {
      const first = error.issues[0];
      return NextResponse.json({ error: first?.message ?? "Validasi gagal." }, { status: 400 });
    }
    const msg = error instanceof Error ? error.message : "Gagal menyimpan artikel SEO.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
