import { HeroSectionBackground } from "@/components/aytipanel/hero-section-background";
import { ProsesKerjaFlow } from "@/components/aytipanel/proses-kerja-flow";
import { CmsHeroPrimaryActions } from "@/components/site-cms/cms-hero-primary-actions";
import { CmsHeroBackgroundControls } from "@/components/site-cms/cms-hero-background-controls";
import { CmsHeroProsesImagesEditor } from "@/components/site-cms/cms-hero-proses-images-editor";
import { CmsHeroSlidesEditor } from "@/components/site-cms/cms-hero-slides-editor";
import { CmsText } from "@/components/site-cms/cms-text";
import type { SiteContent } from "@/lib/site-content";

/** Intro hero: Sora + render halus; tracking & line-height agar kalimat panjang tetap nyaman dibaca. */
const heroIntroBodyClass =
  "[font-family:var(--font-sora),Montserrat,sans-serif] text-pretty text-[clamp(1rem,calc(0.9rem+0.55vw),1.15rem)] font-normal leading-[1.5] tracking-[0.012em] text-white/[0.96] antialiased [-moz-osx-font-smoothing:grayscale] [text-rendering:optimizeLegibility] [text-shadow:0_1px_2px_rgba(0,0,0,0.55),0_0_18px_rgba(2,8,20,0.28)] max-md:leading-[1.48] md:text-[clamp(1.125rem,calc(0.98rem+0.5vw),1.375rem)] md:leading-[1.46] md:tracking-[0.01em]";

/** Bingkai kaca intro: beberapa lapisan putih + gelap sangat tipis agar nuansa putih terasa jelas. */
const heroIntroGlassShellClass =
  "hero-intro-glass-shell relative z-[1] mx-auto w-full min-w-0 max-w-[min(100%,46rem)] overflow-hidden rounded-2xl border border-white/[0.22] bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.2),rgba(255,255,255,0.08)_52%,transparent_70%),linear-gradient(to_bottom_right,rgba(255,255,255,0.11),rgba(255,255,255,0.06)_100%),linear-gradient(to_bottom_right,rgba(230,236,248,0.06),rgba(6,10,20,0.06),rgba(1,3,10,0.14))] px-3.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_1px_2px_rgba(0,0,0,0.14),0_6px_14px_rgba(0,0,0,0.06),0_14px_30px_rgba(1,6,18,0.12),0_24px_48px_-8px_rgba(2,8,18,0.14)] ring-1 ring-inset ring-white/[0.14] backdrop-blur-[16px] backdrop-saturate-[1.15] max-md:border-white/[0.18] max-md:bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.16),rgba(255,255,255,0.065)_50%,transparent_68%),linear-gradient(to_bottom_right,rgba(255,255,255,0.09),rgba(255,255,255,0.048)_100%),linear-gradient(to_bottom_right,rgba(230,236,248,0.05),rgba(6,10,18,0.07),rgba(1,3,9,0.12))] max-md:px-3 max-md:py-2 max-md:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_2px_4px_rgba(0,0,0,0.12),0_6px_18px_rgba(0,0,0,0.05),0_14px_34px_rgba(1,4,14,0.12)] md:px-5 md:py-3";

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
          <div className="hero-content-enter w-full drop-shadow-[0_2px_6px_rgba(2,7,18,0.38)]">
            <div className="mx-auto flex w-full min-w-0 max-w-[min(100%,56.25rem)] flex-col text-left">
              <div className="hero-content-stack mt-5 flex flex-col sm:mt-6 md:mt-0">
                <div className="hero-title-intro-block flex flex-col gap-2 md:gap-3">
                  <div className="space-y-1.5 md:space-y-2">
                  <div className="hero-eyebrow-row -mt-3 -translate-y-3 flex w-full items-center justify-center gap-2.5 will-change-transform sm:-mt-4 sm:translate-y-0 sm:gap-3.5 md:-mt-6 md:-translate-y-2 md:gap-4 lg:-mt-8 lg:-translate-y-4">
                    <span
                      className="h-px min-w-[1.25rem] flex-1 rounded-full bg-gradient-to-r from-transparent via-white/12 to-white/20 max-[360px]:max-w-[2.25rem] sm:max-w-none"
                      aria-hidden
                    />
                    <span className="inline-flex shrink-0 items-center gap-2 sm:gap-2.5">
                      <span
                        className="size-1 shrink-0 rounded-full bg-white/55 shadow-[0_0_6px_rgba(255,255,255,0.22)]"
                        aria-hidden
                      />
                      <CmsText
                        path="hero.brandLabel"
                        text={hero.brandLabel}
                        as="span"
                        className="shrink-0 text-center text-[clamp(10px,2.6vw,11px)] font-medium uppercase leading-snug tracking-[0.2em] text-white/85 md:text-[12px] md:tracking-[0.24em]"
                      />
                      <span
                        className="size-1 shrink-0 rounded-full bg-white/55 shadow-[0_0_6px_rgba(255,255,255,0.22)]"
                        aria-hidden
                      />
                    </span>
                    <span
                      className="h-px min-w-[1.25rem] flex-1 rounded-full bg-gradient-to-l from-transparent via-white/12 to-white/20 max-[360px]:max-w-[2.25rem] sm:max-w-none"
                      aria-hidden
                    />
                  </div>
                  <div className="flex w-full justify-start px-0.5 sm:px-0">
                    <h1
                      id="hero-heading"
                      className="w-full max-w-[56.25rem] px-[0.02em] text-left uppercase [font-family:var(--font-sora),Montserrat,sans-serif] text-[#F5F7FF] [text-shadow:0_1px_2px_rgba(2,7,18,0.96),0_0_7px_rgba(2,7,18,0.62)] [-webkit-text-stroke:0.32px_rgba(2,7,18,0.32)] max-md:[text-shadow:0_1px_2px_rgba(2,7,18,0.98),0_0_7px_rgba(2,7,18,0.7)]"
                    >
                      <span className="hero-heading-line1-row inline-flex max-w-full items-center gap-2 sm:gap-2.5">
                        <CmsText
                          path="hero.headingLine1"
                          text={hero.headingLine1}
                          fallbackText="SOLUSI SISTEM"
                          as="span"
                          className="hero-heading-glass-line1 min-w-0 shrink-0 font-extrabold leading-[1.02] tracking-[-0.04em] text-[#F5F7FF]/88 text-[clamp(0.9rem,2.6vw,1.2rem)] md:text-[1.5rem]"
                        />
                        <span
                          className="hero-heading-line1-end-rule h-px w-10 shrink-0 rounded-full bg-gradient-to-r from-white/45 via-white/22 to-transparent shadow-[0_0_10px_rgba(255,255,255,0.08)] sm:w-12 md:w-16"
                          aria-hidden
                        />
                      </span>
                      <span className="hero-heading-crystal-wrap relative isolate mt-1 block md:mt-1.5">
                        <CmsText
                          path="hero.headingMiddle"
                          text={hero.headingMiddle}
                          fallbackText="PENDINGIN"
                          as="span"
                          className="hero-heading-crystal hero-heading-glass-middle block text-[clamp(2.35rem,12.75vw,5.1rem)] font-extrabold leading-[0.9] tracking-[-0.022em]"
                        />
                      </span>
                      <span className="hero-heading-line2-row mt-0.5 inline-flex max-w-full items-center gap-2 sm:gap-2.5 md:mt-1">
                        <CmsText
                          path="hero.headingLine2"
                          text={hero.headingLine2}
                          fallbackText="TERINTEGRASI"
                          as="span"
                          className="hero-heading-accent hero-heading-glass-line2 min-w-0 shrink-0"
                        />
                        <span
                          className="hero-heading-line1-end-rule h-px w-10 shrink-0 rounded-full bg-gradient-to-r from-white/45 via-white/22 to-transparent shadow-[0_0_10px_rgba(255,255,255,0.08)] sm:w-12 md:w-16"
                          aria-hidden
                        />
                      </span>
                    </h1>
                  </div>
                </div>
                </div>

                <div className="hero-intro-stack mx-auto w-full min-w-0 pt-2 text-left md:pt-4">
                  {hero.introBadge.trim() ? (
                    <div className="hero-intro-badge-row -mt-1 mb-2 flex w-full items-center justify-center gap-2.5 sm:mb-2.5 md:mt-0 md:mb-3">
                      <span
                        className="h-px min-w-[1.25rem] flex-1 rounded-full bg-gradient-to-r from-transparent via-white/12 to-white/20 max-[360px]:max-w-[2.25rem] sm:max-w-none"
                        aria-hidden
                      />
                      <span className="inline-flex shrink-0 items-center gap-2 sm:gap-2.5">
                        <span
                          className="size-1 shrink-0 rounded-full bg-white/55 shadow-[0_0_6px_rgba(255,255,255,0.22)]"
                          aria-hidden
                        />
                        <CmsText
                          path="hero.introBadge"
                          text={hero.introBadge}
                          as="span"
                          className="shrink-0 text-center text-[clamp(10px,2.6vw,11px)] font-medium uppercase leading-snug tracking-[0.2em] text-white/85 md:text-[12px] md:tracking-[0.24em]"
                        />
                        <span
                          className="size-1 shrink-0 rounded-full bg-white/55 shadow-[0_0_6px_rgba(255,255,255,0.22)]"
                          aria-hidden
                        />
                      </span>
                      <span
                        className="h-px min-w-[1.25rem] flex-1 rounded-full bg-gradient-to-l from-transparent via-white/12 to-white/20 max-[360px]:max-w-[2.25rem] sm:max-w-none"
                        aria-hidden
                      />
                    </div>
                  ) : null}
                  <div
                    className={`${heroIntroGlassShellClass} hero-intro-phone max-md:translate-y-4 w-full min-w-0 text-pretty text-left`}
                  >
                    <p
                      className={`hero-intro-body ${heroIntroBodyClass} my-0 text-left md:max-w-[44rem]`}
                    >
                      <CmsText path="hero.intro.before1" text={hero.intro.before1} as="span" />{" "}
                      <CmsText
                        path="hero.intro.bold1"
                        text={hero.intro.bold1}
                        as="span"
                        className="font-semibold tracking-[0.005em] text-[#F7F9FF] [text-shadow:0_1px_2px_rgba(0,0,0,0.42)]"
                      />{" "}
                      <CmsText path="hero.intro.middle" text={hero.intro.middle} as="span" />{" "}
                      <CmsText
                        path="hero.intro.bold2"
                        text={hero.intro.bold2}
                        as="span"
                        className="font-semibold tracking-[0.005em] text-[#F7F9FF] [text-shadow:0_1px_2px_rgba(0,0,0,0.42)]"
                      />{" "}
                      <CmsText path="hero.intro.after2" text={hero.intro.after2} as="span" />{" "}
                      <CmsText
                        path="hero.intro.bold3"
                        text={hero.intro.bold3}
                        as="span"
                        className="font-semibold tracking-[0.005em] text-[#9AEAFA] [text-shadow:0_1px_2px_rgba(0,0,0,0.38),0_0_14px_rgba(2,10,24,0.22)]"
                      />{" "}
                      <CmsText path="hero.intro.after3" text={hero.intro.after3} as="span" />
                    </p>
                  </div>
                </div>

                <div className="hero-process-block mt-14 flex w-full min-w-0 flex-col gap-y-0.5 pt-px md:mt-[4.5rem] md:gap-y-2 md:pt-0">
                  <div
                    id="proses"
                    className="mx-auto w-full min-w-0 scroll-mt-[max(5rem,env(safe-area-inset-top,0px)+4.5rem)] space-y-1.5 py-0 text-center md:scroll-mt-[5.25rem] md:space-y-2 md:py-1"
                  >
                    <div className="hero-proses-badge-row mb-1 flex w-full flex-col items-center gap-1 sm:mb-1.5 md:mb-2">
                      <div className="flex w-full max-w-[min(100%,28rem)] items-center justify-center gap-2.5">
                        <span
                          className="h-px min-w-[1.25rem] flex-1 rounded-full bg-gradient-to-r from-transparent via-white/12 to-white/20 max-[360px]:max-w-[2.25rem] sm:max-w-none"
                          aria-hidden
                        />
                        <span className="inline-flex shrink-0 items-center gap-2 sm:gap-2.5">
                          <span
                            className="size-1 shrink-0 rounded-full bg-white/55 shadow-[0_0_6px_rgba(255,255,255,0.22)]"
                            aria-hidden
                          />
                          <span className="inline-flex shrink-0 flex-col items-center gap-1">
                            <CmsText
                              path="hero.prosesBadge"
                              text={hero.prosesBadge}
                              as="span"
                              className="shrink-0 text-center text-[clamp(10px,2.6vw,11px)] font-semibold uppercase leading-tight tracking-[0.2em] text-[#F7FAFF] antialiased [text-rendering:geometricPrecision] [text-shadow:0_0.5px_0_rgb(2,6,16),0_1px_2px_rgba(0,0,0,0.55),0_0_1px_rgba(0,0,0,0.4)] md:text-[12px] md:tracking-[0.24em]"
                            />
                            <span className="relative h-[2px] w-[min(100%,11rem)] max-w-[85vw] shrink-0" aria-hidden>
                              <span className="absolute -inset-x-0.5 -inset-y-0.5 rounded-full bg-gradient-to-r from-transparent via-sky-400/35 to-transparent opacity-90 blur-[3px]" />
                              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/25 via-sky-200/50 to-transparent shadow-[0_0_10px_rgba(125,211,252,0.22)]" />
                              <span className="absolute inset-x-[8%] inset-y-0 rounded-full bg-gradient-to-r from-white/0 via-white/70 to-white/0" />
                            </span>
                          </span>
                          <span
                            className="size-1 shrink-0 rounded-full bg-white/55 shadow-[0_0_6px_rgba(255,255,255,0.22)]"
                            aria-hidden
                          />
                        </span>
                        <span
                          className="h-px min-w-[1.25rem] flex-1 rounded-full bg-gradient-to-l from-transparent via-white/12 to-white/20 max-[360px]:max-w-[2.25rem] sm:max-w-none"
                          aria-hidden
                        />
                      </div>
                    </div>
                    <ProsesKerjaFlow
                      variant="hero"
                      aria-label="Proses kerja"
                      images={hero.prosesStepImages}
                      imageZoom={hero.prosesStepImageZoom}
                    />
                    <CmsHeroProsesImagesEditor images={hero.prosesStepImages} zoom={hero.prosesStepImageZoom} />
                  </div>
                </div>
              </div>
              <div className="hero-cta-group mx-auto mb-0 mt-8 flex w-full max-w-[42rem] flex-col items-stretch justify-start gap-3 pb-[calc(48px+env(safe-area-inset-bottom,0px))] pt-3 sm:mt-9 sm:pt-4 md:mb-3 md:mt-8 md:flex-row md:flex-wrap md:items-center md:justify-start md:gap-4 md:pb-0 md:pt-4">
                <CmsHeroPrimaryActions
                  whatsappClassName="hero-hubungi-cta group/cta inline-flex min-h-[50px] w-full shrink-0 touch-manipulation items-center justify-center gap-2.5 rounded-[0.9375rem] border border-sky-200/25 bg-[linear-gradient(90deg,rgba(27,91,214,0.95),rgba(53,133,242,0.95))] px-5 py-3.5 text-[0.875rem] font-semibold uppercase leading-snug tracking-[0.03em] text-[#F5F7FF] shadow-[0_10px_30px_rgba(5,28,70,0.38),0_0_18px_rgba(89,216,255,0.14),inset_0_1px_0_rgba(255,255,255,0.22)] ring-1 ring-inset ring-white/18 transition-[opacity,transform,box-shadow,border-color] duration-300 ease-out hover:opacity-95 hover:border-sky-100/35 active:opacity-[0.94] motion-safe:-translate-y-px motion-safe:hover:shadow-[0_12px_36px_rgba(5,28,70,0.45),0_0_24px_rgba(89,216,255,0.18),inset_0_1px_0_rgba(255,255,255,0.24)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white max-md:shadow-[0_12px_34px_rgba(3,16,42,0.52),0_0_16px_rgba(89,216,255,0.18),inset_0_1px_0_rgba(255,255,255,0.24)] md:min-h-[50px] md:w-auto md:flex-1 md:rounded-xl md:py-3 md:text-base md:min-w-[12rem]"
                  secondaryClassName="hero-lihat-produk-cta group/ghost inline-flex min-h-[50px] w-full shrink-0 touch-manipulation items-center justify-center gap-2 rounded-[0.9375rem] border border-white/[0.34] bg-white/[0.05] px-5 py-3.5 text-[0.875rem] font-semibold uppercase leading-snug tracking-[0.03em] text-[#F5F7FF] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-[10px] transition-[opacity,transform,background-color,border-color,box-shadow] duration-300 ease-out hover:bg-white/[0.11] hover:border-[#59D8FF]/55 hover:shadow-[0_0_24px_rgba(89,216,255,0.12)] active:opacity-[0.94] motion-safe:active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white max-md:bg-white/[0.08] max-md:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_28px_rgba(2,8,24,0.32)] md:min-h-[50px] md:w-auto md:flex-1 md:rounded-xl md:py-3 md:text-base md:min-w-[12rem]"
                  heroWhatsAppLabel={hero.ctaWhatsApp.label}
                  heroWhatsAppMessage={hero.ctaWhatsApp.message}
                  heroWhatsAppAriaLabel={hero.ctaWhatsApp.ariaLabel}
                  secondaryLabel={hero.ctaSecondary.label}
                  secondaryHref={hero.ctaSecondary.href}
                  secondaryAriaLabel={hero.ctaSecondary.ariaLabel}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
