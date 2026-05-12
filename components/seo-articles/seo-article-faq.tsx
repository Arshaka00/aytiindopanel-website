import { parseMarkdownLiteInline } from "@/lib/seo-articles/markdown-lite";
import type { SeoArticleFaqItem } from "@/lib/seo-articles/types";

export function SeoArticleFaqSection({ items }: { items: SeoArticleFaqItem[] }) {
  if (!items.length) return null;
  return (
    <section className="mt-12 border-t border-border pt-10" aria-labelledby="seo-article-faq-heading">
      <h2 id="seo-article-faq-heading" className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
        Pertanyaan umum
      </h2>
      <dl className="mt-6 space-y-6">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-border bg-card/70 p-4 shadow-[var(--shadow-card)] md:p-5">
            <dt className="text-base font-semibold text-foreground">{item.question}</dt>
            <dd
              className="seo-article-body mt-2 text-sm leading-relaxed text-muted-foreground md:text-base [&_a]:text-accent [&_a]:underline [&_strong]:text-foreground"
              dangerouslySetInnerHTML={{ __html: parseMarkdownLiteInline(item.answerMarkdown) }}
            />
          </div>
        ))}
      </dl>
    </section>
  );
}
