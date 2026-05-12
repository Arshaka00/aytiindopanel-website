import Link from "next/link";
import type { Metadata } from "next";

import { SeoArticlesAdminPanel } from "@/components/seo-articles/seo-articles-admin-panel";

export const metadata: Metadata = {
  title: "Editor tulisan /artikel | Panel CMS",
  robots: { index: false, follow: false },
};

export default function SiteAdminSeoArticlesPage() {
  return (
    <main className="min-h-[85vh] bg-[radial-gradient(120%_85%_at_50%_-15%,rgba(56,189,248,0.14),transparent_55%),linear-gradient(180deg,#020617,#0f172a)] px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/90">Tulisan /artikel</p>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">Editor tulisan /artikel</h1>
          <p className="text-sm leading-relaxed text-slate-400">
            Bagian ini <span className="font-medium text-slate-300">tidak</span> mengubah meta beranda atau konten CMS
            utama. Untuk judul/meta default situs, organisasi, dan footer gunakan{" "}
            <Link href="/site-admin/site-settings" className="font-medium text-sky-300 underline-offset-4 hover:underline">
              Site Settings
            </Link>
            .
          </p>
          <p className="text-sm text-slate-400">
            File: <code className="text-emerald-200/90">data/seo-articles/live.json</code>. Publik:{" "}
            <Link href="/artikel" className="text-emerald-300 underline-offset-4 hover:underline">
              /artikel
            </Link>
            .
          </p>
        </header>
        <SeoArticlesAdminPanel />
        <p className="text-center text-xs text-slate-500">
          <Link href="/site-admin" className="text-slate-400 hover:text-slate-200">
            ← Kembali ke panel CMS
          </Link>
        </p>
      </div>
    </main>
  );
}
