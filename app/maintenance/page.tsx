import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { MaintenanceLivePanel } from "@/components/aytipanel/maintenance-live-panel";
import { mergeAytiCtaClass } from "@/lib/ayti-icon-cold";
import { generateWhatsAppLink } from "@/utils/whatsapp";
import { getSiteContent } from "@/lib/site-content";
import { resolvePrimaryWhatsAppDigits } from "@/lib/site-contact";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const name = content.siteSettings.siteName.trim() || "Site";
  return {
    title: `Maintenance | ${name}`,
    description: "Website sementara dalam pemeliharaan.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function MaintenancePage() {
  const content = await getSiteContent();
  const settings = content.siteSettings;
  const waDigits = resolvePrimaryWhatsAppDigits(settings);
  const waHref = generateWhatsAppLink(settings.maintenanceWhatsAppMessage, waDigits);

  return (
    <main className="relative isolate flex min-h-[100dvh] items-start justify-center overflow-hidden bg-slate-100 px-4 pb-14 pt-[5.75rem] text-slate-900 sm:pt-24 dark:bg-black dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_12%_10%,rgba(2,132,199,0.16),transparent_65%),radial-gradient(65%_50%_at_88%_90%,rgba(217,119,6,0.08),transparent_70%),linear-gradient(180deg,#e2e8f0_0%,#f8fafc_40%,#f1f5f9_100%)] dark:bg-[radial-gradient(55%_45%_at_12%_10%,rgba(56,189,248,0.16),transparent_65%),radial-gradient(65%_50%_at_88%_90%,rgba(245,158,11,0.1),transparent_70%),linear-gradient(180deg,#010409_0%,#020617_40%,#020617_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-white/20 dark:bg-black/35" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-[linear-gradient(180deg,transparent,rgba(226,232,240,0.8))] dark:bg-[linear-gradient(180deg,transparent,rgba(2,6,23,0.95))]" />

      <section className="relative mt-6 w-full max-w-2xl rounded-3xl border border-slate-300/80 bg-white/88 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:mt-7 sm:p-10 dark:border-white/20 dark:bg-black/80 dark:shadow-[0_30px_120px_rgba(0,0,0,0.95)] motion-safe:animate-[premium-page-reveal_420ms_var(--ease-premium-soft)_both]">
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-white/60 via-transparent to-slate-100/40 dark:from-white/[0.06] dark:to-black/25" />
        <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/65 bg-sky-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-900 dark:border-sky-100/45 dark:bg-sky-300/20 dark:text-white">
          System Notice
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-1.5 sm:h-14 sm:w-14">
            <Image src="/images/logo_ayti.png" alt="Logo PT AYTI INDO PANEL" fill className="object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-900 dark:text-white">
              {settings.siteName.trim() || "PT AYTI INDO PANEL"}
            </p>
            <p className="mt-1 text-xs text-slate-700 dark:text-slate-100 sm:text-sm">
              {content.siteSettings.seoContent.companyDescription.trim().slice(0, 120) ||
                "Industrial Cold Storage & Refrigeration Solutions"}
            </p>
          </div>
        </div>

        <h1 className="mt-7 text-balance text-2xl font-semibold leading-tight tracking-tight text-slate-950 dark:text-white dark:[text-shadow:0_2px_10px_rgba(0,0,0,0.55)] sm:text-4xl sm:leading-[1.1]">
          {settings.maintenanceHeadline}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-800 dark:text-white dark:[text-shadow:0_1px_3px_rgba(0,0,0,0.75)] sm:text-[15px]">
          {settings.maintenanceSubtext}
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {settings.maintenanceShowWhatsApp ? (
            <Link
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Hubungi tim PT AYTI INDO PANEL via WhatsApp"
              className={mergeAytiCtaClass(
                "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-emerald-950 bg-gradient-to-b from-emerald-700 to-emerald-800 px-4 py-2.5 text-sm font-bold text-white shadow-[0_16px_36px_rgba(6,78,59,0.5)] outline outline-2 outline-white/90 transition hover:from-emerald-600 hover:to-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:w-auto dark:border-emerald-300/70 dark:bg-emerald-500 dark:bg-none dark:shadow-[0_12px_32px_rgba(5,150,105,0.35)] dark:outline-white/15 dark:hover:bg-emerald-400 dark:focus-visible:ring-emerald-300 dark:focus-visible:ring-offset-black",
              )}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="ayti-icon-cold h-4 w-4 shrink-0 fill-current"
              >
                <path d="M19.11 4.89A10.89 10.89 0 0 0 2.42 18.06L1 23l5.06-1.34a10.9 10.9 0 0 0 5.2 1.32h.01A10.9 10.9 0 0 0 19.11 4.9Zm-7.83 16.2h-.01a9.08 9.08 0 0 1-4.63-1.27l-.33-.2-3 .79.8-2.93-.22-.34a9.08 9.08 0 1 1 7.39 4.95Zm4.98-6.78c-.27-.14-1.58-.78-1.83-.87-.24-.09-.42-.13-.6.13-.18.27-.69.87-.85 1.04-.16.18-.31.2-.58.07-.27-.14-1.14-.42-2.17-1.34-.8-.72-1.34-1.6-1.5-1.87-.16-.27-.02-.41.12-.55.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.05-.34-.02-.47-.07-.14-.6-1.45-.82-1.99-.22-.52-.44-.45-.6-.45h-.51c-.18 0-.47.07-.72.34-.24.27-.95.92-.95 2.25s.97 2.62 1.1 2.8c.13.18 1.9 2.9 4.6 4.07.64.28 1.15.45 1.54.58.65.2 1.24.17 1.7.1.52-.08 1.58-.65 1.8-1.28.22-.62.22-1.16.15-1.27-.06-.11-.24-.18-.51-.31Z" />
              </svg>
              {settings.maintenanceWhatsAppLabel}
            </Link>
          ) : null}
          <p className="rounded-lg border border-slate-300 bg-slate-100/90 px-3 py-2 text-[11px] text-slate-800 sm:text-xs dark:border-white/35 dark:bg-black/35 dark:text-white dark:[text-shadow:0_1px_2px_rgba(0,0,0,0.7)]">
            Status: maintenance sementara. Tim internal tetap dapat mengelola konten.
          </p>
        </div>
        <MaintenanceLivePanel etaIso={null} />
        </div>
      </section>
    </main>
  );
}
