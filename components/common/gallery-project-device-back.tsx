"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { tryApplyProductListingReturnOnHome } from "@/components/common/product-detail-return-nav";
import { isGalleryProjectPathname } from "@/lib/product-listing-sections";

/**
 * Back perangkat dari `/gallery-project`: pulihkan `/#proyek` di beranda (instan).
 */
export function GalleryProjectDeviceBack() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isGalleryProjectPathname(pathname)) return;

    const onPopState = (): void => {
      queueMicrotask(() => {
        if (window.location.pathname === "/") {
          tryApplyProductListingReturnOnHome();
        }
      });
    };

    const onPageShow = (event: PageTransitionEvent): void => {
      if (!event.persisted || window.location.pathname !== "/") return;
      queueMicrotask(() => tryApplyProductListingReturnOnHome());
    };

    window.addEventListener("popstate", onPopState);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [pathname]);

  return null;
}
