import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import sharp from "sharp";
import { NextResponse, type NextRequest } from "next/server";

import { rateLimitRequest } from "@/lib/api-rate-limit";
import { hasValidAdminSessionFromRequest, isAllowedAdminDevice } from "@/lib/gallery-admin-auth";
import { uploadSiteMediaToPublicBlobIfConfigured } from "@/lib/site-media-blob-upload";
import {
  MEDIA_SCOPE_TO_DIR,
  type MediaLibraryScope,
  PUBLIC_MEDIA_BASE,
} from "@/lib/site-media-constants";

const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_VIDEO_BYTES = 80 * 1024 * 1024;
const IMAGE_WIDTH_VARIANTS = [480, 960, 1600] as const;

/** Kurangi NFT trace seluruh repo ke file upload route (saran Turbopack). */
function joinPublic(...segments: string[]): string {
  return path.join(/* turbopackIgnore: true */ process.cwd(), "public", ...segments);
}

export const runtime = "nodejs";

function sanitizeSegment(s: string): string {
  return s.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80) || "project";
}

function extFromMime(mime: string): string {
  if (mime === "image/jpeg" || mime === "image/jpg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/gif") return ".gif";
  if (mime === "video/mp4") return ".mp4";
  if (mime === "video/webm") return ".webm";
  if (mime === "video/quicktime") return ".mov";
  if (mime === "video/x-m4v" || mime === "video/m4v") return ".m4v";
  if (mime === "video/3gpp" || mime === "video/3gpp2") return ".3gp";
  return "";
}

/** Beberapa browser/OS mengirim `File.type` kosong — turunkan dari ekstensi nama berkas. */
function inferMimeFromFileName(name: string): string {
  const ext = path.extname(name).toLowerCase();
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".m4v": "video/x-m4v",
    ".3gp": "video/3gpp",
    ".3g2": "video/3gpp2",
  };
  return map[ext] ?? "";
}

function isMediaLibraryScope(s: string): s is MediaLibraryScope {
  return s in MEDIA_SCOPE_TO_DIR;
}

export async function POST(req: NextRequest) {
  if (!isAllowedAdminDevice(req.headers, req.cookies) || !hasValidAdminSessionFromRequest(req)) {
    return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 401 });
  }
  if (!rateLimitRequest(req, "upload", 40, 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak unggahan. Coba lagi sebentar." }, { status: 429 });
  }

  const form = await req.formData().catch((err: unknown) => {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[site-media/upload] formData gagal:", detail);
    return null;
  });
  if (!form) {
    return NextResponse.json(
      {
        error:
          "Gagal membaca formulir unggahan. Biasanya karena berkas terlalu besar untuk batas body server — coba video lebih kecil (maks. 80MB) atau pastikan `next.config` memakai `experimental.proxyClientMaxBodySize` ≥ ukuran unggahan.",
      },
      { status: 400 },
    );
  }

  const scope = typeof form.get("scope") === "string" ? (form.get("scope") as string) : "";
  const projectId =
    typeof form.get("projectId") === "string" ? sanitizeSegment(form.get("projectId") as string) : "";
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Berkas wajib diisi." }, { status: 400 });
  }

  const mime = ((file.type || "").trim() || inferMimeFromFileName(file.name)).trim();
  const isImage = mime.startsWith("image/");
  const isVideo = mime.startsWith("video/");
  if (!mime || (!isImage && !isVideo)) {
    return NextResponse.json(
      {
        error:
          "Tipe berkas tidak dikenali. Untuk video gunakan .mp4 / .webm (atau .mov dengan nama berkas yang jelas); untuk gambar .jpg / .png / .webp.",
      },
      { status: 400 },
    );
  }

  const limit = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (file.size > limit) {
    return NextResponse.json({ error: "Berkas terlalu besar." }, { status: 400 });
  }

  const ext = extFromMime(mime) || (isImage ? ".bin" : ".mp4");
  const stamp = randomBytes(6).toString("hex");
  const baseName = `${Date.now()}-${stamp}${ext}`;

  let destDir: string;
  let publicPrefix: string;

  const segment =
    typeof form.get("segment") === "string" ? sanitizeSegment(form.get("segment") as string) : "";

  if (scope === "project" && !projectId) {
    return NextResponse.json({ error: "projectId wajib untuk scope project." }, { status: 400 });
  }

  const scopeOk =
    scope === "hero" ||
    scope === "tentang" ||
    scope === "layanan" ||
    scope === "produk" ||
    scope === "portfolio" ||
    scope === "partners" ||
    scope === "industry" ||
    scope === "coldStorage" ||
    scope === "project" ||
    scope === "gallery" ||
    isMediaLibraryScope(scope);
  if (!scopeOk) {
    return NextResponse.json({ error: "Scope tidak dikenal." }, { status: 400 });
  }

  /** Opsional: dengan `BLOB_READ_WRITE_TOKEN`, unggah ke Blob publik; jika tidak, simpan ke `public/`. */
  try {
    const blobResult = await uploadSiteMediaToPublicBlobIfConfigured({
      scope,
      segment,
      projectId,
      file,
      mime,
    });
    if (blobResult) {
      return NextResponse.json({ ok: true, ...blobResult, storage: "blob-public" as const });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload gagal.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (scope === "hero") {
    destDir = joinPublic("images", "gambar_hero");
    publicPrefix = "/images/gambar_hero";
  } else if (
    scope === "tentang" ||
    scope === "layanan" ||
    scope === "produk" ||
    scope === "portfolio" ||
    scope === "partners" ||
    scope === "industry" ||
    scope === "coldStorage"
  ) {
    const sub = segment || "general";
    destDir = joinPublic("images", "cms", scope, sub);
    publicPrefix = `/images/cms/${scope}/${sub}`;
  } else if (scope === "project") {
    destDir = joinPublic("images", "gallery", "projects", projectId);
    publicPrefix = `/images/gallery/projects/${projectId}`;
  } else if (scope === "gallery") {
    destDir = joinPublic("images", "gallery");
    publicPrefix = "/images/gallery";
  } else if (isMediaLibraryScope(scope)) {
    const sub = MEDIA_SCOPE_TO_DIR[scope];
    destDir = joinPublic("media", sub);
    publicPrefix = `${PUBLIC_MEDIA_BASE}/${sub}`;
  } else {
    return NextResponse.json({ error: "Scope tidak dikenal." }, { status: 400 });
  }

  await fs.mkdir(destDir, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  let diskPath = path.join(destDir, baseName);
  await fs.writeFile(diskPath, buf);

  let url = `${publicPrefix}/${encodeURIComponent(baseName)}`;
  let thumbUrl: string | undefined;
  let sources: string[] | undefined;
  const isLibraryScope = isMediaLibraryScope(scope);

  if (isImage) {
    const stem = path.parse(baseName).name;
    const webpMain = `${stem}.webp`;
    const webpMainPath = path.join(destDir, webpMain);
    const variantNames = IMAGE_WIDTH_VARIANTS.map((w) => `${stem}-${w}.webp`);
    const variantPaths = variantNames.map((name) => path.join(destDir, name));
    try {
      const pipeline = sharp(buf, { failOn: "none" }).rotate().withMetadata({});
      await pipeline.clone().resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 82 }).toFile(webpMainPath);
      await Promise.all(
        variantPaths.map((vp, idx) =>
          sharp(buf, { failOn: "none" })
            .rotate()
            .resize({ width: IMAGE_WIDTH_VARIANTS[idx], withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(vp),
        ),
      );
      await fs.unlink(diskPath).catch(() => {});
      diskPath = webpMainPath;
      url = `${publicPrefix}/${encodeURIComponent(webpMain)}`;
      sources = variantNames.map((name) => `${publicPrefix}/${encodeURIComponent(name)}`);
    } catch {
      // keep original if conversion failed
    }

    if (isLibraryScope) {
      const mainWebp = `${stem}.webp`;
      const thumbName = `thumb-${stem}.webp`;
      const mainPath = path.join(destDir, mainWebp);
      const thumbPath = path.join(destDir, thumbName);
      try {
        await sharp(buf)
          .rotate()
          .resize({ width: 1920, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toFile(mainPath);
        await sharp(buf)
          .rotate()
          .resize({ width: 400, withoutEnlargement: true })
          .webp({ quality: 78 })
          .toFile(thumbPath);
        await fs.unlink(diskPath).catch(() => {});
        url = `${publicPrefix}/${encodeURIComponent(mainWebp)}`;
        thumbUrl = `${publicPrefix}/${encodeURIComponent(thumbName)}`;
      } catch {
        thumbUrl = undefined;
      }
    } else {
      const thumbName = `thumb-${stem}.webp`;
      const thumbPath = path.join(destDir, thumbName);
      try {
        await sharp(buf)
          .rotate()
          .resize({ width: 640, withoutEnlargement: true })
          .webp({ quality: 78 })
          .toFile(thumbPath);
        thumbUrl = `${publicPrefix}/${encodeURIComponent(thumbName)}`;
      } catch {
        thumbUrl = undefined;
      }
    }
  }

  return NextResponse.json({ ok: true, url, thumbUrl, sources, mime, scope });
}
