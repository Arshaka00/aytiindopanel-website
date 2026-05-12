/**
 * `CMS_ENABLE_GLOBAL_PUBLISH` — satu sumber kebenaran untuk orkestrasi publish global
 * (deploy hook, polling Vercel, draft/live via publish global).
 *
 * - **Tidak di-set** atau nilai lain selain penonaktif eksplisit → **aktif** (backward compatible).
 * - **`false` | `0` | `no`** (case-insensitive, trim) → **nonaktif** — alur Git/Vercel + UI deployment sederhana.
 */

const EXPLICIT_DISABLED = new Set(["false", "0", "no"]);
const EXPLICIT_ENABLED = new Set(["true", "1", "yes"]);

/**
 * Normalisasi string env boolean-ish.
 * @returns `false` / `true` bila nilai eksplisit; `null` bila kosong / tidak dikenali (pemanggil biasanya memakai default).
 */
export function normalizeBooleanEnv(raw: string | undefined | null): boolean | null {
  if (raw == null) return null;
  const v = String(raw).trim().toLowerCase();
  if (v === "") return null;
  if (EXPLICIT_DISABLED.has(v)) return false;
  if (EXPLICIT_ENABLED.has(v)) return true;
  return null;
}

/** Baca env `CMS_ENABLE_GLOBAL_PUBLISH` (Node / serverless). */
function readCmsEnableGlobalPublishEnv(): string | undefined {
  return process.env.CMS_ENABLE_GLOBAL_PUBLISH;
}

/**
 * Apakah orkestrasi publish global (enterprise) diizinkan di runtime ini.
 * Default **true** jika env tidak ada atau tidak dikenali.
 */
export function isGlobalPublishEnabled(): boolean {
  const parsed = normalizeBooleanEnv(readCmsEnableGlobalPublishEnv());
  if (parsed === false) return false;
  return true;
}
