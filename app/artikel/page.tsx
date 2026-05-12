import Link from "next/link";
import type { Metadata } from "next";

import { ForceScrollTopOnLoad } from "@/components/common/force-scroll-top-on-load";
import { WhatsAppPhoneProvider } from "@/components/common/whatsapp-phone-context";
import { SiteFooter } from "@/components/aytipanel/site-footer";
import { listPublishedSeoArticles } from "@/lib/seo-articles/repository";
import { resolveSeoArticlesIndexMetadata } from "@/lib/seo-articles/metadata";
import { getSiteContent } from "@/lib/site-content";
import { resolvePrimaryWhatsAppDigits } from "@/lib/site-contact";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return resolveSeoArticlesIndexMetadata(content);
}

export default async function ArtikelIndexPage() {
  const [articles, content] = await Promise.all([listPublishedSeoArticles(), getSiteContent()]);
  const waDigits = resolvePrimaryWhatsAppDigits(content.siteSettings);

  return (
    <WhatsAppPhoneProvider phoneDigits={waDigits}>
      <ForceScrollTopOnLoad />
      <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 md:px-6 md:py-14">
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground md:text-sm">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link href="/" className="text-accent underline-offset-4 hover:underline">
                  Beranda
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-foreground">Artikel</li>
            </ol>
          </nav>
          <header className="mt-8 max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent/90">Panduan teknis</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Artikel refrigerasi industri
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              Cold storage, cold room, blast freezer, sandwich panel, dan ruang pendingin — ringkas untuk tim
              proyek dan QA pangan.
            </p>
          </header>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {articles.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/artikel/${a.slug}`}
                  className="flex h-full flex-col rounded-2xl border border-border bg-card/70 p-5 shadow-[var(--shadow-card)] transition hover:border-accent/35 hover:bg-muted-bg-strong"
                >
                  <span className="text-xs font-medium uppercase tracking-wide text-accent/90">
                    {a.primaryKeyword}
                  </span>
                  <span className="mt-2 text-lg font-semibold text-foreground">{a.title}</span>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">{a.deck}</p>
                  <span className="mt-4 text-sm font-medium text-accent">Baca artikel →</span>
                </Link>
              </li>
            ))}
          </ul>
        </main>
        <SiteFooter footer={content.footer} footerSeoText={content.siteSettings.seoContent.footerSeoText} />
      </div>
    </WhatsAppPhoneProvider>
  );
}
