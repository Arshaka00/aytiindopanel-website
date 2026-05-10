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

    scrollToLandingNavHref(`${window.location.pathname}${h}`);
    clearHomeScrollY();
  }, [pathname]);

  return null;
}
