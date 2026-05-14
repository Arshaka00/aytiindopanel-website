"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { clearHomeScrollY } from "@/components/common/return-section";
import { scrollToLandingNavHref } from "@/components/common/home-nav-scroll";

/**
 * Hash di `/` (#produk, #proses, dll.): geser tepat di bawah header.
 * Tidak lagi memblokir saat `homeScrollY` tersimpan (itu yang bikin tertahan di hero);
 * setelah scroll anchor, hapus snapshot Y agar tidak berlawanan dengan pemulihan posisi.
 */
export function HomeInitialHashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;
    const h = window.location.hash;
    if (!h || h === "#") return;

    const full = `${window.location.pathname}${h}`;
    const runSmooth = () => {
      scrollToLandingNavHref(full);
      clearHomeScrollY();
    };
    /** Koreksi sekali setelah aset/layout stabil — `instant` agar tidak bentrok dengan smooth pertama. */
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
