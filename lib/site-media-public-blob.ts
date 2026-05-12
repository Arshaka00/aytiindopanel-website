import { put } from "@vercel/blob";

/**
 * Prefix pathname Blob untuk upload media situs (public URL), opsional.
 * Default: `{CMS_BLOB_PREFIX}/media-uploads` (bukan file JSON CMS).
 */
export function blobSiteMediaUploadPrefix(): string {
  const explicit = process.env.CMS_BLOB_MEDIA_PREFIX?.trim().replace(/^\/+|\/+$/g, "");
  if (explicit) return explicit;
  const base = process.env.CMS_BLOB_PREFIX?.trim().replace(/^\/+|\/+$/g, "") ?? "site-cms/default";
  return `${base}/media-uploads`;
}

function blobToken(): string {
  const t = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!t) throw new Error("BLOB_READ_WRITE_TOKEN tidak di-set.");
  return t;
}

/** Unggah satu berkas; mengembalikan URL publik yang bisa dipakai di `<img src>`. */
export async function putPublicSiteMediaBlob(
  pathnameRelative: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  const token = blobToken();
  const pathname = pathnameRelative.replace(/^\/+/, "").replace(/\/+/g, "/");
  const blob = await put(pathname, body, {
    access: "public",
    token,
    contentType,
    addRandomSuffix: false,
  });
  return blob.url;
}
