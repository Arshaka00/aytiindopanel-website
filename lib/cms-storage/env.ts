/**
 * CMS remote storage: aktif hanya di deployment Vercel **dan** env Blob + KV lengkap.
 * Tanpa env → fallback filesystem (dev / lokal / Vercel tanpa integrasi).
 */
export function isProductionStorage(): boolean {
  if (process.env.VERCEL !== "1") return false;
  return hasVercelBlobEnv() && hasVercelKvEnv();
}

export function hasVercelBlobEnv(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
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
