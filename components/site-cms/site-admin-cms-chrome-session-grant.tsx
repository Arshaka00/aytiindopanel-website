"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { grantCmsChromeSurfaceFromSiteAdminVisit } from "@/lib/cms-chrome-gate";

/** Set izin bilah CMS mengambang setelah kunjungan ke /site-admin (host production; localhost/LAN dev tidak wajib). */
export function SiteAdminCmsChromeSessionGrant() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/site-admin" || pathname.startsWith("/site-admin/")) {
      grantCmsChromeSurfaceFromSiteAdminVisit();
      window.dispatchEvent(new Event("ayti-cms-chrome-session"));
    }
  }, [pathname]);

  return null;
}
