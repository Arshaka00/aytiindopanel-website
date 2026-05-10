"use client";

import dynamic from "next/dynamic";
import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";

import { MobileMeasuredReveal } from "@/components/common/mobile-measured-reveal";
import { usePrefersReducedMotion } from "@/components/common/use-prefers-reduced-motion";

import { LayananIconStrip } from "@/components/aytipanel/layanan-card-icons";
import { CmsText } from "@/components/site-cms/cms-text";
import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";
import { emptyLayananCard } from "@/lib/cms-item-factories";
import type { SiteContent } from "@/lib/site-content-model";
import {
  featuredMobileScrollHintCopy,
} from "@/components/aytipanel/featured-category-layout";
import {
  lightTitleLeadDivider,
  sectionInsetXMdLg,
  sectionMax,
} from "@/components/aytipanel/theme-section-ui";
import {
  MOBILE_HINT_CROSSFADE_RATIO,
  MOBILE_REVEAL_EASE,
  MOBILE_REVEAL_HEIGHT_COLLAPSE_MS,
  MOBILE_REVEAL_HEIGHT_EXPAND_MS,
} from "@/lib/mobile-reveal-constants";
import type { CmsImageTransform } from "@/lib/cms-image-transform";

const SortList = dynamic(
  () => import("@/components/site-cms/cms-sortable-list").then((m) => m.CmsSortableList),
  { ssr: false },
);

type EditableLayananCard = {
  id: string;
  folderSlug: string;
  title: string;
  body: string[];
  photos?: ({ src: string; alt: string } & Partial<CmsImageTransform>)[];
};

function LayananCardBodyParagraphs({ svc, cardIndex }: { svc: EditableLayananCard; cardIndex: number }) {
  const paragraphs = Array.isArray(svc.body) ? svc.body : [];
  return (
    <>
      {paragraphs.map((paragraph, pIdx) => (
        <Fragment key={pIdx}>
          {pIdx > 0 ? (
            <div
              className="layanan-card-body-divider mx-auto my-2.5 h-px w-full max-w-[14rem] shrink-0 rounded-full bg-gradient-to-r from-transparent via-sky-500/30 to-transparent dark:via-sky-400/38"
              aria-hidden
            />
          ) : null}
          <p className="layanan-card-body m-0 antialiased">
            <CmsText
              path={`layanan.cards.${cardIndex}.body.${pIdx}`}
              text={paragraph}
              as="span"
              className="block"
            />
          </p>
        </Fragment>
      ))}
    </>
  );
}

const layananMobileScrollFooterCopy = "Lanjutkan menggulir untuk layanan berikutnya";

const mobileHintLineStart =
  "h-px min-h-px min-w-[0.875rem] max-w-[4.25rem] flex-1 rounded-full bg-gradient-to-r from-transparent via-sky-500/42 to-sky-600/48 dark:via-sky-400/38 dark:to-sky-300/45";

const mobileHintLineEnd =
  "h-px min-h-px min-w-[0.875rem] max-w-[4.25rem] flex-1 rounded-full bg-gradient-to-l from-transparent via-sky-500/42 to-sky-600/48 dark:via-sky-400/38 dark:to-sky-300/45";

const mobileHintLabel =
  "max-w-[min(100%,16rem)] shrink-0 text-center text-[8px] font-medium uppercase leading-tight tracking-[0.08em] text-sky-700 dark:text-sky-300/92";

const layananIconBadgeClass =
  "relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-sky-500/35 bg-gradient-to-br from-sky-50/95 to-white shadow-md ring-1 ring-slate-200/90 transition-[box-shadow,border-color] duration-300 max-md:transition-none group-hover:border-sky-500/45 group-hover:ring-sky-500/20 dark:border-sky-400/35 dark:from-slate-900/90 dark:to-slate-950/95 dark:ring-white/[0.08] dark:group-hover:border-sky-400/50 sm:h-12 sm:w-12 sm:rounded-xl md:h-14 md:w-14 md:rounded-[1.125rem]";

/** Pengunjung mobile: geser horizontal (snap halus); md+ tetap grid. */
const layananVisitorListClass =
  "layanan-visitor-carousel flex w-full list-none flex-row flex-nowrap gap-4 pl-0 " +
  "max-md:snap-x max-md:snap-mandatory max-md:overflow-x-auto max-md:overflow-y-visible max-md:scroll-auto max-md:scrollbar-none " +
  "max-md:overscroll-x-contain max-md:[overscroll-behavior-y:auto] max-md:[-webkit-overflow-scrolling:touch] max-md:pb-2 max-md:[touch-action:manipulation] " +
  "md:grid md:grid-cols-2 md:items-stretch md:gap-4 md:overflow-visible md:snap-none md:pb-0 lg:grid-cols-3";

const layananVisitorItemClass =
  "min-h-0 min-w-0 shrink-0 max-md:w-[min(90vw,24rem)] max-md:min-w-[min(90vw,24rem)] max-md:max-w-[min(90vw,24rem)] max-md:snap-center max-md:last:pr-3 " +
  "md:min-w-0 md:w-auto md:max-w-none md:last:pr-0";

const layananCarouselEdgeFade =
  "pointer-events-none absolute inset-y-0 z-[3] w-6 from-background via-background/55 to-transparent md:hidden";

/** Setelah geser carousel layanan berhenti di kartu terakhir — jeda singkat lalu scroll ke `#produk` (mobile). */
const LAYANAN_CAROUSEL_TO_PRODUK_DELAY_MS = 25;

/** `h-auto` di bawah md = tinggi intrinsic (hindari bolong saat accordion tertutup); `md:h-full` = baris grid desktop rata tinggi. */
const glassSixCardClass =
  "layanan-glass-card layanan-glass-card--tap-safe group relative flex h-auto min-h-0 min-w-0 touch-manipulation flex-col overflow-hidden rounded-2xl px-3.5 py-3.5 sm:px-4 sm:py-4 md:h-full md:px-[1.125rem] md:py-[1.125rem]";


function LayananServiceCardArticle({
  svc,
  index,
  cardsLength,
  stopPhotoStripPropagation,
  prefersReducedMotion,
  mobileExpanded,
  mobileAccordion,
}: {
  svc: EditableLayananCard;
  index: number;
  cardsLength: number;
  stopPhotoStripPropagation: (e: MouseEvent) => void;
  prefersReducedMotion: boolean;
  mobileExpanded: boolean;
  /** Mode CMS sort list: accordion + measured reveal. Pengunjung: kartu penuh tanpa ketuk. */
  mobileAccordion: boolean;
}) {
  const titleId = `layanan-card-title-${index}`;
  const panelId = `layanan-card-panel-${index}`;
  const contentVersion = [svc.title, ...(Array.isArray(svc.body) ? svc.body : [])].join("\u0001");

  const hintGridMs = mobileExpanded
    ? MOBILE_REVEAL_HEIGHT_COLLAPSE_MS
    : MOBILE_REVEAL_HEIGHT_EXPAND_MS;

  return (
    <article className={glassSixCardClass}>
      <span
        className="layanan-card-shimmer-overlay pointer-events-none absolute inset-0 z-[1]"
        aria-hidden
      />

      <div className="relative z-[2] hidden min-h-0 flex-1 flex-col md:flex">
        <div className="absolute left-0 top-1 z-[6] flex items-center gap-0.5 pl-1 sm:left-0 sm:top-1.5 sm:pl-1.5">
          <span
            className="select-none font-mono text-base font-semibold leading-none text-sky-800/90 sm:text-lg dark:text-sky-200/85"
            aria-hidden
          >
            &ldquo;
          </span>
          <span
            className="inline-flex h-6 min-w-[1.75rem] items-center justify-center rounded-full border border-sky-500/18 bg-sky-500/[0.06] px-1.5 font-mono text-[10px] font-semibold tabular-nums tracking-wide text-sky-800 shadow-sm dark:border-sky-400/25 dark:bg-sky-400/[0.08] dark:text-sky-200/90 dark:shadow-none"
            aria-label={`Langkah ${index + 1} dari ${cardsLength}`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col items-stretch">
          <div
            className="relative z-[5] mb-3 flex w-full flex-wrap items-center justify-center border-b-2 border-border pb-3 dark:border-white/15"
            role="group"
            aria-label={`Ikon layanan: ${svc.title}`}
            onClick={stopPhotoStripPropagation}
          >
            <div className="flex min-w-0 justify-center">
              <LayananIconStrip
                folderSlug={svc.folderSlug}
                title={svc.title}
                badgeClassName={layananIconBadgeClass}
              />
            </div>
          </div>
          <div className="w-full border-b-2 border-border pb-2.5 dark:border-white/15">
            <h3 className="layanan-card-title w-full text-balance text-center text-foreground">
              <CmsText
                path={`layanan.cards.${index}.title`}
                text={svc.title}
                as="span"
                className="block"
              />
            </h3>
          </div>
          <div className="layanan-card-description mt-2.5 flex-1 text-foreground/80 dark:text-slate-300/88">
            <LayananCardBodyParagraphs svc={svc} cardIndex={index} />
          </div>
        </div>
      </div>

      <div className="relative z-[2] flex w-full shrink-0 flex-col md:hidden">
        {!mobileAccordion ? (
          <div className="relative rounded-xl outline-none">
            <div className="absolute left-0 top-1 z-[6] flex items-center gap-0.5 pl-1 sm:left-0 sm:top-1.5 sm:pl-1.5">
              <span
                className="select-none font-mono text-base font-semibold leading-none text-sky-800/90 sm:text-lg dark:text-sky-200/85"
                aria-hidden
              >
                &ldquo;
              </span>
              <span
                className="inline-flex h-6 min-w-[1.75rem] items-center justify-center rounded-full border border-sky-500/18 bg-sky-500/[0.06] px-1.5 font-mono text-[10px] font-semibold tabular-nums tracking-wide text-sky-800 shadow-sm dark:border-sky-400/25 dark:bg-sky-400/[0.08] dark:text-sky-200/90 dark:shadow-none"
                aria-label={`Langkah ${index + 1} dari ${cardsLength}`}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <div
              className="relative z-[5] mb-3 flex w-full flex-wrap items-center justify-center border-b-2 border-border pb-3 dark:border-white/15"
              role="group"
              aria-label={`Ikon layanan: ${svc.title}`}
              onClick={stopPhotoStripPropagation}
            >
              <div className="flex min-w-0 justify-center">
                <LayananIconStrip
                  folderSlug={svc.folderSlug}
                  title={svc.title}
                  badgeClassName={layananIconBadgeClass}
                />
              </div>
            </div>
            <div className="w-full border-b-2 border-border pb-2.5 dark:border-white/15">
              <h3
                id={titleId}
                className="layanan-card-title w-full text-balance text-center text-foreground max-md:text-[1.0625rem] max-md:leading-snug"
              >
                <CmsText
                  path={`layanan.cards.${index}.title`}
                  text={svc.title}
                  as="span"
                  className="block"
                />
              </h3>
            </div>
            <div
              className="mx-auto mt-4 h-px w-full max-w-[14rem] rounded-full bg-gradient-to-r from-transparent via-sky-500/28 to-transparent dark:via-sky-400/24"
              aria-hidden
            />
            <div
              id={panelId}
              role="region"
              aria-labelledby={titleId}
              className="layanan-card-description mt-4 space-y-0 px-0.5 pb-0.5 text-foreground/93 dark:text-slate-100/92"
            >
              <LayananCardBodyParagraphs svc={svc} cardIndex={index} />
            </div>
          </div>
        ) : (
          <>
            <div className="relative rounded-xl outline-none">
              <div className="absolute left-0 top-1 z-[6] flex items-center gap-0.5 pl-1 sm:left-0 sm:top-1.5 sm:pl-1.5">
                <span
                  className="select-none font-mono text-base font-semibold leading-none text-sky-800/90 sm:text-lg dark:text-sky-200/85"
                  aria-hidden
                >
                  &ldquo;
                </span>
                <span
                  className="inline-flex h-6 min-w-[1.75rem] items-center justify-center rounded-full border border-sky-500/18 bg-sky-500/[0.06] px-1.5 font-mono text-[10px] font-semibold tabular-nums tracking-wide text-sky-800 shadow-sm dark:border-sky-400/25 dark:bg-sky-400/[0.08] dark:text-sky-200/90 dark:shadow-none"
                  aria-label={`Langkah ${index + 1} dari ${cardsLength}`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div
                className="relative z-[5] mb-3 flex w-full flex-wrap items-center justify-center border-b-2 border-border pb-3 dark:border-white/15"
                role="group"
                aria-label={`Ikon layanan: ${svc.title}`}
                onClick={stopPhotoStripPropagation}
              >
                <div className="flex min-w-0 justify-center">
                  <LayananIconStrip
                    folderSlug={svc.folderSlug}
                    title={svc.title}
                    badgeClassName={layananIconBadgeClass}
                  />
                </div>
              </div>
              <div className="w-full border-b-2 border-border pb-2.5 dark:border-white/15">
                <h3
                  id={titleId}
                  className="layanan-card-title w-full text-balance text-center text-foreground max-md:text-[1.0625rem] max-md:leading-snug"
                >
                  <CmsText
                    path={`layanan.cards.${index}.title`}
                    text={svc.title}
                    as="span"
                    className="block"
                  />
                </h3>
              </div>
            </div>

            <div
              className={`grid min-h-0 overflow-hidden ${mobileExpanded ? "grid-rows-[0fr]" : "grid-rows-[1fr]"}`}
              aria-hidden={mobileExpanded}
              style={
                prefersReducedMotion
                  ? undefined
                  : {
                      transition: `grid-template-rows ${hintGridMs}ms ${MOBILE_REVEAL_EASE}, opacity ${Math.round(hintGridMs * MOBILE_HINT_CROSSFADE_RATIO)}ms ${MOBILE_REVEAL_EASE}`,
                      opacity: mobileExpanded ? 0 : 1,
                    }
              }
            >
              <div className="min-h-0 overflow-hidden">
                <p className="m-0 mt-2 flex w-full min-w-0 items-center justify-center gap-2 px-0.5">
                  <span className={mobileHintLineStart} aria-hidden />
                  <span className={mobileHintLabel}>{featuredMobileScrollHintCopy}</span>
                  <span className={mobileHintLineEnd} aria-hidden />
                </p>
              </div>
            </div>

            <MobileMeasuredReveal
              variant="stagger"
              expanded={mobileExpanded}
              panelId={panelId}
              labelledBy={titleId}
              prefersReducedMotion={prefersReducedMotion}
              contentVersion={contentVersion}
            >
              <div
                className="premium-reveal-stage premium-reveal-stage--1 mx-auto mt-3 h-px w-full max-w-[14rem] rounded-full bg-gradient-to-r from-transparent via-sky-500/28 to-transparent dark:via-sky-400/24"
                aria-hidden
              />
              <div className="premium-reveal-stage premium-reveal-stage--2 layanan-card-description mt-3 space-y-0 px-0.5 text-foreground/93 dark:text-slate-100/92">
                <LayananCardBodyParagraphs svc={svc} cardIndex={index} />
              </div>
              <div className="premium-reveal-stage premium-reveal-stage--3 border-t border-border/65 px-0.5 pb-0.5 pt-4 dark:border-white/12">
                <p className="m-0 flex w-full min-w-0 items-center justify-center gap-2">
                  <span className={mobileHintLineStart} aria-hidden />
                  <span className={`${mobileHintLabel} text-sky-600/90 dark:text-sky-300/88`}>
                    {layananMobileScrollFooterCopy}
                  </span>
                  <span className={mobileHintLineEnd} aria-hidden />
                </p>
              </div>
            </MobileMeasuredReveal>
          </>
        )}
      </div>
    </article>
  );
}


export function LayananRingkasSection({ layanan }: { layanan: SiteContent["layanan"] }) {
  const cards = layanan.cards.map((c) => ({
    id: c.id,
    folderSlug: c.folderSlug,
    title: c.title,
    body: c.body,
    photos: c.photos,
  }));
  const stopPhotoStripPropagation = useCallback((e: MouseEvent) => {
    e.stopPropagation();
  }, []);

  const cms = useSiteCmsOptional();
  const edit = Boolean(cms?.eligible && cms.editMode);

  const prefersReducedMotion = usePrefersReducedMotion();

  const layananCarouselRef = useRef<HTMLUListElement | null>(null);
  const layananCarouselItemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [layananCarouselActive, setLayananCarouselActive] = useState(0);
  const layananCarouselActiveRef = useRef(0);
  layananCarouselActiveRef.current = layananCarouselActive;

  useLayoutEffect(() => {
    const root = layananCarouselRef.current;
    if (!root || cards.length === 0) return;

    const mq = window.matchMedia("(max-width: 767.98px)");

    const updateActiveFromScroll = () => {
      if (!mq.matches) {
        setLayananCarouselActive(0);
        return;
      }
      const rr = root.getBoundingClientRect();
      if (rr.width < 8) return;
      const centerX = rr.left + rr.width / 2;
      let best = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      layananCarouselItemRefs.current.forEach((li, i) => {
        if (!li) return;
        const ir = li.getBoundingClientRect();
        const cx = ir.left + ir.width / 2;
        const d = Math.abs(cx - centerX);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setLayananCarouselActive((prev) => (prev === best ? prev : best));
    };

    updateActiveFromScroll();
    root.addEventListener("scroll", updateActiveFromScroll, { passive: true });
    window.addEventListener("resize", updateActiveFromScroll);
    mq.addEventListener("change", updateActiveFromScroll);
    return () => {
      root.removeEventListener("scroll", updateActiveFromScroll);
      window.removeEventListener("resize", updateActiveFromScroll);
      mq.removeEventListener("change", updateActiveFromScroll);
    };
  }, [cards.length]);

  useEffect(() => {
    if (edit || cards.length <= 1) return;

    const root = layananCarouselRef.current;
    if (!root) return;

    const mq = window.matchMedia("(max-width: 767.98px)");
    let toProdukTimer: ReturnType<typeof setTimeout> | null = null;
    let settleTimer: ReturnType<typeof setTimeout> | null = null;

    const clearToProduk = () => {
      if (toProdukTimer !== null) {
        clearTimeout(toProdukTimer);
        toProdukTimer = null;
      }
    };

    const atHorizontalEnd = () => {
      const maxScroll = Math.max(0, root.scrollWidth - root.clientWidth);
      return maxScroll <= 2 || root.scrollLeft >= maxScroll - 10;
    };

    const scheduleScrollToProduk = () => {
      if (!mq.matches) return;
      if (layananCarouselActiveRef.current !== cards.length - 1 || !atHorizontalEnd()) {
        clearToProduk();
        return;
      }
      clearToProduk();
      toProdukTimer = setTimeout(() => {
        toProdukTimer = null;
        if (!mq.matches) return;
        if (layananCarouselActiveRef.current !== cards.length - 1 || !atHorizontalEnd()) return;
        const produk = document.getElementById("produk");
        if (!produk) return;
        produk.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
      }, LAYANAN_CAROUSEL_TO_PRODUK_DELAY_MS);
    };

    const onScrollMove = () => {
      clearToProduk();
      if (settleTimer !== null) clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        settleTimer = null;
        scheduleScrollToProduk();
      }, 140);
    };

    const onScrollEnd = () => scheduleScrollToProduk();

    root.addEventListener("scroll", onScrollMove, { passive: true });
    root.addEventListener("scrollend", onScrollEnd);

    return () => {
      clearToProduk();
      if (settleTimer !== null) clearTimeout(settleTimer);
      root.removeEventListener("scroll", onScrollMove);
      root.removeEventListener("scrollend", onScrollEnd);
    };
  }, [edit, cards.length, prefersReducedMotion]);

  return (
    <div
      className="relative isolate z-[40] overflow-x-clip overflow-y-visible pb-[clamp(1rem,2.4vw,1.6rem)] pt-[clamp(1rem,2.4vw,1.6rem)] before:pointer-events-none before:absolute before:inset-0 before:z-[1] before:bg-[radial-gradient(ellipse_68%_54%_at_50%_12%,rgba(59,130,246,0.12),transparent_60%),radial-gradient(circle_at_72%_88%,rgba(37,99,235,0.055),transparent_48%)] before:content-[''] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:z-[1] after:h-[clamp(1.75rem,6vw,2.5rem)] after:bg-gradient-to-t after:from-[var(--bg-main)] after:via-[color-mix(in_srgb,var(--bg-main)_88%,transparent)] after:to-transparent dark:before:bg-[radial-gradient(ellipse_68%_54%_at_50%_12%,rgba(59,130,246,0.1),transparent_60%),radial-gradient(circle_at_72%_88%,rgba(37,99,235,0.045),transparent_48%)] dark:after:from-[#020617] dark:after:via-[#020617]/85 dark:after:to-transparent"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-0 bg-gradient-to-br from-sky-50/95 via-[var(--surface-muted)] to-[var(--surface-muted-strong)] before:pointer-events-none before:absolute before:inset-0 before:z-[1] before:bg-[radial-gradient(ellipse_78%_50%_at_50%_-6%,rgba(59,130,246,0.14),transparent_58%),radial-gradient(circle_at_80%_64%,rgba(37,99,235,0.055),transparent_48%)] before:content-[''] dark:from-[#0f172a] dark:via-[#0b1f3a] dark:to-[#020617] dark:before:bg-[radial-gradient(ellipse_78%_50%_at_50%_-6%,rgba(59,130,246,0.12),transparent_58%),radial-gradient(circle_at_80%_64%,rgba(37,99,235,0.065),transparent_48%)]"
        aria-hidden
      />

      <div className={`relative z-10 ${sectionMax} ${sectionInsetXMdLg}`}>
        <section
          id="layanan"
          className="w-full scroll-mt-[var(--section-nav-pass)] space-y-4 md:space-y-5"
          aria-labelledby="layanan-heading"
        >
          <div className="mx-auto max-w-4xl space-y-2 text-center md:space-y-2.5">
            <header className="flex flex-col items-center gap-1.5 md:gap-2">
              <CmsText
                id="layanan-section-label"
                path="layanan.sectionLabel"
                text={layanan.sectionLabel}
                as="p"
                className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-sky-800/95 md:text-[11px] dark:text-sky-300/85"
              />
              <div
                className="h-px w-14 shrink-0 rounded-full bg-gradient-to-r from-transparent via-sky-500/35 to-transparent md:w-16 dark:via-sky-400/45"
                aria-hidden
              />
            </header>

            <h2
              id="layanan-heading"
              className="text-balance text-[1.625rem] font-semibold leading-[1.2] tracking-[-0.02em] text-foreground sm:text-3xl md:text-[2rem] md:leading-[1.18] lg:text-[2.25rem]"
              aria-describedby="layanan-section-label"
            >
              <span className="flex w-full min-w-0 items-center justify-center gap-2.5 sm:gap-3.5">
                <span
                  className="h-px min-h-px min-w-[1.25rem] max-w-[5.5rem] flex-1 rounded-full bg-gradient-to-r from-transparent via-sky-500/38 to-sky-600/55 dark:via-sky-400/42 dark:to-sky-300/58"
                  aria-hidden
                />
                <CmsText
                  path="layanan.heading"
                  text={layanan.heading}
                  as="span"
                  className="max-w-[min(100%,38rem)] min-w-0 bg-gradient-to-r from-sky-700 via-sky-600 to-sky-700 bg-clip-text px-1 text-balance text-center text-[1.625rem] font-semibold leading-[1.2] tracking-[-0.02em] text-transparent sm:text-3xl md:text-[2rem] md:leading-[1.18] lg:text-[2.25rem] dark:from-sky-200 dark:via-sky-300 dark:to-sky-200"
                />
                <span
                  className="h-px min-h-px min-w-[1.25rem] max-w-[5.5rem] flex-1 rounded-full bg-gradient-to-l from-transparent via-sky-500/38 to-sky-600/55 dark:via-sky-400/42 dark:to-sky-300/58"
                  aria-hidden
                />
              </span>
            </h2>

            <div className="flex justify-center">
              <span className={lightTitleLeadDivider} aria-hidden />
            </div>
            <div
              className="mx-auto h-px w-full max-w-2xl rounded-full bg-gradient-to-r from-transparent via-sky-500/25 to-transparent dark:via-sky-300/30"
              aria-hidden
            />

            <CmsText
              path="layanan.lead"
              text={layanan.lead}
              as="p"
              className="mx-auto w-full max-w-none text-pretty text-sm leading-snug text-muted-foreground md:text-base md:leading-[1.55]"
            />
          </div>

          <div className="relative mx-auto w-full max-w-[76rem]">
                        <div className="layanan-grid-shell rounded-[1.125rem] border-2 border-border/90 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-[14px] sm:p-4 md:rounded-[1.375rem] md:p-5 lg:p-6 dark:border-white/15 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_1px_0_rgba(0,0,0,0.28)]">
              {edit && cms ? (
                <div className="space-y-2">
                  <p className="mx-auto max-w-lg text-center text-[11px] leading-snug text-muted-foreground">
                    Mode edit: kartu layanan ditumpuk untuk pengurutan. Seret gagang ⋮⋮ untuk mengubah urutan.
                  </p>
                  <SortList
                    items={layanan.cards}
                    patchPath="layanan.cards"
                    patchDeep={cms.patchDeep}
                    createItem={emptyLayananCard}
                    addLabel="Kartu layanan"
                    renderItem={(card, index) => {
                      const c = card as SiteContent["layanan"]["cards"][number];
                      return (
                        <LayananServiceCardArticle
                          svc={{
                            id: c.id,
                            folderSlug: c.folderSlug,
                            title: c.title,
                            body: c.body,
                            photos: c.photos,
                          }}
                          index={index}
                          cardsLength={layanan.cards.length}
                          stopPhotoStripPropagation={stopPhotoStripPropagation}
                          prefersReducedMotion={prefersReducedMotion}
                          mobileExpanded={false}
                          mobileAccordion
                        />
                      );
                    }}
                  />
                </div>
              ) : (
              <div className="relative max-md:-mx-0.5">
                <div
                  className={`${layananCarouselEdgeFade} inset-y-0 left-0 bg-gradient-to-r`}
                  aria-hidden
                />
                <div
                  className={`${layananCarouselEdgeFade} inset-y-0 right-0 bg-gradient-to-l`}
                  aria-hidden
                />
                <ul
                  ref={layananCarouselRef}
                  className={layananVisitorListClass}
                  aria-label="Kartu layanan — geser ke samping untuk kartu berikutnya"
                >
                {cards.map((svc, index) => (
                  <li
                    key={svc.id}
                    ref={(el) => {
                      layananCarouselItemRefs.current[index] = el;
                    }}
                    className={layananVisitorItemClass}
                    aria-label={`Kartu ${index + 1} dari ${cards.length}`}
                  >
                    <LayananServiceCardArticle
                      svc={svc}
                      index={index}
                      cardsLength={cards.length}
                      stopPhotoStripPropagation={stopPhotoStripPropagation}
                      prefersReducedMotion={prefersReducedMotion}
                      mobileExpanded={false}
                      mobileAccordion={false}
                    />
                  </li>
                ))}
                </ul>
                <div
                  className="mt-3 flex flex-col items-center gap-2 md:hidden"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <div
                    className="flex items-center justify-center gap-1.5"
                    role="group"
                    aria-label={`Indikator kartu: ${layananCarouselActive + 1} dari ${cards.length}`}
                  >
                    {cards.map((_, i) => (
                      <span
                        key={_.id}
                        role="presentation"
                        className={`h-2 shrink-0 rounded-full transition-[width,background-color] duration-300 [transition-timing-function:var(--ease-premium-out)] ${
                          i === layananCarouselActive
                            ? "w-7 bg-sky-500 dark:bg-sky-400"
                            : "w-2 bg-border dark:bg-white/22"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="m-0 text-center font-mono text-[10px] font-medium tabular-nums tracking-wide text-muted-foreground">
                    {layananCarouselActive + 1} / {cards.length} · geser
                  </p>
                </div>
              </div>
              )}
            </div>
          </div>

          <figure className="mx-auto max-w-[34rem]">
            <blockquote className="layanan-quote-panel layanan-quote-panel--premium m-0 rounded-xl border border-border/85 bg-muted-bg/95 px-5 py-4 text-center text-[0.9375rem] font-normal leading-snug text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-[12px] md:rounded-2xl md:px-7 md:py-5 md:text-base md:leading-[1.65] dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-slate-300/90 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <p className="m-0 text-pretty">
                <CmsText path="layanan.quote" text={layanan.quote} as="span" className="block" />
              </p>
            </blockquote>
          </figure>
        </section>
      </div>
    </div>
  );
}
