import Image from "next/image";
import Link from "next/link";

import { SeoArticleBodyHtml } from "@/components/seo-articles/seo-article-body-html";
import { isRemoteOrBlobImageSrc, resolveArtikelCardImageSrc } from "@/lib/seo-articles/card-image";
import { SeoArticleFaqSection } from "@/components/seo-articles/seo-article-faq";
import { SeoArticleToc } from "@/components/seo-articles/seo-article-toc";
import type { SeoArticle, SeoArticleTocItem } from "@/lib/seo-articles/types";

function Breadcrumb({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
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
          <li>
            <Link
              href="/artikel"
              className="text-accent underline-offset-[3px] transition hover:text-primary hover:underline"
            >
              Artikel
            </Link>
          </li>
          <li aria-hidden="true" className="select-none text-border/90">
            /
          </li>
          <li className="line-clamp-2 font-medium tracking-tight text-foreground/95">{title}</li>
        </ol>
      </nav>
      <Link
        href="/artikel"
        className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-full border border-border/90 bg-gradient-to-b from-card/95 to-card/80 px-4 py-2 text-xs font-medium text-foreground shadow-sm ring-1 ring-black/[0.04] transition duration-200 hover:border-accent/35 hover:from-card hover:to-muted/40 hover:text-accent dark:ring-white/[0.05] sm:text-sm"
      >
        <span aria-hidden className="text-muted-foreground">
          ←
        </span>
        Semua artikel
      </Link>
    </div>
  );
}

export function SeoArticleView({
  article,
  bodyHtml,
  toc,
  readingMinutes,
  related,
}: {
  article: SeoArticle;
  bodyHtml: string;
  toc: SeoArticleTocItem[];
  readingMinutes: number;
  related: { slug: string; title: string; deck: string; heroImage: string }[];
}) {
  const hero = resolveArtikelCardImageSrc(article.heroImage, article.slug);
  const heroRemote = isRemoteOrBlobImageSrc(hero);
  const publishedLabel = new Date(article.publishedAt).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative selection:bg-accent/15">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_90%_55%_at_50%_-8%,theme(colors.accent/0.09),transparent_68%)] md:h-64"
        aria-hidden
      />
      <article className="relative mx-auto max-w-6xl px-4 pb-24 pt-9 md:px-8 md:pb-28 md:pt-11">
        <Breadcrumb title={article.title} />

        <header className="mt-10 max-w-3xl md:mt-12">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border/80 bg-muted/50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Catatan lapangan
            </span>
            {article.primaryKeyword.trim() ? (
              <span className="rounded-full border border-accent/25 bg-accent/[0.09] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                {article.primaryKeyword.trim()}
              </span>
            ) : null}
          </div>
          <h1 className="mt-5 font-[family-name:var(--font-sora)] text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl md:leading-[1.12] lg:text-[2.45rem] lg:leading-[1.1]">
            {article.title}
          </h1>
          <span className="mt-5 block h-0.5 w-16 rounded-full bg-gradient-to-r from-accent to-accent/35" aria-hidden />
          {article.deck ? (
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-[1.65] text-muted-foreground md:text-xl md:leading-[1.65]">
              {article.deck}
            </p>
          ) : null}
          <div className="mt-7 flex flex-wrap gap-2 text-xs tabular-nums md:text-sm">
            <span className="inline-flex items-center rounded-full border border-border/80 bg-card/90 px-3.5 py-1.5 text-muted-foreground shadow-sm backdrop-blur-[1px]">
              <span className="sr-only">Penulis: </span>
              {article.authorName.trim() || "Editor"}
            </span>
            <time
              className="inline-flex items-center rounded-full border border-border/80 bg-card/90 px-3.5 py-1.5 text-muted-foreground shadow-sm backdrop-blur-[1px]"
              dateTime={article.publishedAt}
            >
              {publishedLabel}
            </time>
            <span className="inline-flex items-center rounded-full border border-border/80 bg-card/90 px-3.5 py-1.5 text-muted-foreground shadow-sm backdrop-blur-[1px]">
              {readingMinutes} menit baca
            </span>
          </div>
        </header>

        <div className="relative mx-auto mt-9 h-[14.5rem] w-full max-w-3xl overflow-hidden rounded-2xl border border-border/90 bg-muted shadow-md ring-1 ring-black/[0.05] dark:ring-white/[0.07] sm:mt-10 sm:h-[16.25rem] md:mt-11 md:h-[17.5rem] md:rounded-[1.25rem] lg:h-[18.5rem]">
          {heroRemote ? (
            // eslint-disable-next-line @next/next/no-img-element -- URL eksternal / blob opsional
            <img src={hero} alt="" className="h-full w-full object-cover object-center" />
          ) : (
            <Image
              src={hero}
              alt=""
              fill
              quality={75}
              className="object-cover object-center"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) min(100vw, 36rem), 48rem"
              priority
            />
          )}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/25 via-transparent to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/[0.07] dark:ring-white/[0.1]"
            aria-hidden
          />
        </div>

        <div className="mt-14 grid gap-12 lg:mt-16 lg:grid-cols-[minmax(0,15.75rem)_minmax(0,1fr)] lg:gap-16 xl:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-[calc(var(--site-header-height,3.65rem)+1.25rem)] lg:self-start">
            <div className="lg:hidden">
              <details className="group overflow-hidden rounded-2xl border border-border/90 bg-gradient-to-b from-card/95 to-card/80 shadow-[var(--shadow-card)] ring-1 ring-black/[0.04] dark:ring-white/[0.05]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-sm font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                  <span>Daftar isi</span>
                  <span className="text-muted-foreground transition duration-200 group-open:rotate-180" aria-hidden>
                    ▼
                  </span>
                </summary>
                <div className="border-t border-border/80 px-3 pb-3 pt-1">
                  <SeoArticleToc items={toc} variant="plain" />
                </div>
              </details>
            </div>
            <div className="hidden lg:block">
              <SeoArticleToc items={toc} />
            </div>
          </aside>

          <div className="min-w-0 border-t border-transparent pt-1 lg:border-t-0 lg:pt-0">
            <SeoArticleBodyHtml html={bodyHtml} />
            <SeoArticleFaqSection items={article.faq} />
            {related.length ? (
              <section
                className="mt-16 scroll-mt-28 rounded-[1.25rem] border border-border/80 bg-muted/20 p-6 shadow-inner ring-1 ring-black/[0.03] dark:bg-muted/15 dark:ring-white/[0.04] md:mt-[4.5rem] md:p-8"
                aria-labelledby="seo-article-related-heading"
              >
                <h2
                  id="seo-article-related-heading"
                  className="font-[family-name:var(--font-sora)] text-lg font-semibold tracking-tight text-foreground md:text-xl"
                >
                  Artikel terkait
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                  Masih satu topik besar; beda sudut saja.
                </p>
                <ul className="mt-7 grid gap-3.5 sm:grid-cols-2 sm:gap-4">
                  {related.map((r) => {
                    const relSrc = resolveArtikelCardImageSrc(r.heroImage, r.slug);
                    const relRemote = isRemoteOrBlobImageSrc(relSrc);
                    return (
                      <li key={r.slug}>
                        <Link
                          href={`/artikel/${r.slug}`}
                          className="group flex min-h-[5.25rem] gap-3 rounded-xl border border-border/90 bg-gradient-to-b from-card/95 to-card/75 p-3.5 shadow-sm ring-1 ring-black/[0.03] transition duration-200 hover:-translate-y-px hover:border-accent/30 hover:shadow-[var(--shadow-card)] dark:from-card/90 dark:to-card/65 dark:ring-white/[0.04] sm:min-h-0 sm:gap-3.5 sm:p-4"
                        >
                          <div className="relative size-[4.25rem] shrink-0 overflow-hidden rounded-[0.7rem] bg-muted ring-1 ring-inset ring-black/[0.06] dark:ring-white/[0.08] sm:size-[4.5rem]">
                            {relRemote ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={relSrc}
                                alt=""
                                className="size-full object-cover object-center transition duration-500 group-hover:scale-[1.04]"
                                loading="lazy"
                              />
                            ) : (
                              <Image
                                src={relSrc}
                                alt=""
                                fill
                                quality={75}
                                className="object-cover object-center transition duration-500 group-hover:scale-[1.04]"
                                sizes="(max-width: 640px) 68px, 72px"
                              />
                            )}
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col justify-center py-0.5">
                            <span className="text-sm font-semibold leading-snug tracking-tight text-foreground transition duration-200 group-hover:text-accent md:text-[0.95rem]">
                              {r.title}
                            </span>
                            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground md:line-clamp-3 md:text-sm">
                              {r.deck}
                            </p>
                            <span className="mt-2.5 text-xs font-semibold text-accent/95 transition duration-200 group-hover:text-accent">
                              Baca →
                            </span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}
          </div>
        </div>
      </article>
    </div>
  );
}
