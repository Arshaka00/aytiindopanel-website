import { ContactMapEmbed } from "@/components/aytipanel/contact-map-embed";
import { COMPANY_LEGAL_NAME } from "@/components/aytipanel/constants";
import Image from "next/image";
import {
  IconCompanyLocation,
  IconFacebook,
  IconInstagram,
  IconLinkedIn,
  IconMail,
  IconPhone,
  IconTikTok,
  IconWhatsApp,
  IconX,
  IconYouTube,
} from "@/components/aytipanel/icons";
import {
  lightSectionInsetX,
  lightSectionMax,
  lightSurfaceBandWarm,
  lightSurfaceBandWhite,
  lightTitleLeadDivider,
} from "@/components/aytipanel/light-section-ui";
import { WhatsAppCTAButton } from "@/components/aytipanel/whatsapp-cta-button";
import { FaqItemsClient } from "@/components/aytipanel/faq-items-client";
import { CmsText } from "@/components/site-cms/cms-text";
import { generateWhatsAppLink } from "@/utils/whatsapp";
import type { SiteContent } from "@/lib/site-content-model";

const kontakPanelClass =
  "relative overflow-hidden rounded-2xl border border-border/70 bg-card px-6 pb-6 pt-6 shadow-[0_1px_0_rgba(255,255,255,0.85)_inset,0_18px_50px_-30px_rgba(15,23,42,0.18)] sm:px-7 sm:pb-7 sm:pt-2 md:rounded-[1.375rem] md:px-9 md:pb-9 md:pt-2 lg:px-10 lg:pb-10 lg:pt-2 dark:border-white/[0.08] dark:bg-[color-mix(in_srgb,var(--card)_92%,transparent)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_22px_60px_-32px_rgba(0,0,0,0.5)]";

const kontakPanelAccent =
  "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/55 to-transparent dark:via-sky-300/45";

const FALLBACK_HEADER_LOGO = "/images/logo_ayti.png";
const HEADER_LOGO_IMG_WIDTH = 180;
const HEADER_LOGO_IMG_HEIGHT = 50;

const kontakColumnHeading =
  "flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground";

const kontakColumnHeadingDot =
  "h-1 w-1 shrink-0 rounded-full bg-sky-500/65 dark:bg-sky-300/65";

const kontakContactIconClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/80 bg-muted/40 text-muted-foreground transition-[transform,border-color,background-color,color,box-shadow] duration-[280ms] [transition-timing-function:var(--ease-premium-soft)] group-hover/kontak-row:-translate-y-0.5 group-hover/kontak-row:border-sky-500/40 group-hover/kontak-row:bg-sky-50/85 group-hover/kontak-row:text-sky-700 group-hover/kontak-row:shadow-[0_4px_14px_-6px_rgba(56,189,248,0.45)] dark:border-white/10 dark:bg-white/[0.04] dark:group-hover/kontak-row:border-sky-400/45 dark:group-hover/kontak-row:bg-sky-500/15 dark:group-hover/kontak-row:text-sky-100";

const kontakContactRowClass =
  "group/kontak-row flex items-center gap-4 border-b border-border/40 py-3 transition-colors duration-[240ms] [transition-timing-function:var(--ease-premium-soft)] first:pt-0 last:border-b-0 last:pb-0 hover:[&_.kontak-value]:text-accent focus-within:[&_.kontak-value]:text-accent dark:border-white/[0.06]";

const kontakContactAnchorClass =
  "flex flex-1 items-center justify-between gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const kontakSocialBtnClass =
  "inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border/80 bg-background text-foreground shadow-sm transition-[transform,box-shadow,border-color,background-color,color] duration-[280ms] [transition-timing-function:var(--ease-premium-soft)] motion-safe:active:translate-y-px hover:-translate-y-0.5 hover:border-sky-500/35 hover:bg-sky-50/80 hover:text-sky-700 hover:shadow-[0_8px_18px_-8px_rgba(56,189,248,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-white/12 dark:bg-white/[0.04] dark:hover:border-sky-400/35 dark:hover:bg-sky-500/10 dark:hover:text-sky-100";

export { TentangSection } from "@/components/aytipanel/tentang-section";

function resolveHeaderBrandLogoSrcs(siteSettings?: SiteContent["siteSettings"]) {
  const rawLight = siteSettings?.brandAssets?.logoLight?.trim() ?? "";
  const rawDark = siteSettings?.brandAssets?.logoDark?.trim() ?? "";
  const primary = rawLight || rawDark || FALLBACK_HEADER_LOGO;

  return {
    logoLightSrc: rawLight ? rawLight : primary,
    logoDarkSrc: rawDark ? rawDark : primary,
  };
}

function HeaderMatchedLogoImage({ src, className }: { src: string; className: string }) {
  const shown = src.trim() || FALLBACK_HEADER_LOGO;

  if (/^https?:\/\//.test(shown)) {
    return (
      <img
        src={shown}
        alt=""
        className={className}
        width={HEADER_LOGO_IMG_WIDTH}
        height={HEADER_LOGO_IMG_HEIGHT}
      />
    );
  }

  return (
    <Image
      src={shown}
      alt=""
      width={HEADER_LOGO_IMG_WIDTH}
      height={HEADER_LOGO_IMG_HEIGHT}
      className={className}
    />
  );
}

export function FaqSection({ faq }: { faq: SiteContent["faq"] }) {
  return (
    <section
      id="faq"
      className={`scroll-mt-[var(--section-nav-pass)] ${lightSurfaceBandWhite} ${lightSectionInsetX} py-7 md:py-10 lg:py-12`}
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 md:gap-5 lg:gap-6">
        <div className="mx-auto max-w-3xl space-y-1.5 text-center md:space-y-2 lg:space-y-2.5">
          <header className="flex flex-col items-center gap-1.5 md:gap-2">
            <CmsText
              id="faq-section-label"
              path="faq.sectionLabel"
              text={faq.sectionLabel}
              as="p"
              className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-sky-800/95 md:text-[11px] dark:text-sky-300/85"
            />
            <div
              className="h-px w-14 shrink-0 rounded-full bg-gradient-to-r from-transparent via-sky-500/35 to-transparent md:w-16 dark:via-sky-400/45"
              aria-hidden
            />
          </header>

          <h2
            id="faq-heading"
            className="text-balance text-[1.625rem] font-semibold leading-[1.2] tracking-[-0.02em] text-foreground sm:text-3xl md:text-[2rem] md:leading-[1.18] lg:text-[2.25rem]"
            aria-describedby="faq-section-label"
          >
            <span className="flex w-full min-w-0 items-center justify-center gap-2.5 sm:gap-3.5">
              <span
                className="h-px min-h-px min-w-[1.25rem] max-w-[5.5rem] flex-1 rounded-full bg-gradient-to-r from-transparent via-sky-500/38 to-sky-600/55 dark:via-sky-400/42 dark:to-sky-300/58"
                aria-hidden
              />
              <CmsText
                path="faq.heading"
                text={faq.heading}
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
            path="faq.lead"
            text={faq.lead}
            as="p"
            className="mx-auto max-w-2xl text-pretty text-sm leading-snug text-muted-foreground md:text-[0.9375rem] md:leading-relaxed"
          />
        </div>
        <FaqItemsClient faq={faq} />
        <div className="text-center">
          <WhatsAppCTAButton
            className="inline-flex w-full items-center justify-center gap-2 rounded-[11px] bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_-6px_color-mix(in_srgb,var(--accent)_55%,transparent)] transition-[filter,transform] duration-[260ms] [transition-timing-function:var(--ease-premium-soft)] hover:brightness-110 motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.988] md:w-auto md:px-6"
            ariaLabel="Tanya langsung via WhatsApp"
            message={faq.ctaMessage}
          >
            <IconWhatsApp className="h-4 w-4 shrink-0 opacity-95" aria-hidden />
            <CmsText path="faq.ctaLabel" text={faq.ctaLabel} as="span" />
          </WhatsAppCTAButton>
        </div>
      </div>
    </section>
  );
}

export function KontakSection({
  kontak,
  social,
  siteSettings,
  waPhoneDigits,
}: {
  kontak: SiteContent["kontak"];
  social: SiteContent["footer"]["social"];
  siteSettings?: SiteContent["siteSettings"];
  waPhoneDigits: string;
}) {
  const safeAddressLines = Array.isArray(kontak.addressLines) ? kontak.addressLines : [];
  const safeSocial = {
    instagram: social?.instagram ?? "#",
    linkedin: social?.linkedin ?? "",
    facebook: social?.facebook ?? "#",
    tiktok: social?.tiktok ?? "#",
    youtube: social?.youtube ?? "#",
    x: social?.x ?? "#",
  };
  const linkedInHref = /^https?:\/\//i.test(safeSocial.linkedin) ? safeSocial.linkedin : "";
  const hasIntro = kontak.intro.trim().length > 0;
  const hasWhatsAppCta = kontak.waCtaLabel.trim().length > 0;
  const { logoLightSrc, logoDarkSrc } = resolveHeaderBrandLogoSrcs(siteSettings);

  return (
    <section
      id="kontak"
      className={`scroll-mt-[var(--section-nav-pass)] ${lightSurfaceBandWarm} ${lightSectionInsetX} py-8 sm:py-9 md:py-10 lg:py-12`}
      aria-labelledby="kontak-heading"
    >
      <div className={`${lightSectionMax} space-y-8 md:space-y-10`}>
        <header className="mx-auto flex max-w-4xl flex-col items-center gap-1.5 md:gap-2">
          <CmsText
            id="kontak-heading"
            path="kontak.heading"
            text={kontak.heading}
            as="h2"
            className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-sky-800/95 md:text-[11px] dark:text-sky-300/85"
          />
          <div
            className="h-px w-32 shrink-0 rounded-full bg-gradient-to-r from-transparent via-sky-500/35 to-transparent sm:w-40 md:w-48 lg:w-56 dark:via-sky-400/45"
            aria-hidden
          />
        </header>

        <div className={kontakPanelClass}>
          <span className={kontakPanelAccent} aria-hidden />

          {/*
            Brand block (logo + nameplate). Rata kiri; di md+ baris dengan CTA WhatsApp (justify-between).
          */}
          <div
            className={`flex flex-col items-start gap-4 border-b border-border/60 pb-3 md:flex-row md:gap-6 md:pb-4 dark:border-white/[0.08] ${
              hasWhatsAppCta ? "md:items-center md:justify-between" : ""
            }`}
          >
            <div className={`min-w-0 w-full text-left ${hasWhatsAppCta ? "md:max-w-xl" : ""}`}>
              <div className="inline-flex max-w-full items-center justify-start gap-2 rounded-xl border border-border/70 bg-gradient-to-br from-card via-muted-bg/70 to-card px-2.5 py-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_18px_46px_-30px_rgba(15,23,42,0.25)] ring-1 ring-black/[0.025] backdrop-blur-[10px] sm:gap-4 sm:rounded-2xl sm:px-4 sm:py-1 dark:border-white/[0.08] dark:bg-[linear-gradient(145deg,rgba(255,255,255,0.055),rgba(255,255,255,0.022))] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_22px_54px_-32px_rgba(0,0,0,0.72)] dark:ring-white/[0.04]">
                <HeaderMatchedLogoImage
                  src={logoLightSrc}
                  className="h-7 w-auto max-h-9 shrink-0 object-contain sm:h-12 sm:max-h-14 md:h-14 md:max-h-[4.25rem] dark:hidden"
                />
                <HeaderMatchedLogoImage
                  src={logoDarkSrc}
                  className="hidden h-7 w-auto max-h-9 shrink-0 object-contain sm:h-12 sm:max-h-14 md:h-14 md:max-h-[4.25rem] dark:block"
                />
                <div className="min-w-0 border-l border-sky-500/25 pl-2 sm:pl-4 dark:border-sky-300/18">
                  <p className="min-w-0 text-balance bg-gradient-to-r from-sky-800 via-slate-900 to-sky-800 bg-clip-text text-left text-[0.875rem] font-semibold leading-tight tracking-[-0.025em] text-transparent sm:text-[1.375rem] md:text-[1.5rem] dark:from-sky-100 dark:via-white dark:to-sky-200">
                    <CmsText path="kontak.badge" text={kontak.badge} as="span" className="inline" />
                  </p>
                  <span
                    className="mt-1 flex w-full max-w-[min(100%,18rem)] items-center justify-start gap-1.5 sm:mt-1.5 sm:gap-2"
                    aria-hidden
                  >
                    <span className="h-px flex-1 rounded-full bg-gradient-to-r from-transparent via-sky-500/35 to-sky-500/55 dark:via-sky-300/35 dark:to-sky-300/55" />
                    <span className="h-1 w-1 shrink-0 rotate-45 bg-sky-500/55 shadow-[0_0_0_3px_rgba(14,165,233,0.10)] sm:h-1.5 sm:w-1.5 dark:bg-sky-300/55" />
                    <span className="h-px flex-1 rounded-full bg-gradient-to-r from-sky-500/55 via-sky-500/35 to-transparent dark:from-sky-300/55 dark:via-sky-300/35" />
                  </span>
                </div>
              </div>
              {hasIntro ? (
                <CmsText
                  path="kontak.intro"
                  text={kontak.intro}
                  as="p"
                  className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground md:text-[0.9375rem] md:leading-relaxed"
                />
              ) : null}
            </div>
            {hasWhatsAppCta ? (
              <div className="flex w-full shrink-0 justify-start md:w-auto md:justify-end">
                <WhatsAppCTAButton
                  className="group/cta inline-flex w-full min-h-12 max-w-sm items-center justify-center gap-2.5 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_28px_-10px_color-mix(in_srgb,var(--accent)_55%,transparent)] transition-[filter,transform,box-shadow] duration-[260ms] [transition-timing-function:var(--ease-premium-soft)] hover:brightness-110 hover:shadow-[0_14px_32px_-10px_color-mix(in_srgb,var(--accent)_50%,transparent)] motion-safe:hover:scale-[1.01] motion-safe:active:scale-[0.988] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/55 focus-visible:ring-offset-2 md:w-auto md:min-w-[240px] md:py-3"
                  ariaLabel="Konsultasi proyek via WhatsApp"
                  message={kontak.waMessage}
                >
                  <IconWhatsApp className="h-5 w-5 shrink-0 opacity-95" aria-hidden />
                  <CmsText path="kontak.waCtaLabel" text={kontak.waCtaLabel} as="span" />
                  <span
                    aria-hidden
                    className="ml-0.5 inline-flex translate-x-0 transition-transform duration-[260ms] [transition-timing-function:var(--ease-premium-soft)] group-hover/cta:translate-x-0.5"
                  >
                    →
                  </span>
                </WhatsAppCTAButton>
              </div>
            ) : null}
          </div>

          <div className="grid gap-10 pt-4 md:grid-cols-2 md:items-start md:gap-12 md:pt-5 lg:gap-16">
            <div className="min-w-0 md:pr-4 lg:pr-8">
              <h3 className={kontakColumnHeading}>
                <span className={kontakColumnHeadingDot} aria-hidden />
                <CmsText path="kontak.detailHeading" text={kontak.detailHeading} as="span" className="inline" />
              </h3>
              <ul className="mt-5 divide-y divide-transparent">
                <li className={kontakContactRowClass}>
                  <a
                    href={`tel:${kontak.phoneTel}`}
                    className={kontakContactAnchorClass}
                    aria-label={`Telepon ${kontak.phone}`}
                  >
                    <span className={kontakContactIconClass} aria-hidden>
                      <IconPhone className="h-[18px] w-[18px] shrink-0" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        <CmsText path="kontak.phoneLabel" text={kontak.phoneLabel} as="span" className="inline" />
                      </span>
                      <span className="kontak-value mt-0.5 block text-[0.9375rem] font-semibold tabular-nums text-foreground transition-colors">
                        <CmsText path="kontak.phone" text={kontak.phone} as="span" className="inline" />
                      </span>
                    </span>
                  </a>
                </li>

                <li className={kontakContactRowClass}>
                  <a
                    href={generateWhatsAppLink(kontak.waMessage, waPhoneDigits)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={kontakContactAnchorClass}
                    aria-label={`WhatsApp ${kontak.whatsappDisplay}`}
                  >
                    <span className={kontakContactIconClass} aria-hidden>
                      <IconWhatsApp className="h-[18px] w-[18px] shrink-0" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        <CmsText path="kontak.whatsappLabel" text={kontak.whatsappLabel} as="span" className="inline" />
                      </span>
                      <span className="kontak-value mt-0.5 block text-[0.9375rem] font-semibold tabular-nums text-foreground transition-colors">
                        <CmsText
                          path="kontak.whatsappDisplay"
                          text={kontak.whatsappDisplay}
                          as="span"
                          className="inline"
                        />
                      </span>
                    </span>
                  </a>
                </li>

                <li className={kontakContactRowClass}>
                  <a
                    href={`mailto:${kontak.email}`}
                    className={kontakContactAnchorClass}
                    aria-label={`Email ${kontak.email}`}
                  >
                    <span className={kontakContactIconClass} aria-hidden>
                      <IconMail className="h-[18px] w-[18px] shrink-0" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        <CmsText path="kontak.emailLabel" text={kontak.emailLabel} as="span" className="inline" />
                      </span>
                      <span className="kontak-value mt-0.5 block break-all text-[0.9375rem] font-semibold text-foreground transition-colors">
                        <CmsText path="kontak.email" text={kontak.email} as="span" className="inline" />
                      </span>
                    </span>
                  </a>
                </li>

                <li className={`${kontakContactRowClass} cursor-default items-start`}>
                  <span className={`${kontakContactIconClass} mt-0.5`} aria-hidden>
                    <IconCompanyLocation className="h-[18px] w-[18px] shrink-0" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      <CmsText path="kontak.addressLabel" text={kontak.addressLabel} as="span" className="inline" />
                    </span>
                    <address className="mt-1 not-italic text-[0.875rem] font-medium leading-relaxed text-foreground">
                      {safeAddressLines.map((line, li) => (
                        <span key={`${line}-${li}`} className="block">
                          <CmsText
                            path={`kontak.addressLines.${li}`}
                            text={line}
                            as="span"
                            className="inline"
                          />
                        </span>
                      ))}
                      <span className="mt-2 block text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {COMPANY_LEGAL_NAME}
                      </span>
                    </address>
                  </div>
                </li>
              </ul>
            </div>

            <div className="min-w-0 md:border-l md:border-border/50 md:pl-8 lg:pl-12 dark:md:border-white/[0.08]">
              <h3 className={kontakColumnHeading}>
                <span className={kontakColumnHeadingDot} aria-hidden />
                <CmsText path="kontak.socialHeading" text={kontak.socialHeading} as="span" className="inline" />
              </h3>
              <p className="mt-2 text-pretty text-xs leading-relaxed text-muted-foreground md:text-[13px]">
                <CmsText path="kontak.socialLead" text={kontak.socialLead} as="span" className="inline" />
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  href={safeSocial.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={kontakSocialBtnClass}
                  aria-label="Instagram Aytipanel"
                >
                  <IconInstagram className="h-[18px] w-[18px] shrink-0" />
                </a>
                <a
                  href={safeSocial.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={kontakSocialBtnClass}
                  aria-label="Facebook Aytipanel"
                >
                  <IconFacebook className="h-[18px] w-[18px] shrink-0" />
                </a>
                {linkedInHref ? (
                  <a
                    href={linkedInHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={kontakSocialBtnClass}
                    aria-label="LinkedIn"
                  >
                    <IconLinkedIn className="h-[18px] w-[18px] shrink-0" />
                  </a>
                ) : null}
                <a
                  href={safeSocial.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={kontakSocialBtnClass}
                  aria-label="TikTok Aytipanel"
                >
                  <IconTikTok className="h-[18px] w-[18px] shrink-0" />
                </a>
                <a
                  href={safeSocial.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={kontakSocialBtnClass}
                  aria-label="YouTube Aytipanel"
                >
                  <IconYouTube className="h-[18px] w-[18px] shrink-0" />
                </a>
                <a
                  href={safeSocial.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={kontakSocialBtnClass}
                  aria-label="X (Twitter) Aytipanel"
                >
                  <IconX className="h-[16px] w-[16px] shrink-0" />
                </a>
              </div>
              <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-[11px] font-medium leading-none text-muted-foreground dark:border-white/[0.08] dark:bg-white/[0.03]">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500/85 shadow-[0_0_0_3px_rgba(16,185,129,0.18)] dark:bg-emerald-400" aria-hidden />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/70 dark:text-white/70">
                  <CmsText path="kontak.operationalLabel" text={kontak.operationalLabel} as="span" className="inline" />
                </span>
                <span aria-hidden className="text-border/80 dark:text-white/20">
                  •
                </span>
                <span>
                  <CmsText path="kontak.operationalHours" text={kontak.operationalHours} as="span" className="inline" />
                </span>
              </div>
              <div className="mt-5 w-full overflow-hidden rounded-xl border border-border/70 bg-muted/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
                <ContactMapEmbed
                  title={kontak.mapTitle}
                  src={kontak.mapEmbedUrl}
                  className="aspect-[16/6] w-full border-0 bg-muted/40 dark:bg-white/[0.06]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

