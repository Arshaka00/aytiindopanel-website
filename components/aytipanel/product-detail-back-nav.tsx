"use client";

import { usePathname } from "next/navigation";

import { BackButton } from "@/components/common/BackButton";
import {
  buildProductDetailBackFallbackHref,
  parseProductDetailSlug,
} from "@/lib/product-listing-sections";
import { mergeAytiCtaClass } from "@/lib/ayti-icon-cold";

const premiumBackClass = mergeAytiCtaClass(
  "group inline-flex min-h-10 touch-manipulation items-center gap-2 rounded-full border border-white/10 bg-[color-mix(in_srgb,var(--card)_12%,transparent)] py-2 pr-3.5 pl-2 text-[13px] font-semibold tracking-[0.01em] text-foreground/85 shadow-none backdrop-blur-sm backdrop-saturate-125 ring-1 ring-inset ring-white/6 transition-[transform,box-shadow,border-color,background-color,color] duration-300 ease-[var(--ease-premium-soft)] hover:border-white/18 hover:bg-[color-mix(in_srgb,var(--card)_22%,transparent)] hover:text-foreground hover:shadow-[0_6px_20px_-14px_rgba(56,189,248,0.2)] motion-safe:hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background [-webkit-tap-highlight-color:transparent] dark:border-white/8 dark:bg-[color-mix(in_srgb,rgb(15_23_42)_16%,transparent)] dark:text-white/82 dark:shadow-none dark:ring-white/5 dark:hover:border-white/14 dark:hover:bg-[color-mix(in_srgb,rgb(15_23_42)_28%,transparent)] dark:hover:text-white/95 md:min-h-11 md:pr-4 md:pl-2.5 md:text-sm",
);

const backIconClass =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-sky-400/14 bg-transparent text-[15px] font-semibold leading-none text-sky-800/85 shadow-none transition-[transform,border-color] duration-300 group-hover:scale-[1.04] group-hover:border-sky-400/28 dark:text-sky-100/85";

type ProductDetailBackNavProps = {
  className?: string;
};

/** Offset di bawah header + padding artikel (`py-4` / `md:py-8` / `lg:py-10`), sedikit lebih tinggi. */
const pinnedBarTopClass =
  "top-[calc(var(--site-header-height,3.65rem)+0.125rem)] md:top-[calc(var(--site-header-height,3.65rem)+0.625rem)] lg:top-[calc(var(--site-header-height,3.65rem)+1rem)]";

/**
 * Tombol kembali detail produk — target lewat `resolveProductDetailBackTarget` di BackButton.
 */
export function ProductDetailBackNav({ className = "" }: ProductDetailBackNavProps) {
  const pathname = usePathname();
  const slug = parseProductDetailSlug(pathname ?? "");

  return (
    <BackButton
      label="Kembali"
      destination="previous"
      fallbackHref={buildProductDetailBackFallbackHref(slug)}
      className={className ? `${premiumBackClass} ${className}` : premiumBackClass}
      icon={<span className={backIconClass} aria-hidden>←</span>}
    />
  );
}

/**
 * Tombol kembali tetap di kiri atas saat scroll (fixed di bawah header).
 * Spacer di alur dokumen menjaga hero tidak tertutup saat halaman di atas.
 */
export function ProductDetailBackNavPinned() {
  return (
    <>
      <div
        className="mb-2.5 min-h-10 sm:mb-3 sm:min-h-11 md:mb-3.5"
        aria-hidden
      />
      <div
        className={`pointer-events-none fixed inset-x-0 z-40 px-4 sm:px-5 md:px-6 ${pinnedBarTopClass}`}
      >
        <div className="pointer-events-auto mx-auto flex w-full max-w-5xl justify-start">
          <ProductDetailBackNav />
        </div>
      </div>
    </>
  );
}
