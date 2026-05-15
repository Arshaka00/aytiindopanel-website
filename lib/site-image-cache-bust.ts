import { SITE_IMAGE_UPLOAD_ISO } from "@/components/aytipanel/site-image-upload-dates.generated";

/** Path tanpa query agar cocok kunci manifest. */
export function normalizeSiteImagePath(src: string): string {
  const q = src.indexOf("?");
  return q === -1 ? src : src.slice(0, q);
}

/** Versi cache dari mtime file (`site-image-upload-dates.generated.ts`). */
export function siteImageCacheBustToken(src: string): string | undefined {
  const path = normalizeSiteImagePath(src.trim());
  if (!path.startsWith("/images/")) return undefined;
  const iso = SITE_IMAGE_UPLOAD_ISO[path];
  if (!iso) return undefined;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? String(t) : undefined;
}

/**
 * Tambah `?v=` pada aset lokal `/images/...` setelah file diganti.
 * Blob/http(s) dan path CMS preview tidak diubah.
 */
export function withSiteImageCacheBust(src: string): string {
  const trimmed = src.trim();
  if (!trimmed) return src;
  if (
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:") ||
    /^https?:\/\//i.test(trimmed)
  ) {
    return trimmed;
  }
  const path = normalizeSiteImagePath(trimmed);
  if (!path.startsWith("/images/")) return trimmed;
  const token = siteImageCacheBustToken(path);
  if (!token) return path;
  return `${path}?v=${token}`;
}
