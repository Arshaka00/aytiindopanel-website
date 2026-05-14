"use client";

import type { WhatsAppFunnelCTA } from "@/components/aytipanel/whatsapp-funnel";
import { CmsText } from "@/components/site-cms/cms-text";
import { createDefaultSiteContent } from "@/lib/site-content-defaults";
import type { SiteContent } from "@/lib/site-content-model";

const FALLBACK_FOOTER = createDefaultSiteContent().footer;

/** Pemisah horizontal tipis — menggantikan border keras agar lebih halus (premium). */
const footerDivider =
  "mx-auto h-px w-full max-w-xl rounded-full bg-gradient-to-r from-transparent via-sky-500/22 to-transparent dark:via-sky-400/18";

type SiteFooterProps = {
  whatsappFunnel?: WhatsAppFunnelCTA;
  /** Jika true, strip promo “Siap bahas ruang lingkup…” + tombol WhatsApp tidak ditampilkan. */
  hideFooterPromoCta?: boolean;
  /** Optional — default dari konten situs bawaan (tanpa override berkas). */
  footer?: SiteContent["footer"];
};

export function SiteFooter({
  whatsappFunnel,
  hideFooterPromoCta = false,
  footer = FALLBACK_FOOTER,
}: SiteFooterProps) {
  void whatsappFunnel;
  void hideFooterPromoCta;

  return (
    <footer className="relative overflow-hidden bg-muted-bg-strong text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] dark:bg-[color-mix(in_srgb,var(--cta-band)_92%,black_8%)] dark:text-white/85 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/35 to-transparent dark:via-sky-400/28"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-sky-500/[0.04] to-transparent dark:from-white/[0.03]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      <div className="animate-footer-content-in relative mx-auto max-w-6xl px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5 sm:py-5 md:px-6 md:py-6">
        <div className="mx-auto flex w-full min-w-0 max-w-lg flex-col items-center justify-center gap-2.5">
          <div className={footerDivider} aria-hidden />
          <p className="mx-auto w-full max-w-[min(100%,24rem)] text-center text-[12px] font-medium leading-snug tracking-[0.02em] text-foreground/85 [-webkit-text-size-adjust:100%] dark:text-white/70 sm:text-[13px]">
            <CmsText
              path="footer.copyrightLine"
              text={footer.copyrightLine}
              as="span"
              className="inline text-pretty break-words"
            />
          </p>
        </div>
      </div>
    </footer>
  );
}
