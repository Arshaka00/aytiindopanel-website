/** Loader intro dokumen sudah selesai di tab ini — cegah muncul lagi saat navigasi SPA / remount. */
export const GLOBAL_LOADER_DONE_KEY = "ayti_global_loader_done_v1";

export function isDocumentReloadNavigation(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const nav = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (nav?.type === "reload") return true;
    const legacy = performance as Performance & {
      navigation?: { type?: number };
    };
    return legacy.navigation?.type === 1;
  } catch {
    return false;
  }
}

/**
 * Tampilkan intro hanya pada kunjungan pertama tab (belum `GLOBAL_LOADER_DONE_KEY`).
 * Reload tidak memicu intro — scroll lock loader menangkap `scrollY` 0 dan memulihkan ke hero,
 * termasuk saat URL `/#layanan` atau `/#tentang`.
 * Navigasi klien yang remount layout tidak memicu ulang.
 */
export function shouldRunGlobalLoaderIntro(): boolean {
  if (typeof window === "undefined") return false;
  if (isDocumentReloadNavigation()) return false;
  try {
    return sessionStorage.getItem(GLOBAL_LOADER_DONE_KEY) !== "1";
  } catch {
    return true;
  }
}

export function markGlobalLoaderIntroDone(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(GLOBAL_LOADER_DONE_KEY, "1");
  } catch {
    /* private mode */
  }
}
