"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

import {
  lightSectionInsetX,
  lightSectionMax,
  lightSurfaceBandWhite,
} from "@/components/aytipanel/light-section-ui";
import { CmsImage } from "@/components/site-cms/cms-image";
import { CmsText } from "@/components/site-cms/cms-text";
import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";
import { emptyIndustry, emptyPartner } from "@/lib/cms-item-factories";
import type { SiteContent } from "@/lib/site-content-model";
import { mergeAytiCardClass } from "@/lib/ayti-icon-cold";

const SortList = dynamic(
  () => import("@/components/site-cms/cms-sortable-list").then((m) => m.CmsSortableList),
  { ssr: false },
);

/** Kartu logo (Our Customer & Our Partner) — satu baris marquee (mobile lebih rapat) */
const marqueeLogoCardClass = mergeAytiCardClass(
  "flex h-[4.75rem] w-[10rem] shrink-0 flex-col items-stretch justify-center gap-0 rounded-lg border border-border/85 bg-card/95 px-1.5 py-1.5 text-center shadow-[var(--shadow-card)] ring-1 ring-black/[0.04] backdrop-blur-[2px] transition-[transform,box-shadow,border-color] duration-300 [transition-timing-function:var(--ease-premium-soft)] md:h-[7rem] md:w-[14rem] md:rounded-xl md:gap-0 md:px-2 md:py-2 md:ring-black/[0.05] md:motion-safe:hover:-translate-y-0.5 md:motion-safe:hover:border-sky-500/25 md:motion-safe:hover:shadow-[var(--shadow-card-hover)] dark:border-white/[0.1] dark:bg-[linear-gradient(165deg,rgba(15,23,42,0.94)_0%,rgba(10,16,28,0.97)_100%)] dark:ring-white/[0.06]",
);

/** Lebar viewport = 5 kartu + 4 celah (selaras `gap-1.5 sm:gap-2.5 md:gap-4` pada track). */
const marqueeFiveCardsViewportClass =
  "mx-auto min-w-0 w-full max-w-[min(100%,calc(5*10rem+4*0.375rem))] sm:max-w-[min(100%,calc(5*10rem+4*0.625rem))] md:max-w-[min(100%,calc(5*14rem+4*1rem))]";

const industriesMarqueeWrapClass =
  "partner-marquee-mask motion-reduce:hidden overflow-x-clip " + marqueeFiveCardsViewportClass;

const partnersMarqueeWrapClass =
  "partner-marquee-mask motion-reduce:hidden overflow-x-clip " + marqueeFiveCardsViewportClass;

const industriesStaticStripClass =
  "hidden motion-reduce:flex motion-reduce:flex-nowrap motion-reduce:justify-start motion-reduce:gap-1.5 motion-reduce:overflow-x-auto motion-reduce:px-1 motion-reduce:pb-1 motion-reduce:scrollbar-none sm:motion-reduce:gap-2.5 md:motion-reduce:gap-4 " +
  marqueeFiveCardsViewportClass;

const partnersStaticStripClass =
  "hidden motion-reduce:flex motion-reduce:flex-nowrap motion-reduce:justify-start motion-reduce:gap-1.5 motion-reduce:overflow-x-auto motion-reduce:px-1 motion-reduce:pb-1 motion-reduce:scrollbar-none sm:motion-reduce:gap-2.5 md:motion-reduce:gap-4 " +
  marqueeFiveCardsViewportClass;

/** Urutan tampil acak stabil (bukan urutan JSON). */
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: readonly T[], seedStr: string): T[] {
  if (items.length <= 1) return [...items];
  const arr = [...items];
  const rng = mulberry32(hashSeed(seedStr));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Area gambar di kartu marquee — `flex-1` mengisi tinggi kartu; logo object-contain tanpa distorsi. */
const marqueeLogoImageShellClass = "relative flex-1 min-h-0 w-full min-w-0";

const logoImageContainClass = "object-contain object-center";

export function CustomersPartnersSectionClient({ data }: { data: SiteContent["customersPartners"] }) {
  const cms = useSiteCmsOptional();
  const edit = Boolean(cms?.eligible && cms.editMode);

  const industries = data.industries;
  const partners = data.partners;

  const industriesDisplayOrder = useMemo(() => {
    const fingerprint = industries.map((x) => `${x.id}\u001f${x.logoSrc}`).join("\u001e");
    return seededShuffle(industries, `customers-partners-ind|${fingerprint}`);
  }, [industries]);

  const industryIndexById = useMemo(() => {
    const m = new Map<string, number>();
    industries.forEach((row, i) => m.set(row.id, i));
    return m;
  }, [industries]);

  const partnerIndexById = useMemo(() => {
    const m = new Map<string, number>();
    partners.forEach((row, i) => m.set(row.id, i));
    return m;
  }, [partners]);

  /** Hanya entri yang punya file logo — marquee tidak memuat slot kosong. */
  const industriesMarqueeItems = useMemo(
    () => industriesDisplayOrder.filter((x) => Boolean(x.logoSrc?.trim())),
    [industriesDisplayOrder],
  );

  const partnersMarqueeItems = useMemo(
    () => partners.filter((x) => Boolean(x.logoSrc?.trim())),
    [partners],
  );

  const renderMarqueeIndustries = () => (
    <div className={industriesMarqueeWrapClass}>
      <div className="customer-marquee-track flex min-w-0 w-max max-w-none gap-1.5 sm:gap-2.5 md:gap-4">
        {[...industriesMarqueeItems, ...industriesMarqueeItems].map((item, index) => {
          const oi = industryIndexById.get(item.id) ?? 0;
          const src = item.logoSrc!.trim();
          return (
            <div key={`${item.id}-${index}`} className={marqueeLogoCardClass}>
              <div className={marqueeLogoImageShellClass}>
                <CmsImage
                  fill
                  srcPath={`customersPartners.industries.${oi}.logoSrc`}
                  src={src}
                  alt={item.logoAlt?.trim() || item.label}
                  uploadScope="industry"
                  uploadSegment={`scroll-${oi}`}
                  className="block h-full w-full min-h-0"
                  imageClassName={logoImageContainClass}
                  sizes="(max-width: 480px) 100px, (max-width: 768px) 130px, 180px"
                  enableZoom={false}
                  imageTransform={item.logoAdjust}
                  transformPatchPath={`customersPartners.industries.${oi}.logoAdjust`}
                />
              </div>
              <span className="sr-only">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStaticIndustries = () => (
    <div className={industriesStaticStripClass}>
      {industriesDisplayOrder.map((item) => {
        const oi = industryIndexById.get(item.id) ?? 0;
        const src = item.logoSrc?.trim();
        if (!src) return null;
        return (
          <div key={item.id} className={marqueeLogoCardClass}>
            <div className={marqueeLogoImageShellClass}>
              <CmsImage
                fill
                srcPath={`customersPartners.industries.${oi}.logoSrc`}
                src={src}
                alt={item.logoAlt?.trim() || item.label}
                uploadScope="industry"
                uploadSegment={`static-${oi}`}
                className="block h-full w-full min-h-0"
                imageClassName={logoImageContainClass}
                sizes="(max-width: 480px) 100px, (max-width: 768px) 130px, 180px"
                enableZoom={false}
                imageTransform={item.logoAdjust}
                transformPatchPath={`customersPartners.industries.${oi}.logoAdjust`}
              />
            </div>
            <span className="sr-only">{item.label}</span>
          </div>
        );
      })}
    </div>
  );

  const renderMarqueePartners = () => (
    <div className={partnersMarqueeWrapClass}>
      <div className="partner-marquee-track flex min-w-0 w-max max-w-none gap-1.5 sm:gap-2.5 md:gap-4">
        {[...partnersMarqueeItems, ...partnersMarqueeItems].map((p, index) => {
          const pi = partnerIndexById.get(p.id) ?? 0;
          const src = p.logoSrc!.trim();
          return (
            <div key={`${p.id}-${index}`} className={marqueeLogoCardClass}>
              <div className={marqueeLogoImageShellClass}>
                <CmsImage
                  fill
                  srcPath={`customersPartners.partners.${pi}.logoSrc`}
                  src={src}
                  alt={p.logoAlt}
                  uploadScope="partners"
                  uploadSegment={`scroll-${pi}`}
                  className="block h-full w-full min-h-0"
                  imageClassName={logoImageContainClass}
                  sizes="(max-width: 480px) 120px, (max-width: 768px) 150px, 220px"
                  enableZoom={false}
                  imageTransform={p.logoAdjust}
                  transformPatchPath={`customersPartners.partners.${pi}.logoAdjust`}
                />
              </div>
              <span className="sr-only">{p.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStaticPartners = () => (
    <div className={partnersStaticStripClass}>
      {partners.map((p, pi) => {
        const src = p.logoSrc?.trim();
        if (!src) return null;
        return (
          <div key={p.id} className={marqueeLogoCardClass}>
            <div className={marqueeLogoImageShellClass}>
              <CmsImage
                fill
                srcPath={`customersPartners.partners.${pi}.logoSrc`}
                src={src}
                alt={p.logoAlt}
                uploadScope="partners"
                uploadSegment={`marquee-${pi}`}
                className="block h-full w-full min-h-0"
                imageClassName={logoImageContainClass}
                sizes="(max-width: 480px) 120px, (max-width: 768px) 150px, 220px"
                enableZoom={false}
                imageTransform={p.logoAdjust}
                transformPatchPath={`customersPartners.partners.${pi}.logoAdjust`}
              />
            </div>
            <span className="sr-only">{p.name}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <section
      id="customers-partners"
      className={`scroll-mt-[var(--section-nav-pass)] relative overflow-hidden ${lightSurfaceBandWhite} ${lightSectionInsetX} py-5 md:py-11`}
      aria-labelledby="trust-customer-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-30%,rgba(56,189,248,0.09),transparent_58%)] dark:bg-[radial-gradient(ellipse_75%_48%_at_50%_-22%,rgba(56,189,248,0.14),transparent_52%)]"
        aria-hidden
      />
      <div
        className={`relative z-[1] ${lightSectionMax} min-w-0 max-w-full space-y-3 overflow-x-clip md:space-y-5`}
      >
        <header className="mx-auto max-w-3xl px-1 pb-0 text-center md:px-2 md:pb-0.5">
          <h2
            id="trust-customer-heading"
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center"
          >
            <span
              className="hidden h-px min-h-px min-w-[2.25rem] max-w-[5rem] flex-1 rounded-full bg-gradient-to-r from-transparent via-sky-500/40 to-sky-600/35 sm:block dark:via-sky-400/38 dark:to-sky-300/45"
              aria-hidden
            />
            <span className="max-w-[min(100%,20rem)] bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-sm font-semibold tracking-[-0.015em] text-transparent sm:text-base md:text-lg md:leading-snug dark:from-slate-100 dark:via-white dark:to-slate-100">
              <CmsText path="customersPartners.heading" text={data.heading} as="span" className="inline" />
            </span>
            <span
              className="hidden h-px min-h-px min-w-[2.25rem] max-w-[5rem] flex-1 rounded-full bg-gradient-to-l from-transparent via-sky-500/40 to-sky-600/35 sm:block dark:via-sky-400/38 dark:to-sky-300/45"
              aria-hidden
            />
          </h2>
        </header>

        {edit && cms ? (
          <div className="space-y-3 rounded-2xl border border-sky-500/22 bg-slate-950/35 p-3 shadow-[0_12px_40px_-24px_rgba(56,189,248,0.35)] backdrop-blur-sm dark:bg-slate-950/50 md:space-y-4 md:p-5">
            <CmsText
              path="customersPartners.editorIndustriesLabel"
              text={data.editorIndustriesLabel}
              as="p"
              className="text-center text-[11px] text-muted-foreground"
            />
            <SortList
              items={industries}
              patchPath="customersPartners.industries"
              patchDeep={cms.patchDeep}
              createItem={emptyIndustry}
              addLabel={data.editorAddIndustryLabel}
              renderItem={(item, i) => {
                const row = item as SiteContent["customersPartners"]["industries"][number];
                return (
                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative h-[4.75rem] w-[10rem] shrink-0 overflow-hidden rounded-lg border border-white/15 bg-card/80 md:h-[7rem] md:w-[14rem]">
                      <CmsImage
                        fill
                        srcPath={`customersPartners.industries.${i}.logoSrc`}
                        src={row.logoSrc || ""}
                        alt={row.logoAlt || row.label}
                        uploadScope="industry"
                        uploadSegment={`row-${i}`}
                        className="block h-full w-full min-h-0"
                        imageClassName={logoImageContainClass}
                        sizes="(max-width:768px) 160px, 224px"
                        enableZoom={false}
                        imageTransform={row.logoAdjust}
                        transformPatchPath={`customersPartners.industries.${i}.logoAdjust`}
                      />
                    </div>
                    <CmsText
                      path={`customersPartners.industries.${i}.label`}
                      text={row.label}
                      as="span"
                      className="min-w-0 flex-1 text-sm font-medium text-foreground"
                    />
                  </div>
                );
              }}
            />
            <p className="border-t border-white/[0.08] pt-3 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:border-white/[0.1]">
              Partner
            </p>
            <SortList
              items={partners}
              patchPath="customersPartners.partners"
              patchDeep={cms.patchDeep}
              createItem={emptyPartner}
              addLabel={data.editorAddPartnerLabel}
              renderItem={(p, pi) => {
                const row = p as SiteContent["customersPartners"]["partners"][number];
                return (
                  <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center">
                    <div className="relative h-[4.75rem] w-[10rem] shrink-0 overflow-hidden rounded-lg border border-white/15 bg-card md:h-[7rem] md:w-[14rem]">
                      <CmsImage
                        fill
                        srcPath={`customersPartners.partners.${pi}.logoSrc`}
                        src={row.logoSrc || ""}
                        alt={row.logoAlt}
                        uploadScope="partners"
                        uploadSegment={`edit-${pi}`}
                        className="block h-full w-full min-h-0"
                        imageClassName={logoImageContainClass}
                        imageTransform={row.logoAdjust}
                        transformPatchPath={`customersPartners.partners.${pi}.logoAdjust`}
                        sizes="(max-width:768px) 160px, 224px"
                        enableZoom={false}
                      />
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      <CmsText
                        path={`customersPartners.partners.${pi}.name`}
                        text={row.name}
                        as="span"
                        className="block font-medium text-foreground"
                      />
                    </span>
                  </div>
                );
              }}
            />
          </div>
        ) : null}

        <div
          className={`space-y-3 md:space-y-5 ${edit && cms ? "mt-4 rounded-2xl border border-dashed border-sky-500/30 bg-sky-500/[0.04] p-3 md:mt-5 md:p-4" : ""}`}
        >
          {edit && cms ? (
            <p className="text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700/90 dark:text-sky-200/80">
              Pratinjau strip (sama seperti di halaman)
            </p>
          ) : null}
          {renderStaticIndustries()}
          {renderMarqueeIndustries()}
          <div className="relative pt-3 md:pt-5">
            <div
              className="absolute left-1/2 top-0 h-px w-[min(92vw,26rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-sky-500/28 to-transparent dark:via-sky-400/32"
              aria-hidden
            />
            <h3 className="mb-2.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-1 pt-0.5 text-center md:mb-4 md:gap-x-3 md:gap-y-1.5 md:px-2 md:pt-1">
              <span
                className="hidden h-px min-h-px min-w-[2.25rem] max-w-[5rem] flex-1 rounded-full bg-gradient-to-r from-transparent via-sky-500/40 to-sky-600/35 sm:block dark:via-sky-400/38 dark:to-sky-300/45"
                aria-hidden
              />
              <span className="max-w-[min(100%,20rem)] bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-sm font-semibold tracking-[-0.015em] text-transparent sm:text-base md:text-lg md:leading-snug dark:from-slate-100 dark:via-white dark:to-slate-100">
                <CmsText
                  path="customersPartners.partnerHeading"
                  text={data.partnerHeading}
                  as="span"
                  className="inline"
                />
              </span>
              <span
                className="hidden h-px min-h-px min-w-[2.25rem] max-w-[5rem] flex-1 rounded-full bg-gradient-to-l from-transparent via-sky-500/40 to-sky-600/35 sm:block dark:via-sky-400/38 dark:to-sky-300/45"
                aria-hidden
              />
            </h3>
            {renderStaticPartners()}
            {renderMarqueePartners()}
          </div>
        </div>
      </div>
    </section>
  );
}
