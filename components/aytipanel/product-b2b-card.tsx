import Link from "next/link";
import { SiteCopyrightImagePreview } from "@/components/aytipanel/site-copyright-image-preview";
import { CmsImage } from "@/components/site-cms/cms-image";
import { CmsText } from "@/components/site-cms/cms-text";
import type { ProductB2BCardData } from "@/components/aytipanel/products-b2b-data";
import { WhatsAppCTAButton } from "@/components/aytipanel/whatsapp-cta-button";
import { mergeAytiCardClass, mergeAytiCtaClass } from "@/lib/ayti-icon-cold";
import { generateWhatsAppMessage } from "@/utils/whatsapp";
import { buildProductDetailHref } from "@/components/aytipanel/product-navigation";
import { prepareNavigateFromListingToProductDetail } from "@/components/common/return-section";

type Props = {
  card: ProductB2BCardData;
  /** Index untuk stagger animasi masuk (motion-safe). */
  staggerIndex?: number;
  /** Kartu secondary / varian — lebih ringkas. */
  compact?: boolean;
  /** Override rasio gambar agar tinggi kartu lebih terkontrol. */
  imageAspectClassName?: string;
  /** Rapatkan jarak vertikal konten teks tanpa ubah ukuran font. */
  tightTextSpacing?: boolean;
  /** Sembunyikan gambar kartu untuk varian section tertentu. */
  hideImage?: boolean;
  /** Sembunyikan seluruh action CTA pada card. */
  hideActions?: boolean;
  /** Anchor section beranda untuk Kembali (tanpa `#`), sesuai `id` blok listing. */
  listingReturnAnchor?: string;
  /** Path CMS untuk gambar kartu agar bisa diganti via edit mode. */
  imageSrcPath?: string;
  /**
   * Awalan path JSON untuk teks kartu, mis. `produk.categories.0.cards.1` atau `serviceMaintenance.cards.0`.
   * Jika diisi, judul, deskripsi, highlights, spesifikasi, dan label tombol bisa diedit inline + panel gaya.
   */
  cmsCardPathPrefix?: string;
};

const productCardShellDefault = mergeAytiCardClass(
  "dark-card animate-product-card-in group/card relative isolate flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-foreground shadow-[var(--shadow-card)] outline-none ring-1 ring-border/70 transition-[transform,box-shadow,border-color] duration-[320ms] [transition-timing-function:var(--ease-premium-soft)] motion-safe:hover:-translate-y-1 motion-safe:hover:border-accent/40 motion-safe:hover:shadow-[var(--shadow-card-hover)] motion-safe:active:-translate-y-1 motion-safe:active:border-accent/40 motion-safe:active:shadow-[var(--shadow-card-hover)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:shadow-[0_8px_32px_-10px_rgba(0,0,0,0.65)] dark:ring-white/[0.06] dark:motion-safe:hover:border-white/18 dark:motion-safe:hover:shadow-[0_18px_50px_-14px_rgba(0,0,0,0.72)] dark:motion-safe:active:border-white/18 dark:motion-safe:active:shadow-[0_18px_50px_-14px_rgba(0,0,0,0.72)] md:rounded-xl",
);

const productCardShellCompact = mergeAytiCardClass(
  "dark-card animate-product-card-in group/card relative isolate flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-card text-foreground shadow-[0_6px_24px_-12px_rgba(0,0,0,0.2)] outline-none ring-1 ring-border/60 transition-[transform,box-shadow,border-color] duration-[320ms] [transition-timing-function:var(--ease-premium-soft)] motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-accent/35 motion-safe:hover:shadow-[0_12px_32px_-14px_rgba(0,0,0,0.28)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:shadow-[0_8px_28px_-12px_rgba(0,0,0,0.55)] dark:ring-white/[0.05] dark:motion-safe:hover:border-white/16 md:rounded-xl",
);

const btnPrimaryProductDefault =
  "inline-flex min-h-11 flex-1 touch-manipulation items-center justify-center gap-1.5 rounded-[11px] bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-[0_4px_14px_-4px_rgba(37,99,235,0.65)] transition-[filter,transform,opacity] duration-[220ms] [transition-timing-function:var(--ease-premium-soft)] hover:brightness-110 motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/90 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:active:scale-100 dark:focus-visible:ring-offset-slate-900";

const btnPrimaryProductCompact =
  "inline-flex min-h-10 flex-1 touch-manipulation items-center justify-center gap-1 rounded-[10px] bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 px-3 py-2 text-center text-xs font-semibold text-white shadow-[0_3px_12px_-4px_rgba(37,99,235,0.55)] transition-[filter,transform,opacity] duration-[220ms] [transition-timing-function:var(--ease-premium-soft)] hover:brightness-110 motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/90 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:active:scale-100 dark:focus-visible:ring-offset-slate-900";

const btnSecondaryProductDefault =
  "inline-flex min-h-11 flex-1 touch-manipulation items-center justify-center gap-1.5 rounded-[11px] border border-border bg-muted-bg px-4 py-2.5 text-center text-sm font-semibold text-foreground shadow-sm backdrop-blur-sm transition-[border-color,background-color,transform] duration-[260ms] [transition-timing-function:var(--ease-premium-soft)] motion-safe:active:translate-y-px hover:border-accent/35 hover:bg-muted-bg-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-white/35 dark:bg-white/[0.06] dark:text-white dark:hover:border-white/55 dark:hover:bg-white/12 dark:focus-visible:ring-white/45 dark:focus-visible:ring-offset-slate-900";

const btnSecondaryProductCompact =
  "inline-flex min-h-10 flex-1 touch-manipulation items-center justify-center gap-1 rounded-[10px] border border-border bg-muted-bg px-3 py-2 text-center text-xs font-semibold text-foreground shadow-sm backdrop-blur-sm transition-[border-color,background-color,transform] duration-[260ms] [transition-timing-function:var(--ease-premium-soft)] motion-safe:active:translate-y-px hover:border-accent/35 hover:bg-muted-bg-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-white/35 dark:bg-white/[0.06] dark:text-white dark:hover:border-white/55 dark:hover:bg-white/12 dark:focus-visible:ring-white/45 dark:focus-visible:ring-offset-slate-900";

const premiumDividerClass =
  "h-px w-full rounded-full bg-gradient-to-r from-transparent via-sky-500/35 to-transparent dark:via-sky-300/45";

export function ProductB2BCard({
  card,
  staggerIndex = 0,
  compact = false,
  imageAspectClassName,
  tightTextSpacing = false,
  hideImage = false,
  hideActions = false,
  listingReturnAnchor = "produk",
  imageSrcPath,
  cmsCardPathPrefix,
}: Props) {
  const showDetail = card.detailLabel != null;
  const detailHref = card.slug ? buildProductDetailHref(card.slug) : "#kontak";
  const delayMs = staggerIndex * 72;

  const shell = compact ? productCardShellCompact : productCardShellDefault;
  const btnPri = compact ? btnPrimaryProductCompact : btnPrimaryProductDefault;
  const btnSec = compact ? btnSecondaryProductCompact : btnSecondaryProductDefault;
  const storeReturnForDetail = (): void =>
    prepareNavigateFromListingToProductDetail(listingReturnAnchor);
  const defaultAspectClass = compact ? "aspect-[5/3]" : "aspect-[16/10]";
  const cardClassName = hideImage
    ? `${shell} border-slate-200/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.98)_100%)] ring-slate-200/75 shadow-[0_14px_34px_-20px_rgba(15,23,42,0.5)] dark:border-white/12 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.96)_0%,rgba(15,23,42,0.9)_100%)] dark:ring-white/[0.07]`
    : shell;

  const p = cmsCardPathPrefix?.trim();

  return (
    <article
      className={cardClassName}
      style={
        staggerIndex > 0
          ? { animationDelay: `${delayMs}ms` }
          : undefined
      }
    >
      {hideImage ? null : (
        <div
          className={`relative w-full shrink-0 overflow-hidden bg-muted-bg-strong dark:bg-slate-800 ${imageAspectClassName ?? defaultAspectClass}`}
        >
          {imageSrcPath ? (
            <CmsImage
              srcPath={imageSrcPath}
              src={card.imageSrc}
              alt={card.imageAlt}
              fill
              uploadScope="produk"
              uploadSegment="cards"
              sizes={compact ? "(max-width: 768px) 45vw, 30vw" : "(max-width: 768px) 100vw, 33vw"}
              className="object-cover transition-[transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover/card:scale-[1.035]"
            />
          ) : (
            <SiteCopyrightImagePreview
              fill
              src={card.imageSrc}
              alt={card.imageAlt}
              sizes={compact ? "(max-width: 768px) 45vw, 30vw" : "(max-width: 768px) 100vw, 33vw"}
              buttonClassName="absolute inset-0 block h-full w-full min-h-0"
              imageClassName="object-cover transition-[transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover/card:scale-[1.035]"
            />
          )}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-800/20 to-transparent dark:from-slate-950/85 dark:via-slate-950/25"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-foreground/18 to-transparent dark:via-white/20"
            aria-hidden
          />
        </div>
      )}

      <div
        className={`relative flex min-h-0 flex-1 flex-col bg-card/95 backdrop-blur-md dark:bg-slate-900/90 ${hideImage ? "" : "border-t border-border dark:border-white/[0.07]"} ${compact ? "gap-3 p-3.5 md:gap-4 md:p-4" : tightTextSpacing ? "gap-4 p-5 md:gap-4 md:p-6" : "gap-5 p-5 md:gap-6 md:p-6"}`}
      >
        <div className={`space-y-1.5 ${compact ? "" : tightTextSpacing ? "space-y-2" : "space-y-2"}`}>
          <h3
            className={`text-center font-semibold tracking-tight text-foreground dark:text-white ${compact ? "text-[0.9375rem] leading-snug md:text-base" : hideImage ? "text-[1.12rem] leading-tight md:text-[1.22rem]" : "text-lg leading-snug md:text-xl"}`}
          >
            {p ? (
              <CmsText path={`${p}.title`} text={card.title} as="span" className="block min-w-0" />
            ) : (
              card.title
            )}
          </h3>
          <div
            className={`h-px w-full rounded-full ${hideImage ? "bg-gradient-to-r from-transparent via-sky-500/55 to-transparent dark:via-sky-300/65" : premiumDividerClass}`}
            aria-hidden
          />
          <div
            className={`whitespace-pre-line dark:text-white/80 ${compact ? "line-clamp-3 text-xs leading-snug text-muted md:text-[0.8125rem]" : hideImage ? "text-center text-[0.93rem] leading-[1.45] text-slate-600 md:text-[0.98rem] dark:text-slate-200/85" : tightTextSpacing ? "text-sm leading-snug text-muted md:text-[0.9375rem] md:leading-snug" : "text-sm leading-relaxed text-muted md:text-[0.9375rem] md:leading-relaxed"}`}
          >
            {p ? (
              <CmsText path={`${p}.subtitle`} text={card.subtitle} as="span" className="inline text-inherit" />
            ) : (
              card.subtitle
            )}
          </div>
        </div>

        <div className={compact ? "space-y-2" : tightTextSpacing ? "space-y-2.5" : "space-y-2.5"}>
          <div className={premiumDividerClass} aria-hidden />
          <p
            className={`text-center font-semibold uppercase tracking-[0.16em] text-muted dark:text-white/60 ${compact ? "text-[10px]" : hideImage ? "text-[10px] text-sky-700/85 dark:text-sky-300/80" : "text-[11px]"}`}
          >
            Layanan
          </p>
          <div className={premiumDividerClass} aria-hidden />
          <ul
            className={`text-foreground dark:text-white/90 ${compact ? "space-y-1.5 text-xs leading-snug md:text-[0.8125rem]" : hideImage ? "space-y-2 text-[0.93rem] leading-[1.42] md:text-[0.97rem]" : tightTextSpacing ? "space-y-1.5 text-sm leading-snug md:leading-snug" : "space-y-2.5 text-sm leading-snug md:leading-relaxed"}`}
            role="list"
          >
            {card.highlights.map((line, hi) => (
              <li key={`${p ?? "hl"}-${hi}`} className="flex min-w-0 gap-2">
                <span className="shrink-0 pt-[1px] text-sky-700/80 dark:text-sky-300/80" aria-hidden>
                  -
                </span>
                <span className="min-w-0">
                  {p ? (
                    <CmsText
                      path={`${p}.highlights.${hi}`}
                      text={line}
                      as="span"
                      className="inline text-inherit"
                    />
                  ) : (
                    line
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className={tightTextSpacing && !compact ? "space-y-2" : "space-y-2"}>
          <div className={premiumDividerClass} aria-hidden />
          <p
            className={`text-center font-semibold uppercase tracking-[0.16em] text-muted dark:text-white/60 ${compact ? "text-[10px]" : hideImage ? "text-[10px] text-sky-700/85 dark:text-sky-300/80" : "text-[11px]"}`}
          >
            Dukungan
          </p>
          <div className={premiumDividerClass} aria-hidden />
          <div
            className={`rounded-[11px] border border-border bg-muted-bg text-center font-medium whitespace-pre-line text-muted backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.06] dark:text-white/80 ${hideImage ? "border-sky-200/55 bg-sky-50/55 dark:border-sky-400/25 dark:bg-sky-500/10" : ""} ${compact ? "px-2.5 py-2 text-[10px] leading-snug md:text-[11px]" : tightTextSpacing ? "px-3.5 py-2.5 text-xs leading-snug md:text-[13px] md:leading-snug" : "px-3.5 py-3 text-xs leading-relaxed md:text-[13px] md:leading-relaxed"}`}
          >
            {p ? (
              <CmsText path={`${p}.specs`} text={card.specs} as="span" className="block whitespace-pre-wrap text-inherit" />
            ) : (
              card.specs
            )}
          </div>
        </div>

        {hideActions ? null : (
          <div
            className={`mt-auto flex flex-col ${compact ? "gap-2" : tightTextSpacing ? "gap-2" : "gap-2.5"} ${showDetail ? "sm:flex-row sm:items-stretch sm:gap-2.5 md:gap-3" : ""}`}
          >
            {showDetail ? (
              card.slug ? (
                <Link
                  href={detailHref}
                  scroll
                  className={mergeAytiCtaClass(btnSec)}
                  onPointerDownCapture={storeReturnForDetail}
                  onClick={storeReturnForDetail}
                >
                  <span className="truncate">
                    {p ? (
                      <CmsText
                        path={`${p}.detailLabel`}
                        text={card.detailLabel ?? ""}
                        as="span"
                        className="inline"
                      />
                    ) : (
                      card.detailLabel
                    )}
                  </span>
                  <span className="text-accent opacity-95 dark:text-blue-300" aria-hidden>
                    →
                  </span>
                </Link>
              ) : (
                <a href={detailHref} className={mergeAytiCtaClass(btnSec)}>
                  <span className="truncate">
                    {p ? (
                      <CmsText
                        path={`${p}.detailLabel`}
                        text={card.detailLabel ?? ""}
                        as="span"
                        className="inline"
                      />
                    ) : (
                      card.detailLabel
                    )}
                  </span>
                  <span className="text-accent opacity-95 dark:text-blue-300" aria-hidden>
                    →
                  </span>
                </a>
              )
            ) : null}
            <WhatsAppCTAButton
              className={`${btnPri} ${showDetail ? "flex-1" : "w-full"}`}
              ariaLabel={`${card.quoteLabel} via WhatsApp untuk ${card.title} (buka tab baru)`}
              message={generateWhatsAppMessage(card.title, card.whatsappContext)}
            >
              <span className="max-w-full truncate text-center">
                {p ? (
                  <CmsText path={`${p}.quoteLabel`} text={card.quoteLabel} as="span" className="inline" />
                ) : (
                  card.quoteLabel
                )}
              </span>
            </WhatsAppCTAButton>
          </div>
        )}
      </div>
    </article>
  );
}
