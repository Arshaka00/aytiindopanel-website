import { parseMarkdownLiteInline } from "@/lib/seo-articles/markdown-lite";
import type { SeoArticleFaqItem } from "@/lib/seo-articles/types";

export function SeoArticleFaqSection({ items }: { items: SeoArticleFaqItem[] }) {
  if (!items.length) return null;
  return (
    <section
      className="mt-16 scroll-mt-28 border-t border-border/70 pt-14 md:mt-[4.5rem] md:pt-16"
      aria-labelledby="seo-article-faq-heading"
    >
      <div className="max-w-2xl">
        <h2
          id="seo-article-faq-heading"
          className="font-[family-name:var(--font-sora)] text-xl font-semibold tracking-tight text-foreground md:text-2xl"
        >
          Pertanyaan umum
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-[0.9375rem]">
          Hal yang sering ditanyakan lagi di lapangan.
        </p>
      </div>
      <div className="mt-9 overflow-hidden rounded-2xl border border-border/90 bg-gradient-to-b from-card/90 to-card/70 shadow-[var(--shadow-card)] ring-1 ring-black/[0.04] dark:from-card/80 dark:to-card/55 dark:ring-white/[0.05] md:rounded-[1.25rem]">
        <dl className="divide-y divide-border/80">
          {items.map((item, i) => (
            <div key={item.id} className="px-5 py-6 md:px-7 md:py-7">
              <dt className="flex gap-3.5 text-base font-semibold leading-snug tracking-tight text-foreground md:text-[1.0625rem] md:leading-snug">
                <span
                  className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/12 text-xs font-bold tabular-nums text-accent"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <span className="pt-0.5">{item.question}</span>
              </dt>
              <dd
                className="seo-article-body mt-4 max-w-prose pl-11 text-[0.9375rem] leading-[1.72] text-muted-foreground md:pl-12 md:text-base md:leading-[1.75] [&_a]:font-medium [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-[3px] [&_a]:transition-colors [&_a]:hover:text-primary [&_strong]:font-semibold [&_strong]:text-foreground/95"
                dangerouslySetInnerHTML={{ __html: parseMarkdownLiteInline(item.answerMarkdown) }}
              />
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
