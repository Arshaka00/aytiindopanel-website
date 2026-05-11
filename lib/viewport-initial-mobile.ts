/**
 * Tebakan awal apakah viewport "mobile" (selaras `max-md` / 767.98px) dari User-Agent.
 * Digunakan hanya untuk **selaraskan SSR + hydrasi** `useCmsViewportIsMobile` — setelah
 * mount tetap disinkronkan dengan `matchMedia` (resize, devtools, tablet).
 */
export function isLikelyMobileViewportFromUserAgent(userAgent: string | null): boolean {
  if (!userAgent || typeof userAgent !== "string") return false;
  return /Mobile|Android|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
}
