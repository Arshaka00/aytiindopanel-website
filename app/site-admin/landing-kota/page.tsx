import Link from "next/link";
import type { Metadata } from "next";

import { LandingKotaAdminPanel } from "@/components/site-cms/landing-kota-admin-panel";
import { getAllServiceCitySlugs } from "@/lib/seo-service-city-pages";

export const metadata: Metadata = {
  title: "Landing kota (SEO wilayah) | Panel CMS",
  robots: { index: false, follow: false },
};

export default function SiteAdminLandingKotaPage() {
  const allCitySlugs = getAllServiceCitySlugs();

  return (
    <main className="min-h-[85vh] bg-[radial-gradient(120%_85%_at_50%_-15%,rgba(56,189,248,0.14),transparent_55%),linear-gradient(180deg,#020617,#0f172a)] px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300/90">SEO wilayah</p>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">Landing kota</h1>
          <p className="text-sm leading-relaxed text-slate-400">
            Konten disimpan di <code className="text-sky-200/90">SiteContent.landingKotaPages</code> (file{" "}
            <code className="text-sky-200/90">data/site-content/*.json</code>), bukan di editor artikel terpisah.
            Untuk meta beranda global gunakan{" "}
            <Link href="/site-admin/site-settings" className="font-medium text-sky-300 underline-offset-4 hover:underline">
              Site Settings
            </Link>
            .
          </p>
        </header>
        <LandingKotaAdminPanel allCitySlugs={allCitySlugs} />
        <p className="text-center text-xs text-slate-500">
          <Link href="/site-admin" className="text-slate-400 hover:text-slate-200">
            ← Kembali ke panel CMS
          </Link>
        </p>
      </div>
    </main>
  );
}
