"use client";

import Link from "next/link";
import {
  prepareNavigateFromListingToProductDetail,
  prepareNavigateToProductDetail,
  setGalleryProjectReturnFromPortfolioCta,
  snapshotReturnPathForInternalDetail,
} from "@/components/common/return-section";
import {
  normalizeProductListingReturnSectionId,
  parseProductDetailSlug,
} from "@/lib/product-listing-sections";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Link> & {
  defaultHomeSectionDomId?: string;
  /**
   * Dari beranda ke produk: simpan `/#{id}` di storage produk (featured produk, dll.).
   * Mengabaikan `defaultHomeSectionDomId`.
   */
  listingReturnSectionId?: string;
  /** CTA Gallery di section Portfolio — set return `/#proyek` (abaikan prop lain). */
  galleryFromPortfolioCta?: boolean;
};

/**
 * Link ke halaman detail dalam situs: simpan lokasi sekarang lebih awal (`pointerdown` + `click`)
 * agar fallback tombol Kembali di iOS / Android konsisten meski `click` tertunda atau gagal sinkronkan.
 */
export function InternalDetailNavLink({
  defaultHomeSectionDomId = "proses",
  listingReturnSectionId,
  galleryFromPortfolioCta,
  onClick,
  onPointerDownCapture,
  ...props
}: Props) {
  const storeReturn = (): void => {
    if (galleryFromPortfolioCta) {
      setGalleryProjectReturnFromPortfolioCta();
      return;
    }
    const slug =
      typeof props.href === "string" ? parseProductDetailSlug(props.href) : null;
    if (slug) {
      prepareNavigateToProductDetail(
        slug,
        listingReturnSectionId ?? defaultHomeSectionDomId,
      );
      return;
    }
    if (listingReturnSectionId) {
      prepareNavigateFromListingToProductDetail(
        normalizeProductListingReturnSectionId(listingReturnSectionId),
      );
      return;
    }
    snapshotReturnPathForInternalDetail(defaultHomeSectionDomId);
  };

  const capture: Props["onPointerDownCapture"] = (e) => {
    storeReturn();
    onPointerDownCapture?.(e);
  };
  const handleClick: Props["onClick"] = (e) => {
    storeReturn();
    onClick?.(e);
  };
  return <Link {...props} onPointerDownCapture={capture} onClick={handleClick} />;
}
