import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATALOG_DOWNLOAD_URL } from "@/components/aytipanel/constants";
import { generateWhatsAppMessage, type WhatsAppMessageContext } from "@/utils/whatsapp";
import {
  getProductBySlug,
  PRODUCTS,
} from "@/components/aytipanel/products-catalog";
import { getRichProductDetail } from "@/components/aytipanel/product-detail-rich-data";
import { WhatsAppPhoneProvider } from "@/components/common/whatsapp-phone-context";
import { getSiteContent } from "@/lib/site-content";
import { resolvePrimaryWhatsAppDigits } from "@/lib/site-contact";
import { resolvePublicSiteOrigin } from "@/lib/site-url-resolve";
import { mergeRichProductDetail } from "@/lib/product-rich-merge";
import { ProductDetailHeroCms } from "@/components/aytipanel/product-detail-hero-cms";
import { ProductDetailHeaderCms } from "@/components/aytipanel/product-detail-header-cms";
import { ProductDetailRichSections } from "@/components/aytipanel/product-detail-rich-sections";
import { ScrollRevealSection } from "@/components/aytipanel/scroll-reveal-section";
import { BackButton } from "@/components/common/BackButton";
import { ForceScrollTopOnLoad } from "@/components/common/force-scroll-top-on-load";
import { InternalDetailNavLink } from "@/components/common/internal-detail-nav-link";
import { SiteFooter } from "@/components/aytipanel/site-footer";
import { WhatsAppCTAButton } from "@/components/aytipanel/whatsapp-cta-button";
import { mergeAytiCardClass, mergeAytiCtaClass } from "@/lib/ayti-icon-cold";

const SERVICE_MAINTENANCE_SLUGS = new Set([
  "maintenance-berkala",
  "perbaikan-troubleshooting",
  "after-sales-support",
]);

const HIDE_CATALOG_DOWNLOAD_SLUGS = new Set([
  "cold-storage-custom",
  "pembekuan-cepat-abf",
  "loading-dock-system",
  "sistem-refrigerasi",
]);

const PRODUCT_SLUG_TO_WHATSAPP_CONTEXT: Partial<Record<string, WhatsAppMessageContext>> = {
  "sandwich-panel-pu-camelock": "produk",
  "sandwich-panel-pu-full-knock-down": "produk",
  "sandwich-panel-eps": "produk",
  "cold-storage-custom": "solusi_sistem",
  "pembekuan-cepat-abf": "solusi_sistem",
  "cold-storage-portable": "solusi_sistem",
  "pintu-panel": "accessories",
  "loading-dock-system": "accessories",
  "sistem-refrigerasi": "solusi_sistem",
  "maintenance-berkala": "maintenance",
  "perbaikan-troubleshooting": "troubleshooting",
  "after-sales-support": "after_sales",
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    return { title: "Produk tidak ditemukan | PT AYTI INDO PANEL" };
  }
  const siteContent = await getSiteContent();
  const po = siteContent.productPageOverrides?.[slug];
  const label = [po?.title ?? product.title, po?.subtitle ?? product.subtitle].filter(Boolean).join(" ");
  const rich = mergeRichProductDetail(getRichProductDetail(slug), siteContent.productRichOverrides?.[slug]);
  const description =
    rich?.paragraphs.join(" ") ?? po?.description ?? product.description;
  const metaDesc = description.length > 160 ? `${description.slice(0, 157)}…` : description;
  const brand = siteContent.siteSettings.siteName.trim() || "PT AYTI INDO PANEL";
  const base = resolvePublicSiteOrigin(siteContent.siteSettings.siteUrl);
  const canonical = new URL(`/produk/${slug}`, base).href;
  const title = `${label} | ${brand}`;
  return {
    title,
    description: metaDesc,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description: metaDesc,
      siteName: brand,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const siteContent = await getSiteContent();
  const waDigits = resolvePrimaryWhatsAppDigits(siteContent.siteSettings);
  const po = siteContent.productPageOverrides?.[slug];
  const richDetail = mergeRichProductDetail(
    getRichProductDetail(slug),
    siteContent.productRichOverrides?.[slug],
  );
  const displayTitle = po?.title ?? product.title;
  const displaySubtitle = po?.subtitle ?? product.subtitle ?? "";
  const displayBadge = po?.badge ?? product.badge;
  const displayImageSrc = po?.imageSrc ?? product.imageSrc;
  const refrigerationVisual =
    richDetail?.sectionsVariant === "refrigeration" || slug === "sistem-refrigerasi";
  const context = PRODUCT_SLUG_TO_WHATSAPP_CONTEXT[slug] ?? "konsultasi";
  const productMessage = generateWhatsAppMessage(product.title, context);
  const isServiceMaintenance = SERVICE_MAINTENANCE_SLUGS.has(slug);
  const showCatalogDownload =
    !isServiceMaintenance && !HIDE_CATALOG_DOWNLOAD_SLUGS.has(slug);

  return (
    <WhatsAppPhoneProvider phoneDigits={waDigits}>
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <ForceScrollTopOnLoad />
      <main className="flex-1">
        <article className="border-b border-border px-4 py-5 sm:px-5 md:px-6 md:py-14 lg:py-16">
          <div className="mx-auto max-w-5xl">
            <BackButton
              label="Kembali"
              destination="previous"
              fallbackHref="/#produk"
              className="mb-3 inline-flex min-h-11 min-w-11 touch-manipulation pointer-events-auto items-center gap-1.5 self-start rounded-lg border border-border/70 bg-card/70 px-3.5 py-2 text-sm font-medium text-accent/90 opacity-95 shadow-[var(--shadow-card)] backdrop-blur-[1px] transition-[color,opacity,border-color,background-color] duration-200 hover:border-accent/35 hover:bg-muted-bg-strong hover:text-primary hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background md:mb-5"
            />

            <ScrollRevealSection variant="image">
              <ProductDetailHeroCms
                slug={slug}
                imageSrc={displayImageSrc}
                alt={
                  displaySubtitle ? `${displayTitle} ${displaySubtitle}` : displayTitle
                }
                frameClassName={
                  refrigerationVisual
                    ? mergeAytiCardClass(
                        "relative mt-0 h-[170px] w-full overflow-hidden rounded-2xl bg-image-placeholder shadow-[0_10px_34px_-22px_rgba(15,23,42,0.45)] ring-2 ring-sky-500/25 ring-offset-2 ring-offset-background sm:mt-3 md:mt-5 sm:h-[300px] lg:h-[380px] dark:ring-sky-400/30",
                      )
                    : mergeAytiCardClass(
                        "relative mt-0 h-[170px] w-full overflow-hidden rounded-2xl bg-image-placeholder shadow-[0_10px_30px_-22px_rgba(15,23,42,0.4)] ring-1 ring-border/80 sm:mt-3 md:mt-5 sm:h-[300px] lg:h-[380px]",
                      )
                }
              />
            </ScrollRevealSection>

            <ScrollRevealSection>
              <header className="mt-2 max-w-4xl space-y-2 md:mt-7 md:space-y-3">
                <ProductDetailHeaderCms
                  slug={slug}
                  product={product}
                  title={displayTitle}
                  subtitle={displaySubtitle}
                  badge={displayBadge}
                />
              </header>
            </ScrollRevealSection>

            <ScrollRevealSection>
              {richDetail ? (
                <ProductDetailRichSections detail={richDetail} cmsSlug={slug} />
              ) : (
                <div className="mt-5 max-w-3xl text-base leading-relaxed text-muted md:mt-7 md:text-[1.06rem]">
                  <p>{product.description}</p>
                </div>
              )}
            </ScrollRevealSection>

            <div className={richDetail ? "mt-8 md:mt-9" : "mt-6 md:mt-8"}>
              <div
                className="h-px w-full rounded-full bg-gradient-to-r from-transparent via-accent/35 to-transparent dark:via-sky-400/40"
                aria-hidden
              />
              <div className="mt-5 flex flex-col items-center gap-3 text-center md:mt-6 md:gap-3.5">
                <p className="max-w-xl text-sm leading-relaxed text-muted md:text-base">
                  {isServiceMaintenance
                    ? "Untuk informasi lebih lanjut, silakan hubungi tim support kami."
                    : "Untuk konsultasi lebih lanjut, silakan hubungi tim kami."}
                </p>
                <div className="flex w-full flex-col items-stretch gap-2.5 sm:w-auto sm:flex-row sm:items-center md:gap-2.5">
                  {showCatalogDownload ? (
                    <a
                      href={CATALOG_DOWNLOAD_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={mergeAytiCtaClass(
                        "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border/90 bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow-[var(--shadow-card)] transition-[border-color,background-color,box-shadow] hover:border-accent/35 hover:bg-muted-bg-strong hover:shadow-[0_12px_24px_-16px_rgba(15,23,42,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto dark:border-white/20 dark:bg-white/[0.04] dark:text-white dark:hover:border-white/35 dark:hover:bg-white/[0.08] dark:focus-visible:ring-white/45 dark:focus-visible:ring-offset-slate-950",
                      )}
                      aria-label="Download katalog produk (buka tab baru)"
                    >
                      Download Katalog
                    </a>
                  ) : null}
                  <WhatsAppCTAButton
                    className="group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-12px_rgba(16,185,129,0.72)] ring-1 ring-emerald-300/20 transition-[transform,filter,box-shadow] duration-200 hover:brightness-110 hover:shadow-[0_16px_34px_-12px_rgba(16,185,129,0.8)] motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/90 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto dark:border-emerald-300/35 dark:ring-emerald-300/25 dark:focus-visible:ring-offset-slate-950"
                    ariaLabel={
                      isServiceMaintenance
                        ? "Hubungi tim support via WhatsApp (buka tab baru)"
                        : "Konsultasi via WhatsApp (buka tab baru)"
                    }
                    message={productMessage}
                  >
                    {isServiceMaintenance ? "Hubungi via WhatsApp" : "Konsultasi via WhatsApp"}
                    <span className="text-white/85 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>
                      →
                    </span>
                  </WhatsAppCTAButton>
                </div>
                <BackButton
                  label="Kembali"
                  destination="previous"
                  fallbackHref="/#produk"
                  className="mt-3 inline-flex w-full min-h-11 min-w-11 touch-manipulation pointer-events-auto items-center justify-center gap-1.5 rounded-lg border border-border/80 bg-card px-4 py-2.5 text-sm font-medium text-accent/90 shadow-[var(--shadow-card)] transition-[color,background-color,border-color,box-shadow] hover:border-accent/35 hover:bg-muted-bg-strong hover:text-primary hover:shadow-[0_12px_26px_-18px_rgba(15,23,42,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto"
                />
              </div>
            </div>

            {richDetail?.relatedProductSlugs && richDetail.relatedProductSlugs.length > 0 ? (
              <ScrollRevealSection>
              <section className="mt-10 border-t border-border pt-8 md:mt-11 md:pt-9" aria-labelledby="related-products-heading">
                <h2
                  id="related-products-heading"
                  className="text-lg font-semibold tracking-tight text-foreground md:text-xl"
                >
                  Produk terkait
                </h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {richDetail.relatedProductSlugs.map((rs) => {
                    const rp = getProductBySlug(rs);
                    if (!rp) return null;
                    return (
                      <li key={rs}>
                        <InternalDetailNavLink
                          href={`/produk/${rs}`}
                          className="inline-flex rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-accent transition hover:border-accent/40 hover:bg-muted-bg"
                        >
                          {rp.title}
                        </InternalDetailNavLink>
                      </li>
                    );
                  })}
                </ul>
              </section>
              </ScrollRevealSection>
            ) : null}
          </div>
        </article>
      </main>
      <SiteFooter
        footer={siteContent.footer}
        footerSeoText={siteContent.siteSettings.seoContent.footerSeoText}
        whatsappFunnel={{ message: productMessage, dataSource: `produk:${slug}` }}
      />
    </div>
    </WhatsAppPhoneProvider>
  );
}
