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
 * - **Lokal** tanpa `CMS_BLOB_ACCESS`: default **private** (aman untuk dev).
 * - **Vercel** tanpa `CMS_BLOB_ACCESS`: default **public** — menghindari build gagal saat store
 *   hanya mendukung blob publik (error "Cannot use private access on a public store").
 *   Pakai store dengan akses private? Set **`CMS_BLOB_ACCESS=private`** di semua env (Production + Preview).
 * - `CMS_BLOB_ACCESS=public` / `1` / `true`: pakai blob publik eksplisit.
 */
export type CmsBlobAccessMode = "private" | "public";

export function getCmsBlobAccessMode(): CmsBlobAccessMode {
  const v = process.env.CMS_BLOB_ACCESS?.trim().toLowerCase();
  if (v === "public" || v === "1" || v === "true" || v === "yes") return "public";
  if (v === "private" || v === "0" || v === "false" || v === "no") return "private";
  if (process.env.VERCEL === "1") return "public";
  return "private";
}

export function hasVercelKvEnv(): boolean {
  const url = process.env.KV_REST_API_URL?.trim() ?? process.env.KV_URL?.trim();
  return Boolean(url && process.env.KV_REST_API_TOKEN?.trim());
}

/**
 * Publish global + orkestrasi deploy hook + polling UID (Deployment Center).
 * Set **`CMS_ENABLE_GLOBAL_PUBLISH=false`** (atau `0` / `no`) untuk fase dev: source of truth = Git + Vercel deploy saja.
 * Default: **aktif** (unset / nilai lain).
 */
export function isGlobalPublishWorkflowEnabled(): boolean {
  const v = process.env.CMS_ENABLE_GLOBAL_PUBLISH?.trim().toLowerCase();
  if (v === "false" || v === "0" || v === "no") return false;
  return true;
}

/** Prefix konsisten untuk key KV (status publish, lock). */
export function cmsKvKey(suffix: string): string {
  const base = process.env.CMS_KV_PREFIX?.trim() || "aytipanel:site-cms";
  return `${base}:${suffix}`;
}
