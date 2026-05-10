/**
 * Layout hero dual-gambar + petunjuk bar mobile untuk section featured produk
 * (Utama, Solusi, Accessories).
 */

export const featuredDualImageHalfFrame =
  "relative min-w-0 flex-1 overflow-hidden rounded-[1.125rem] shadow-[0_16px_48px_-12px_rgba(15,23,42,0.35)] ring-1 ring-black/[0.06] dark:shadow-[0_20px_56px_-14px_rgba(0,0,0,0.55)] dark:ring-white/[0.09]";

export const featuredDualImageViewportHeights =
  "relative h-[128px] w-full sm:h-[188px] md:h-[332px] lg:h-[352px] lg:max-h-[384px]";

export const featuredMobileTapHintLine =
  "h-px min-h-px min-w-[0.875rem] max-w-[4.25rem] flex-1 rounded-full bg-gradient-to-r from-transparent via-blue-500/42 to-blue-600/48 dark:via-blue-400/38 dark:to-blue-300/45";

export const featuredMobileTapHintLineEnd =
  "h-px min-h-px min-w-[0.875rem] max-w-[4.25rem] flex-1 rounded-full bg-gradient-to-l from-transparent via-blue-500/42 to-blue-600/48 dark:via-blue-400/38 dark:to-blue-300/45";

export const featuredMobileTapHintLabel =
  "max-w-[min(100%,18rem)] shrink-0 text-center text-[8px] font-medium uppercase leading-tight tracking-[0.08em] text-blue-800 dark:text-blue-300/92";

/** Mode scroll-driven mobile (sel selaras section Layanan). */
export const featuredMobileScrollHintCopy = "Detail mengikuti gulir";
export const featuredMobileScrollFooterCopy = "Lanjutkan menggulir untuk kategori berikutnya";

/** Di atas grup tautan ke halaman detail produk (featured Utama / Solusi / Accessories). */
export const featuredProdukDetailNavHintCopy = "Klik untuk melihat detail produk";
export const featuredProdukDetailNavHintClass =
  "m-0 max-w-[min(100%,22rem)] shrink-0 text-center text-[10px] font-medium leading-tight text-muted-foreground dark:text-white/65";

/** Baris teks petunjuk + garis gradient kiri/kanan. */
export const featuredProdukDetailNavHintRowClass =
  "flex w-full min-w-0 items-center justify-center gap-2 px-0.5";

/** Pembungkus petunjuk: garis atas/bawah pendek & bergradient (bukan border full-width). */
export const featuredProdukDetailNavHintWrapClass =
  "flex flex-col items-center gap-1 py-0 md:gap-1.5";

/** Garis atas petunjuk — lebih panjang dari garis bawah. */
export const featuredProdukDetailNavHintRuleTopClass =
  "block h-px w-full max-w-[min(100%,24rem)] shrink-0 rounded-full bg-gradient-to-r from-transparent via-blue-500/48 to-transparent dark:via-sky-400/46";

/** Garis bawah petunjuk — lebih pendek. */
export const featuredProdukDetailNavHintRuleBottomClass =
  "block h-px w-full max-w-[min(100%,10rem)] shrink-0 rounded-full bg-gradient-to-r from-transparent via-blue-500/48 to-transparent dark:via-sky-400/46";
