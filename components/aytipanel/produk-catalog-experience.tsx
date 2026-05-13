"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  useDeferredValue,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";

import { InternalDetailNavLink } from "@/components/common/internal-detail-nav-link";
import { useWhatsAppPhoneDigits } from "@/components/common/whatsapp-phone-context";
import {
  catalogSectionFilters,
  type ProdukCatalogListItem,
} from "@/lib/produk-catalog-build";
import { mergeAytiCardClass, mergeAytiCtaClass, mergeAytiMediaClass } from "@/lib/ayti-icon-cold";
import { generateWhatsAppLink } from "@/utils/whatsapp";

function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

/** Dua panel foto per kartu; jika hanya satu sumber, crop kiri/kanan agar terasa dua sudut pandang. */
function CatalogDiptychPhotos({
  leftSrc,
  leftAlt,
  rightSrc,
  rightAlt,
  sameSource,
  sizes,
}: {
  leftSrc: string;
  leftAlt: string;
  rightSrc: string;
  rightAlt: string;
  /** true = satu file yang sama di kedua panel (posisi objek beda). */
  sameSource: boolean;
  sizes: string;
}) {
  const [leftLoaded, setLeftLoaded] = useState(false);
  const [rightLoaded, setRightLoaded] = useState(false);
  const bothLoaded = leftLoaded && rightLoaded;

  const leftObject = sameSource
    ? "object-cover object-[22%_center] sm:object-[25%_center]"
    : "object-cover object-center";
  const rightObject = sameSource
    ? "object-cover object-[78%_center] sm:object-[75%_center]"
    : "object-cover object-center";

  return (
    <div
      className={mergeAytiMediaClass(
        "relative aspect-[3/2] min-h-[9rem] w-full overflow-hidden bg-neutral-200 sm:aspect-[16/9] sm:min-h-0 lg:aspect-[2/1] dark:bg-neutral-950",
      )}
    >
      {/* Diptych: rail lebih ramping di mobile → lebih banyak ruang foto */}
      <div className="absolute inset-0 grid min-h-0 grid-cols-[1fr_minmax(5px,7px)_1fr] sm:grid-cols-[1fr_minmax(8px,10px)_1fr]">
        <div className="relative min-h-0 overflow-hidden">
          <Image
            src={leftSrc}
            alt={leftAlt}
            fill
            sizes={sizes}
            quality={88}
            loading="lazy"
            decoding="async"
            className={`${leftObject} [transform:translate3d(0,0,0)] transition-[transform,opacity] duration-700 ease-out motion-reduce:transition-none ${
              leftLoaded ? "opacity-100" : "opacity-0"
            } group-hover/image:scale-[1.02] motion-reduce:group-hover/image:scale-100`}
            onLoad={() => setLeftLoaded(true)}
          />
        </div>
        <div
          className="relative min-h-0 bg-gradient-to-b from-neutral-300 via-neutral-200 to-neutral-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),inset_1px_0_0_rgba(255,255,255,0.45),inset_-1px_0_0_rgba(15,23,42,0.06)] dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),inset_1px_0_0_rgba(255,255,255,0.05),inset_-1px_0_0_rgba(0,0,0,0.4)]"
          aria-hidden
        >
          {/* Selaras pemisah konten kartu: gradient fade + aksen via-border */}
          <span className="pointer-events-none absolute inset-y-[10%] left-1/2 w-[1.5px] max-w-[2px] -translate-x-1/2 rounded-full bg-gradient-to-b from-transparent via-border/95 to-transparent dark:via-white/[0.18]" />
        </div>
        <div className="relative min-h-0 overflow-hidden">
          <Image
            src={rightSrc}
            alt={rightAlt}
            fill
            sizes={sizes}
            quality={88}
            loading="lazy"
            decoding="async"
            className={`${rightObject} [transform:translate3d(0,0,0)] transition-[transform,opacity] duration-700 ease-out motion-reduce:transition-none ${
              rightLoaded ? "opacity-100" : "opacity-0"
            } group-hover/image:scale-[1.02] motion-reduce:group-hover/image:scale-100`}
            onLoad={() => setRightLoaded(true)}
          />
        </div>
      </div>
      <div
        className={`pointer-events-none absolute inset-0 z-[1] bg-muted transition-opacity duration-500 ease-out motion-reduce:transition-none ${
          bothLoaded ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden
      >
        <div className="absolute inset-0 animate-pulse motion-reduce:animate-none" />
      </div>
    </div>
  );
}

function CatalogCard({
  tile,
  index,
}: {
  tile: ProdukCatalogListItem;
  index: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.li
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
      transition={{
        duration: 0.42,
        ease: [0.22, 0.61, 0.36, 1],
        delay: reduceMotion ? 0 : Math.min(index * 0.035, 0.35),
      }}
      className="group/card relative flex min-h-0 min-w-0"
    >
      {/* Bingkai gradient + bayangan — lapisan premium di luar kartu */}
      <div className="pointer-events-none absolute -inset-px z-0 rounded-[1.4rem] bg-gradient-to-br from-sky-400/35 via-violet-400/15 to-blue-700/25 opacity-90 blur-[0.5px] dark:from-sky-500/25 dark:via-blue-950/40 dark:to-slate-950/60 dark:opacity-100" aria-hidden />
      <div className="relative rounded-[1.35rem] bg-gradient-to-br from-sky-400/45 via-slate-200/70 to-blue-600/35 p-[1px] shadow-[0_22px_56px_-32px_rgba(14,165,233,0.22),0_8px_24px_-16px_rgba(15,23,42,0.12)] dark:from-sky-500/30 dark:via-white/[0.14] dark:to-blue-950/55 dark:shadow-[0_28px_64px_-36px_rgba(0,0,0,0.75),0_0_0_1px_rgba(56,189,248,0.08)]">
      <InternalDetailNavLink
        href={`/produk/${tile.slug}`}
        scroll
        defaultHomeSectionDomId="produk"
        className={mergeAytiCardClass(
          "group/image relative flex h-full min-h-[17.75rem] w-full touch-manipulation flex-col overflow-hidden rounded-[1.3rem] border border-white/70 bg-gradient-to-b from-card via-card/95 to-muted/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-12px_24px_-16px_rgba(14,165,233,0.06),0_12px_36px_-28px_rgba(15,23,42,0.12)] transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] active:scale-[0.997] [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-1 [@media(hover:hover)_and_(pointer:fine)]:hover:border-sky-300/45 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_0_60px_-20px_rgba(56,189,248,0.12),0_28px_56px_-28px_rgba(14,165,233,0.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500/80 dark:border-white/[0.1] dark:from-[rgba(17,24,39,0.96)] dark:via-[rgba(15,23,42,0.9)] dark:to-[rgba(12,17,28,0.85)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-20px_40px_-24px_rgba(56,189,248,0.08),0_20px_48px_-28px_rgba(0,0,0,0.55)] dark:[@media(hover:hover)_and_(pointer:fine)]:hover:border-sky-400/35 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_36px_72px_-36px_rgba(56,189,248,0.18)] sm:min-h-[20rem] md:min-h-[21.25rem]",
        )}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[3px] bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-90 dark:via-white/35 dark:opacity-100"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-x-8 top-[3px] z-[5] h-px bg-gradient-to-r from-white/50 via-white/80 to-white/50 opacity-60 dark:from-white/10 dark:via-white/25 dark:to-white/10" aria-hidden />
        <div className="relative overflow-hidden">
          <CatalogDiptychPhotos
            leftSrc={tile.imageSrc}
            leftAlt={tile.imageAlt}
            rightSrc={tile.imageSrcSecondary ?? tile.imageSrc}
            rightAlt={
              tile.imageSrcSecondary
                ? tile.imageAltSecondary ?? tile.title
                : tile.imageAlt
            }
            sameSource={!tile.imageSrcSecondary}
            sizes="(max-width: 639px) 48vw, (max-width: 1023px) 26vw, (max-width: 1535px) 21vw, 340px"
          />
          <span className="pointer-events-none absolute left-2.5 top-2.5 z-[12] rounded-full border border-white/30 bg-gradient-to-b from-white/15 to-black/40 px-2.5 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_6px_20px_-4px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-xl dark:border-white/25 dark:from-white/10 dark:to-black/50 sm:left-3 sm:top-3 sm:px-3">
            Detail
          </span>
        </div>

        <div className="relative flex min-h-[7.75rem] flex-1 flex-col gap-0 bg-gradient-to-b from-background/65 via-background/40 to-muted/15 px-3.5 pb-3.5 pt-3.5 sm:min-h-[8.25rem] sm:px-5 sm:pb-5 sm:pt-4 md:min-h-[8.75rem] md:pb-5 md:pt-4 dark:from-white/[0.045] dark:via-transparent dark:to-transparent">
          <div className="pointer-events-none absolute inset-x-3.5 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/35 to-transparent sm:inset-x-5 md:inset-x-5 dark:via-sky-400/25" aria-hidden />
          <h3 className="pb-2.5 text-[1.0625rem] font-semibold leading-snug tracking-[-0.025em] text-foreground sm:pb-3 md:text-[1.125rem] dark:text-white">
            {tile.title}
          </h3>
          <div className="h-px w-full shrink-0 bg-gradient-to-r from-transparent via-border/80 to-transparent dark:via-white/[0.14]" aria-hidden />
          {tile.subtitle.trim() ? (
            <p className="relative line-clamp-2 border-l-[3px] border-sky-500/35 pl-3 pt-2.5 text-[0.9375rem] leading-relaxed text-muted-foreground/95 sm:pt-3 md:text-[0.95rem] dark:border-sky-400/30 dark:text-slate-300/88">
              {tile.subtitle}
            </p>
          ) : (
            <span className="block min-h-[1.75rem] pt-2" aria-hidden />
          )}
          <div className="relative mx-auto mt-2.5 w-full max-w-[17.5rem] pt-1 sm:mt-3">
            <div
              className="relative flex min-h-[3rem] w-full items-center gap-3 overflow-hidden rounded-[0.875rem] border border-sky-500/30 bg-gradient-to-b from-sky-500/[0.07] via-white/60 to-slate-50/90 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_28px_-14px_rgba(14,165,233,0.28)] transition-[border-color,box-shadow,background-image] duration-300 dark:border-sky-400/[0.22] dark:from-sky-500/15 dark:via-slate-900/55 dark:to-slate-950/95 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_10px_36px_-16px_rgba(0,0,0,0.55)] [@media(hover:hover)_and_(pointer:fine)]:group-hover/image:border-sky-400/45 [@media(hover:hover)_and_(pointer:fine)]:group-hover/image:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_12px_36px_-12px_rgba(56,189,248,0.28)] dark:[@media(hover:hover)_and_(pointer:fine)]:group-hover/image:border-sky-400/40 dark:[@media(hover:hover)_and_(pointer:fine)]:group-hover/image:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_14px_40px_-14px_rgba(56,189,248,0.22)]"
              role="presentation"
            >
              <span
                className="pointer-events-none absolute inset-x-8 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-sky-400/45 to-transparent dark:via-sky-400/35"
                aria-hidden
              />
              <span
                className="pointer-events-none absolute -left-8 top-1/2 h-16 w-24 -translate-y-1/2 rounded-full bg-sky-400/15 blur-2xl dark:bg-sky-500/10"
                aria-hidden
              />
              <span
                className="relative z-[2] h-9 w-1 shrink-0 rounded-full bg-gradient-to-b from-sky-400/70 via-sky-500/50 to-blue-600/55 shadow-[0_0_12px_rgba(56,189,248,0.35)] dark:from-sky-300/40 dark:via-sky-400/35 dark:to-blue-700/40"
                aria-hidden
              />
              <span className="relative z-[2] min-w-0 flex-1 text-center">
                <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-950/95 dark:text-sky-100/95">
                  Lihat selengkapnya
                </span>
                <span className="mx-auto mt-1 block h-px w-[72%] max-w-[9rem] rounded-full bg-gradient-to-r from-transparent via-sky-500/45 to-transparent opacity-90 dark:via-sky-400/40" aria-hidden />
              </span>
              <span className="relative z-[2] flex size-9 shrink-0 items-center justify-center rounded-full border border-sky-500/35 bg-gradient-to-br from-white via-sky-50/95 to-sky-100/90 text-sky-800 shadow-[0_2px_12px_-4px_rgba(14,165,233,0.45),inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-white/90 dark:border-sky-400/40 dark:from-sky-500/30 dark:via-slate-900 dark:to-slate-950 dark:text-sky-100 dark:shadow-[0_4px_18px_-6px_rgba(56,189,248,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] dark:ring-white/10 [@media(hover:hover)_and_(pointer:fine)]:group-hover/image:border-sky-400/55 [@media(hover:hover)_and_(pointer:fine)]:group-hover/image:shadow-[0_6px_22px_-6px_rgba(56,189,248,0.45),inset_0_1px_0_rgba(255,255,255,1)] dark:[@media(hover:hover)_and_(pointer:fine)]:group-hover/image:from-sky-400/35">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="ayti-icon-cold size-3.5 translate-x-px transition-transform duration-500 ease-out [@media(hover:hover)_and_(pointer:fine)]:group-hover/image:translate-x-0.5"
                  aria-hidden
                >
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </InternalDetailNavLink>
      </div>
    </motion.li>
  );
}

function EmptyCatalogState({
  onClear,
}: {
  onClear: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={mergeAytiCardClass(
        "mx-auto flex max-w-lg flex-col items-center justify-center rounded-2xl border border-dashed border-border/65 bg-gradient-to-b from-muted-bg/50 to-muted-bg/25 px-5 py-8 text-center shadow-[0_8px_32px_-20px_rgba(15,23,42,0.12)] md:rounded-[1.35rem] md:py-10 dark:border-white/[0.08] dark:from-white/[0.04] dark:to-transparent dark:shadow-[0_12px_40px_-24px_rgba(0,0,0,0.45)]",
      )}
    >
      <div className="mb-3 flex size-11 items-center justify-center rounded-lg border border-border/70 bg-background/80 shadow-sm md:mb-4 md:size-12 md:rounded-xl dark:bg-white/[0.04]">
        <svg viewBox="0 0 24 24" className="ayti-icon-cold size-7 text-muted-foreground" aria-hidden fill="none">
          <path
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path d="M11 8v5l3 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-lg font-semibold tracking-tight text-foreground">Tidak ada produk yang cocok</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        Ubah kata kunci atau kosongkan filter untuk melihat seluruh katalog.
      </p>
      <button
        type="button"
        onClick={onClear}
        className={mergeAytiCtaClass(
          "mt-5 min-h-11 touch-manipulation rounded-full border border-border/90 bg-background px-5 py-2 text-sm font-semibold text-foreground shadow-sm transition-[background-color,box-shadow,transform] duration-300 hover:bg-muted-bg-strong hover:shadow-md active:scale-[0.99] dark:border-white/[0.1] dark:bg-white/[0.06]",
        )}
      >
        Reset pencarian
      </button>
    </motion.div>
  );
}

export type ProdukCatalogExperienceProps = {
  items: ProdukCatalogListItem[];
};

export function ProdukCatalogExperience({ items }: ProdukCatalogExperienceProps) {
  const waDigits = useWhatsAppPhoneDigits();
  const inquiryHref = generateWhatsAppLink(
    "Halo PT AYTI INDO PANEL,\nSaya tertarik dengan produk anda, saya ingin diskusi.\nTerima kasih.",
    waDigits,
  );

  const filters = useMemo(() => catalogSectionFilters(items), [items]);
  const [section, setSection] = useState<string>("all");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const debouncedQuery = useDebounced(deferredQuery, 180);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return items.filter((it) => {
      if (section !== "all" && it.sectionKey !== section) return false;
      if (!q) return true;
      return (
        it.title.toLowerCase().includes(q) ||
        it.subtitle.toLowerCase().includes(q) ||
        it.slug.toLowerCase().includes(q)
      );
    });
  }, [items, section, debouncedQuery]);

  const clearFilters = useCallback(() => {
    setSection("all");
    setQuery("");
  }, []);

  const activeFilter =
    section !== "all" || query.trim().length > 0;

  return (
    <>
      <div className="sticky top-[calc(var(--site-header-height,3.65rem)+0.5rem+env(safe-area-inset-top,0px))] z-40 mb-2 sm:mb-3 md:mb-5">
        <div className="w-full">
          <div
            className={mergeAytiCardClass(
              "relative w-full overflow-hidden rounded-2xl border border-border/45 bg-gradient-to-b from-background/92 via-background/88 to-muted/30 shadow-[0_12px_44px_-18px_rgba(14,165,233,0.14),0_2px_0_0_rgba(255,255,255,0.06)_inset] backdrop-blur-2xl supports-[backdrop-filter]:from-background/78 dark:border-white/[0.07] dark:from-[rgba(15,23,42,0.92)] dark:via-[rgba(15,23,42,0.85)] dark:to-[rgba(15,23,42,0.72)] dark:shadow-[0_16px_48px_-20px_rgba(0,0,0,0.65),0_1px_0_0_rgba(255,255,255,0.04)_inset] md:rounded-[1.35rem]",
            )}
          >
            <div
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/35 to-transparent dark:via-sky-400/25"
              aria-hidden
            />
            <div className="relative px-2.5 pb-2.5 pt-3 sm:px-4 sm:pb-4 sm:pt-4">
              <div
                className="flex flex-wrap justify-center gap-1.5 sm:gap-2.5"
                role="tablist"
                aria-label="Filter kategori"
              >
                {filters.map((f) => {
                  const active = section === f.key;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setSection(f.key)}
                      className={`touch-manipulation shrink-0 whitespace-nowrap rounded-full border px-3 py-2 text-[12px] font-medium tracking-wide transition-[background-color,border-color,box-shadow,color,transform] duration-300 sm:px-4 sm:text-[13px] min-h-11 active:scale-[0.98] ${
                        active
                          ? "border-sky-400/40 bg-gradient-to-b from-sky-500/18 to-sky-600/10 text-sky-950 shadow-[0_2px_12px_-4px_rgba(14,165,233,0.35)] ring-1 ring-sky-400/25 dark:border-sky-400/35 dark:from-sky-400/18 dark:to-sky-600/8 dark:text-sky-50 dark:shadow-[0_2px_14px_-4px_rgba(56,189,248,0.25)] dark:ring-sky-400/20"
                          : "border-border/55 bg-background/50 text-muted-foreground hover:border-border hover:bg-muted/45 hover:text-foreground dark:border-white/[0.07] dark:bg-white/[0.04] dark:hover:border-white/15 dark:hover:bg-white/[0.07]"
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>

              <div className="mx-auto mt-2.5 w-full max-w-xl sm:mt-3.5 sm:max-w-2xl lg:max-w-3xl">
                <div className="flex w-full flex-col items-stretch gap-1.5 sm:flex-row sm:items-center sm:justify-center sm:gap-3">
                  <label className="relative min-w-0 flex-1 sm:max-w-lg lg:max-w-xl">
                    <span className="sr-only">Cari produk</span>
                    <svg
                      className="ayti-icon-cold pointer-events-none absolute left-3.5 top-1/2 size-[1.125rem] -translate-y-1/2 text-muted-foreground/90"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                      />
                    </svg>
                    <input
                      type="search"
                      enterKeyHint="search"
                      inputMode="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Cari nama produk, kata kunci…"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      className="min-h-11 w-full rounded-full border border-border/55 bg-background/95 py-2.5 pl-11 pr-4 text-base leading-normal text-foreground shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] outline-none ring-0 transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground/85 focus:border-sky-400/45 focus:bg-background focus:shadow-[inset_0_1px_2px_rgba(15,23,42,0.04),0_0_0_3px_rgba(56,189,248,0.11)] dark:border-white/[0.09] dark:bg-white/[0.05] dark:focus:border-sky-400/40"
                    />
                  </label>

                  {activeFilter ? (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className={mergeAytiCtaClass(
                        "min-h-11 w-full shrink-0 touch-manipulation rounded-full border border-border/60 bg-background/70 px-5 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-[border-color,background-color,color,box-shadow] active:bg-muted/50 hover:border-sky-400/30 hover:bg-muted/40 hover:text-foreground sm:w-auto dark:border-white/[0.1] dark:bg-white/[0.04] dark:hover:bg-white/[0.08]",
                      )}
                    >
                      Reset
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <EmptyCatalogState key="empty" onClear={clearFilters} />
        ) : (
          <motion.ul
            key={`grid-${section}-${debouncedQuery}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid list-none grid-cols-1 gap-2.5 p-0 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5"
          >
            {filtered.map((tile, i) => (
              <CatalogCard key={tile.slug} tile={tile} index={i} />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Mobile CTA — kompak; tap target ~44px (min-h-11) */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 md:hidden">
        <div className="pointer-events-auto relative overflow-hidden border-t border-border/40 bg-gradient-to-b from-background/98 via-background/95 to-muted/35 shadow-[0_-10px_36px_-16px_rgba(15,23,42,0.09)] backdrop-blur-xl dark:border-white/[0.06] dark:from-[rgba(15,23,42,0.98)] dark:via-[rgba(15,23,42,0.95)] dark:to-[rgba(11,17,28,0.93)] dark:shadow-[0_-12px_40px_-18px_rgba(0,0,0,0.38)]">
          <div
            className="pointer-events-none absolute inset-x-10 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-sky-400/35 to-transparent dark:via-sky-400/22"
            aria-hidden
          />
          <div className="relative px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))]">
            <a
              href={inquiryHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Hubungi kami melalui WhatsApp"
              className={mergeAytiCtaClass(
                "flex min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 px-3.5 py-2.5 text-sm font-semibold leading-snug tracking-tight text-white shadow-[0_8px_24px_-10px_rgba(37,99,235,0.38),inset_0_1px_0_rgba(255,255,255,0.26)] ring-1 ring-white/12 transition-[filter,transform,box-shadow] duration-200 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400/90 [@media(hover:hover)_and_(pointer:fine)]:shadow-[0_10px_28px_-10px_rgba(37,99,235,0.42),inset_0_1px_0_rgba(255,255,255,0.28)] [@media(hover:hover)_and_(pointer:fine)]:brightness-[1.03]",
              )}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/14 shadow-[inset_0_1px_0_rgba(255,255,255,0.32)] ring-1 ring-white/22">
                <svg viewBox="0 0 24 24" className="ayti-icon-cold size-4 shrink-0" aria-hidden fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.123 1.035 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </span>
              <span className="select-none">Hubungi kami</span>
            </a>
          </div>
        </div>
      </div>

      <div
        className="shrink-0 md:hidden"
        style={{ height: "calc(4.5rem + env(safe-area-inset-bottom, 0px))" }}
        aria-hidden
      />
    </>
  );
}
