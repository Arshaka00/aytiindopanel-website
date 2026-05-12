/**
 * Gate bilah CMS mengambang + inline editing (`eligible` di `SiteCmsProvider`):
 * secara default hanya origin berikut (port 3000, skema http sesuai dev umum):
 *   - http://localhost:3000
 *   - http://172.20.10.6:3000
 *
 * Tambah origin (pisahkan koma) lewat `NEXT_PUBLIC_CMS_SURFACE_ORIGINS` bila perlu
 * (mis. `http://127.0.0.1:3000`, `https://localhost:3000`, staging).
 *
 * @see SiteCmsChrome — `isSiteCmsChromeSurfaceAllowed`
 * @see SiteCmsProvider — `eligible` di-AND dengan hasil API
 */

/** Host production (referensi URL situs; bukan daftar gate CMS bawaan). */
export const CMS_CHROME_PRODUCTION_HOST = "www.aytiindopanel.com";

const DEFAULT_CMS_SURFACE_ORIGINS = ["http://localhost:3000", "http://172.20.10.6:3000"] as const;

function parseExtraOriginsFromEnv(): string[] {
  const raw = process.env.NEXT_PUBLIC_CMS_SURFACE_ORIGINS?.trim();
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

/** Origin lengkap (termasuk skema + port) yang boleh menampilkan CMS / edit mode. */
export function getCmsAllowedSurfaceOrigins(): readonly string[] {
  return [...DEFAULT_CMS_SURFACE_ORIGINS, ...parseExtraOriginsFromEnv()];
}

/** True bila tab ini berada pada origin yang diizinkan untuk CMS & edit inline. */
export function isSiteCmsSurfaceOriginAllowed(): boolean {
  if (typeof window === "undefined") return false;
  return getCmsAllowedSurfaceOrigins().includes(window.location.origin);
}

/** True = boleh menampilkan SiteCmsChrome (sama dengan gate origin). */
export function isSiteCmsChromeSurfaceAllowed(): boolean {
  return isSiteCmsSurfaceOriginAllowed();
}

/**
 * Dipanggil setelah kunjungan ke `/site-admin` — memicu refresh listener chrome.
 */
export function grantCmsChromeSurfaceFromSiteAdminVisit(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("ayti-cms-chrome-session"));
}
