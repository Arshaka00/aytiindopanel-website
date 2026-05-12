/**
 * Bilah mengambang "Edit mode" + tautan CMS:
 * - Production (`www.…`): hanya setelah membuka `/site-admin` sekali di tab (sessionStorage).
 * - Localhost / 127.0.0.1 / `*.local`: selalu diizinkan agar dev tidak perlu langkah ekstra.
 * @see SiteCmsChrome — sembunyikan bila gate false.
 */

const STORAGE_KEY = "ayti_cms_chrome_surface_v1";

/** Host production yang diminta (bukan apex tanpa www). */
export const CMS_CHROME_PRODUCTION_HOST = "www.aytiindopanel.com";

function isLocalDevHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".local");
}

/** Dipanggil saat pengguna membuka `/site-admin` pada host yang diizinkan. */
export function grantCmsChromeSurfaceFromSiteAdminVisit(): void {
  if (typeof window === "undefined") return;
  const h = window.location.hostname;
  if (h !== CMS_CHROME_PRODUCTION_HOST && !isLocalDevHost(h)) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* private mode / quota */
  }
}

/** True = boleh menampilkan SiteCmsChrome (prod: setelah `/site-admin`; dev host: langsung). */
export function isSiteCmsChromeSurfaceAllowed(): boolean {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  if (h !== CMS_CHROME_PRODUCTION_HOST && !isLocalDevHost(h)) return false;
  if (isLocalDevHost(h)) return true;
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}
