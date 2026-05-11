/**
 * Hero slide `src` boleh dioptimasi `next/image` (localPatterns / remotePatterns).
 * URL lain (CDN eksternal, blob pratinjau CMS) tetap `<img>` agar tidak memecah build/runtime.
 */
export function isHeroSlideNextImageOptimizable(src: string): boolean {
  const pathOnly = src.trim().split("?")[0].toLowerCase();
  return (
    pathOnly.startsWith("/images/") ||
    pathOnly.startsWith("/media/") ||
    pathOnly.startsWith("https://images.unsplash.com/")
  );
}
