import Image from "next/image";
import Link from "next/link";

import { ScrollRevealSection } from "@/components/aytipanel/scroll-reveal-section";
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
import { getCityPlacename } from "@/lib/local-seo-geo";
import {
  LOCAL_SEO_BRAND_TAGLINE,
  type LocalSeoCityPageDef,
} from "@/lib/local-seo-city-pages";
import { cmsPortfolioPreviewSlice } from "@/lib/cms-portfolio-preview";
import { layananPagePath } from "@/lib/service-pages";
import { mergeAytiCardClass, mergeAytiCtaClass, mergeAytiTitleClass } from "@/lib/ayti-icon-cold";
import type { SiteContent } from "@/lib/site-content-model";
import { generateWhatsAppMessage } from "@/utils/whatsapp";

const faqCard = mergeAytiCardClass(
  "rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-colors hover:border-accent/30",
);

function Breadcrumb({ page }: { page: LocalSeoCityPageDef }) {
  const placename = getCityPlacename(page.cityKey);
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
          <Link href={`/lokasi-${page.cityKey}`} className="text-accent underline-offset-4 hover:underline">
            Area {placename}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className="text-foreground">{page.topicLabel}</li>
      </ol>
    </nav>
  );
}

export function LocalSeoCityLandingView({
  page,
  content,
  canonicalHref: _canonicalHref,
}: {
  page: LocalSeoCityPageDef;
  content: SiteContent;
  canonicalHref: string;
}) {
  const waMessage = generateWhatsAppMessage(page.waTopicPhrase, page.whatsAppContext);
  const waFunnel = { message: waMessage, dataSource: `local_seo_${page.slug}` } as const;
  const portfolioItems = cmsPortfolioPreviewSlice(content, 4);
  const relatedProducts = page.relatedProductSlugs
    .map((s) => getProductBySlug(s))
    .filter((p): p is NonNullable<ReturnType<typeof getProductBySlug>> => Boolean(p));

  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <main>
        <section
          className="relative flex min-h-[min(520px,88dvh)] scroll-mt-24 items-center overflow-hidden border-b border-border bg-background"
          aria-labelledby="local-seo-hero-heading"
        >
          <Image
            src={page.hero.imageSrc}
            alt={page.hero.imageAlt}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--hero-from)] via-[var(--hero-from)]/90 to-[var(--hero-to)]/75"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent"
            aria-hidden
          />
          <div className={`relative z-10 w-full ${sectionInsetX} py-20 md:py-24`}>
            <div className={sectionMax}>
              <Breadcrumb page={page} />
              <div className="max-w-2xl space-y-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
                  PT AYTI INDO PANEL — {LOCAL_SEO_BRAND_TAGLINE}
                </p>
                <h1
                  id="local-seo-hero-heading"
                  className="text-balance text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl lg:text-[2.5rem]"
                >
                  {page.h1}
                </h1>
                <p className="text-xl font-semibold leading-snug text-white/92 md:text-2xl">
                  {page.hero.subheadline}
                </p>
                <p className="text-lg leading-relaxed text-white/88">{page.hero.lead}</p>
                <ul
                  className="space-y-2 border-l-2 border-white/35 pl-4 text-sm leading-snug text-white/85 sm:text-[0.9375rem]"
                  role="list"
                >
                  {page.hero.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="text-emerald-300" aria-hidden>
                        ✓
                      </span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <WhatsAppCTAButton
                    className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/85 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-[2px] transition-all duration-200 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    ariaLabel={`Konsultasi ${page.topicLabel} via WhatsApp`}
                    message={waMessage}
                    dataSource={waFunnel.dataSource}
                  >
                    <IconWhatsApp className="h-4 w-4 shrink-0 opacity-95" aria-hidden />
                    Konsultasi &amp; Survey Lokasi
                  </WhatsAppCTAButton>
                  <a
                    href="#konteks-kota"
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
            id="konteks-kota"
            className={`scroll-mt-24 ${surfaceBandMuted} ${sectionPaddingY}`}
            aria-labelledby="local-context-heading"
          >
            <div className={sectionMax}>
              <header className="max-w-3xl space-y-4">
                <p className={sectionEyebrow}>{page.cityContext.eyebrow}</p>
                <h2 id="local-context-heading" className={sectionHeading}>
                  {page.cityContext.title}
                </h2>
                {page.cityContext.paragraphs.map((p) => (
                  <p key={p.slice(0, 48)} className={sectionLead}>
                    {p}
                  </p>
                ))}
              </header>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-foreground">Jangkauan &amp; koridor</h3>
                <ul className="mt-3 flex flex-wrap gap-2" role="list">
                  {page.cityContext.coverageAreas.map((area) => (
                    <li
                      key={area}
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground"
                    >
                      {area}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-10 grid gap-6 md:grid-cols-3">
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
          <section className={`${surfaceBand} ${sectionPaddingY}`} aria-labelledby="local-benefits-heading">
            <div className={sectionMax}>
              <header className="max-w-3xl space-y-4">
                <p className={sectionEyebrow}>Keunggulan</p>
                <h2 id="local-benefits-heading" className={sectionHeading}>
                  Nilai untuk operasi di {getCityPlacename(page.cityKey)}
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
                  {page.cityContext.industryTags.map((ind) => (
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
            aria-labelledby="local-advantages-heading"
          >
            <div className={sectionMax}>
              <header className="max-w-3xl space-y-4">
                <p className={sectionEyebrow}>Mengapa AYTI</p>
                <h2 id="local-advantages-heading" className={sectionHeading}>
                  Pendampingan teknis terintegrasi
                </h2>
                <p className={sectionLead}>
                  Dari survey hingga commissioning — satu tim untuk panel, pintu, dan pendingin.
                </p>
              </header>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2" role="list">
                {page.advantages.map((text) => (
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
          <section className={`${surfaceBand} ${sectionPaddingY}`} aria-labelledby="local-specs-heading">
            <div className={sectionMax}>
              <header className="max-w-3xl space-y-4">
                <p className={sectionEyebrow}>Spesifikasi</p>
                <h2 id="local-specs-heading" className={sectionHeading}>
                  Ringkasan teknis proyek
                </h2>
              </header>
              <dl className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
                {page.specs.map((row) => (
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
            aria-labelledby="local-portfolio-heading"
          >
            <div className={sectionMax}>
              <header className="max-w-3xl space-y-4">
                <p className={sectionEyebrow}>Portfolio</p>
                <h2 id="local-portfolio-heading" className={sectionHeading}>
                  Proyek terbaru
                </h2>
                <p className={sectionLead}>
                  Cuplikan dari{" "}
                  <Link href="/gallery-project" className="text-accent underline-offset-4 hover:underline">
                    galeri proyek
                  </Link>
                  — urutan dan konten sama dengan portfolio di beranda.
                </p>
              </header>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {portfolioItems.map((item) => {
                  const img = item.imageSrc.trim();
                  return (
                    <Link
                      key={item.id}
                      href="/gallery-project"
                      className={`${themedCardInteractive} block overflow-hidden`}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                        {img ? (
                          <Image
                            src={img}
                            alt={item.imageAlt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 25vw"
                          />
                        ) : null}
                      </div>
                      <div className="p-4 pt-4">
                        {item.snippetLabel ? (
                          <p className="text-xs leading-snug text-muted">{item.snippetLabel}</p>
                        ) : null}
                        <h3
                          className={`text-lg font-semibold text-foreground ${item.snippetLabel ? "mt-1" : ""}`}
                        >
                          {item.name}
                        </h3>
                        <p className="mt-1 text-sm text-muted">{item.location}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <p className="mt-8">
                <Link
                  href="/gallery-project"
                  className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
                >
                  Lihat galeri proyek lengkap →
                </Link>
              </p>
            </div>
          </section>
        </ScrollRevealSection>

        <ScrollRevealSection>
          <section className={`${surfaceBand} ${sectionPaddingY}`} aria-labelledby="local-faq-heading">
            <div className={sectionMax}>
              <header className="max-w-3xl space-y-4">
                <p className={sectionEyebrow}>FAQ</p>
                <h2 id="local-faq-heading" className={sectionHeading}>
                  Pertanyaan umum — {getCityPlacename(page.cityKey)}
                </h2>
              </header>
              <div className="mt-8 space-y-4">
                {page.faq.map((item) => (
                  <article key={item.question} className={faqCard}>
                    <h3 className={mergeAytiTitleClass("text-lg font-semibold text-foreground")}>
                      {item.question}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-muted">{item.answer}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </ScrollRevealSection>

        <ScrollRevealSection>
          <section className={`${surfaceBandMuted} ${sectionPaddingY}`} aria-labelledby="local-related-heading">
            <div className={sectionMax}>
              <header className="max-w-3xl space-y-4">
                <p className={sectionEyebrow}>Layanan terkait</p>
                <h2 id="local-related-heading" className={sectionHeading}>
                  Halaman layanan utama
                </h2>
                <p className={sectionLead}>
                  Pelajari spesifikasi lengkap, keunggulan, dan FAQ pada halaman layanan industri kami.
                </p>
              </header>
              <ul className="mt-6 flex flex-wrap gap-3" role="list">
                {page.relatedServiceLinks.map((link) => (
                  <li key={link.slug}>
                    <Link
                      href={layananPagePath(link.slug)}
                      className="inline-flex rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-accent/40 hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {relatedProducts.length > 0 ? (
                <div className="mt-10">
                  <h3 className="text-lg font-semibold text-foreground">Produk terkait</h3>
                  <ul className="mt-4 flex flex-wrap gap-3" role="list">
                    {relatedProducts.map((p) => (
                      <li key={p.slug}>
                        <Link
                          href={`/produk/${p.slug}`}
                          className="inline-flex rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent/40"
                        >
                          {p.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-10">
                <h3 className="text-lg font-semibold text-foreground">
                  {page.topicLabel} di kota lain
                </h3>
                <ul className="mt-4 flex flex-wrap gap-2" role="list">
                  {page.siblingCityKeys.map((key) => (
                    <li key={key}>
                      <Link
                        href={`/${page.productBase}-${key}`}
                        className="text-sm font-medium text-accent underline-offset-4 hover:underline"
                      >
                        {getCityPlacename(key)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </ScrollRevealSection>

        <section
          className={`border-t border-border bg-[var(--cta-band)] ${sectionPaddingY} text-white`}
          aria-labelledby="local-cta-heading"
        >
          <div className={`${sectionMax} text-center`}>
            <h2 id="local-cta-heading" className="text-2xl font-semibold tracking-tight md:text-3xl">
              Siap bahas proyek {page.topicLabel.toLowerCase()} di {getCityPlacename(page.cityKey)}?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/88">
              Kirim denah, target suhu, dan jenis komoditas — tim kami bantu susun spesifikasi panel dan pendingin.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <WhatsAppCTAButton
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[var(--cta-band)] shadow-md transition hover:bg-white/95"
                ariaLabel="Hubungi via WhatsApp"
                message={waMessage}
                dataSource={waFunnel.dataSource}
              >
                <IconWhatsApp className="h-5 w-5" aria-hidden />
                WhatsApp — Konsultasi Gratis
              </WhatsAppCTAButton>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
