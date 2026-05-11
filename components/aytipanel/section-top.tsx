import { HeroSectionBackground } from "@/components/aytipanel/hero-section-background";
import { HeroIntroTagline } from "@/components/aytipanel/hero-intro-tagline";
import { ProsesKerjaFlow } from "@/components/aytipanel/proses-kerja-flow";
import { CmsHeroPrimaryActions } from "@/components/site-cms/cms-hero-primary-actions";
import { CmsHeroBackgroundControls } from "@/components/site-cms/cms-hero-background-controls";
import { CmsHeroSlidesEditor } from "@/components/site-cms/cms-hero-slides-editor";
import { CmsText } from "@/components/site-cms/cms-text";
import type { SiteContent } from "@/lib/site-content";

/** Intro hero: sama stack font & ritme huruf dengan blok judul (#hero-heading, Sora + Montserrat). */
const heroIntroBodyClass =
  "[font-family:var(--font-sora),Montserrat,sans-serif] text-pretty text-balance text-[clamp(0.8125rem,calc(0.76rem+0.5vw),0.9375rem)] font-medium leading-[1.62] tracking-[-0.024em] text-white/95 antialiased [text-shadow:0_1px_6px_rgba(2,7,18,0.94),0_0_14px_rgba(2,7,18,0.52),0_0_28px_rgba(56,189,248,0.07)] max-md:leading-[1.62] md:text-[clamp(0.875rem,calc(0.78rem+0.32vw),1.0625rem)] md:leading-[1.62] md:tracking-[-0.032em] md:text-white/[0.96]";

export function SectionTop({
  hero,
  disableVideoBackground = false,
  initialViewportIsMobile,
}: {
  hero: SiteContent["hero"];
  /** Dari Site Settings — jika true, hero memakai slider gambar, bukan video. */
  disableVideoBackground?: boolean;
  /** SSR: selaras hydrasi crop/transform hero (mobile vs desktop). */
  initialViewportIsMobile?: boolean;
}) {
  return (
    <>
      {/* Hero: padding Android dikunci globals. `ua-android`: shift-up + CTA. `ua-iphone`: shift-up (teks + alur kerja) + CTA + skala tombol */}
      <section
        id="beranda"
        className="hero hero-section-fixed-dark relative isolate flex h-auto min-h-0 scroll-mt-[max(env(safe-area-inset-top,0px),0.75rem)] flex-col items-center justify-start overflow-x-clip overflow-y-visible border-b border-white/[0.06] bg-[#050B18] py-8 pb-[max(7.25rem,calc(env(safe-area-inset-bottom,0px)+1.875rem))] pt-[max(3.25rem,calc(env(safe-area-inset-top,0px)+2.25rem))] text-white [-webkit-font-smoothing:antialiased] sm:pt-[3.75rem] md:min-h-[min(92svh,980px)] md:py-0 lg:min-h-[min(94svh,980px)]"
        aria-labelledby="hero-heading"
      >
        <HeroSectionBackground
          slides={hero.slides}
          backgroundVideo={hero.backgroundVideo}
          disableVideoBackground={disableVideoBackground}
          initialViewportIsMobile={initialViewportIsMobile}
        />
        <CmsHeroSlidesEditor slides={hero.slides} />
        <CmsHeroBackgroundControls hero={hero} />
        <div className="hero-overlay-diagonal pointer-events-none absolute inset-0 z-[1]" aria-hidden />
        <div className="hero-overlay-vertical pointer-events-none absolute inset-0 z-[1]" aria-hidden />
        <div className="hero-overlay-glow pointer-events-none absolute inset-0 z-[1]" aria-hidden />
        <div
          className="hero-overlay-bottom pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-2/5 md:h-[42%]"
          aria-hidden
        />
        <div className="hero-overlay-bottom-soft pointer-events-none absolute bottom-0 left-0 z-[1] h-32 w-full" aria-hidden />
        <div
          className="hero-overlay-desktop-rail pointer-events-none absolute inset-0 z-[1] hidden md:block"
          aria-hidden
        />
        <div className="hero-overlay-top-hairline pointer-events-none absolute inset-x-0 top-0 z-[1] h-px" aria-hidden />
        <div className="hero-layout-shell relative z-10 mx-auto flex w-full min-w-0 max-w-6xl flex-1 items-start pl-[max(1.25rem,env(safe-area-inset-left,0px))] pr-[max(1.25rem,env(safe-area-inset-right,0px))] pt-2 sm:pl-6 sm:pr-6 sm:pt-3 md:items-center md:px-8 md:pt-0">
          <div className="hero-content-enter w-full drop-shadow-[0_3px_8px_rgba(2,7,18,0.62)]">
            <div className="mx-auto flex w-full min-w-0 max-w-[min(100%,56.25rem)] flex-col text-left">
              <div className="hero-content-stack mt-5 flex flex-col sm:mt-6 md:mt-0">
                <div className="hero-title-intro-block flex flex-col gap-2 md:gap-3">
                  <div className="space-y-1.5 md:space-y-2">
                  <div className="hero-eyebrow-row -mt-3 -translate-y-3 flex w-full items-center justify-center gap-2.5 will-change-transform sm:-mt-4 sm:translate-y-0 sm:gap-3.5 md:-mt-6 md:-translate-y-2 md:gap-4 lg:-mt-8 lg:-translate-y-4">
                    <span
                      className="h-px min-w-[1.25rem] flex-1 rounded-full bg-gradient-to-r from-transparent via-sky-400/30 to-sky-300/55 max-[360px]:max-w-[2.25rem] sm:max-w-none"
                      aria-hidden
                    />
                    <span className="inline-flex shrink-0 items-center gap-2 sm:gap-2.5">
                      <span
                        className="size-1 shrink-0 rounded-full bg-sky-300/75 shadow-[0_0_8px_rgba(56,189,248,0.55)]"
                        aria-hidden
                      />
                      <CmsText
                        path="hero.brandLabel"
                        text={hero.brandLabel}
                        as="span"
                        className="shrink-0 text-center text-[clamp(10px,2.6vw,11px)] font-medium uppercase leading-snug tracking-[0.2em] text-white/85 md:text-[12px] md:tracking-[0.24em]"
                      />
                      <span
                        className="size-1 shrink-0 rounded-full bg-sky-300/75 shadow-[0_0_8px_rgba(56,189,248,0.55)]"
                        aria-hidden
                      />
                    </span>
                    <span
                      className="h-px min-w-[1.25rem] flex-1 rounded-full bg-gradient-to-l from-transparent via-sky-400/30 to-sky-300/55 max-[360px]:max-w-[2.25rem] sm:max-w-none"
                      aria-hidden
                    />
                  </div>
                  <div className="flex w-full justify-start px-0.5 sm:px-0">
                    <h1
                      id="hero-heading"
                      className="w-full max-w-[56.25rem] px-[0.02em] text-left uppercase [font-family:var(--font-sora),Montserrat,sans-serif] text-[#F5F7FF] [text-shadow:0_2px_5px_rgba(2,7,18,0.95),0_0_12px_rgba(2,7,18,0.7)] [-webkit-text-stroke:0.25px_rgba(2,7,18,0.26)] max-md:[text-shadow:0_2px_5px_rgba(2,7,18,0.98),0_0_12px_rgba(2,7,18,0.82)]"
                    >
                      <CmsText
                        path="hero.headingLine1"
                        text={hero.headingLine1}
                        fallbackText="SOLUSI SISTEM"
                        as="span"
                        className="hero-heading-glass-line1 block text-[clamp(0.9rem,2.6vw,1.2rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#F5F7FF]/88 md:text-[1.5rem]"
                      />
                      <span className="hero-heading-crystal-wrap relative isolate mt-1 block md:mt-1.5">
                        <CmsText
                          path="hero.headingMiddle"
                          text={hero.headingMiddle}
                          fallbackText="PENDINGIN"
                          as="span"
                          className="hero-heading-crystal hero-heading-glass-middle block text-[clamp(2rem,11.5vw,4.5rem)] font-extrabold leading-[0.9] tracking-[-0.045em]"
                        />
                      </span>
                      <CmsText
                        path="hero.headingLine2"
                        text={hero.headingLine2}
                        fallbackText="TERINTEGRASI"
                        as="span"
                        className="hero-heading-accent hero-heading-glass-line2 mt-0.5 block md:mt-1"
                      />
                    </h1>
                  </div>
                </div>
                </div>

                <div className="mx-auto w-full min-w-0 space-y-4 pt-3 text-left md:space-y-5 md:pt-4">
                  <div
                    className="hero-intro-divider h-px w-full max-w-[16rem] rounded-full bg-gradient-to-r from-transparent via-sky-300/45 to-transparent md:max-w-[20rem]"
                    aria-hidden
                  />
                  <div className="hero-intro-phone w-full min-w-0 max-w-[min(100%,42rem)] text-pretty text-left">
                    <HeroIntroTagline className="hero-intro-tagline-surface relative z-[1] -translate-y-1 overflow-hidden rounded-2xl border border-white/[0.18] bg-gradient-to-br from-white/[0.055] via-[rgba(6,18,44,0.38)] to-[rgba(3,8,20,0.78)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-10px_28px_-14px_rgba(56,189,248,0.035),0_1px_3px_rgba(0,0,0,0.55),0_6px_16px_rgba(0,0,0,0.32),0_16px_36px_rgba(1,6,18,0.58),0_32px_64px_-6px_rgba(2,10,28,0.68),0_48px_80px_-18px_rgba(56,189,248,0.095)] ring-1 ring-inset ring-white/[0.08] backdrop-blur-[11px] max-md:-translate-y-0.5 max-md:border-white/[0.15] max-md:from-white/[0.045] max-md:via-[rgba(5,14,36,0.42)] max-md:to-[rgba(2,7,18,0.82)] max-md:shadow-[inset_0_1px_0_rgba(255,255,255,0.13),inset_0_-8px_22px_-12px_rgba(56,189,248,0.028),0_2px_5px_rgba(0,0,0,0.5),0_8px_22px_rgba(0,0,0,0.28),0_18px_44px_rgba(1,5,16,0.6),0_36px_68px_-8px_rgba(2,10,28,0.62),0_44px_72px_-14px_rgba(56,189,248,0.075)] md:-translate-y-1.5 md:px-6 md:py-5">
                      <p className={`${heroIntroBodyClass} text-left md:max-w-[38rem] max-md:text-white/95`}>
                        <CmsText path="hero.intro.before1" text={hero.intro.before1} as="span" />
                        <CmsText
                          path="hero.intro.bold1"
                          text={hero.intro.bold1}
                          as="span"
                          className="font-semibold tracking-[-0.03em] text-[#F5F7FF]"
                        />
                        <CmsText path="hero.intro.middle" text={hero.intro.middle} as="span" />
                        <CmsText
                          path="hero.intro.bold2"
                          text={hero.intro.bold2}
                          as="span"
                          className="font-semibold tracking-[-0.03em] text-[#F5F7FF]"
                        />
                        <CmsText path="hero.intro.after2" text={hero.intro.after2} as="span" />
                        <CmsText
                          path="hero.intro.bold3"
                          text={hero.intro.bold3}
                          as="span"
                          className="font-semibold tracking-[-0.03em] text-[#7FE7FF]"
                        />
                        <CmsText path="hero.intro.after3" text={hero.intro.after3} as="span" />
                      </p>
                    </HeroIntroTagline>
                  </div>
                </div>

                <div className="hero-process-block mt-7 flex w-full min-w-0 flex-col gap-y-0.5 pt-px md:mt-8 md:gap-y-4 md:pt-0">
                  <div
                    id="proses"
                    className="mx-auto w-full min-w-0 scroll-mt-[max(5rem,env(safe-area-inset-top,0px)+4.5rem)] space-y-3 py-0.5 text-center md:scroll-mt-[5.25rem] md:space-y-4 md:py-2.5"
                  >
                    <header className="mx-auto flex max-w-[42rem] flex-col items-center gap-1 px-1 md:gap-1.5 md:px-0">
                      <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-sky-300/40 bg-gradient-to-r from-sky-500/[0.14] via-cyan-400/[0.1] to-sky-500/[0.14] px-2.5 py-[5px] shadow-[0_12px_36px_-10px_rgba(2,12,42,0.75),0_0_24px_-8px_rgba(56,189,248,0.22),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-md md:gap-2 md:px-3.5 md:py-1.5 md:shadow-[0_14px_42px_-10px_rgba(2,14,48,0.8),0_0_32px_-6px_rgba(56,189,248,0.28),inset_0_1px_0_rgba(255,255,255,0.16)]">
                        <span
                          className="size-[5px] shrink-0 rounded-full bg-sky-200 shadow-[0_0_14px_rgba(56,189,248,0.85),0_0_6px_rgba(165,243,252,0.65)] md:size-1.5 md:shadow-[0_0_16px_rgba(56,189,248,0.9)]"
                          aria-hidden
                        />
                        <CmsText
                          path="hero.prosesBadge"
                          text={hero.prosesBadge}
                          as="h2"
                          id="hero-proses-heading"
                          className="text-center font-mono text-[9px] font-semibold uppercase leading-none tracking-[0.2em] text-sky-100 [text-shadow:0_0_20px_rgba(56,189,248,0.35)] md:text-[11px] md:tracking-[0.28em]"
                        />
                        <span
                          className="size-[5px] shrink-0 rounded-full bg-sky-200 shadow-[0_0_14px_rgba(56,189,248,0.85),0_0_6px_rgba(165,243,252,0.65)] md:size-1.5 md:shadow-[0_0_16px_rgba(56,189,248,0.9)]"
                          aria-hidden
                        />
                      </div>
                    </header>
                    <ProsesKerjaFlow
                      variant="hero"
                      aria-labelledby="hero-proses-heading"
                    />
                  </div>
                </div>
              </div>
              <div className="hero-cta-group mx-auto mb-0 mt-7 flex w-full max-w-[42rem] flex-col items-stretch justify-start gap-3 pb-[calc(48px+env(safe-area-inset-bottom,0px))] pt-3 sm:mt-8 sm:pt-4 md:mb-3 md:mt-7 md:flex-row md:flex-wrap md:items-center md:justify-start md:gap-4 md:pb-0 md:pt-4">
                <CmsHeroPrimaryActions
                  whatsappClassName="hero-hubungi-cta group/cta inline-flex min-h-[50px] w-full shrink-0 touch-manipulation items-center justify-center gap-2.5 rounded-[0.9375rem] border border-sky-200/25 bg-[linear-gradient(90deg,rgba(27,91,214,0.95),rgba(53,133,242,0.95))] px-5 py-3.5 text-[0.875rem] font-semibold uppercase leading-snug tracking-[0.03em] text-[#F5F7FF] shadow-[0_10px_30px_rgba(5,28,70,0.38),0_0_18px_rgba(89,216,255,0.14),inset_0_1px_0_rgba(255,255,255,0.22)] ring-1 ring-inset ring-white/18 transition-[opacity,transform,box-shadow,border-color] duration-300 ease-out hover:opacity-95 hover:border-sky-100/35 active:opacity-[0.94] motion-safe:-translate-y-px motion-safe:hover:shadow-[0_12px_36px_rgba(5,28,70,0.45),0_0_24px_rgba(89,216,255,0.18),inset_0_1px_0_rgba(255,255,255,0.24)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white max-md:shadow-[0_12px_34px_rgba(3,16,42,0.52),0_0_16px_rgba(89,216,255,0.18),inset_0_1px_0_rgba(255,255,255,0.24)] md:min-h-[50px] md:w-auto md:flex-1 md:rounded-xl md:py-3 md:text-base md:min-w-[12rem]"
                  secondaryClassName="hero-lihat-produk-cta group/ghost inline-flex min-h-[50px] w-full shrink-0 touch-manipulation items-center justify-center gap-2 rounded-[0.9375rem] border border-white/[0.34] bg-white/[0.05] px-5 py-3.5 text-[0.875rem] font-semibold uppercase leading-snug tracking-[0.03em] text-[#F5F7FF] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-[10px] transition-[opacity,transform,background-color,border-color,box-shadow] duration-300 ease-out hover:bg-white/[0.11] hover:border-[#59D8FF]/55 hover:shadow-[0_0_24px_rgba(89,216,255,0.12)] active:opacity-[0.94] motion-safe:active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white max-md:bg-white/[0.08] max-md:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_28px_rgba(2,8,24,0.32)] md:min-h-[50px] md:w-auto md:flex-1 md:rounded-xl md:py-3 md:text-base md:min-w-[12rem]"
                  heroWhatsAppLabel={hero.ctaWhatsApp.label}
                  heroWhatsAppMessage={hero.ctaWhatsApp.message}
                  secondaryLabel={hero.ctaSecondary.label}
                  secondaryHref={hero.ctaSecondary.href}
                  secondaryAria="Lihat section produk utama"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
