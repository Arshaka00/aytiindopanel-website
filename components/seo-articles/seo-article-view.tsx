import Image from "next/image";
import Link from "next/link";

import { SeoArticleBodyHtml } from "@/components/seo-articles/seo-article-body-html";
import { SeoArticleFaqSection } from "@/components/seo-articles/seo-article-faq";
import { SeoArticleToc } from "@/components/seo-articles/seo-article-toc";
import type { SeoArticle, SeoArticleTocItem } from "@/lib/seo-articles/types";

function Breadcrumb({ title }: { title: string }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground md:text-sm">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
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
        <li className="text-foreground">{title}</li>
      </ol>
    </nav>
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
  related: { slug: string; title: string; deck: string }[];
}) {
  const hero = article.heroImage.trim();
  return (
    <article className="mx-auto max-w-6xl px-4 pb-16 pt-8 md:px-6 md:pt-12">
      <Breadcrumb title={article.title} />
      <header className="mt-6 max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent/90">Artikel</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{article.title}</h1>
        {article.deck ? (
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">{article.deck}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground md:text-sm">
          <span>{article.authorName.trim() || "Editor"}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={article.publishedAt}>
            {new Date(article.publishedAt).toLocaleDateString("id-ID", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
          <span aria-hidden="true">·</span>
          <span>{readingMinutes} menit baca</span>
        </div>
      </header>

      {hero ? (
        <div className="relative mt-8 aspect-[21/9] max-w-4xl overflow-hidden rounded-2xl border border-border bg-muted shadow-xl">
          {/^https?:\/\//.test(hero) ? (
            // eslint-disable-next-line @next/next/no-img-element -- URL eksternal opsional hero
            <img src={hero} alt="" className="h-full w-full object-cover" />
          ) : (
            <Image
              src={hero}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
              priority
            />
          )}
        </div>
      ) : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] lg:gap-12">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="lg:hidden">
            <details className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-2">
                  Daftar isi
                  <span className="text-xs text-muted-foreground">tap untuk buka</span>
                </span>
              </summary>
              <div className="border-t border-border p-3">
                <SeoArticleToc items={toc} variant="plain" />
              </div>
            </details>
          </div>
          <div className="hidden lg:block">
            <SeoArticleToc items={toc} />
          </div>
        </aside>

        <div className="min-w-0 max-w-3xl">
          <SeoArticleBodyHtml html={bodyHtml} />
          <SeoArticleFaqSection items={article.faq} />
          {related.length ? (
            <section className="mt-12 border-t border-border pt-10" aria-labelledby="seo-article-related-heading">
              <h2
                id="seo-article-related-heading"
                className="text-xl font-semibold tracking-tight text-foreground md:text-2xl"
              >
                Artikel terkait
              </h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/artikel/${r.slug}`}
                      className="block h-full rounded-2xl border border-border bg-card/70 p-4 shadow-[var(--shadow-card)] transition hover:border-accent/35 hover:bg-muted-bg-strong"
                    >
                      <span className="text-sm font-semibold text-accent hover:text-primary">{r.title}</span>
                      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{r.deck}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </article>
  );
}
