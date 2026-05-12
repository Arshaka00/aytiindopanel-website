"use client";

/** URL hash menuju section beranda (`/#layanan`) — digunakan SiteHeader */

/** Event setelah navigasi hash beranda — dipakai pulse ringan pada section target. */
export const LANDING_SECTION_ENTER_EVENT = "landing-section-enter";

/** Jarak udara antara bawah sticky header dan tepi atas section target (px). */
const ANCHOR_BELOW_HEADER_GAP_PX = 12;

const HEADER_STICKY_SELECTOR = "[data-site-header-sticky]";

/** Fallback jika `#id` salah / header tidak ada: ~bilah + safe-area atas + gap */
const FALLBACK_ABOVE_TARGET_PX = 96;

function landingScrollTarget(hash: string): HTMLElement | null {
  const trimmed = decodeURIComponent(hash.replace(/^#/, ""));
  const id =
    trimmed.length === 0 || trimmed.toLowerCase() === "home" ? "beranda" : trimmed;
  return document.getElementById(id);
}

function scrollWindowToY(top: number): void {
  const y = Math.max(0, top);
  let behavior: ScrollBehavior = "smooth";
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      behavior = "auto";
    }
  } catch {
    behavior = "smooth";
  }
  window.scrollTo({ top: y, behavior });
}

/** Setelah scroll ke anchor, beri sinyal agar section target bisa dipulse (animasi “pindah section”). */
function dispatchLandingSectionEnter(hash: string, delayMs: number): void {
  if (typeof window === "undefined") return;
  window.setTimeout(() => {
    window.dispatchEvent(new CustomEvent(LANDING_SECTION_ENTER_EVENT, { detail: { hash } }));
  }, delayMs);
}

/** Posisikan tepi atas `el` tepat di bawah bilah sticky (tinggi aktual dari layout). */
function scrollTargetBelowStickyHeader(el: HTMLElement): void {
  const sticky = document.querySelector<HTMLElement>(HEADER_STICKY_SELECTOR);
  let headerBottomVp: number | null = null;

  if (sticky && document.body.contains(sticky)) {
    headerBottomVp = sticky.getBoundingClientRect().bottom;
  }

  if (headerBottomVp == null || Number.isNaN(headerBottomVp)) {
    scrollWindowToY(
      el.getBoundingClientRect().top +
        window.scrollY -
        FALLBACK_ABOVE_TARGET_PX -
        ANCHOR_BELOW_HEADER_GAP_PX,
    );
    return;
  }

  /** Perbedaan yang harus ditambahkan ke scrollY supaya atas `el` = bawah header + gap */
  const elTopVp = el.getBoundingClientRect().top;
  const delta = elTopVp - headerBottomVp - ANCHOR_BELOW_HEADER_GAP_PX;
  scrollWindowToY(window.scrollY + delta);
}

/**
 * Scroll ke elemen `#id` pada halaman beranda dengan offset mengikuti tinggi sticky header.
 * Fallback retry singkat jika DOM belum siap (SSR → hidrasi).
 */
export function scrollToLandingNavHref(href: string): void {
  if (typeof window === "undefined") return;

  let url: URL;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return;
  }

  const effectiveHash = url.hash.length <= 1 ? "#beranda" : url.hash;
  let attempts = 0;

  const run = (): void => {
    attempts += 1;
    const el = landingScrollTarget(effectiveHash);
    if (el) {
      scrollTargetBelowStickyHeader(el);
      let motionDelay = 420;
      try {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          motionDelay = 80;
        }
      } catch {
        motionDelay = 420;
      }
      dispatchLandingSectionEnter(effectiveHash, motionDelay);
      return;
    }
    if (attempts <= 36) window.setTimeout(run, 42);
    else scrollWindowToY(0);
  };

  queueMicrotask(() => requestAnimationFrame(run));
}

/**
 * Pada `/`: set URL tanpa navigasi halaman baru, lalu scroll.
 * Pada path lain: navigasi full ke `pathname` + hash supaya anchor pasti tepat di atas konten setelah reload.
 */
export function navigateLandingHashFromNav(pathname: string, href: string): void {
  if (typeof window === "undefined") return;

  let url: URL;
  try {
    url = new URL(href, window.location.origin);
  } catch {
    return;
  }

  // Non-landing destination (e.g. /gallery-project) must navigate immediately.
  if (url.pathname !== "/") {
    const target = `${url.pathname}${url.search}${url.hash}`;
    window.location.assign(target);
    return;
  }

  if (pathname === "/") {
    window.history.replaceState(null, "", `${url.pathname}${url.hash}`);
    scrollToLandingNavHref(href);
    return;
  }

  window.location.assign(url.pathname + url.hash);
}
