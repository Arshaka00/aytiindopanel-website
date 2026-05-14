"use client";

/** URL hash menuju section beranda (`/#layanan`) — digunakan SiteHeader */

/** Event setelah navigasi hash beranda — dipakai pulse ringan pada section target. */
export const LANDING_SECTION_ENTER_EVENT = "landing-section-enter";

/** Jarak udara antara bawah sticky header dan tepi atas section target (px). */
const ANCHOR_BELOW_HEADER_GAP_PX = 12;

const HEADER_STICKY_SELECTOR = "[data-site-header-sticky]";

/** Fallback jika `#id` salah / header tidak ada: ~bilah + safe-area atas + gap */
const FALLBACK_ABOVE_TARGET_PX = 96;

let premiumScrollRafId = 0;

function cancelPremiumLandingScroll(): void {
  if (premiumScrollRafId) {
    cancelAnimationFrame(premiumScrollRafId);
    premiumScrollRafId = 0;
  }
}

function landingScrollTarget(hash: string): HTMLElement | null {
  const trimmed = decodeURIComponent(hash.replace(/^#/, ""));
  const id =
    trimmed.length === 0 || trimmed.toLowerCase() === "home" ? "beranda" : trimmed;
  return document.getElementById(id);
}

function shouldUseInstantScroll(): boolean {
  if (typeof window === "undefined") return true;
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  } catch {
    /* ignore */
  }
  const root = document.documentElement;
  if (root.dataset.performanceNoAnim === "1") return true;
  if (root.dataset.performanceLightweight === "1") return true;
  return false;
}

function isMobileishViewport(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  try {
    if (window.matchMedia("(pointer: coarse)").matches) return true;
    if (window.matchMedia("(max-width: 767.98px)").matches) return true;
  } catch {
    /* ignore */
  }
  return false;
}

/** Easing halus — dipilih acak per gestur (maju/mundur punya set berbeda). */
function sampleEasing(forward: boolean): (t: number) => number {
  const outCubic = (t: number) => 1 - (1 - t) ** 3;
  const outQuart = (t: number) => 1 - (1 - t) ** 4;
  const inOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
  const softOut = (t: number) => 1 - (1 - t) ** 2.35;
  const pool = forward
    ? [outCubic, outQuart, softOut]
    : [inOutCubic, outCubic, outQuart];
  return pool[Math.floor(Math.random() * pool.length)]!;
}

function computePremiumDurationMs(deltaAbs: number, forward: boolean): number {
  const mobileish = isMobileishViewport();
  const baseMin = mobileish ? 400 : 500;
  const baseMax = mobileish ? 560 : 700;
  const span = Math.max(window.innerHeight * 1.1, 520);
  const distanceBoost = Math.min(1.15, 0.62 + (deltaAbs / span) * 0.48);
  const base = baseMin + Math.random() * (baseMax - baseMin);
  const dir = forward ? 0.97 + Math.random() * 0.1 : 0.9 + Math.random() * 0.1;
  const ms = Math.round(base * distanceBoost * dir);
  return Math.max(320, Math.min(960, ms));
}

/**
 * Scroll vertikal window dengan easing terkontrol (rAF) — konsisten di Safari mobile & desktop.
 * `behavior: "smooth"` bawaan browser sering tidak merata; di sini premium + sedikit variasi acak.
 */
function runPremiumScrollWindowToY(
  targetY: number,
  onDone: (info: { durationMs: number; premium: boolean }) => void,
): void {
  cancelPremiumLandingScroll();

  const endY = Math.max(0, targetY);
  const startY = window.scrollY;
  const delta = endY - startY;
  if (Math.abs(delta) < 1.5) {
    onDone({ durationMs: 0, premium: true });
    return;
  }

  const forward = delta > 0;
  const ease = sampleEasing(forward);
  const durationMs = computePremiumDurationMs(Math.abs(delta), forward);
  const t0 = performance.now();

  const tick = (now: number) => {
    const raw = (now - t0) / durationMs;
    const t = raw >= 1 ? 1 : raw;
    const y = startY + delta * ease(t);
    window.scrollTo({ left: window.scrollX, top: y, behavior: "auto" });
    if (t < 1) {
      premiumScrollRafId = requestAnimationFrame(tick);
    } else {
      premiumScrollRafId = 0;
      window.scrollTo({ left: window.scrollX, top: endY, behavior: "auto" });
      onDone({ durationMs: durationMs, premium: true });
    }
  };

  premiumScrollRafId = requestAnimationFrame(tick);
}

function scrollWindowToY(
  top: number,
  behaviorOverride?: ScrollBehavior,
  onComplete?: (info: { durationMs: number; premium: boolean }) => void,
): void {
  const y = Math.max(0, top);
  let behavior: ScrollBehavior = behaviorOverride ?? "smooth";
  if (behaviorOverride === undefined) {
    behavior = shouldUseInstantScroll() ? "auto" : "smooth";
  }

  const done = onComplete ?? (() => {});

  if (behavior === "auto") {
    cancelPremiumLandingScroll();
    window.scrollTo({ left: window.scrollX, top: y, behavior: "auto" });
    done({ durationMs: 0, premium: false });
    return;
  }

  if (shouldUseInstantScroll()) {
    cancelPremiumLandingScroll();
    window.scrollTo({ left: window.scrollX, top: y, behavior: "auto" });
    done({ durationMs: 0, premium: false });
    return;
  }

  runPremiumScrollWindowToY(y, done);
}

/** Scroll ke atas beranda (logo) — sama-sama memakai kurva premium bila halus diizinkan. */
export function scrollLandingHomeTop(behavior: ScrollBehavior = "smooth"): void {
  if (typeof window === "undefined") return;
  scrollWindowToY(0, behavior);
}

/** Setelah scroll ke anchor, beri sinyal agar section target bisa dipulse (animasi “pindah section”). */
function dispatchLandingSectionEnter(hash: string, delayMs: number): void {
  if (typeof window === "undefined") return;
  window.setTimeout(() => {
    window.dispatchEvent(new CustomEvent(LANDING_SECTION_ENTER_EVENT, { detail: { hash } }));
  }, delayMs);
}

/** Posisikan tepi atas `el` tepat di bawah bilah sticky (tinggi aktual dari layout). */
function scrollTargetBelowStickyHeader(
  el: HTMLElement,
  scrollBehavior: ScrollBehavior | undefined,
  onScrollFinish?: (info: { durationMs: number; premium: boolean }) => void,
): void {
  const sticky = document.querySelector<HTMLElement>(HEADER_STICKY_SELECTOR);
  let headerBottomVp: number | null = null;

  if (sticky && document.body.contains(sticky)) {
    headerBottomVp = sticky.getBoundingClientRect().bottom;
  }

  const finish = onScrollFinish ?? (() => {});

  if (headerBottomVp == null || Number.isNaN(headerBottomVp)) {
    scrollWindowToY(
      el.getBoundingClientRect().top +
        window.scrollY -
        FALLBACK_ABOVE_TARGET_PX -
        ANCHOR_BELOW_HEADER_GAP_PX,
      scrollBehavior,
      finish,
    );
    return;
  }

  /** Perbedaan yang harus ditambahkan ke scrollY supaya atas `el` = bawah header + gap */
  const elTopVp = el.getBoundingClientRect().top;
  const delta = elTopVp - headerBottomVp - ANCHOR_BELOW_HEADER_GAP_PX;
  scrollWindowToY(window.scrollY + delta, scrollBehavior, finish);
}

/**
 * Scroll ke elemen `#id` pada halaman beranda dengan offset mengikuti tinggi sticky header.
 * Fallback retry singkat jika DOM belum siap (SSR → hidrasi).
 *
 * `scrollBehavior: "auto"` — untuk koreksi setelah layout (mis. `load`) tanpa ganda animasi smooth.
 */
export function scrollToLandingNavHref(
  href: string,
  options?: { scrollBehavior?: ScrollBehavior },
): void {
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
      scrollTargetBelowStickyHeader(el, options?.scrollBehavior, (info) => {
        const reduce = shouldUseInstantScroll();
        let motionDelay = 96;
        if (!reduce && info.premium && info.durationMs > 0) {
          motionDelay = Math.round(info.durationMs + 64 + Math.random() * 72);
        } else if (!reduce) {
          motionDelay = 140;
        }
        dispatchLandingSectionEnter(effectiveHash, motionDelay);
      });
      return;
    }
    if (attempts <= 36) window.setTimeout(run, 42);
    else scrollWindowToY(0, "auto");
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
