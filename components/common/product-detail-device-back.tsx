"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { isProductDetailPathname } from "@/lib/product-listing-sections";
import { tryApplyProductListingReturnOnHome } from "@/components/common/product-detail-return-nav";

/**
 * Tombol back perangkat (Android / iOS gesture): selaraskan dengan Kembali UI —
 * pulihkan `/#produk-utama` | `/#produk-solusi` | `/#accessories` dari session.
 */
export function ProductDetailDeviceBack() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isProductDetailPathname(pathname)) return;

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
