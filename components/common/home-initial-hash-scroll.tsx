"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  clearHomeScrollY,
  consumeHomeReturnScrollHandled,
} from "@/components/common/return-section";
import {
  isMobileishViewport,
  scrollToLandingNavHref,
} from "@/components/common/home-nav-scroll";
import { isHomeDocumentReload } from "@/components/common/scroll-to-section-on-load";

/**
 * Hash di `/` (#produk, #proses, dll.) pada **kunjungan langsung** (bukan kembali dari detail).
 * Kembali dari detail ditangani `ScrollToSectionOnLoad` + intent agar tidak scroll ganda.
 */
export function HomeInitialHashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;
    if (isHomeDocumentReload()) return;
    if (consumeHomeReturnScrollHandled()) return;

    const h = window.location.hash;
    if (!h || h === "#") return;

    const full = `${window.location.pathname}${window.location.search}${h}`;

    if (isMobileishViewport()) {
      scrollToLandingNavHref(full, { scrollBehavior: "auto" });
      clearHomeScrollY();
      return;
    }

    const runSmooth = () => {
      scrollToLandingNavHref(full);
      clearHomeScrollY();
    };
    const runSnap = () => {
      scrollToLandingNavHref(full, { scrollBehavior: "auto" });
      clearHomeScrollY();
    };

    runSmooth();
    const tLate = window.setTimeout(runSnap, 520);
    window.addEventListener("load", runSnap, { once: true });
    return () => {
      window.clearTimeout(tLate);
      window.removeEventListener("load", runSnap);
    };
  }, [pathname]);

  return null;
}
