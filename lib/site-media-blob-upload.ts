import { randomBytes } from "node:crypto";
import path from "node:path";

import sharp from "sharp";

import { isSiteMediaBlobUploadEnabled } from "@/lib/site-media-blob-env";
import { MEDIA_SCOPE_TO_DIR, type MediaLibraryScope } from "@/lib/site-media-constants";
import { blobSiteMediaUploadPrefix, putPublicSiteMediaBlob } from "@/lib/site-media-public-blob";

const IMAGE_WIDTH_VARIANTS = [480, 960, 1600] as const;

function extFromMime(mime: string): string {
  if (mime === "image/jpeg" || mime === "image/jpg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/gif") return ".gif";
  if (mime === "video/mp4") return ".mp4";
  if (mime === "video/webm") return ".webm";
  return "";
}

function isMediaLibraryScope(s: string): s is MediaLibraryScope {
  return s in MEDIA_SCOPE_TO_DIR;
}

function joinMediaPath(...parts: string[]): string {
  const prefix = blobSiteMediaUploadPrefix();
  const tail = parts.filter(Boolean).join("/").replace(/\/+/g, "/");
  return `${prefix}/${tail}`.replace(/\/+/g, "/");
}

function buildRelativeDir(scope: string, segment: string, projectId: string): string {
  if (scope === "hero") return "images/gambar_hero";
  if (
    scope === "tentang" ||
    scope === "layanan" ||
    scope === "produk" ||
    scope === "portfolio" ||
    scope === "partners" ||
    scope === "industry"
  ) {
    const sub = segment || "general";
    return `images/cms/${scope}/${sub}`;
  }
  if (scope === "project") return `images/gallery/projects/${projectId}`;
  if (scope === "gallery") return "images/gallery";
  if (isMediaLibraryScope(scope)) return `media/${MEDIA_SCOPE_TO_DIR[scope]}`;
  throw new Error("Scope tidak dikenal.");
}

export type SiteMediaBlobUploadResult = {
  url: string;
  thumbUrl?: string;
  sources?: string[];
  mime: string;
  scope: string;
};

/**
 * Jika `BLOB_READ_WRITE_TOKEN` di-set, unggah ke Vercel Blob **`access: public`** (opsional).
 * Tanpa token, upload memakai `public/` di repo. Konten CMS JSON tidak pernah disimpan di Blob.
 */
export async function uploadSiteMediaToPublicBlobIfConfigured(params: {
  scope: string;
  segment: string;
  projectId: string;
  file: File;
  mime: string;
}): Promise<SiteMediaBlobUploadResult | null> {
  if (!isSiteMediaBlobUploadEnabled()) return null;

  const { scope, segment, projectId, file, mime } = params;
  const isImage = mime.startsWith("image/");
  const isVideo = mime.startsWith("video/");
  if (!isImage && !isVideo) throw new Error("Hanya gambar atau video.");

  const ext = extFromMime(mime) || (isImage ? ".bin" : ".mp4");
  const stamp = randomBytes(6).toString("hex");
  const baseName = `${Date.now()}-${stamp}${ext}`;

  let relativeDir: string;
  try {
    relativeDir = buildRelativeDir(scope, segment, projectId);
  } catch {
    throw new Error("Scope tidak dikenal.");
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const isLibraryScope = isMediaLibraryScope(scope);

  if (isVideo) {
    const pathname = joinMediaPath(relativeDir, baseName);
    const url = await putPublicSiteMediaBlob(pathname, buf, mime);
    return { url, mime, scope };
  }

  let url: string;
  let thumbUrl: string | undefined;
  let sources: string[] | undefined;

  const stem = path.parse(baseName).name;

  if (isLibraryScope) {
    const variantNames = IMAGE_WIDTH_VARIANTS.map((w) => `${stem}-${w}.webp`);
    const mainWebp = `${stem}.webp`;
    const thumbName = `thumb-${stem}.webp`;

    try {
      const variantBufs = await Promise.all(
        IMAGE_WIDTH_VARIANTS.map((w) =>
          sharp(buf, { failOn: "none" })
            .rotate()
            .resize({ width: w, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer(),
        ),
      );
      sources = await Promise.all(
        variantNames.map((name, idx) =>
          putPublicSiteMediaBlob(joinMediaPath(relativeDir, name), variantBufs[idx]!, "image/webp"),
        ),
      );
    } catch {
      sources = undefined;
    }

    const mainBuf = await sharp(buf, { failOn: "none" })
      .rotate()
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    const thumbBuf = await sharp(buf, { failOn: "none" })
      .rotate()
      .resize({ width: 400, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer();
    url = await putPublicSiteMediaBlob(joinMediaPath(relativeDir, mainWebp), mainBuf, "image/webp");
    thumbUrl = await putPublicSiteMediaBlob(joinMediaPath(relativeDir, thumbName), thumbBuf, "image/webp");
    return { url, thumbUrl, sources, mime, scope };
  }

  const webpMain = `${stem}.webp`;
  const variantNames = IMAGE_WIDTH_VARIANTS.map((w) => `${stem}-${w}.webp`);
  try {
    const pipeline = sharp(buf, { failOn: "none" }).rotate().withMetadata({});
    const webpMainBuf = await pipeline
      .clone()
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    const variantBufs = await Promise.all(
      IMAGE_WIDTH_VARIANTS.map((w) =>
        sharp(buf, { failOn: "none" })
          .rotate()
          .resize({ width: w, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer(),
      ),
    );
    url = await putPublicSiteMediaBlob(joinMediaPath(relativeDir, webpMain), webpMainBuf, "image/webp");
    sources = await Promise.all(
      variantNames.map((name, idx) =>
        putPublicSiteMediaBlob(joinMediaPath(relativeDir, name), variantBufs[idx]!, "image/webp"),
      ),
    );
  } catch {
    url = await putPublicSiteMediaBlob(joinMediaPath(relativeDir, baseName), buf, mime || "application/octet-stream");
  }

  const thumbName = `thumb-${stem}.webp`;
  try {
    const thumbBuf = await sharp(buf, { failOn: "none" })
      .rotate()
      .resize({ width: 640, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer();
    thumbUrl = await putPublicSiteMediaBlob(joinMediaPath(relativeDir, thumbName), thumbBuf, "image/webp");
  } catch {
    thumbUrl = undefined;
  }

  return { url, thumbUrl, sources, mime, scope };
}
