"use client";

import Link from "next/link";
import {
  prepareNavigateFromListingToProductDetail,
  snapshotReturnPathForInternalDetail,
} from "@/components/common/return-section";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Link> & {
  defaultHomeSectionDomId?: string;
  /**
   * Dari beranda: simpan `/#{id}` tanpa snapshot scroll Y (portofolio, featured produk).
   * Mengabaikan `defaultHomeSectionDomId`.
   */
  listingReturnSectionId?: string;
};

/**
 * Link ke halaman detail dalam situs: simpan lokasi sekarang lebih awal (`pointerdown` + `click`)
 * agar fallback tombol Kembali di iOS / Android konsisten meski `click` tertunda atau gagal sinkronkan.
 */
export function InternalDetailNavLink({
  defaultHomeSectionDomId = "proses",
  listingReturnSectionId,
  onClick,
  onPointerDownCapture,
  ...props
}: Props) {
  const storeReturn = (): void => {
    if (listingReturnSectionId) {
      prepareNavigateFromListingToProductDetail(listingReturnSectionId);
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
