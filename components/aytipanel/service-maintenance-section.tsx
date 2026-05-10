"use client";

import { useCallback, useState, type RefCallback } from "react";

import { ProductB2BCard } from "@/components/aytipanel/product-b2b-card";
import type {
  ProductB2BCardData,
  ProductB2BCategoryData,
} from "@/components/aytipanel/products-b2b-data";
import { IconWhatsApp } from "@/components/aytipanel/icons";
import { WhatsAppCTAButton } from "@/components/aytipanel/whatsapp-cta-button";
import { featuredMobileScrollHintCopy } from "@/components/aytipanel/featured-category-layout";
import {
  lightEyebrow,
  lightSectionInsetX,
  lightSectionMax,
  lightSurfaceBandWarm,
  lightTitleLeadDivider,
} from "@/components/aytipanel/light-section-ui";
import { MobileMeasuredReveal } from "@/components/common/mobile-measured-reveal";
import { usePrefersReducedMotion } from "@/components/common/use-prefers-reduced-motion";
import {
  MOBILE_HINT_CROSSFADE_RATIO,
  MOBILE_REVEAL_EASE,
  MOBILE_REVEAL_HEIGHT_COLLAPSE_MS,
  MOBILE_REVEAL_HEIGHT_EXPAND_MS,
} from "@/lib/mobile-reveal-constants";
import { generateWhatsAppMessage } from "@/utils/whatsapp";
import { CmsText } from "@/components/site-cms/cms-text";

const serviceMaintenanceScrollFooterCopy = "Lanjutkan menggulir untuk layanan berikutnya";

const mobileHintLineStart =
  "h-px min-h-px min-w-[0.875rem] max-w-[4.25rem] flex-1 rounded-full bg-gradient-to-r from-transparent via-sky-500/42 to-sky-600/48 dark:via-sky-400/38 dark:to-sky-300/45";

const mobileHintLineEnd =
  "h-px min-h-px min-w-[0.875rem] max-w-[4.25rem] flex-1 rounded-full bg-gradient-to-l from-transparent via-sky-500/42 to-sky-600/48 dark:via-sky-400/38 dark:to-sky-300/45";

const mobileHintLabel =
  "max-w-[min(100%,16rem)] shrink-0 text-center text-[8px] font-medium uppercase leading-tight tracking-[0.08em] text-sky-700 dark:text-sky-300/92";

function ServiceMaintenanceCardArticle({
  maintenance,
  card,
  cardIndex,
  mobileScrollMode,
  mobileExpanded,
  mobileOpenDetailIndex,
  onMobileDetailToggle,
  cardObserveRef,
  prefersReducedMotion,
}: {
  maintenance: ProductB2BCategoryData;
  card: ProductB2BCardData;
  cardIndex: number;
  mobileScrollMode: boolean;
  mobileExpanded: boolean;
  /** Index kartu yang detail-nya terbuka di mobile (`<details>`); -1 = tidak dipakai (scroll mode). */
  mobileOpenDetailIndex: number;
  onMobileDetailToggle: (cardIndex: number, nextOpen: boolean) => void;
  cardObserveRef?: RefCallback<HTMLElement | null>;
  prefersReducedMotion: boolean;
}) {
  const titleId = `service-maint-card-title-${cardIndex}`;
  const panelId = `service-maint-card-panel-${cardIndex}`;
  const contentVersion = [card.title, card.subtitle, ...card.highlights, card.specs].join("\u0001");

  const hintGridMs = mobileExpanded
    ? MOBILE_REVEAL_HEIGHT_COLLAPSE_MS
    : MOBILE_REVEAL_HEIGHT_EXPAND_MS;

  const mobileShellClass =
    "relative overflow-hidden rounded-2xl border border-slate-200/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.985)_0%,rgba(248,250,252,0.98)_100%)] p-4 shadow-[0_14px_34px_-20px_rgba(15,23,42,0.5)] dark:border-white/12 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.96)_0%,rgba(15,23,42,0.9)_100%)]";

  return (
    <article className="flex min-h-0 min-w-0 flex-col md:h-full md:min-h-0">
      <div className="md:hidden">
        <div
          ref={cardObserveRef}
          className={mobileShellClass}
          data-service-maintenance-scroll={
            mobileScrollMode ? (mobileExpanded ? "active" : "idle") : undefined
          }
        >
          <h3
            id={titleId}
            className="text-center text-[1.02rem] font-semibold leading-tight tracking-tight text-foreground dark:text-white"
          >
            <CmsText
              path={`serviceMaintenance.cards.${cardIndex}.title`}
              text={card.title}
              as="span"
              className="block"
            />
          </h3>
          <div
            className="mt-2 h-px w-full rounded-full bg-gradient-to-r from-transparent via-sky-500/45 to-transparent dark:via-sky-300/55"
            aria-hidden
          />
          <p className="mt-2.5 text-center text-[0.92rem] leading-[1.45] text-slate-600 dark:text-slate-200/85">
            <CmsText
              path={`serviceMaintenance.cards.${cardIndex}.subtitle`}
              text={card.subtitle}
              as="span"
              className="block"
            />
          </p>
          <div
            className="mt-2.5 h-[2px] w-full rounded-full bg-gradient-to-r from-transparent via-sky-500/65 to-transparent dark:via-sky-300/70"
            aria-hidden
          />

          {mobileScrollMode ? (
            <>
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
                expanded={mobileExpanded}
                panelId={panelId}
                labelledBy={titleId}
                prefersReducedMotion={prefersReducedMotion}
                contentVersion={contentVersion}
              >
                <div className="mt-3 rounded-xl border border-sky-200/70 bg-sky-50/55 px-3 py-2.5 dark:border-sky-400/25 dark:bg-sky-500/10">
                  <p className="text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300/90">
                    {maintenance.detailSectionLabel ?? "Layanan"}
                  </p>
                  <ul className="mt-2.5 space-y-1.5 text-[0.88rem] leading-snug text-foreground dark:text-white/90">
                    {card.highlights.map((line, hi) => (
                      <li key={`${cardIndex}-${hi}`} className="flex min-w-0 gap-2">
                        <span
                          className="shrink-0 pt-[1px] text-sky-700/80 dark:text-sky-300/80"
                          aria-hidden
                        >
                          -
                        </span>
                        <span className="min-w-0">
                          <CmsText
                            path={`serviceMaintenance.cards.${cardIndex}.highlights.${hi}`}
                            text={line}
                            as="span"
                            className="inline"
                          />
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 space-y-2.5 border-t border-sky-200/75 pt-3 dark:border-sky-400/25">
                    <p className="text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300/90">
                      {maintenance.supportLabel ?? "Dukungan"}
                    </p>
                    <p className="rounded-[10px] border border-sky-200/70 bg-white/65 px-3 py-2.5 text-center text-[0.78rem] font-medium leading-snug text-slate-700 dark:border-sky-400/25 dark:bg-sky-950/35 dark:text-sky-100/90">
                      <CmsText
                        path={`serviceMaintenance.cards.${cardIndex}.specs`}
                        text={card.specs}
                        as="span"
                        className="block whitespace-pre-wrap"
                      />
                    </p>
                  </div>
                </div>
                <div className="border-t border-sky-200/75 px-0.5 pb-0.5 pt-4 dark:border-sky-400/20">
                  <p className="m-0 flex w-full min-w-0 items-center justify-center gap-2">
                    <span className={mobileHintLineStart} aria-hidden />
                    <span className={`${mobileHintLabel} text-sky-600/90 dark:text-sky-300/88`}>
                      {serviceMaintenanceScrollFooterCopy}
                    </span>
                    <span className={mobileHintLineEnd} aria-hidden />
                  </p>
                </div>
              </MobileMeasuredReveal>
            </>
          ) : (
            <details
              open={mobileOpenDetailIndex === cardIndex}
              onToggle={(e) => {
                onMobileDetailToggle(cardIndex, e.currentTarget.open);
              }}
              className="group mt-3 rounded-xl border border-sky-200/70 bg-sky-50/55 px-3 py-2.5 dark:border-sky-400/25 dark:bg-sky-500/10"
            >
              <summary className="cursor-pointer list-none text-center [&::-webkit-details-marker]:hidden">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300/90">
                  {maintenance.detailSectionLabel ?? "Layanan"}
                </span>
                <span className="mt-1 flex w-full min-w-0 items-center justify-center gap-2 group-open:hidden">
                  <span className={mobileHintLineStart} aria-hidden />
                  <span className={mobileHintLabel}>
                    {maintenance.detailOpenHint ?? "Ketuk untuk melihat"}
                  </span>
                  <span className={mobileHintLineEnd} aria-hidden />
                </span>
              </summary>
              <ul className="mt-2.5 space-y-1.5 text-[0.88rem] leading-snug text-foreground dark:text-white/90">
                {card.highlights.map((line, hi) => (
                  <li key={`${cardIndex}-${hi}`} className="flex min-w-0 gap-2">
                    <span className="shrink-0 pt-[1px] text-sky-700/80 dark:text-sky-300/80" aria-hidden>
                      -
                    </span>
                    <span className="min-w-0">
                      <CmsText
                        path={`serviceMaintenance.cards.${cardIndex}.highlights.${hi}`}
                        text={line}
                        as="span"
                        className="inline"
                      />
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 space-y-2.5 border-t border-sky-200/75 pt-3 dark:border-sky-400/25">
                <p className="text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300/90">
                  {maintenance.supportLabel ?? "Dukungan"}
                </p>
                <p className="rounded-[10px] border border-sky-200/70 bg-white/65 px-3 py-2.5 text-center text-[0.78rem] font-medium leading-snug text-slate-700 dark:border-sky-400/25 dark:bg-sky-950/35 dark:text-sky-100/90">
                  <CmsText
                    path={`serviceMaintenance.cards.${cardIndex}.specs`}
                    text={card.specs}
                    as="span"
                    className="block whitespace-pre-wrap"
                  />
                </p>
              </div>
              <p className="m-0 mt-3 hidden w-full min-w-0 items-center justify-center gap-2 group-open:flex">
                <span className={mobileHintLineStart} aria-hidden />
                <span className={mobileHintLabel}>
                  {maintenance.detailCloseHint ?? "Ketuk untuk menutup"}
                </span>
                <span className={mobileHintLineEnd} aria-hidden />
              </p>
            </details>
          )}
        </div>
      </div>

      <div className="hidden min-h-0 flex-1 flex-col md:flex">
        <ProductB2BCard
          card={card}
          staggerIndex={cardIndex}
          tightTextSpacing
          hideImage
          hideActions
          listingReturnAnchor="service-maintenance"
          cmsCardPathPrefix={`serviceMaintenance.cards.${cardIndex}`}
        />
      </div>
    </article>
  );
}

export function ServiceMaintenanceSection({
  maintenance,
}: {
  maintenance: ProductB2BCategoryData;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const cards = maintenance.cards;
  /** Mobile: kartu 0 terbuka default; buka kartu lain → yang lain tertutup; tutup aktif → kembali ke kartu 0. */
  const [mobileOpenDetailIndex, setMobileOpenDetailIndex] = useState(0);

  const onMobileDetailToggle = useCallback((cardIndex: number, nextOpen: boolean) => {
    if (nextOpen) {
      setMobileOpenDetailIndex(cardIndex);
      return;
    }
    // Tutup eksplisit pada kartu aktif → kembali ke kartu 0.
    // Abaikan toggle “tutup” dari kartu lain saat React meng-set `open` lewat state (anti race).
    setMobileOpenDetailIndex((prev) => (prev === cardIndex ? 0 : prev));
  }, []);

  return (
    <section
      id="service-maintenance"
      className={`scroll-mt-[var(--section-nav-pass)] ${lightSurfaceBandWarm} ${lightSectionInsetX} py-5 sm:py-6 md:py-8`}
      aria-labelledby="service-maintenance-heading"
    >
      <div className={lightSectionMax}>
        <div className="mx-auto max-w-4xl space-y-2 text-center md:space-y-2.5">
          <header className="flex flex-col items-center gap-1.5 md:gap-2">
            <p
              id="service-maintenance-label"
              className={`${lightEyebrow} text-[11px] md:text-xs`}
            >
              <CmsText
                path="serviceMaintenance.eyebrow"
                text={maintenance.eyebrow}
                as="span"
              />
            </p>
            <div
              className="h-px w-14 shrink-0 rounded-full bg-gradient-to-r from-transparent via-sky-500/35 to-transparent md:w-16 dark:via-sky-400/45"
              aria-hidden
            />
          </header>

          <h2
            id="service-maintenance-heading"
            className="text-balance text-[1.625rem] font-semibold leading-[1.2] tracking-[-0.02em] text-foreground sm:text-3xl md:text-[2rem] md:leading-[1.18] lg:text-[2.25rem]"
            aria-describedby="service-maintenance-label"
          >
            <span className="flex w-full min-w-0 items-center justify-center gap-2.5 sm:gap-3.5">
              <span
                className="h-px min-h-px min-w-[1.25rem] max-w-[5.5rem] flex-1 rounded-full bg-gradient-to-r from-transparent via-sky-500/38 to-sky-600/55 dark:via-sky-400/42 dark:to-sky-300/58"
                aria-hidden
              />
              <span className="max-w-[min(100%,38rem)] min-w-0 bg-gradient-to-r from-sky-700 via-sky-600 to-sky-700 bg-clip-text px-1 text-balance text-center text-[1.625rem] font-semibold leading-[1.2] tracking-[-0.02em] text-transparent sm:text-3xl md:text-[2rem] md:leading-[1.18] lg:text-[2.25rem] dark:from-sky-200 dark:via-sky-300 dark:to-sky-200">
                <CmsText
                  path="serviceMaintenance.title"
                  text={maintenance.title}
                  as="span"
                  className="inline"
                />
              </span>
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

          <p className="mx-auto w-full max-w-3xl text-pretty text-sm leading-snug text-muted-foreground md:text-base md:leading-[1.55]">
            <CmsText
              path="serviceMaintenance.description"
              text={maintenance.description}
              as="span"
              className="block"
            />
          </p>
        </div>

        <div className="-mt-20 grid grid-cols-1 items-stretch gap-5 sm:mt-6 sm:gap-5 md:mt-7 md:grid-cols-3 md:gap-5 xl:gap-6">
          {cards.map((card, cardIndex) => (
            <ServiceMaintenanceCardArticle
              key={`${card.title}-${cardIndex}`}
              maintenance={maintenance}
              card={card}
              cardIndex={cardIndex}
              mobileScrollMode={false}
              mobileExpanded={false}
              mobileOpenDetailIndex={mobileOpenDetailIndex}
              onMobileDetailToggle={onMobileDetailToggle}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>

        <div className="mt-6 md:mt-7">
          <div className="mx-auto flex w-full max-w-[22rem] flex-col items-center gap-4 text-center sm:max-w-[24rem] md:max-w-none">
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base md:leading-relaxed">
              {maintenance.supportLead ?? "Untuk informasi lebih lanjut, hubungi tim support kami."}
            </p>
            <WhatsAppCTAButton
              className="inline-flex w-auto min-w-[12.5rem] items-center justify-center gap-2 rounded-[12px] bg-gradient-to-r from-sky-400 via-blue-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_26px_-10px_rgba(56,189,248,0.85)] transition-[transform,filter,box-shadow] duration-200 hover:brightness-110 hover:shadow-[0_16px_30px_-12px_rgba(56,189,248,0.95)] motion-safe:hover:scale-[1.01] md:w-auto md:min-w-[220px]"
              ariaLabel="Hubungi via WhatsApp untuk informasi service dan maintenance"
              message={generateWhatsAppMessage("service dan maintenance cold storage")}
            >
              <IconWhatsApp className="h-4 w-4 shrink-0 text-white" aria-hidden />
              {maintenance.supportCtaLabel ?? "Hubungi via WhatsApp"}
            </WhatsAppCTAButton>
          </div>
        </div>
      </div>
    </section>
  );
}
