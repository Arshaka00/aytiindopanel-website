import { notFound } from "next/navigation";

import { ServicePageView } from "@/components/aytipanel/service-page-view";
import { ForceScrollTopOnLoad } from "@/components/common/force-scroll-top-on-load";
import { WhatsAppPhoneProvider } from "@/components/common/whatsapp-phone-context";
import { ServicePageJsonLd } from "@/components/seo/service-page-json-ld";
import { getPublishedLayananPageBySlug } from "@/lib/layanan-pages/repository";
import { applyCitySeoToPage, type ServiceCitySeoOverlay } from "@/lib/seo-service-city-overlay";
import { getSiteContent } from "@/lib/site-content";
import { resolvePrimaryWhatsAppDigits } from "@/lib/site-contact";
import { absoluteUrlFromSite, resolvePublicSiteOrigin } from "@/lib/site-url-resolve";

export async function renderLayananPage({
  layananSlug,
  canonicalHref,
  citySeo,
}: {
  layananSlug: string;
  canonicalHref: string;
  citySeo?: ServiceCitySeoOverlay;
}) {
  const published = await getPublishedLayananPageBySlug(layananSlug);
  if (!published) notFound();

  const { record: _record, cmsPageIndex, showPortfolioSection, ...page } = published;
  const content = await getSiteContent();
  const waDigits = resolvePrimaryWhatsAppDigits(content.siteSettings);
  const displayPage = citySeo ? applyCitySeoToPage(page, citySeo) : page;
  const waDataSource = citySeo ? `service_city_${citySeo.slug}` : `service_${page.slug}`;

  return (
    <WhatsAppPhoneProvider phoneDigits={waDigits}>
      <ForceScrollTopOnLoad />
      <ServicePageJsonLd
        canonicalHref={canonicalHref}
        content={content}
        page={displayPage}
        citySeo={citySeo}
      />
      <ServicePageView
        page={displayPage}
        content={content}
        canonicalHref={canonicalHref}
        cmsPageIndex={cmsPageIndex}
        showPortfolioSection={showPortfolioSection}
        citySeo={citySeo}
        waDataSource={waDataSource}
      />
    </WhatsAppPhoneProvider>
  );
}

export async function resolveLayananPageCanonicalHref(
  layananSlug: string,
  publicPath: string,
): Promise<string> {
  const content = await getSiteContent();
  const origin = resolvePublicSiteOrigin(content.siteSettings.siteUrl).origin;
  return absoluteUrlFromSite(origin, publicPath);
}
