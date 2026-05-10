import { resolvePublicSiteOrigin } from "@/lib/site-url-resolve";
import type { SiteContent } from "@/lib/site-content-model";

/** Organization + WebSite JSON-LD untuk SEO lokal & pengetahuan umum perusahaan. */
export function SiteJsonLd({ content }: { content: SiteContent }) {
  const ss = content.siteSettings;
  const seo = ss.seoContent;
  const originUrl = resolvePublicSiteOrigin(ss.siteUrl);
  const origin = originUrl.origin;

  const areasFromSeo = seo.serviceAreas
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const areasFromLocal = (ss.localSeo?.areaServed ?? []).map((s) => s.trim()).filter(Boolean);
  const areas = [...new Set([...areasFromSeo, ...areasFromLocal])];

  const latRaw = ss.localSeo?.latitude?.trim() ?? "";
  const lngRaw = ss.localSeo?.longitude?.trim() ?? "";
  const lat = Number.parseFloat(latRaw.replace(",", "."));
  const lng = Number.parseFloat(lngRaw.replace(",", "."));
  const geo =
    Number.isFinite(lat) && Number.isFinite(lng)
      ? ({ "@type": "GeoCoordinates", latitude: lat, longitude: lng } as const)
      : undefined;

  const description = [
    (seo.companyDescription || seo.metaDescription || "").trim(),
    seo.additionalSeoContent.trim(),
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();

  const distinctProdUrls = [
    ...new Set((ss.productionUrls ?? []).map((p) => p.url.trim()).filter(Boolean)),
  ];
  const sameAsAliases = distinctProdUrls.filter((u) => u !== origin);
  const socialProfiles = [
    ss.socialLinks?.instagram,
    ss.socialLinks?.linkedin,
    ss.socialLinks?.youtube,
    ss.socialLinks?.tiktok,
    ss.socialLinks?.facebook,
  ]
    .map((u) => u?.trim())
    .filter(Boolean) as string[];
  const sameAsAll = [...new Set([...sameAsAliases, ...socialProfiles])];

  const graph: Record<string, unknown>[] = [
    {
      "@type": "Organization",
      "@id": `${origin}/#organization`,
      name: ss.siteName || "Organization",
      url: origin,
      ...(sameAsAll.length ? { sameAs: sameAsAll } : {}),
      ...(description ? { description } : {}),
      ...(geo ? { geo } : {}),
      ...(ss.localSeo?.openingHours?.length
        ? { openingHours: ss.localSeo.openingHours.join("; ") }
        : {}),
      ...(areas.length
        ? {
            areaServed: areas.map((name) => ({
              "@type": "AdministrativeArea",
              name,
            })),
          }
        : {}),
    },
    {
      "@type": "WebSite",
      "@id": `${origin}/#website`,
      url: origin,
      name: ss.siteName || "Website",
      publisher: { "@id": `${origin}/#organization` },
      ...(seo.metaDescription.trim()
        ? { description: seo.metaDescription.trim() }
        : {}),
    },
  ];

  const schema = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
