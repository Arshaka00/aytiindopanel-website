import type { SiteContent } from "@/lib/site-content-model";
import type { SeoLandingPageDef } from "@/lib/seo-landing";
import { getProductBySlug } from "@/components/aytipanel/products-catalog";
import { absoluteUrlFromSite, resolvePublicSiteOrigin } from "@/lib/site-url-resolve";
import { getCityPlacename } from "@/lib/local-seo-geo";

function toAbsoluteImage(origin: string, src: string): string {
  const t = src.trim();
  if (!t) return "";
  if (/\w+:\/\//.test(t)) return t;
  return absoluteUrlFromSite(origin, t.startsWith("/") ? t : `/${t}`);
}

function joinAddressLines(lines: string[]): string {
  return lines.map((l) => l.trim()).filter(Boolean).join(", ");
}

export function SeoLandingJsonLd({
  landing,
  content,
  canonicalHref,
}: {
  landing: SeoLandingPageDef;
  content: SiteContent;
  canonicalHref: string;
}) {
  const ss = content.siteSettings;
  const origin = resolvePublicSiteOrigin(ss.siteUrl).origin;
  const orgId = `${origin}/#organization`;
  const siteName = ss.siteName.trim() || "PT AYTI INDO PANEL";

  const addrLines = content.kontak.addressLines.map((l) => l.trim()).filter(Boolean);
  const streetAddress = joinAddressLines(addrLines) || ss.companyAddress.trim();

  const telephone =
    content.kontak.phoneTel.trim() ||
    content.kontak.phone.replace(/\s/g, "") ||
    content.kontak.whatsappDisplay.replace(/\D/g, "");

  const products: Record<string, unknown>[] = landing.relatedProductSlugs.flatMap((slug) => {
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

  const faqEntities = landing.faq.map((item) => ({
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

  const geoForBusiness = cmsGeo;

  const cityKey = landing.localSeoCityKey;

  const servedName = cityKey ? getCityPlacename(cityKey) : landing.modifierLabel;
  const areaServed =
    cityKey && servedName
      ? [
          {
            "@type": "City",
            name: servedName,
            containedInPlace: { "@type": "Country", name: "Indonesia" },
          },
        ]
      : (ss.localSeo?.areaServed ?? [])
          .map((s) => s.trim())
          .filter(Boolean)
          .map((name) => ({ "@type": "AdministrativeArea", name }));

  const mapsLink =
    ss.mapsUrl.trim() ||
    (content.kontak.mapEmbedUrl.includes("google") ? content.kontak.mapEmbedUrl.split("&")[0] : "");

  const lb: Record<string, unknown> = {
    "@type": "LocalBusiness",
    "@id": `${canonicalHref}#local-business`,
    name: siteName,
    url: canonicalHref,
    description: landing.metaDescription,
    telephone: telephone || undefined,
    parentOrganization: { "@id": orgId },
    address: {
      "@type": "PostalAddress",
      streetAddress: streetAddress || undefined,
      addressCountry: "ID",
    },
    ...(geoForBusiness ? { geo: geoForBusiness } : {}),
    ...(areaServed.length ? { areaServed } : {}),
    ...(mapsLink ? { hasMap: mapsLink } : {}),
    ...(ss.localSeo?.openingHours?.length
      ? { openingHours: ss.localSeo.openingHours.join("; ") }
      : {}),
  };

  const areaSlug = cityKey ? `lokasi-${cityKey}` : null;
  const breadcrumbItems: Record<string, unknown>[] = [
    { "@type": "ListItem", position: 1, name: "Beranda", item: origin },
  ];
  let pos = 2;
  if (landing.kind === "city_area") {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: pos++,
      name: "Area layanan",
      item: absoluteUrlFromSite(origin, "/produk"),
    });
    breadcrumbItems.push({
      "@type": "ListItem",
      position: pos,
      name: landing.h1.replace(/\s+/g, " ").slice(0, 80),
      item: canonicalHref,
    });
  } else {
    if (areaSlug) {
      breadcrumbItems.push({
        "@type": "ListItem",
        position: pos++,
        name: cityKey ? `Area ${getCityPlacename(cityKey)}` : "Area layanan",
        item: absoluteUrlFromSite(origin, `/${areaSlug}`),
      });
    }
    breadcrumbItems.push({
      "@type": "ListItem",
      position: pos++,
      name: "Produk",
      item: absoluteUrlFromSite(origin, "/produk"),
    });
    breadcrumbItems.push({
      "@type": "ListItem",
      position: pos,
      name: landing.h1.replace(/\s+/g, " ").slice(0, 80),
      item: canonicalHref,
    });
  }

  const graph: Record<string, unknown>[] = [
    lb,
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
    ...products,
  ];

  const schema = { "@context": "https://schema.org", "@graph": graph };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
