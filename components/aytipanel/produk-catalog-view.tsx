import Link from "next/link";

import { ProdukCatalogExperience } from "@/components/aytipanel/produk-catalog-experience";
import { InternalDetailNavLink } from "@/components/common/internal-detail-nav-link";
import { mergeAytiCardClass } from "@/lib/ayti-icon-cold";
import { buildProdukCatalogList } from "@/lib/produk-catalog-build";
import type { SiteContent } from "@/lib/site-content-model";

export type ProdukCatalogViewProps = {
  content: SiteContent;
};

const H1_CLASS =
  "text-balance bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-[clamp(1.5rem,4.5vw+0.6rem,2.25rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-transparent dark:from-white dark:via-slate-100 dark:to-slate-300/90 md:text-4xl md:leading-[1.12] lg:text-[2.4rem]";

/**
 * Katalog produk — hero & shell server-rendered; filter, pencarian, grid, & motion di client.
 */
export function ProdukCatalogView({ content }: ProdukCatalogViewProps) {
  const brand = content.siteSettings.siteName.trim() || "PT AYTI INDO PANEL";
  const items = buildProdukCatalogList(content);
  const segmentCount = new Set(items.map((i) => i.sectionKey)).size;
  const totalEntries = items.length;

  /** Hero katalog terpisah dari `produk.heading` / `produk.lead` (itu untuk section `/#produk`). */
  const catalogH1 = "Katalog produk";

  return (
    <div className="relative min-h-full overflow-x-clip">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_64%_at_50%_-12%,rgba(56,189,248,0.09),transparent_58%),radial-gradient(ellipse_70%_48%_at_100%_32%,rgba(37,99,235,0.05),transparent_60%),radial-gradient(ellipse_50%_40%_at_0%_78%,rgba(14,165,233,0.04),transparent_55%)] dark:bg-[radial-gradient(ellipse_100%_64%_at_50%_-12%,rgba(56,189,248,0.07),transparent_58%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.28] dark:opacity-[0.16]"
        style={{
          backgroundImage: `linear-gradient(rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
        }}
        aria-hidden
      />

      <div className="mx-auto max-w-[min(100%,80rem)] px-3.5 py-4 sm:px-6 sm:py-5 md:px-9 md:py-6 lg:px-10 lg:py-7">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className={`${H1_CLASS} mt-0`}>{catalogH1}</h1>
          <p className="mt-1.5 text-xs font-medium leading-snug text-muted-foreground/90 md:mt-2 md:text-sm">
            {brand}
          </p>
          <div
            className="mx-auto mt-2 h-px w-20 rounded-full bg-gradient-to-r from-transparent via-sky-500/40 to-transparent dark:via-sky-400/40 md:mt-2.5"
            aria-hidden
          />

          <div className="mx-auto mt-3 grid max-w-2xl grid-cols-2 gap-1.5 sm:mt-3.5 sm:flex sm:max-w-xl sm:flex-wrap sm:justify-center sm:gap-2.5 md:mt-4 md:gap-3">
            <div
              className={mergeAytiCardClass(
                "rounded-lg border border-border/60 bg-background/90 px-2 py-2.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-sm sm:min-w-[10rem] sm:flex-1 sm:rounded-2xl sm:px-5 sm:py-3 dark:border-white/[0.07] dark:bg-white/[0.04] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
              )}
            >
              <p className="font-mono text-xl font-semibold tabular-nums tracking-tight text-foreground dark:text-white sm:text-2xl">
                {totalEntries}
              </p>
              <p className="mt-1 text-[9px] font-medium uppercase leading-tight tracking-[0.18em] text-muted-foreground sm:mt-1.5 sm:text-[10px] sm:tracking-[0.2em]">
                SKU tersedia
              </p>
            </div>
            <div
              className={mergeAytiCardClass(
                "rounded-lg border border-border/60 bg-background/90 px-2 py-2.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-sm sm:min-w-[10rem] sm:flex-1 sm:rounded-2xl sm:px-5 sm:py-3 dark:border-white/[0.07] dark:bg-white/[0.04]",
              )}
            >
              <p className="font-mono text-xl font-semibold tabular-nums tracking-tight text-foreground dark:text-white sm:text-2xl">
                {segmentCount}
              </p>
              <p className="mt-1 text-[9px] font-medium uppercase leading-tight tracking-[0.18em] text-muted-foreground sm:mt-1.5 sm:text-[10px] sm:tracking-[0.2em]">
                Segmen katalog
              </p>
            </div>
          </div>
        </header>

        {items.length === 0 ? (
          <div
            className={mergeAytiCardClass(
              "mx-auto mt-5 max-w-lg rounded-2xl border border-dashed border-border/80 bg-muted-bg/30 px-5 py-7 text-center md:mt-6 md:py-9",
            )}
          >
            <p className="text-lg font-semibold text-foreground">Belum ada entri katalog</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Tambahkan produk melalui CMS atau periksa konten situs.
            </p>
          </div>
        ) : (
          <div className="mt-3 md:mt-4 lg:mt-5">
            <div
              className="mx-auto mb-2.5 h-px max-w-4xl bg-gradient-to-r from-transparent via-border to-transparent dark:via-white/10 md:mb-3.5"
              aria-hidden
            />
            <ProdukCatalogExperience items={items} />
          </div>
        )}

        <footer
          className={`mx-auto mt-3 max-w-2xl border-t border-border/60 pt-3 text-center md:mt-4 md:pt-4 ${
            items.length > 0
              ? "pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-8"
              : "pb-5 md:pb-8"
          }`}
        >
          <p className="text-sm leading-[1.65] text-muted-foreground md:text-[0.9375rem]">
            Konteks visual lengkap ada di{" "}
            <InternalDetailNavLink
              href="/#produk"
              scroll
              defaultHomeSectionDomId="produk"
              className="font-medium text-accent underline-offset-[5px] transition-colors hover:underline"
            >
              section produk beranda
            </InternalDetailNavLink>
            .{" "}
            <Link
              href="/"
              className="font-medium text-accent underline-offset-[5px] transition-colors hover:underline"
            >
              Kembali ke beranda
            </Link>
            .
          </p>
        </footer>
      </div>
    </div>
  );
}
