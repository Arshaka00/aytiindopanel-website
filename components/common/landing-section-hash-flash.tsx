"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import {
  isMobileishViewport,
  LANDING_SECTION_ENTER_EVENT,
} from "@/components/common/home-nav-scroll";

const FLASH_CLASS = "landing-hash-section-flash";
const FLASH_MS = 780;

function targetIdFromHash(hash: string): string | null {
  const raw = hash.trim();
  if (!raw || raw === "#") return null;
  const id = decodeURIComponent(raw.replace(/^#/, ""));
  if (!id.length) return null;
  if (id.toLowerCase() === "home") return "beranda";
  return id;
}

/**
 * Animasi singkat pada elemen `#id` target saat user pindah section lewat menu/hash
 * (CustomEvent dari `scrollToLandingNavHref` + `hashchange` untuk tombol depan/belakang).
 */
export function LandingSectionHashFlash() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    const pendingTimers = new Set<number>();

    const pulseTarget = (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;

      const reduce =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const noAnim = document.documentElement.dataset.performanceNoAnim === "1";
      const light = document.documentElement.dataset.performanceLightweight === "1";
      if (reduce || noAnim || light || isMobileishViewport()) return;

      el.classList.remove(FLASH_CLASS);
      void el.offsetWidth;
      el.classList.add(FLASH_CLASS);
      const t = window.setTimeout(() => {
        el.classList.remove(FLASH_CLASS);
        pendingTimers.delete(t);
      }, FLASH_MS);
      pendingTimers.add(t);
    };

    const runFromHash = (hash: string) => {
      const id = targetIdFromHash(hash);
      if (!id) return;
      pulseTarget(id);
    };

    const onEnter = (ev: Event) => {
      const ce = ev as CustomEvent<{ hash?: string }>;
      const h = ce.detail?.hash;
      if (typeof h === "string" && h.length) runFromHash(h);
    };

    const onHashChange = () => runFromHash(window.location.hash);

    window.addEventListener(LANDING_SECTION_ENTER_EVENT, onEnter);
    window.addEventListener("hashchange", onHashChange);

    return () => {
      window.removeEventListener(LANDING_SECTION_ENTER_EVENT, onEnter);
      window.removeEventListener("hashchange", onHashChange);
      for (const tid of pendingTimers) window.clearTimeout(tid);
      pendingTimers.clear();
    };
  }, [pathname]);

  return null;
}
