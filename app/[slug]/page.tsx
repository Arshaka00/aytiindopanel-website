import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { SiteFooter } from "@/components/aytipanel/site-footer";
import { ForceScrollTopOnLoad } from "@/components/common/force-scroll-top-on-load";
import { WhatsAppPhoneProvider } from "@/components/common/whatsapp-phone-context";
import { SeoLandingJsonLd } from "@/components/seo/seo-landing-json-ld";
import { SeoLandingView } from "@/components/seo/seo-landing-view";
import {
  renderLayananPage,
  resolveLayananPageCanonicalHref,
} from "@/lib/layanan-pages/render-layanan-page";
import {
  getAllServiceCitySlugs,
  getServiceCityPageBySlug,
  isServiceCitySlug,
  loadServiceCitySeoOverlayMerged,
  resolveServiceCityMetadata,
} from "@/lib/seo-service-city-pages";
import { serviceCityPagePath } from "@/lib/seo-service-paths";
import {
  getSeoRootServiceByUrlSlug,
  isSeoRootServiceUrlSlug,
  SEO_ROOT_URL_SLUGS,
} from "@/lib/seo-services";
import { getSeoLandingBySlug, resolveSeoLandingMetadata, SEO_LANDING_PAGES } from "@/lib/seo-landing";
import { resolveServicePageMetadata } from "@/lib/service-pages";
import { getSiteContent } from "@/lib/site-content";
import { resolvePrimaryWhatsAppDigits } from "@/lib/site-contact";
import { absoluteUrlFromSite, resolvePublicSiteOrigin } from "@/lib/site-url-resolve";

/** ISR: konten CMS/JSON bisa berubah tanpa rebuild penuh. */
export const revalidate = 86400;

/** Hanya slug yang terdaftar — path lain tidak membuat halaman duplikat. */
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  const citySlugs = new Set(getAllServiceCitySlugs());
  const rootSlugs = new Set(SEO_ROOT_URL_SLUGS);
  const taken = new Set([...citySlugs, ...rootSlugs]);

  const legacy = SEO_LANDING_PAGES.filter((p) => !taken.has(p.slug)).map((p) => ({
    slug: p.slug,
  }));

  return [
    ...[...citySlugs].map((slug) => ({ slug })),
    ...SEO_ROOT_URL_SLUGS.map((slug) => ({ slug })),
    ...legacy,
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const content = await getSiteContent();

  if (isServiceCitySlug(slug)) {
    const md = await resolveServiceCityMetadata(slug, content);
    if (!md) notFound();
    return md;
  }

  const root = getSeoRootServiceByUrlSlug(slug);
  if (root) {
    const md = resolveServicePageMetadata(root.layananSlug, content);
    if (!md) notFound();
    return md;
  }

  const md = resolveSeoLandingMetadata(slug, content);
  if (!md) notFound();
  return md;
}

export default async function SeoLandingDynamicPage({ params }: Props) {
  const { slug } = await params;

  const cityPage = getServiceCityPageBySlug(slug);
  if (cityPage) {
    const content = await getSiteContent();
    const citySeo = await loadServiceCitySeoOverlayMerged(slug, content);
    if (!citySeo) notFound();
    const canonicalHref = await resolveLayananPageCanonicalHref(
      cityPage.layananSlug,
      serviceCityPagePath(slug),
    );
    return renderLayananPage({
      layananSlug: cityPage.layananSlug,
      canonicalHref,
      citySeo,
    });
  }

  const root = getSeoRootServiceByUrlSlug(slug);
  if (root) {
    const canonicalHref = await resolveLayananPageCanonicalHref(root.layananSlug, `/${root.urlSlug}`);
    return renderLayananPage({
      layananSlug: root.layananSlug,
      canonicalHref,
    });
  }

  const content = await getSiteContent();
  const waDigits = resolvePrimaryWhatsAppDigits(content.siteSettings);
  const origin = resolvePublicSiteOrigin(content.siteSettings.siteUrl).origin;

  const landing = getSeoLandingBySlug(slug);
  if (!landing) notFound();

  const canonicalHref = absoluteUrlFromSite(origin, `/${landing.slug}`);

  return (
    <WhatsAppPhoneProvider phoneDigits={waDigits}>
      <ForceScrollTopOnLoad />
      <SeoLandingJsonLd canonicalHref={canonicalHref} content={content} landing={landing} />
      <SeoLandingView canonicalHref={canonicalHref} content={content} landing={landing} />
      <SiteFooter footer={content.footer} />
    </WhatsAppPhoneProvider>
  );
}
