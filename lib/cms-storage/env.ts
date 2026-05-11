/**
 * CMS file storage di Vercel: pakai Blob jika `BLOB_READ_WRITE_TOKEN` ada.
 * Tanpa Blob di Vercel, fallback filesystem gagal menulis (`EROFS` di `/var/task`).
 * KV tidak disyaratkan di sini — dipakai terpisah untuk lock/status (`hasVercelKvEnv()`).
 */
export function isProductionStorage(): boolean {
  if (process.env.VERCEL !== "1") return false;
  return hasVercelBlobEnv();
}

export function hasVercelBlobEnv(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

/**
 * Tingkat akses Blob untuk file CMS (`live.json`, draft, audit, …).
 * - `private` (default): store harus mendukung blob private (disarankan untuk keamanan).
 * - `public`: untuk store Vercel yang **hanya** public — wajib jika error
 *   "Cannot use private access on a public store". Path JSON tetap tidak dipublikasikan UI;
 *   gunakan `CMS_BLOB_PREFIX` yang tidak mudah ditebak atau pertimbangkan store terpisah.
 */
export type CmsBlobAccessMode = "private" | "public";

export function getCmsBlobAccessMode(): CmsBlobAccessMode {
  const v = process.env.CMS_BLOB_ACCESS?.trim().toLowerCase();
  if (v === "public") return "public";
  return "private";
}

export function hasVercelKvEnv(): boolean {
  const url = process.env.KV_REST_API_URL?.trim() ?? process.env.KV_URL?.trim();
  return Boolean(url && process.env.KV_REST_API_TOKEN?.trim());
}

/** Prefix konsisten untuk key KV (status publish, lock). */
export function cmsKvKey(suffix: string): string {
  const base = process.env.CMS_KV_PREFIX?.trim() || "aytipanel:site-cms";
  return `${base}:${suffix}`;
}
