import Image from "next/image";
import Link from "next/link";

import { ContactMapEmbed } from "@/components/aytipanel/contact-map-embed";
import { getProductBySlug } from "@/components/aytipanel/products-catalog";
import { LocalNapBlock } from "@/components/seo/local-nap-block";
import type { SiteContent } from "@/lib/site-content-model";
import { getCityPlacename, SERVICE_AREA_CITY_KEYS } from "@/lib/local-seo-geo";
import type { SeoLandingPageDef } from "@/lib/seo-landing";
import { mergeAytiCardClass, mergeAytiCtaClass, mergeAytiTitleClass } from "@/lib/ayti-icon-cold";
import { resolvePublicSiteOrigin } from "@/lib/site-url-resolve";
import { generateWhatsAppLink, generateWhatsAppMessage } from "@/utils/whatsapp";
import { resolvePrimaryWhatsAppDigits } from "@/lib/site-contact";

function siblingLinks(landing: SeoLandingPageDef): { slug: string; label: string }[] {
  if (!landing.productBaseForSiblings || !landing.siblingCityKeys?.length) return [];
  const out: { slug: string; label: string }[] = [];
  for (const key of landing.siblingCityKeys.slice(0, 6)) {
    out.push({
      slug: `${landing.productBaseForSiblings}-${key}`,
      label: getCityPlacename(key),
    });
  }
  return out;
}

function BreadcrumbNav({ landing }: { landing: SeoLandingPageDef }) {
  if (landing.kind === "city_area" && landing.localSeoCityKey) {
    const pn = getCityPlacename(landing.localSeoCityKey);
    return (
      <ol className="flex flex-wrap gap-x-2 gap-y-1">
        <li>
          <Link href="/" className="text-accent underline-offset-4 hover:underline">
            Beranda
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className="text-muted-foreground">Area layanan</li>
        <li aria-hidden="true">/</li>
        <li className="text-foreground">{pn}</li>
      </ol>
    );
  }

  const areaSlug = landing.localSeoCityKey ? `lokasi-${landing.localSeoCityKey}` : null;
  return (
    <ol className="flex flex-wrap gap-x-2 gap-y-1">
      <li>
        <Link href="/" className="text-accent underline-offset-4 hover:underline">
          Beranda
        </Link>
      </li>
      {areaSlug ? (
        <>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/${areaSlug}`} className="text-accent underline-offset-4 hover:underline">
              Area {getCityPlacename(landing.localSeoCityKey!)}
            </Link>
          </li>
        </>
      ) : null}
      <li aria-hidden="true">/</li>
      <li>
        <Link href="/#produk" className="text-accent underline-offset-4 hover:underline">
          Produk
        </Link>
      </li>
      <li aria-hidden="true">/</li>
      <li className="text-foreground">{landing.topicLabel}</li>
    </ol>
  );
}

export function SeoLandingView({
  landing,
  content,
  canonicalHref,
}: {
  landing: SeoLandingPageDef;
  content: SiteContent;
  canonicalHref: string;
}) {
  const origin = resolvePublicSiteOrigin(content.siteSettings.siteUrl).origin;
  const waDigits = resolvePrimaryWhatsAppDigits(content.siteSettings);
  const waMessage = generateWhatsAppMessage(landing.waTopicPhrase, landing.whatsAppContext);
  const waHref = generateWhatsAppLink(waMessage, waDigits);

  const projects = content.portfolio.projects.slice(0, 4);
  const siblings = siblingLinks(landing);
  const showLocalBlock = landing.kind === "city_area" || landing.kind === "product_city";
  const mapSrc = content.kontak.mapEmbedUrl.trim();
  const otherLokasi =
    landing.kind === "city_area" && landing.localSeoCityKey
      ? SERVICE_AREA_CITY_KEYS.filter((k) => k !== landing.localSeoCityKey)
          .map((k) => ({
            slug: `lokasi-${k}`,
            label: getCityPlacename(k),
          }))
          .sort((a, b) => a.label.localeCompare(b.label, "id"))
          .slice(0, 24)
      : [];

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background">
      <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <BreadcrumbNav landing={landing} />
        </nav>

        <h1 className={mergeAytiTitleClass("text-balance font-sora text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl")}>
          {landing.h1}
        </h1>

        <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
          {landing.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="mt-8">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className={mergeAytiCtaClass(
              "inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition hover:opacity-95",
            )}
            data-source={`seo-landing:${landing.slug}`}
          >
            Konsultasi WhatsApp
          </a>
        </div>

        {landing.kind === "city_area" && landing.hubServiceSlugs?.length ? (
          <section className="mt-12" aria-labelledby="hub-services-heading">
            <h2 id="hub-services-heading" className="text-lg font-semibold text-foreground">
              Layanan di wilayah ini
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2 text-sm">
              {landing.hubServiceSlugs.map((slug) => (
                <li key={slug}>
                  <Link
                    href={`/${slug}`}
                    className="rounded-full border border-border bg-muted-bg/50 px-3 py-1.5 font-medium text-foreground hover:border-accent/40"
                  >
                    {slug.replace(/-/g, " ")}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-12" aria-labelledby="related-products-heading">
          <h2 id="related-products-heading" className="text-lg font-semibold text-foreground">
            {landing.kind === "city_area" ? "Produk katalog terkait" : "Produk terkait"}
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {landing.relatedProductSlugs.map((slug) => {
              const p = getProductBySlug(slug);
              if (!p) return null;
              const href = `/produk/${slug}`;
              return (
                <li key={slug}>
                  <Link
                    href={href}
                    className={mergeAytiCardClass(
                      "flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm transition hover:border-accent/30 hover:bg-muted-bg/40",
                    )}
                  >
                    <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={p.imageSrc}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{p.title}</p>
                      {p.subtitle ? <p className="text-sm text-muted-foreground">{p.subtitle}</p> : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {projects.length ? (
          <section className="mt-12" aria-labelledby="gallery-preview-heading">
            <h2 id="gallery-preview-heading" className="text-lg font-semibold text-foreground">
              Proyek terbaru
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cuplikan dari{" "}
              <Link href="/gallery-project" className="text-accent underline-offset-4 hover:underline">
                galeri proyek
              </Link>
              .
            </p>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {projects.map((proj) => {
                const img = proj.coverImageSrc?.trim() || proj.galleryPhotos?.[0]?.src?.trim() || "";
                const alt = proj.coverImageAlt || proj.galleryPhotos?.[0]?.alt || proj.name;
                if (!img) {
                  return (
                    <li key={proj.id}>
                      <Link
                        href="/gallery-project"
                        className="block rounded-2xl border border-border bg-card p-4 text-sm font-medium text-foreground hover:border-accent/30"
                      >
                        {proj.name}
                      </Link>
                    </li>
                  );
                }
                return (
                  <li key={proj.id}>
                    <Link
                      href="/gallery-project"
                      className={mergeAytiCardClass("block overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:border-accent/30")}
                    >
                      <div className="relative aspect-[4/3] w-full bg-muted">
                        <Image
                          src={img}
                          alt={alt}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 50vw"
                        />
                      </div>
                      <div className="p-3">
                        <p className="font-medium text-foreground">{proj.name}</p>
                        <p className="text-xs text-muted-foreground">{proj.location}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <section className="mt-12" aria-labelledby="internal-links-heading">
          <h2 id="internal-links-heading" className="text-lg font-semibold text-foreground">
            Telusuri juga
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2 text-sm">
            <li>
              <Link
                href="/cold-storage"
                className="rounded-full border border-border bg-muted-bg/50 px-3 py-1.5 text-foreground hover:border-accent/40"
              >
                Cold storage
              </Link>
            </li>
            <li>
              <Link
                href="/tentang"
                className="rounded-full border border-border bg-muted-bg/50 px-3 py-1.5 text-foreground hover:border-accent/40"
              >
                Tentang kami
              </Link>
            </li>
            <li>
              <Link
                href="/gallery-project"
                className="rounded-full border border-border bg-muted-bg/50 px-3 py-1.5 text-foreground hover:border-accent/40"
              >
                Galeri proyek
              </Link>
            </li>
            <li>
              <Link
                href="/#produk"
                className="rounded-full border border-border bg-muted-bg/50 px-3 py-1.5 text-foreground hover:border-accent/40"
              >
                Produk
              </Link>
            </li>
            {otherLokasi.map(({ slug, label }) => (
              <li key={slug}>
                <Link
                  href={`/${slug}`}
                  className="rounded-full border border-border bg-muted-bg/50 px-3 py-1.5 text-foreground hover:border-accent/40"
                >
                  Area {label}
                </Link>
              </li>
            ))}
            {siblings.map(({ slug, label }) => (
              <li key={slug}>
                <Link
                  href={`/${slug}`}
                  className="rounded-full border border-border bg-muted-bg/50 px-3 py-1.5 text-foreground hover:border-accent/40"
                >
                  {landing.topicLabel} {label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-lg font-semibold text-foreground">
            {landing.kind === "city_area" ? "FAQ lokal" : "Pertanyaan umum"}
          </h2>
          <div className="mt-4 space-y-3">
            {landing.faq.map((item, idx) => (
              <details
                key={idx}
                className={mergeAytiCardClass("group rounded-xl border border-border bg-card px-4 py-3")}
              >
                <summary className="cursor-pointer list-none font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {showLocalBlock ? (
          <>
            <LocalNapBlock content={content} headingId="seo-nap-heading" />
            {mapSrc ? (
              <section className="mt-8" aria-labelledby="seo-map-heading">
                <h2 id="seo-map-heading" className="text-lg font-semibold text-foreground">
                  Peta kantor
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Lokasi kantor / bengkel referensi — sama dengan embed di halaman kontak situs.
                </p>
                <div className="mt-3 overflow-hidden rounded-2xl border border-border/70 bg-muted/25 shadow-sm dark:border-white/10">
                  <ContactMapEmbed
                    title={content.kontak.mapTitle}
                    src={mapSrc}
                    className="aspect-[16/9] min-h-[220px] w-full border-0 bg-muted/40 dark:bg-white/[0.04]"
                  />
                </div>
              </section>
            ) : null}
          </>
        ) : null}

        <p className="mt-10 text-xs text-muted-foreground">
          URL kanonikal:{" "}
          <a href={canonicalHref} className="text-accent underline-offset-2 hover:underline">
            {canonicalHref.replace(origin, "") || "/"}
          </a>
        </p>
      </article>
    </main>
  );
}
