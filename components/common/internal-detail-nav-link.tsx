"use client";

import Link from "next/link";
import { snapshotReturnPathForInternalDetail } from "@/components/common/return-section";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Link> & {
  defaultHomeSectionDomId?: string;
};

/**
 * Link ke halaman detail dalam situs: simpan lokasi sekarang lebih awal (`pointerdown` + `click`)
 * agar fallback tombol Kembali di iOS / Android konsisten meski `click` tertunda atau gagal sinkronkan.
 */
export function InternalDetailNavLink({
  defaultHomeSectionDomId = "proses",
  onClick,
  onPointerDownCapture,
  ...props
}: Props) {
  const capture: Props["onPointerDownCapture"] = (e) => {
    snapshotReturnPathForInternalDetail(defaultHomeSectionDomId);
    onPointerDownCapture?.(e);
  };
  const handleClick: Props["onClick"] = (e) => {
    snapshotReturnPathForInternalDetail(defaultHomeSectionDomId);
    onClick?.(e);
  };
  return <Link {...props} onPointerDownCapture={capture} onClick={handleClick} />;
}
