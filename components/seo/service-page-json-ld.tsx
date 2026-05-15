import type { ServiceCitySeoOverlay } from "@/lib/seo-service-city-overlay";
import { LAYANAN_PAGES_BASE_PATH, type ServicePageDef } from "@/lib/service-pages";
import type { SiteContent } from "@/lib/site-content-model";
import { absoluteUrlFromSite, resolvePublicSiteOrigin } from "@/lib/site-url-resolve";

export function ServicePageJsonLd({
  page,
  content,
  canonicalHref,
  citySeo,
}: {
  page: ServicePageDef;
  content: SiteContent;
  canonicalHref: string;
  citySeo?: ServiceCitySeoOverlay;
}) {
  const ss = content.siteSettings;
  const origin = resolvePublicSiteOrigin(ss.siteUrl).origin;
  const orgId = `${origin}/#organization`;
  const siteName = ss.siteName.trim() || "PT AYTI INDO PANEL";

  const faqEntities = page.faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  }));

  const breadcrumbItems = citySeo
    ? [
        { "@type": "ListItem", position: 1, name: "Beranda", item: origin },
        {
          "@type": "ListItem",
          position: 2,
          name: `Area ${citySeo.placename}`,
          item: absoluteUrlFromSite(origin, `/${citySeo.hubSlug}`),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: page.navLabel,
          item: absoluteUrlFromSite(origin, citySeo.serviceRootPath),
        },
        { "@type": "ListItem", position: 4, name: citySeo.placename, item: canonicalHref },
      ]
    : [
        { "@type": "ListItem", position: 1, name: "Beranda", item: origin },
        {
          "@type": "ListItem",
          position: 2,
          name: "Layanan",
          item: absoluteUrlFromSite(origin, LAYANAN_PAGES_BASE_PATH),
        },
        { "@type": "ListItem", position: 3, name: page.navLabel, item: canonicalHref },
      ];

  const areaServed = citySeo
    ? { "@type": "City", name: citySeo.placename }
    : { "@type": "Country", name: "Indonesia" };

  const graph: Record<string, unknown>[] = [
    {
      "@type": "Service",
      "@id": `${canonicalHref}#service`,
      name: page.hero.h1,
      description: page.metaDescription,
      url: canonicalHref,
      provider: { "@id": orgId, name: siteName },
      areaServed,
    },
    {
      "@type": "FAQPage",
      "@id": `${canonicalHref}#faq`,
      mainEntity: faqEntities,
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${canonicalHref}#breadcrumb`,
      itemListElement: breadcrumbItems,
    },
  ];

  const schema = { "@context": "https://schema.org", "@graph": graph };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
