/**
 * CMS file storage di Vercel: pakai Blob jika `BLOB_READ_WRITE_TOKEN` ada.
 * Tanpa Blob di Vercel, fallback filesystem gagal menulis (`EROFS` di `/var/task`).
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
 *   Bila baca `live.json` di log memunculkan **403 Forbidden**, token/store biasanya benar tetapi **mode access tidak cocok** dengan blob lama — samakan `CMS_BLOB_ACCESS` dengan cara upload, atau biarkan runtime mencoba fallback public/private sekali per bacaan.
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
