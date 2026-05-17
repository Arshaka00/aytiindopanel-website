"use client";

import { markLandingHashNavigationIntent } from "@/components/common/return-section";

/** URL hash menuju section beranda (`/#layanan`) — digunakan SiteHeader */

/** Event setelah navigasi hash beranda — dipakai pulse ringan pada section target. */
export const LANDING_SECTION_ENTER_EVENT = "landing-section-enter";

/** Jarak udara antara bawah sticky header dan tepi atas section target (px). */
const ANCHOR_BELOW_HEADER_GAP_PX = 12;

const HEADER_STICKY_SELECTOR = "[data-site-header-sticky]";

/** Fallback jika `#id` salah / header tidak ada: ~bilah + safe-area atas + gap */
const FALLBACK_ABOVE_TARGET_PX = 96;

let premiumScrollRafId = 0;

/** Cegah scroll restore ganda (popstate + ScrollToSectionOnLoad) dalam satu navigasi balik. */
let landingInstantScrollLockUntil = 0;
const LANDING_INSTANT_SCROLL_LOCK_MS = 520;
/** Drift > ambang baru dikoreksi sekali (hindari micro-jump Safari subpixel). */
const MOBILE_ANCHOR_STABILIZE_THRESHOLD_PX = 8;
const LANDING_INSTANT_RESTORE_ATTR = "data-landing-instant-restore";
const LANDING_INSTANT_RESTORE_CHROME_MS = 420;
let landingInstantRestoreClearTimer: number | undefined;
let mobileAnchorRestoreGeneration = 0;

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

/** Hero beranda: satu layar penuh dari atas dokumen (bukan offset di bawah sticky header). */
function isHomeHeroAnchorHash(hash: string): boolean {
  const id = decodeURIComponent(hash.replace(/^#/, "")).trim().toLowerCase();
  return id.length === 0 || id === "beranda" || id === "home";
}

/**
 * Lepas scroll-lock `position: fixed` pada body (mis. dari GlobalLoader) yang tertinggal
 * setelah Fast Refresh — kalau tidak, konten hero tampil tertutup header.
 */
export function releaseStuckDocumentScrollLock(): void {
  if (typeof window === "undefined") return;
  const body = document.body;
  const html = document.documentElement;
  if (body.style.position !== "fixed") return;
  body.style.position = "";
  body.style.top = "";
  body.style.width = "";
  body.style.overflow = "";
  html.style.overflow = "";
}

function scrollHomeHeroFullViewport(
  scrollBehavior: ScrollBehavior = "auto",
  onComplete?: () => void,
): void {
  cancelPremiumLandingScroll();
  releaseStuckDocumentScrollLock();
  window.scrollTo({ top: 0, left: 0, behavior: scrollBehavior });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  const root = document.scrollingElement;
  if (root) root.scrollTop = 0;
  onComplete?.();
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

/** Mobile / touch: scroll instan — hindari rAF premium & pulse section (lebih ringan di GPU). */
export function preferInstantHomeScroll(): boolean {
  return shouldUseInstantScroll() || isMobileishViewport();
}

export function isMobileishViewport(): boolean {
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
  const baseMin = mobileish ? 430 : 540;
  const baseMax = mobileish ? 600 : 780;
  const span = Math.max(window.innerHeight * 1.1, 520);
  const distanceBoost = Math.min(1.15, 0.62 + (deltaAbs / span) * 0.48);
  const base = baseMin + Math.random() * (baseMax - baseMin);
  const dir = forward ? 0.97 + Math.random() * 0.1 : 0.9 + Math.random() * 0.1;
  const ms = Math.round(base * distanceBoost * dir);
  return Math.max(360, Math.min(1040, ms));
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
    behavior = preferInstantHomeScroll() ? "auto" : "smooth";
  }

  const done = onComplete ?? (() => {});

  if (behavior === "auto") {
    cancelPremiumLandingScroll();
    window.scrollTo({ left: window.scrollX, top: y, behavior: "auto" });
    done({ durationMs: 0, premium: false });
    return;
  }

  if (preferInstantHomeScroll()) {
    cancelPremiumLandingScroll();
    window.scrollTo({ left: window.scrollX, top: y, behavior: "auto" });
    done({ durationMs: 0, premium: false });
    return;
  }

  runPremiumScrollWindowToY(y, done);
}

/** Setelah refresh dokumen di `/`: URL `/#beranda` + scroll ke atas (hero memenuhi 1 layar). */
export function scrollHomeToHeroSection(): void {
  if (typeof window === "undefined") return;
  const heroHref = `${window.location.pathname}${window.location.search}#beranda`;
  try {
    if (window.location.hash !== "#beranda") {
      window.history.replaceState(null, "", heroHref);
    }
  } catch {
    /* ignore */
  }
  scrollHomeHeroFullViewport("auto");
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

/** Hitung `scrollY` agar tepi atas `el` berada tepat di bawah sticky header. */
function measureLandingAnchorScrollY(el: HTMLElement): number | null {
  const sticky = document.querySelector<HTMLElement>(HEADER_STICKY_SELECTOR);
  let headerBottomVp: number | null = null;

  if (sticky && document.body.contains(sticky)) {
    headerBottomVp = sticky.getBoundingClientRect().bottom;
  }

  if (headerBottomVp == null || Number.isNaN(headerBottomVp)) {
    return (
      el.getBoundingClientRect().top +
      window.scrollY -
      FALLBACK_ABOVE_TARGET_PX -
      ANCHOR_BELOW_HEADER_GAP_PX
    );
  }

  const elTopVp = el.getBoundingClientRect().top;
  const delta = elTopVp - headerBottomVp - ANCHOR_BELOW_HEADER_GAP_PX;
  return Math.max(0, window.scrollY + delta);
}

function tryAcquireLandingInstantScrollLock(): boolean {
  const now = Date.now();
  if (now < landingInstantScrollLockUntil) return false;
  landingInstantScrollLockUntil = now + LANDING_INSTANT_SCROLL_LOCK_MS;
  return true;
}

/**
 * Selama restore instan mobile: matikan scroll anchoring browser + smooth scroll global
 * agar Safari tidak “menarik” posisi setelah `scrollTo` programmatic.
 * Lihat `html[data-landing-instant-restore]` di globals.css.
 */
function armLandingInstantRestoreViewport(): void {
  if (!isMobileishViewport()) return;
  const root = document.documentElement;
  root.setAttribute(LANDING_INSTANT_RESTORE_ATTR, "1");
  if (landingInstantRestoreClearTimer !== undefined) {
    window.clearTimeout(landingInstantRestoreClearTimer);
  }
  landingInstantRestoreClearTimer = window.setTimeout(() => {
    root.removeAttribute(LANDING_INSTANT_RESTORE_ATTR);
    landingInstantRestoreClearTimer = undefined;
  }, LANDING_INSTANT_RESTORE_CHROME_MS);
}

/**
 * Satu koreksi opsional setelah visualViewport/header settle (toolbar Safari).
 * Bukan retry loop — maksimal satu `scrollTo` tambahan jika drift nyata.
 */
function stabilizeMobileInstantLandingAnchor(el: HTMLElement): void {
  if (!isMobileishViewport()) return;

  const generation = ++mobileAnchorRestoreGeneration;
  let corrected = false;

  const maybeCorrectOnce = (): void => {
    if (corrected || generation !== mobileAnchorRestoreGeneration) return;
    const targetY = measureLandingAnchorScrollY(el);
    if (targetY == null) return;
    if (Math.abs(window.scrollY - targetY) <= MOBILE_ANCHOR_STABILIZE_THRESHOLD_PX) return;
    corrected = true;
    scrollWindowToY(targetY, "auto");
  };

  const vv = window.visualViewport;
  if (!vv) {
    window.setTimeout(maybeCorrectOnce, 120);
    return;
  }

  let idleTimer: number | undefined;
  const onVvResize = (): void => {
    if (generation !== mobileAnchorRestoreGeneration) return;
    if (idleTimer !== undefined) window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(maybeCorrectOnce, 120);
  };

  vv.addEventListener("resize", onVvResize, { passive: true });
  window.setTimeout(() => {
    if (generation !== mobileAnchorRestoreGeneration) return;
    if (idleTimer !== undefined) window.clearTimeout(idleTimer);
    vv.removeEventListener("resize", onVvResize);
    maybeCorrectOnce();
  }, 360);
}

/** Posisikan tepi atas `el` tepat di bawah bilah sticky (tinggi aktual dari layout). */
function scrollTargetBelowStickyHeader(
  el: HTMLElement,
  scrollBehavior: ScrollBehavior | undefined,
  onScrollFinish?: (info: { durationMs: number; premium: boolean }) => void,
): void {
  const finish = onScrollFinish ?? (() => {});
  const targetY = measureLandingAnchorScrollY(el);
  if (targetY == null) {
    finish({ durationMs: 0, premium: false });
    return;
  }
  scrollWindowToY(targetY, scrollBehavior, finish);
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
  const instant =
    options?.scrollBehavior === "auto" ||
    (options?.scrollBehavior === undefined && preferInstantHomeScroll());
  const resolvedBehavior: ScrollBehavior | undefined = instant
    ? "auto"
    : options?.scrollBehavior;
  const mobileInstant = instant && isMobileishViewport();

  if (instant && !tryAcquireLandingInstantScrollLock()) {
    return;
  }

  if (mobileInstant) {
    armLandingInstantRestoreViewport();
  }

  const maxAttempts = instant ? 28 : 36;
  const retryMs = instant ? 64 : 42;
  let attempts = 0;

  const run = (): void => {
    attempts += 1;

    if (isHomeHeroAnchorHash(effectiveHash)) {
      scrollHomeHeroFullViewport(resolvedBehavior ?? "auto", () => {
        if (instant) return;
        dispatchLandingSectionEnter(effectiveHash, 96);
      });
      return;
    }

    const el = landingScrollTarget(effectiveHash);
    if (el) {
      if (mobileInstant) {
        scrollTargetBelowStickyHeader(el, "auto");
        stabilizeMobileInstantLandingAnchor(el);
        return;
      }
      scrollTargetBelowStickyHeader(el, resolvedBehavior, (info) => {
        if (instant) return;
        let motionDelay = 96;
        if (info.premium && info.durationMs > 0) {
          motionDelay = Math.round(info.durationMs + 64 + Math.random() * 72);
        } else {
          motionDelay = 140;
        }
        dispatchLandingSectionEnter(effectiveHash, motionDelay);
      });
      return;
    }
    if (attempts <= maxAttempts) window.setTimeout(run, retryMs);
  };

  if (mobileInstant) {
    requestAnimationFrame(() => requestAnimationFrame(run));
  } else {
    queueMicrotask(() => requestAnimationFrame(run));
  }
}

export type NavigateLandingHashOptions = {
  /** Next.js App Router — hindari `location.assign` agar transisi & overlay navigasi jalan. */
  spaNavigate?: (destination: string) => void;
};

/**
 * Pada `/`: set URL tanpa navigasi halaman baru, lalu scroll.
 * Pada path lain: navigasi ke beranda + hash; dengan `spaNavigate` memakai client routing Next.
 */
export function navigateLandingHashFromNav(
  pathname: string,
  href: string,
  options?: NavigateLandingHashOptions,
): void {
  if (typeof window === "undefined") return;

  let url: URL;
  try {
    url = new URL(href, window.location.origin);
  } catch {
    return;
  }

  if (url.pathname !== "/") {
    const target = `${url.pathname}${url.search}${url.hash}`;
    if (options?.spaNavigate) {
      options.spaNavigate(target);
      return;
    }
    window.location.assign(target);
    return;
  }

  if (pathname === "/") {
    window.history.replaceState(null, "", `${url.pathname}${url.hash}`);
    scrollToLandingNavHref(href);
    return;
  }

  const homeDest = `${url.pathname}${url.search}${url.hash}`;
  if (options?.spaNavigate) {
    if (url.hash.length > 1) {
      markLandingHashNavigationIntent(homeDest);
    }
    options.spaNavigate(homeDest);
    return;
  }

  window.location.assign(url.pathname + url.hash);
}
