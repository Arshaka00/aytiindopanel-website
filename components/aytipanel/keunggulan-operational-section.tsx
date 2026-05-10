"use client";

import { motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import type { ComponentType, SVGProps } from "react";
import { useEffect, useMemo, useState } from "react";

import { IconManufacturing } from "@/components/aytipanel/icons";
import { mergeAytiCardClass, mergeAytiIconClass } from "@/lib/ayti-icon-cold";
import {
  lightEyebrow,
  lightTitleLeadDivider,
  sectionInsetX,
  sectionMax,
} from "@/components/aytipanel/theme-section-ui";
import { CmsText } from "@/components/site-cms/cms-text";
import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";
import { emptyKeunggulanCard } from "@/lib/cms-item-factories";
import type {
  KeunggulanCardIconKey,
  KeunggulanStatIconKey,
  SiteContent,
} from "@/lib/site-content-model";

const SortList = dynamic(
  () => import("@/components/site-cms/cms-sortable-list").then((m) => m.CmsSortableList),
  { ssr: false },
);

type SvgProps = SVGProps<SVGSVGElement> & { className?: string };

type CardIcon = ComponentType<SvgProps>;

const stroke = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconRabDoc({ className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" className={mergeAytiIconClass(className)} aria-hidden {...stroke} {...props}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
      <path d="M14 2v6h6M8 13h8M8 17h8M8 9h3" />
    </svg>
  );
}

function IconClipboardScope({ className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" className={mergeAytiIconClass(className)} aria-hidden {...stroke} {...props}>
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
      <path d="M15 2H9a1 1 0 00-1 1v2h8V3a1 1 0 00-1-1zM9 12l2 2 4-4M9 16h6" />
    </svg>
  );
}

function IconStopwatch({ className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" className={mergeAytiIconClass(className)} aria-hidden {...stroke} {...props}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l3 2M9 2h6M12 2v3" />
    </svg>
  );
}

function IconHardHat({ className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" className={mergeAytiIconClass(className)} aria-hidden {...stroke} {...props}>
      <path d="M12 21c-5 0-8-3-8-6V9l16-4v10c0 3-3 6-8 6z" />
      <path d="M4 13h16M8 21v2h8v-2" />
    </svg>
  );
}

function IconFolderTech({ className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" className={mergeAytiIconClass(className)} aria-hidden {...stroke} {...props}>
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z" />
      <path d="M8 13h8M8 17h6" />
    </svg>
  );
}

function IconStatBriefcase({ className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" className={mergeAytiIconClass(className)} aria-hidden {...stroke} {...props}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16M6 11h12" />
    </svg>
  );
}

function IconStatUsers({ className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" className={mergeAytiIconClass(className)} aria-hidden {...stroke} {...props}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function IconStatClock({ className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" className={mergeAytiIconClass(className)} aria-hidden {...stroke} {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function IconStatShield({ className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" className={mergeAytiIconClass(className)} aria-hidden {...stroke} {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

const CARD_ICON_MAP: Record<KeunggulanCardIconKey, CardIcon> = {
  manufacturing: IconManufacturing,
  rab: IconRabDoc,
  clipboard: IconClipboardScope,
  stopwatch: IconStopwatch,
  hardhat: IconHardHat,
  folder: IconFolderTech,
};

const STAT_ICON_MAP: Record<KeunggulanStatIconKey, CardIcon> = {
  briefcase: IconStatBriefcase,
  users: IconStatUsers,
  clock: IconStatClock,
  shield: IconStatShield,
};

const easeOut = [0.16, 1, 0.3, 1] as const;

const viewport = { once: true, amount: 0.12, margin: "0px 0px -10% 0px" } as const;

/**
 * Skala font section (terang/gelap): kartu → KPI (lead pakai skala sama seperti Layanan / Produk).
 * Satuan mengikuti grid 4px; leading disetel untuk baca panjang & heading singkat.
 */
const tz = {
  cardTitle:
    "text-[9px] font-semibold uppercase leading-[1.38] tracking-[0.065em] text-foreground antialiased sm:text-[11px] sm:leading-[1.36] sm:tracking-[0.062em] md:text-xs md:leading-[1.42] md:tracking-[0.058em] dark:text-white",
  cardBody:
    "text-[10px] font-normal leading-[1.6] tracking-[-0.011em] text-muted antialiased sm:text-[11.5px] sm:leading-[1.64] md:text-[13px] md:leading-[1.68] md:tracking-[-0.012em] dark:text-slate-400",
  statKicker:
    "text-[9px] font-semibold uppercase leading-snug tracking-[0.11em] text-foreground antialiased sm:text-[13px] sm:tracking-[0.09em] md:text-sm md:tracking-[0.085em] dark:text-white",
  statVal:
    "text-[1rem] font-semibold tabular-nums leading-none tracking-[-0.03em] text-foreground antialiased sm:text-[1.1875rem] md:text-[1.375rem] dark:text-white",
  statLbl:
    "text-[8px] font-medium uppercase leading-tight tracking-[0.1em] text-muted antialiased sm:text-[9px] md:text-[10px] md:tracking-[0.11em] dark:text-slate-500",
} as const;

function KeunggulanProcurementCardArticle({
  item,
  index,
  r,
}: {
  item: SiteContent["keunggulan"]["cards"][number];
  index: number;
  r: boolean;
}) {
  const Icon = CARD_ICON_MAP[item.iconKey] ?? IconManufacturing;
  return (
    <article
      className={mergeAytiCardClass(
        "group/card relative flex h-full min-h-0 flex-col items-center overflow-hidden rounded-[0.8125rem] border border-border bg-card px-3 py-3.5 text-center shadow-[var(--shadow-card)] backdrop-blur-sm transition-[border-color,box-shadow,transform] duration-200 sm:rounded-[0.875rem] sm:px-4 sm:py-[1.125rem] md:rounded-xl md:px-5 md:py-[1.25rem] dark:border-white/[0.07] dark:bg-white/[0.028] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] motion-safe:md:hover:border-sky-500/35 motion-safe:md:hover:shadow-[var(--shadow-card-hover)] motion-safe:dark:md:hover:border-sky-500/32 motion-safe:dark:md:hover:bg-white/[0.04] motion-safe:dark:md:hover:shadow-[0_0_0_1px_rgba(56,189,248,0.07),0_14px_40px_-20px_rgba(56,189,248,0.18)] motion-safe:md:hover:[transform:translateY(-2px)]",
      )}
      aria-labelledby={`keunggulan-card-heading-${index}`}
    >
      <motion.div
        className="relative mb-2.5 size-9 shrink-0 sm:mb-3 sm:size-10 md:mb-3.5 md:size-[2.75rem]"
        whileHover={
          r
            ? {}
            : {
                scale: 1.03,
                transition: { type: "spring", stiffness: 420, damping: 20 },
              }
        }
      >
        <span
          className="absolute -inset-0.5 rounded-full bg-sky-500/30 blur-lg opacity-70 transition-opacity duration-200 group-hover/card:opacity-90"
          aria-hidden
        />
        <span
          className="relative flex size-9 items-center justify-center rounded-full border border-sky-500/35 bg-gradient-to-br from-sky-500/14 to-blue-600/10 shadow-sm ring-1 ring-sky-500/15 sm:size-10 md:size-[2.75rem] dark:border-sky-400/32 dark:from-sky-500/[0.16] dark:to-blue-600/[0.09] dark:shadow-[0_0_18px_-3px_rgba(56,189,248,0.45)] dark:ring-white/[0.05]"
          aria-hidden
        >
          <Icon className="relative z-[1] size-[1.125rem] text-sky-700 sm:size-[1.1875rem] md:size-[1.3125rem] dark:text-white/[0.97]" />
        </span>
      </motion.div>

      <h3
        id={`keunggulan-card-heading-${index}`}
        className={`${tz.cardTitle} w-full text-balance hyphens-none`}
      >
        <CmsText
          path={`keunggulan.cards.${index}.title`}
          text={item.title}
          as="span"
          className="block"
        />
      </h3>
      <p className={`mt-2 w-full min-h-0 flex-1 text-pretty sm:mt-2.5 ${tz.cardBody}`}>
        <CmsText path={`keunggulan.cards.${index}.body`} text={item.body} as="span" className="block" />
      </p>
    </article>
  );
}

export function KeunggulanOperationalSection({ keunggulan }: { keunggulan: SiteContent["keunggulan"] }) {
  const prefersReducedMotion = useReducedMotion();
  // Treat mobile (≤ 767.98px) sebagai "reduced motion" untuk Framer Motion.
  // Outer <ScrollRevealSection> (CSS) sudah meng-handle fade-in section di mobile;
  // stagger Framer Motion per kartu di mobile justru menjadi sumber jank scroll
  // karena setiap motion.li menambah subscriber & rAF callback dari Framer Motion.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767.98px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  const r = (prefersReducedMotion ?? false) || isMobile;
  const cms = useSiteCmsOptional();
  const edit = Boolean(cms?.eligible && cms.editMode);

  const procurementMapped = keunggulan.cards.map((c) => ({
    ...c,
    Icon: CARD_ICON_MAP[c.iconKey] ?? IconManufacturing,
  }));

  const statsMapped = keunggulan.stats.map((s) => ({
    ...s,
    Icon: STAT_ICON_MAP[s.iconKey] ?? IconStatBriefcase,
  }));

  const v = useMemo(() => {
    const dQuick = r ? 0 : 0.48;
    const dCard = r ? 0 : 0.4;

    return {
      orchestrator: {
        hidden: {},
        visible: {
          transition: {
            staggerChildren: r ? 0 : 0.2,
            delayChildren: r ? 0 : 0.03,
          },
        },
      } as const,
      headerFade: {
        hidden: { opacity: r ? 1 : 0, y: r ? 0 : 14 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: dQuick, ease: easeOut },
        },
      } as const,
      panel: {
        hidden: { opacity: r ? 1 : 0, y: r ? 0 : 14 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: r ? 0 : 0.42,
            ease: easeOut,
            staggerChildren: r ? 0 : 0.068,
            delayChildren: r ? 0 : 0.06,
          },
        },
      } as const,
      card: {
        hidden: { opacity: r ? 1 : 0, y: r ? 0 : 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: dCard, ease: easeOut },
        },
      } as const,
      statStrip: {
        hidden: { opacity: r ? 1 : 0, y: r ? 0 : 14 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: r ? 0 : 0.5, ease: easeOut },
        },
      } as const,
    };
  }, [r]);

  return (
    <section
      id="keunggulan"
      className="relative scroll-mt-[var(--section-nav-pass)] border-y border-border bg-muted-bg py-5 text-foreground [-webkit-font-smoothing:antialiased] dark:border-white/[0.06] dark:bg-[#030712] dark:text-white md:py-8"
      aria-labelledby="keunggulan-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_88%_48%_at_50%_-8%,rgba(56,189,248,0.07),transparent_52%),radial-gradient(ellipse_55%_36%_at_100%_92%,rgba(37,99,235,0.04),transparent_48%)] dark:bg-[radial-gradient(ellipse_88%_48%_at_50%_-8%,rgba(56,189,248,0.11),transparent_52%),radial-gradient(ellipse_55%_36%_at_100%_92%,rgba(37,99,235,0.06),transparent_48%),radial-gradient(ellipse_48%_32%_at_0%_78%,rgba(59,130,246,0.05),transparent_46%)]" />
      <div className={`relative ${sectionMax} ${sectionInsetX}`}>
        {/*
          `initial="hidden"` — kartu mulai dari opacity:0 / y:14 lalu stagger ke visible saat
          intersect. Variants `v.*` sudah meng-collapse hidden→visible jika user reduced-motion
          (lihat memo `v` di atas). #keunggulan + descendants juga punya CSS guard di globals.css
          yang menonaktifkan transisi opacity/transform global agar Framer Motion stagger tidak
          macet di Safari mobile.
        */}
        <motion.div
          className="space-y-3 md:space-y-4"
          variants={v.orchestrator}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <motion.header
            className="mx-auto max-w-4xl space-y-2 text-center md:space-y-2.5 sm:max-w-[46rem] md:max-w-[50rem]"
            variants={v.headerFade}
          >
            <div className="flex flex-col items-center gap-1.5 md:gap-2">
              <CmsText
                id="keunggulan-section-label"
                path="keunggulan.sectionLabel"
                text={keunggulan.sectionLabel}
                as="p"
                className={`${lightEyebrow} text-[11px] md:text-xs`}
              />
              <div
                className="h-px w-14 shrink-0 rounded-full bg-gradient-to-r from-transparent via-sky-500/35 to-transparent md:w-16 dark:via-sky-400/45"
                aria-hidden
              />
            </div>

            <h2
              id="keunggulan-heading"
              className="text-balance text-[1.625rem] font-semibold leading-[1.2] tracking-[-0.02em] text-foreground sm:text-3xl md:text-[2rem] md:leading-[1.18] lg:text-[2.25rem]"
              aria-describedby="keunggulan-section-label"
            >
              <span className="flex w-full min-w-0 items-center justify-center gap-2.5 sm:gap-3.5">
                <span
                  className="h-px min-h-px min-w-[1.25rem] max-w-[5.5rem] flex-1 rounded-full bg-gradient-to-r from-transparent via-sky-500/38 to-sky-600/55 dark:via-sky-400/42 dark:to-sky-300/58"
                  aria-hidden
                />
                <CmsText
                  path="keunggulan.heading"
                  text={keunggulan.heading}
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
              path="keunggulan.lead"
              text={keunggulan.lead}
              as="p"
              className="mx-auto max-w-[min(100%,38rem)] text-pretty text-center text-sm leading-snug text-muted-foreground sm:max-w-[40rem] md:max-w-[42rem] md:text-base md:leading-[1.55]"
            />
          </motion.header>

          {edit && cms ? (
            <div className="space-y-2">
              <p className="mx-auto max-w-lg text-center text-[11px] leading-snug text-muted-foreground">
                <CmsText path="keunggulan.editorHint" text={keunggulan.editorHint} as="span" className="inline" />
              </p>
              <SortList
                items={keunggulan.cards}
                patchPath="keunggulan.cards"
                patchDeep={cms.patchDeep}
                createItem={emptyKeunggulanCard}
                addLabel={keunggulan.editorAddCardLabel}
                renderItem={(item, index) => (
                  <KeunggulanProcurementCardArticle
                    item={item as SiteContent["keunggulan"]["cards"][number]}
                    index={index}
                    r={r}
                  />
                )}
              />
            </div>
          ) : (
            <motion.ol
              className="grid list-none grid-cols-2 gap-2 p-0 sm:gap-2.5 md:grid-cols-3 md:gap-3.5"
              variants={v.panel}
            >
              {procurementMapped.map(({ id }, index) => (
                <motion.li key={id} className="min-h-0" variants={v.card}>
                  <KeunggulanProcurementCardArticle
                    item={keunggulan.cards[index]}
                    index={index}
                    r={r}
                  />
                </motion.li>
              ))}
            </motion.ol>
          )}

          <motion.footer
            className={mergeAytiCardClass(
              "rounded-xl border border-border bg-card px-3.5 py-3.5 shadow-[var(--shadow-card)] md:rounded-[1.05rem] md:px-5 md:py-[1.125rem] dark:border-white/[0.08] dark:bg-white/[0.022] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_18px_48px_-26px_rgba(0,0,0,0.7)] max-md:rounded-[11px]",
            )}
            variants={v.statStrip}
          >
            <div className="flex flex-col items-center gap-4 lg:gap-5 lg:pt-0.5">
              <div className="mx-auto w-full max-w-[22rem] border-b border-border pb-4 dark:border-white/[0.1] sm:max-w-xl md:max-w-2xl">
                <p className={`text-balance text-center ${tz.statKicker}`}>
                  <CmsText path="keunggulan.statsHeading" text={keunggulan.statsHeading} as="span" className="inline" />
                </p>
              </div>
              <ul className="grid w-full max-w-full grid-cols-4 justify-items-center gap-x-1.5 gap-y-4 px-0.5 sm:flex sm:flex-wrap sm:items-end sm:justify-between sm:gap-x-4 sm:gap-y-3 sm:px-0 lg:flex-nowrap lg:justify-end lg:gap-7 xl:gap-8">
                {statsMapped.map(({ value, label, Icon: SI, labelMobileLines }, si) => (
                  <li
                    key={`${label}-${si}`}
                    className="flex min-w-0 flex-col items-center text-center max-sm:px-0.5 sm:px-0 sm:flex-1 sm:basis-[22%] sm:min-w-0 lg:max-w-none"
                  >
                    <span className="inline-flex rounded-lg border border-sky-500/30 bg-gradient-to-br from-sky-500/12 to-blue-600/8 p-1.5 shadow-sm sm:p-2 md:p-2.5 dark:border-sky-400/28 dark:from-sky-500/10 dark:to-blue-600/[0.06] dark:shadow-[0_0_12px_-4px_rgba(56,189,248,0.26)]">
                      <SI className="size-5 text-sky-700 sm:size-[1.375rem] md:size-7 dark:text-sky-300/95" />
                    </span>
                    <div className="mt-3 flex min-w-0 flex-col items-center gap-1.5 sm:mt-3.5 md:mt-4">
                      <CmsText
                        path={`keunggulan.stats.${si}.value`}
                        text={value}
                        as="span"
                        className={`${tz.statVal}${value.includes("★") ? " tracking-[0.04em]" : ""}`}
                      />
                      <span className={`${tz.statLbl} max-w-[9.75rem] text-pretty sm:max-w-none`}>
                        {labelMobileLines ? (
                          <>
                            <span className="sm:hidden">
                              <CmsText
                                path={`keunggulan.stats.${si}.labelMobileLines.0`}
                                text={labelMobileLines[0]}
                                as="span"
                                className="inline"
                              />
                              <br />
                              <CmsText
                                path={`keunggulan.stats.${si}.labelMobileLines.1`}
                                text={labelMobileLines[1]}
                                as="span"
                                className="inline"
                              />
                            </span>
                            <CmsText
                              path={`keunggulan.stats.${si}.label`}
                              text={label}
                              as="span"
                              className="hidden sm:inline"
                            />
                          </>
                        ) : (
                          <CmsText
                            path={`keunggulan.stats.${si}.label`}
                            text={label}
                            as="span"
                            className="inline"
                          />
                        )}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.footer>
        </motion.div>
      </div>
    </section>
  );
}
