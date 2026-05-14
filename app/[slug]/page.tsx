import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { SiteFooter } from "@/components/aytipanel/site-footer";
import { ForceScrollTopOnLoad } from "@/components/common/force-scroll-top-on-load";
import { WhatsAppPhoneProvider } from "@/components/common/whatsapp-phone-context";
import { SeoLandingJsonLd } from "@/components/seo/seo-landing-json-ld";
import { SeoLandingView } from "@/components/seo/seo-landing-view";
import { getSeoLandingBySlug, resolveSeoLandingMetadata, SEO_LANDING_PAGES } from "@/lib/seo-landing";
import { getSiteContent } from "@/lib/site-content";
import { resolvePrimaryWhatsAppDigits } from "@/lib/site-contact";
import { absoluteUrlFromSite, resolvePublicSiteOrigin } from "@/lib/site-url-resolve";

/** ISR: konten CMS/JSON bisa berubah tanpa rebuild penuh. */
export const revalidate = 86400;

/** Hanya slug yang terdaftar di manifest SEO — path lain tidak membuat halaman duplikat. */
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SEO_LANDING_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const content = await getSiteContent();
  const md = resolveSeoLandingMetadata(slug, content);
  if (!md) notFound();
  return md;
}

export default async function SeoLandingDynamicPage({ params }: Props) {
  const { slug } = await params;
  const landing = getSeoLandingBySlug(slug);
  if (!landing) notFound();

  const content = await getSiteContent();
  const waDigits = resolvePrimaryWhatsAppDigits(content.siteSettings);
  const origin = resolvePublicSiteOrigin(content.siteSettings.siteUrl).origin;
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
