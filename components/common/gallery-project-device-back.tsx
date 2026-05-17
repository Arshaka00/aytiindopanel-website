"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { tryApplyGalleryReturnOnHome } from "@/components/common/gallery-project-return-nav";
import { isGalleryProjectPathname } from "@/lib/product-listing-sections";

/**
 * Back perangkat dari `/gallery-project`: pulihkan `/#beranda` atau `/#proyek` di beranda.
 */
export function GalleryProjectDeviceBack() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isGalleryProjectPathname(pathname)) return;

    const applyHomeReturn = (): void => {
      queueMicrotask(() => {
        if (window.location.pathname !== "/") return;
        tryApplyGalleryReturnOnHome();
      });
    };

    const onPopState = (): void => {
      applyHomeReturn();
    };

    const onPageShow = (event: PageTransitionEvent): void => {
      if (!event.persisted || window.location.pathname !== "/") return;
      applyHomeReturn();
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
