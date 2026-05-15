import Image from "next/image";
import Link from "next/link";

import { LayananPageCmsText } from "@/components/aytipanel/layanan-page-cms-text";
import { LayananPageHeroAltEditor } from "@/components/aytipanel/layanan-page-hero-alt-editor";
import { LayananPageHeroImage } from "@/components/aytipanel/layanan-page-hero-image";
import { LayananPortfolioCmsToggle } from "@/components/aytipanel/layanan-portfolio-cms-toggle";
import { ScrollRevealSection } from "@/components/aytipanel/scroll-reveal-section";
import { SiteFooter } from "@/components/aytipanel/site-footer";
import { getProductBySlug } from "@/components/aytipanel/products-catalog";
import { IconWhatsApp } from "@/components/aytipanel/icons";
import { WhatsAppCTAButton } from "@/components/aytipanel/whatsapp-cta-button";
import {
  sectionInsetX,
  sectionMax,
  sectionPaddingY,
  sectionEyebrow,
  sectionHeading,
  sectionLead,
  surfaceBand,
  surfaceBandMuted,
  themedCard,
  themedCardInteractive,
} from "@/components/aytipanel/theme-section-ui";
import {
  LAYANAN_PAGES_BASE_PATH,
  SERVICE_BRAND_TAGLINE,
  getServicePageBySlug,
  type ServicePageDef,
} from "@/lib/service-pages";
import type { ServiceCitySeoOverlay } from "@/lib/seo-service-city-overlay";
import { resolveServicePublicPath, serviceCityPagePath } from "@/lib/seo-service-paths";
import { cmsPortfolioPreviewByIds, cmsPortfolioPreviewSlice } from "@/lib/cms-portfolio-preview";
import { mergeAytiCardClass, mergeAytiCtaClass, mergeAytiTitleClass } from "@/lib/ayti-icon-cold";
import type { SiteContent } from "@/lib/site-content-model";
import { getWhatsAppProductName } from "@/components/aytipanel/constants/whatsapp";
import { generateWhatsAppMessage } from "@/utils/whatsapp";

const faqCard = mergeAytiCardClass(
  "rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-colors hover:border-accent/30",
);

const FALLBACK_PORTFOLIO_IMAGE = "/images/layanan/instalasi-panel-cold-room/1.jpg";

function pickPortfolioProjects(
  content: SiteContent,
  maxItems: number,
  preferredIds?: string[],
): {
  name: string;
  location: string;
  imageSrc: string;
  imageAlt: string;
  snippetLabel: string;
}[] {
  if (maxItems <= 0) return [];
  if (preferredIds?.length) {
    const byId = cmsPortfolioPreviewByIds(content, preferredIds, maxItems);
    if (byId.length >= 1) {
      return byId.map((item) => ({
        name: item.name,
        location: item.location,
        imageSrc: item.imageSrc.trim() || FALLBACK_PORTFOLIO_IMAGE,
        imageAlt: item.imageAlt,
        snippetLabel: item.snippetLabel,
      }));
    }
  }
  return cmsPortfolioPreviewSlice(content, maxItems).map((item) => ({
    name: item.name,
    location: item.location,
    imageSrc: item.imageSrc.trim() || FALLBACK_PORTFOLIO_IMAGE,
    imageAlt: item.imageAlt,
    snippetLabel: item.snippetLabel,
  }));
}

function Breadcrumb({ page, citySeo }: { page: ServicePageDef; citySeo?: ServiceCitySeoOverlay }) {
  if (citySeo) {
    return (
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <ol className="flex flex-wrap gap-x-2 gap-y-1">
          <li>
            <Link href="/" className="text-accent underline-offset-4 hover:underline">
              Beranda
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/${citySeo.hubSlug}`}
              className="text-accent underline-offset-4 hover:underline"
            >
              Area {citySeo.placename}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={citySeo.serviceRootPath}
              className="text-accent underline-offset-4 hover:underline"
            >
              {page.navLabel}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">{citySeo.placename}</li>
        </ol>
      </nav>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
      <ol className="flex flex-wrap gap-x-2 gap-y-1">
        <li>
          <Link href="/" className="text-accent underline-offset-4 hover:underline">
            Beranda
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link href={LAYANAN_PAGES_BASE_PATH} className="text-accent underline-offset-4 hover:underline">
            Layanan
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className="text-foreground">{page.navLabel}</li>
      </ol>
    </nav>
  );
}

export function ServicePageView({
  page,
  content,
  canonicalHref: _canonicalHref,
  cmsPageIndex = -1,
  showPortfolioSection = false,
  citySeo,
  waDataSource,
}: {
  page: ServicePageDef;
  content: SiteContent;
  canonicalHref: string;
  cmsPageIndex?: number;
  showPortfolioSection?: boolean;
  citySeo?: ServiceCitySeoOverlay;
  waDataSource?: string;
}) {
  const heroSrc = page.hero.imageSrc;
  const heroAlt = page.hero.imageAlt;
  const waProductName = citySeo
    ? citySeo.waTopicPhrase
    : getWhatsAppProductName(page.waMessageKey);
  const waMessage = generateWhatsAppMessage(waProductName, page.waContext);
  const waFunnel = {
    message: waMessage,
    dataSource: waDataSource ?? (citySeo ? `service_city_${citySeo.slug}` : `service_${page.slug}`),
  } as const;

  /** Satu foto referensi proyek — bagian penting; nonaktifkan lewat CMS (mode edit). */
  const portfolioMax = showPortfolioSection === false ? 0 : 1;
  const portfolioItems = pickPortfolioProjects(content, portfolioMax, citySeo?.relatedGalleryProjectIds);
  const relatedServices = page.relatedServiceSlugs
    .map((s) => getServicePageBySlug(s))
    .filter((p): p is ServicePageDef => Boolean(p));
  const relatedProducts = page.relatedProductSlugs
    .map((s) => getProductBySlug(s))
    .filter((p): p is NonNullable<ReturnType<typeof getProductBySlug>> => Boolean(p));

  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <main>
        <section
          className="relative flex min-h-[min(520px,88dvh)] scroll-mt-24 items-center overflow-hidden border-b border-border bg-background"
          aria-labelledby="service-hero-heading"
        >
          <div className="absolute inset-0">
            <LayananPageHeroImage cmsPageIndex={cmsPageIndex} src={heroSrc} alt={heroAlt} />
          </div>
          <LayananPageHeroAltEditor cmsPageIndex={cmsPageIndex} alt={heroAlt} />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--hero-from)] via-[var(--hero-from)]/90 to-[var(--hero-to)]/75"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent"
            aria-hidden
          />
          <div className={`relative z-10 w-full ${sectionInsetX} py-20 md:py-24`}>
            <div className={`${sectionMax}`}>
              <Breadcrumb page={page} citySeo={citySeo} />
              <div className="max-w-2xl space-y-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
                  PT AYTI INDO PANEL — {SERVICE_BRAND_TAGLINE}
                </p>
                <h1
                  id="service-hero-heading"
                  className="text-balance text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl lg:text-[2.5rem]"
                >
                  <LayananPageCmsText
                    cmsPageIndex={cmsPageIndex}
                    field="heroH1"
                    text={page.hero.h1}
                    as="span"
                    className="inline"
                  />
                </h1>
                <p className="text-xl font-semibold leading-snug text-white/92 md:text-2xl">
                  <LayananPageCmsText
                    cmsPageIndex={cmsPageIndex}
                    field="heroSubheadline"
                    text={page.hero.subheadline}
                    as="span"
                    className="inline"
                  />
                </p>
                <p className="text-lg leading-relaxed text-white/88">
                  <LayananPageCmsText
                    cmsPageIndex={cmsPageIndex}
                    field="heroLead"
                    text={page.hero.lead}
                    as="span"
                    className="inline"
                  />
                </p>
                <ul
                  className="space-y-2 border-l-2 border-white/35 pl-4 text-sm leading-snug text-white/85 sm:text-[0.9375rem]"
                  role="list"
                >
                  {page.hero.bullets.map((b, i) => (
                    <li key={`${b.slice(0, 24)}-${i}`} className="flex gap-2">
                      <span className="text-emerald-300" aria-hidden>
                        ✓
                      </span>
                      <span>
                        <LayananPageCmsText
                          cmsPageIndex={cmsPageIndex}
                          field={`heroBullets.${i}`}
                          text={b}
                          as="span"
                          className="inline"
                        />
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <WhatsAppCTAButton
                    className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/85 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-[2px] transition-all duration-200 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    ariaLabel={`Konsultasi ${page.navLabel} via WhatsApp`}
                    message={waMessage}
                    dataSource={waFunnel.dataSource}
                  >
                    <IconWhatsApp className="h-4 w-4 shrink-0 opacity-95" aria-hidden />
                    Konsultasi &amp; Survey Lokasi
                  </WhatsAppCTAButton>
                  <a
                    href="#penjelasan-layanan"
                    className={mergeAytiCtaClass(
                      "rounded-md px-1.5 py-0.5 text-sm font-semibold text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline",
                    )}
                  >
                    Pelajari layanan
                  </a>
                </div>
                <p className="text-xs font-medium tracking-wide text-white/65">
                  Respon cepat • Konsultasi gratis • Tanpa komitmen
                </p>
              </div>
            </div>
          </div>
        </section>

        <ScrollRevealSection>
          <section
            id="penjelasan-layanan"
            className={`scroll-mt-24 ${surfaceBandMuted} ${sectionPaddingY}`}
            aria-labelledby="service-overview-heading"
          >
            <div className={sectionMax}>
              <header className="max-w-3xl space-y-4">
                <p className={sectionEyebrow}>
                  <LayananPageCmsText
                    cmsPageIndex={cmsPageIndex}
                    field="overviewEyebrow"
                    text={page.overview.eyebrow}
                    as="span"
                    className="inline"
                  />
                </p>
                <h2 id="service-overview-heading" className={sectionHeading}>
                  <LayananPageCmsText
                    cmsPageIndex={cmsPageIndex}
                    field="overviewTitle"
                    text={page.overview.title}
                    as="span"
                    className="inline"
                  />
                </h2>
                {page.overview.paragraphs.map((p, i) => (
                  <p key={p.slice(0, 40)} className={sectionLead}>
                    <LayananPageCmsText
                      cmsPageIndex={cmsPageIndex}
                      field={`overviewParagraphs.${i}`}
                      text={p}
                      as="span"
                      className="inline"
                    />
                  </p>
                ))}
                {citySeo && citySeo.coverageAreas.length > 0 ? (
                  <div className="pt-2">
                    <p className="text-sm font-semibold text-foreground">Kawasan layanan</p>
                    <ul className="mt-2 flex flex-wrap gap-2" role="list">
                      {citySeo.coverageAreas.map((area) => (
                        <li
                          key={area}
                          className="rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground"
                        >
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </header>

              <div className="mt-10 grid gap-6 md:grid-cols-3">
                {page.functions.map((item) => (
                  <article key={item.title} className={themedCardInteractive}>
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-3 text-base leading-relaxed text-muted">{item.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </ScrollRevealSection>

        <ScrollRevealSection>
          <section className={`${surfaceBand} ${sectionPaddingY}`} aria-labelledby="service-benefits-heading">
            <div className={sectionMax}>
              <header className="max-w-3xl space-y-4">
                <p className={sectionEyebrow}>Manfaat</p>
                <h2 id="service-benefits-heading" className={sectionHeading}>
                  Nilai untuk operasi Anda
                </h2>
              </header>
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {page.benefits.map((item) => (
                  <article key={item.title} className={themedCard}>
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-3 text-base leading-relaxed text-muted">{item.body}</p>
                  </article>
                ))}
              </div>

              <div className="mt-12">
                <h3 className="text-lg font-semibold text-foreground">Industri terkait</h3>
                <ul className="mt-4 flex flex-wrap gap-2" role="list">
                  {page.industries.map((ind) => (
                    <li
                      key={ind}
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground"
                    >
                      {ind}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </ScrollRevealSection>

        <ScrollRevealSection>
          <section
            className={`${surfaceBandMuted} ${sectionPaddingY}`}
            aria-labelledby="service-advantages-heading"
          >
            <div className={sectionMax}>
              <header className="max-w-3xl space-y-4">
                <p className={sectionEyebrow}>{page.advantages.eyebrow}</p>
                <h2 id="service-advantages-heading" className={sectionHeading}>
                  {page.advantages.title}
                </h2>
                <p className={sectionLead}>{page.advantages.lead}</p>
              </header>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2" role="list">
                {page.advantages.items.map((text) => (
                  <li
                    key={text}
                    className={`${themedCard} flex items-start gap-3 text-base font-medium leading-snug text-foreground`}
                  >
                    <span className="mt-0.5 shrink-0 font-semibold text-accent" aria-hidden>
                      ✔
                    </span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </ScrollRevealSection>

        <ScrollRevealSection>
          <section className={`${surfaceBand} ${sectionPaddingY}`} aria-labelledby="service-specs-heading">
            <div className={sectionMax}>
              <header className="max-w-3xl space-y-4">
                <p className={sectionEyebrow}>{page.specs.eyebrow}</p>
                <h2 id="service-specs-heading" className={sectionHeading}>
                  {page.specs.title}
                </h2>
                <p className={sectionLead}>{page.specs.lead}</p>
              </header>
              <dl className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
                {page.specs.rows.map((row) => (
                  <div
                    key={row.label}
                    className="grid gap-1 px-5 py-4 sm:grid-cols-[minmax(9rem,12rem)_1fr] sm:gap-6 sm:px-6"
                  >
                    <dt className="text-sm font-semibold uppercase tracking-wide text-muted">{row.label}</dt>
                    <dd className="text-base leading-relaxed text-foreground">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        </ScrollRevealSection>

        <ScrollRevealSection>
          <section
            className={`${surfaceBandMuted} ${sectionPaddingY}`}
            aria-labelledby="service-applications-heading"
          >
            <div className={sectionMax}>
              <header className="max-w-3xl space-y-4">
                <p className={sectionEyebrow}>Aplikasi industri</p>
                <h2 id="service-applications-heading" className={sectionHeading}>
                  Di sektor mana layanan ini dipakai
                </h2>
                <p className={sectionLead}>{page.applicationsIntro}</p>
              </header>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {page.applications.map((item) => (
                  <article key={item.title} className={themedCardInteractive}>
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-3 text-base leading-relaxed text-muted">{item.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </ScrollRevealSection>

        <ScrollRevealSection>
          <section className={`${surfaceBand} ${sectionPaddingY}`} aria-labelledby="service-portfolio-heading">
            <div className={sectionMax}>
              <header className="max-w-3xl space-y-4">
                <p className={sectionEyebrow}>{page.portfolio.eyebrow}</p>
                <h2 id="service-portfolio-heading" className={sectionHeading}>
                  {page.portfolio.title}
                </h2>
                <p className={sectionLead}>{page.portfolio.lead}</p>
                <LayananPortfolioCmsToggle cmsPageIndex={cmsPageIndex} enabled={showPortfolioSection} />
              </header>
              {portfolioItems[0] ? (
                <article
                  className={mergeAytiCardClass(
                    "mt-8 max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]",
                  )}
                >
                  <div className="relative aspect-[4/3] bg-muted-bg-strong">
                    <Image
                      src={portfolioItems[0].imageSrc}
                      alt={portfolioItems[0].imageAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 28rem"
                    />
                  </div>
                  <div className="space-y-2 p-5">
                    {portfolioItems[0].snippetLabel ? (
                      <p className="text-xs leading-snug text-muted">{portfolioItems[0].snippetLabel}</p>
                    ) : null}
                    <h3
                      className={`text-base font-semibold text-foreground${portfolioItems[0].snippetLabel ? " mt-1" : ""}`}
                    >
                      {portfolioItems[0].name}
                    </h3>
                    <p className="text-sm text-muted">{portfolioItems[0].location}</p>
                  </div>
                </article>
              ) : null}
              <p className="mt-8 text-center">
                <Link
                  href="/gallery-project"
                  className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
                >
                  Lihat semua proyek di galeri →
                </Link>
              </p>
            </div>
          </section>
        </ScrollRevealSection>

        {(relatedServices.length > 0 || relatedProducts.length > 0) && (
          <ScrollRevealSection>
            <section
              className={`${surfaceBandMuted} ${sectionPaddingY}`}
              aria-labelledby="service-related-heading"
            >
              <div className={sectionMax}>
                <header className="max-w-3xl space-y-4">
                  <p className={sectionEyebrow}>Layanan terkait</p>
                  <h2 id="service-related-heading" className={sectionHeading}>
                    Eksplor solusi pendukung
                  </h2>
                </header>
                {relatedServices.length > 0 ? (
                  <ul className="mt-6 flex flex-wrap gap-2" role="list">
                    {relatedServices.map((rel) => (
                      <li key={rel.slug}>
                        <Link
                          href={resolveServicePublicPath(rel.slug)}
                          className="inline-flex rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-accent/40 hover:text-accent"
                        >
                          {rel.navLabel}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {relatedProducts.length > 0 ? (
                  <div className="mt-8">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Produk terkait</h3>
                    <ul className="mt-3 flex flex-wrap gap-2" role="list">
                      {relatedProducts.map((prod) => (
                        <li key={prod.slug}>
                          <Link
                            href={`/produk/${prod.slug}`}
                            className="inline-flex rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent/35 hover:text-accent"
                          >
                            {prod.title}
                            {prod.subtitle ? ` ${prod.subtitle}` : ""}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </section>
          </ScrollRevealSection>
        )}

        {citySeo && citySeo.siblingCities.length > 0 ? (
          <ScrollRevealSection>
            <section
              className={`${surfaceBandMuted} ${sectionPaddingY}`}
              aria-labelledby="service-sibling-cities-heading"
            >
              <div className={sectionMax}>
                <header className="max-w-3xl space-y-4">
                  <p className={sectionEyebrow}>Wilayah terdekat</p>
                  <h2 id="service-sibling-cities-heading" className={sectionHeading}>
                    {page.navLabel} di kota lain
                  </h2>
                  <p className={sectionLead}>
                    Lihat halaman {page.navLabel.toLowerCase()} untuk kawasan layanan di sekitar{" "}
                    {citySeo.displayLabel}.
                  </p>
                </header>
                <ul className="mt-8 flex flex-wrap gap-2" role="list">
                  {citySeo.siblingCities.map((sibling) => (
                    <li key={sibling.slug}>
                      <Link
                        href={serviceCityPagePath(sibling.slug)}
                        className="inline-flex rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:border-accent/40 hover:text-accent"
                      >
                        {sibling.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </ScrollRevealSection>
        ) : null}

        <ScrollRevealSection>
          <section className={`${surfaceBand} ${sectionPaddingY}`} aria-labelledby="service-faq-heading">
            <div className={`${sectionMax} max-w-3xl`}>
              <header className="space-y-4 text-center md:text-left">
                <p className={sectionEyebrow}>FAQ</p>
                <h2 id="service-faq-heading" className={sectionHeading}>
                  Pertanyaan yang sering diajukan
                </h2>
              </header>
              <div className="mt-8 space-y-4">
                {page.faq.map((item, i) => (
                  <details key={item.question} className={`group ${faqCard}`}>
                    <summary
                      className={mergeAytiTitleClass(
                        "flex cursor-pointer list-none items-start justify-between gap-4 font-semibold leading-snug text-foreground marker:hidden [&::-webkit-details-marker]:hidden",
                      )}
                    >
                      <span>
                        <LayananPageCmsText
                          cmsPageIndex={cmsPageIndex}
                          field={`faq.${i}.question`}
                          text={item.question}
                          as="span"
                          className="inline"
                        />
                      </span>
                      <span className="mt-0.5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180">
                        ▾
                      </span>
                    </summary>
                    <p className="mt-4 border-t border-border pt-4 text-base leading-relaxed text-muted">
                      <LayananPageCmsText
                        cmsPageIndex={cmsPageIndex}
                        field={`faq.${i}.answer`}
                        text={item.answer}
                        as="span"
                        className="inline"
                      />
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        </ScrollRevealSection>

        <ScrollRevealSection>
          <section className={`${sectionPaddingY} ${surfaceBandMuted}`} aria-label="Konsultasi layanan">
            <div className={sectionMax}>
              <div className="rounded-2xl bg-gradient-to-r from-primary to-accent px-8 py-14 text-white shadow-[var(--shadow-cta)] md:px-14 md:py-16">
                <div className="flex flex-col items-center justify-between gap-8 text-center lg:flex-row lg:items-center lg:text-left">
                  <div className="max-w-xl space-y-4">
                    <h2 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                      <LayananPageCmsText
                        cmsPageIndex={cmsPageIndex}
                        field="ctaHeadline"
                        text={page.ctaHeadline}
                        as="span"
                        className="inline"
                      />
                    </h2>
                    <p className="text-lg leading-relaxed text-white/85">
                      <LayananPageCmsText
                        cmsPageIndex={cmsPageIndex}
                        field="ctaLead"
                        text={page.ctaLead}
                        as="span"
                        className="inline"
                      />
                    </p>
                    <p className="text-sm font-medium text-white/70">
                      {SERVICE_BRAND_TAGLINE} • Respon cepat • Survey lokasi
                    </p>
                  </div>
                  <WhatsAppCTAButton
                    className="inline-flex w-full min-w-[min(100%,280px)] shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-10 py-4 text-base font-semibold text-brand-contrast shadow-[0_10px_40px_rgba(0,0,0,0.18)] transition-all duration-200 hover:opacity-95 motion-safe:hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:w-auto"
                    ariaLabel={`Konsultasi ${page.navLabel} via WhatsApp`}
                    message={waMessage}
                    dataSource={waFunnel.dataSource}
                  >
                    <IconWhatsApp className="h-6 w-6 shrink-0 text-[#25D366]" aria-hidden />
                    Chat WhatsApp
                  </WhatsAppCTAButton>
                </div>
              </div>
            </div>
          </section>
        </ScrollRevealSection>
      </main>
      <SiteFooter whatsappFunnel={waFunnel} />
    </div>
  );
}
