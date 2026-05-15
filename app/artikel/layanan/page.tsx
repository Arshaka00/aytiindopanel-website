import Link from "next/link";
import type { Metadata } from "next";

import { LayananIndexCardImage } from "@/components/aytipanel/layanan-index-card-image";
import { LayananPageCmsText } from "@/components/aytipanel/layanan-page-cms-text";
import { ForceScrollTopOnLoad } from "@/components/common/force-scroll-top-on-load";
import { WhatsAppPhoneProvider } from "@/components/common/whatsapp-phone-context";
import { SiteFooter } from "@/components/aytipanel/site-footer";
import { CmsText } from "@/components/site-cms/cms-text";
import { listPublishedLayananPages } from "@/lib/layanan-pages/repository";
import { resolveLayananPagesIndexMetadata } from "@/lib/layanan-pages/metadata";
import { resolveServicePublicPath } from "@/lib/seo-service-paths";
import { getSiteContent } from "@/lib/site-content";
import { resolvePrimaryWhatsAppDigits } from "@/lib/site-contact";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return resolveLayananPagesIndexMetadata(content);
}

export default async function ArtikelLayananIndexPage() {
  const [pages, content] = await Promise.all([listPublishedLayananPages(), getSiteContent()]);
  const waDigits = resolvePrimaryWhatsAppDigits(content.siteSettings);
  const primary = pages.filter((p) => p.kind === "primary");
  const support = pages.filter((p) => p.kind === "support");
  const index = content.layananPages.index;

  return (
    <WhatsAppPhoneProvider phoneDigits={waDigits}>
      <ForceScrollTopOnLoad />
      <div className="relative flex min-h-full flex-1 flex-col bg-background text-foreground">
        <main className="relative mx-auto w-full max-w-6xl flex-1 px-4 py-12 md:px-8 md:py-16">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <ol className="flex flex-wrap gap-x-2 gap-y-1">
              <li>
                <Link href="/" className="text-accent underline-offset-4 hover:underline">
                  Beranda
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/artikel" className="text-accent underline-offset-4 hover:underline">
                  Artikel
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="font-medium text-foreground">Layanan</li>
            </ol>
          </nav>

          <header className="mt-10 max-w-3xl border-b border-border/60 pb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
              <CmsText path="layananPages.index.eyebrow" text={index.eyebrow} as="span" className="inline" />
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-sora)] text-3xl font-semibold tracking-tight md:text-4xl">
              <CmsText path="layananPages.index.heading" text={index.heading} as="span" className="inline" />
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              <CmsText path="layananPages.index.lead" text={index.lead} as="span" className="inline" />
            </p>
          </header>

          <section className="mt-12" aria-labelledby="layanan-utama-heading">
            <h2 id="layanan-utama-heading" className="text-xl font-semibold tracking-tight">
              Layanan utama
            </h2>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {primary.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={resolveServicePublicPath(p.slug)}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-[var(--shadow-card-hover)]"
                  >
                    <div className="relative aspect-[16/10] bg-muted">
                      <LayananIndexCardImage
                        cmsPageIndex={p.cmsPageIndex}
                        src={p.hero.imageSrc}
                        alt={p.hero.imageAlt}
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-semibold leading-snug text-foreground group-hover:text-accent">
                        <LayananPageCmsText
                          cmsPageIndex={p.cmsPageIndex}
                          field="navLabel"
                          text={p.navLabel}
                          as="span"
                          className="inline"
                        />
                      </h3>
                      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                        <LayananPageCmsText
                          cmsPageIndex={p.cmsPageIndex}
                          field="heroSubheadline"
                          text={p.hero.subheadline}
                          as="span"
                          className="inline"
                        />
                      </p>
                      <span className="mt-4 text-sm font-semibold text-accent">Selengkapnya →</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {support.length > 0 ? (
            <section className="mt-14" aria-labelledby="layanan-panduan-heading">
              <h2 id="layanan-panduan-heading" className="text-xl font-semibold tracking-tight">
                Panduan &amp; edukasi
              </h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {support.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={resolveServicePublicPath(p.slug)}
                      className="block rounded-xl border border-border bg-card/80 p-5 transition hover:border-accent/30 hover:bg-card"
                    >
                      <h3 className="font-semibold text-foreground">
                        <LayananPageCmsText
                          cmsPageIndex={p.cmsPageIndex}
                          field="navLabel"
                          text={p.navLabel}
                          as="span"
                          className="inline"
                        />
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        <LayananPageCmsText
                          cmsPageIndex={p.cmsPageIndex}
                          field="metaDescription"
                          text={p.metaDescription}
                          as="span"
                          className="inline"
                        />
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </main>
        <SiteFooter footer={content.footer} />
      </div>
    </WhatsAppPhoneProvider>
  );
}
