import Link from "next/link";
import type { Metadata } from "next";

import { ForceScrollTopOnLoad } from "@/components/common/force-scroll-top-on-load";
import { WhatsAppPhoneProvider } from "@/components/common/whatsapp-phone-context";
import { SiteFooter } from "@/components/aytipanel/site-footer";
import { getCityPlacename } from "@/lib/local-seo-geo";
import {
  getLandingKotaHubPages,
  landingKotaHubPath,
  resolveLandingKotaIndexMetadata,
} from "@/lib/landing-kota-pages";
import { getSiteContent } from "@/lib/site-content";
import { resolvePrimaryWhatsAppDigits } from "@/lib/site-contact";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return resolveLandingKotaIndexMetadata(content);
}

export default async function ArtikelLokasiIndexPage() {
  const content = await getSiteContent();
  const hubPages = getLandingKotaHubPages();
  const waDigits = resolvePrimaryWhatsAppDigits(content.siteSettings);
  const idx = content.landingKotaPages.index;

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
              <li className="font-medium text-foreground">Landing kota</li>
            </ol>
          </nav>

          <header className="mt-10 max-w-3xl border-b border-border/60 pb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">{idx.eyebrow}</p>
            <h1 className="mt-4 font-[family-name:var(--font-sora)] text-3xl font-semibold tracking-tight md:text-4xl">
              {idx.heading}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{idx.lead}</p>
          </header>

          <section className="mt-12" aria-labelledby="landing-kota-list-heading">
            <h2 id="landing-kota-list-heading" className="text-xl font-semibold tracking-tight">
              Kota &amp; kawasan layanan
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {hubPages.map((page) => {
                const cityKey = page.localSeoCityKey!;
                const placename = getCityPlacename(cityKey);
                return (
                  <li key={page.slug}>
                    <Link
                      href={landingKotaHubPath(page.slug)}
                      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-[var(--shadow-card-hover)]"
                    >
                      <h3 className="font-semibold leading-snug text-foreground group-hover:text-accent">
                        {placename}
                      </h3>
                      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {page.metaDescription}
                      </p>
                      <span className="mt-4 text-sm font-semibold text-accent">Area layanan →</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <p className="mt-12 text-sm text-muted-foreground">
            Indeks ini memuat halaman hub{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">/lokasi-*</code>. Untuk halaman layanan teknis
            per topik, lihat{" "}
            <Link href="/artikel/layanan" className="text-accent underline-offset-4 hover:underline">
              Halaman Layanan
            </Link>
            .
          </p>
        </main>
        <SiteFooter footer={content.footer} />
      </div>
    </WhatsAppPhoneProvider>
  );
}
