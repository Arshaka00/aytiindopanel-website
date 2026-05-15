import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { ForceScrollTopOnLoad } from "@/components/common/force-scroll-top-on-load";
import { WhatsAppPhoneProvider } from "@/components/common/whatsapp-phone-context";
import { SiteFooter } from "@/components/aytipanel/site-footer";
import { isRemoteOrBlobImageSrc, resolveArtikelCardImageSrc } from "@/lib/seo-articles/card-image";
import { listPublishedSeoArticles } from "@/lib/seo-articles/repository";
import { resolveSeoArticlesIndexMetadata } from "@/lib/seo-articles/metadata";
import { estimateReadingMinutesFromMarkdown } from "@/lib/seo-articles/reading-time";
import { getSiteContent } from "@/lib/site-content";
import { resolvePrimaryWhatsAppDigits } from "@/lib/site-contact";
import { LAYANAN_PAGES_BASE_PATH } from "@/lib/service-pages";

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
      <div className="relative flex min-h-full flex-1 flex-col bg-background text-foreground selection:bg-accent/15">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_85%_60%_at_50%_-10%,theme(colors.accent/0.11),transparent_65%)] md:h-72"
          aria-hidden
        />
        <main className="relative mx-auto w-full max-w-6xl flex-1 px-4 py-12 md:px-8 md:py-16 lg:py-20">
          <nav
            aria-label="Breadcrumb"
            className="text-[13px] text-muted-foreground md:text-sm [&_a]:rounded-md [&_a]:px-1 [&_a]:py-0.5 [&_a]:transition-colors [&_a]:hover:bg-muted/60"
          >
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link
                  href="/"
                  className="text-accent underline-offset-[3px] transition hover:text-primary hover:underline"
                >
                  Beranda
                </Link>
              </li>
              <li aria-hidden="true" className="select-none text-border/90">
                /
              </li>
              <li className="font-medium tracking-tight text-foreground/95">Artikel</li>
            </ol>
          </nav>

          <header className="mt-10 max-w-2xl border-b border-border/60 pb-12 md:mt-12 md:max-w-3xl md:pb-14">
            <p className="inline-flex rounded-full border border-border/80 bg-gradient-to-b from-card to-card/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-accent shadow-sm">
              Catatan lapangan
            </p>
            <h1 className="mt-6 font-[family-name:var(--font-sora)] text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl md:leading-[1.12] lg:text-[2.55rem]">
              Artikel refrigerasi industri
            </h1>
            <span className="mt-6 block h-0.5 w-16 rounded-full bg-gradient-to-r from-accent to-accent/40" aria-hidden />
            <p className="mt-6 text-pretty text-lg leading-[1.65] text-muted-foreground md:text-xl md:leading-[1.65]">
              Artikel ringkas untuk yang kerja di proyek: cold room, gudang beku, blast freezer, panel PU—bukan
              ringkasan teori panjang.
            </p>
            <p className="mt-6">
              <Link
                href={LAYANAN_PAGES_BASE_PATH}
                className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/[0.08] px-4 py-2 text-sm font-semibold text-accent transition hover:border-accent/40 hover:bg-accent/[0.12]"
              >
                Lihat halaman layanan (panel, cold storage, refrigerasi)
                <span aria-hidden>→</span>
              </Link>
            </p>
          </header>

          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-14 lg:gap-8">
            {articles.map((a) => {
              const minutes = estimateReadingMinutesFromMarkdown(a.bodyMarkdown, a.faq);
              const dateShort = new Date(a.publishedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              const imgSrc = resolveArtikelCardImageSrc(a.heroImage, a.slug);
              const imgRemote = isRemoteOrBlobImageSrc(imgSrc);
              return (
                <li key={a.id}>
                  <Link
                    href={`/artikel/${a.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-border/90 bg-gradient-to-b from-card/95 to-card/80 shadow-[var(--shadow-card)] ring-1 ring-black/[0.04] transition duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-lg dark:from-card/90 dark:to-card/70 dark:ring-white/[0.06]"
                  >
                    <div className="relative h-44 w-full shrink-0 overflow-hidden bg-muted sm:h-[13.25rem] md:h-56">
                      {imgRemote ? (
                        // eslint-disable-next-line @next/next/no-img-element -- URL eksternal / blob opsional
                        <img
                          src={imgSrc}
                          alt=""
                          className="h-full w-full object-cover object-center transition duration-700 ease-out group-hover:scale-[1.03]"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <Image
                          src={imgSrc}
                          alt=""
                          fill
                          quality={86}
                          className="object-cover object-center transition duration-700 ease-out group-hover:scale-[1.03]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1152px) calc(50vw - 2.5rem), 480px"
                        />
                      )}
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/85 via-background/15 to-transparent"
                        aria-hidden
                      />
                      <div
                        className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/[0.06] dark:ring-white/[0.08]"
                        aria-hidden
                      />
                    </div>
                    <div className="flex flex-1 flex-col px-5 pb-6 pt-5 md:px-6 md:pb-7 md:pt-6">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium tabular-nums tracking-wide text-muted-foreground">
                        <time dateTime={a.publishedAt}>{dateShort}</time>
                        <span aria-hidden className="text-border/80">
                          ·
                        </span>
                        <span>{minutes} menit baca</span>
                      </div>
                      <span className="mt-3.5 inline-flex w-fit max-w-full rounded-full border border-accent/20 bg-accent/[0.09] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                        <span className="truncate">{a.primaryKeyword}</span>
                      </span>
                      <span className="mt-3 font-[family-name:var(--font-sora)] text-lg font-semibold leading-snug tracking-tight text-foreground transition duration-200 group-hover:text-accent md:text-[1.25rem] md:leading-snug">
                        {a.title}
                      </span>
                      <p className="mt-2.5 line-clamp-3 flex-1 text-[0.9375rem] leading-relaxed text-muted-foreground md:line-clamp-4 md:text-base md:leading-relaxed">
                        {a.deck}
                      </p>
                      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition duration-200 group-hover:gap-2.5">
                        Lanjut baca
                        <span aria-hidden className="text-base transition-transform duration-200 group-hover:translate-x-0.5">
                          →
                        </span>
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </main>
        <SiteFooter footer={content.footer} />
      </div>
    </WhatsAppPhoneProvider>
  );
}
