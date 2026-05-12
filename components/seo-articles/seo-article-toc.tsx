import Link from "next/link";

import type { SeoArticleTocItem } from "@/lib/seo-articles/types";

export function SeoArticleToc({
  items,
  variant = "card",
}: {
  items: SeoArticleTocItem[];
  variant?: "card" | "plain";
}) {
  if (!items.length) return null;
  const shell =
    variant === "plain"
      ? "seo-article-toc border-l-2 border-accent/30 pl-4 pr-1 pt-0.5"
      : "seo-article-toc rounded-2xl border border-border/90 bg-gradient-to-b from-card/95 to-card/75 p-4 shadow-[var(--shadow-card)] ring-1 ring-black/[0.04] backdrop-blur-[2px] dark:from-card/85 dark:to-card/60 dark:ring-white/[0.05] md:p-5";
  return (
    <nav aria-label="Daftar isi" className={shell}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent/95">Daftar isi</p>
      <ol className="mt-4 list-none space-y-0.5 text-[13px] leading-snug tracking-tight text-foreground/90 md:text-sm">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? "pl-2.5 md:pl-3.5" : ""}>
            <Link
              href={`#${encodeURIComponent(item.id)}`}
              className={[
                "block rounded-lg px-2 py-1.5 transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                item.level === 3
                  ? "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  : "font-medium text-foreground hover:bg-muted/70",
              ].join(" ")}
            >
              {item.text}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
