import { getProductBySlug } from "@/components/aytipanel/products-catalog";
import type { LocalSeoCityPageDef } from "@/lib/local-seo-city-pages";
import { getCityPlacename } from "@/lib/local-seo-geo";
import type { SiteContent } from "@/lib/site-content-model";
import { absoluteUrlFromSite, resolvePublicSiteOrigin } from "@/lib/site-url-resolve";

function toAbsoluteImage(origin: string, src: string): string {
  const t = src.trim();
  if (!t) return "";
  if (/\w+:\/\//.test(t)) return t;
  return absoluteUrlFromSite(origin, t.startsWith("/") ? t : `/${t}`);
}

function joinAddressLines(lines: string[]): string {
  return lines.map((l) => l.trim()).filter(Boolean).join(", ");
}

export function LocalSeoCityJsonLd({
  page,
  content,
  canonicalHref,
}: {
  page: LocalSeoCityPageDef;
  content: SiteContent;
  canonicalHref: string;
}) {
  const ss = content.siteSettings;
  const origin = resolvePublicSiteOrigin(ss.siteUrl).origin;
  const orgId = `${origin}/#organization`;
  const siteName = ss.siteName.trim() || "PT AYTI INDO PANEL";
  const placename = getCityPlacename(page.cityKey);

  const addrLines = content.kontak.addressLines.map((l) => l.trim()).filter(Boolean);
  const streetAddress = joinAddressLines(addrLines) || ss.companyAddress.trim();

  const telephone =
    content.kontak.phoneTel.trim() ||
    content.kontak.phone.replace(/\s/g, "") ||
    content.kontak.whatsappDisplay.replace(/\D/g, "");

  const products: Record<string, unknown>[] = page.relatedProductSlugs.flatMap((slug) => {
    const p = getProductBySlug(slug);
    if (!p) return [];
    const url = absoluteUrlFromSite(origin, `/produk/${slug}`);
    const image = toAbsoluteImage(origin, p.imageSrc);
    const node: Record<string, unknown> = {
      "@type": "Product",
      name: [p.title, p.subtitle].filter(Boolean).join(" "),
      description: p.description,
      url,
      brand: { "@type": "Brand", name: siteName },
    };
    if (image) node.image = image;
    return [node];
  });

  const faqEntities = page.faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  }));

  const latRaw = ss.localSeo?.latitude?.trim() ?? "";
  const lngRaw = ss.localSeo?.longitude?.trim() ?? "";
  const latCms = Number.parseFloat(latRaw.replace(",", "."));
  const lngCms = Number.parseFloat(lngRaw.replace(",", "."));
  const cmsGeo =
    Number.isFinite(latCms) && Number.isFinite(lngCms)
      ? ({ "@type": "GeoCoordinates", latitude: latCms, longitude: lngCms } as const)
      : undefined;

  const breadcrumbItems = [
    { name: "Beranda", item: absoluteUrlFromSite(origin, "/") },
    { name: `Area ${placename}`, item: absoluteUrlFromSite(origin, `/lokasi-${page.cityKey}`) },
    { name: page.topicLabel, item: canonicalHref },
  ];

  const graph: Record<string, unknown>[] = [
    {
      "@type": "Service",
      "@id": `${canonicalHref}#service`,
      name: page.h1,
      description: page.metaDescription,
      url: canonicalHref,
      provider: { "@id": orgId },
      areaServed: placename
        ? [{ "@type": "City", name: placename }]
        : undefined,
      serviceType: page.topicLabel,
    },
    {
      "@type": "FAQPage",
      "@id": `${canonicalHref}#faq`,
      mainEntity: faqEntities,
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${canonicalHref}#breadcrumb`,
      itemListElement: breadcrumbItems.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.name,
        item: b.item,
      })),
    },
    {
      "@type": "LocalBusiness",
      "@id": orgId,
      name: siteName,
      url: origin,
      telephone: telephone || undefined,
      address: streetAddress
        ? {
            "@type": "PostalAddress",
            streetAddress,
            addressCountry: "ID",
          }
        : undefined,
      geo: cmsGeo,
    },
    ...products,
  ];

  const payload = {
    "@context": "https://schema.org",
    "@graph": graph.filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
