"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { grantCmsChromeSurfaceFromSiteAdminVisit } from "@/lib/cms-chrome-gate";

/** Memicu refresh gate chrome setelah `/site-admin` (izin CMS = origin di `cms-chrome-gate`). */
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
