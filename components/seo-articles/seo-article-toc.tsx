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
      ? "seo-article-toc px-1 pt-1"
      : "seo-article-toc rounded-2xl border border-border bg-card/70 p-4 shadow-[var(--shadow-card)] backdrop-blur-sm";
  return (
    <nav aria-label="Daftar isi" className={shell}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent/90">Daftar isi</p>
      <ol className="mt-3 list-none space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? "pl-4 text-muted-foreground" : "text-foreground"}>
            <Link
              href={`#${encodeURIComponent(item.id)}`}
              className="inline-flex text-left text-accent underline-offset-4 hover:text-primary hover:underline"
            >
              {item.text}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
