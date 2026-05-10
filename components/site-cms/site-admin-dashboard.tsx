"use client";

import Link from "next/link";

const SHOW_DEVICE_BIND_CARD = false;

export function SiteAdminDashboard() {
  return (
    <main className="min-h-[85vh] bg-[radial-gradient(120%_85%_at_50%_-15%,rgba(56,189,248,0.14),transparent_55%),linear-gradient(180deg,#020617,#0f172a)] px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300/90">Internal</p>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">Panel CMS</h1>
          <p className="text-sm text-slate-400">
            Pintasan cepat. Pengaturan domain, kontak, SEO, publish, dan backup ada di Site Settings.
          </p>
        </header>

        <Link
          href="/site-admin/visitor-analytics"
          className="group block rounded-2xl border border-indigo-400/35 bg-gradient-to-br from-indigo-500/15 to-slate-900/60 p-6 shadow-lg backdrop-blur-md transition hover:border-indigo-300/55 hover:from-indigo-500/25"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-300/90">Analytics</p>
          <h2 className="mt-2 text-lg font-semibold text-white md:text-xl">Visitor Analytics</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Traffic ringan: kunjungan, halaman populer, kota, perangkat, klik WhatsApp — penyimpanan JSONL internal.
          </p>
          <span className="mt-4 inline-block text-sm font-semibold text-indigo-200 group-hover:underline">
            Buka dashboard →
          </span>
        </Link>

        <Link
          href="/site-admin/site-settings"
          className="group block rounded-2xl border border-cyan-400/35 bg-gradient-to-br from-cyan-500/15 to-slate-900/60 p-6 shadow-lg backdrop-blur-md transition hover:border-cyan-300/55 hover:from-cyan-500/25"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300/90">Utama</p>
          <h2 className="mt-2 text-lg font-semibold text-white md:text-xl">Site Settings</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Domain produksi, WhatsApp &amp; email, SEO, published / maintenance, draft→live, dan backup &amp; restore.
          </p>
          <span className="mt-4 inline-block text-sm font-semibold text-cyan-200 group-hover:underline">
            Buka Site Settings →
          </span>
        </Link>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/"
            className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg backdrop-blur-md transition hover:border-sky-400/35 hover:bg-white/[0.07]"
          >
            <h2 className="text-base font-semibold text-white">Beranda</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Edit mode: teks/gambar inline, urutan section, media library — tombol mengambang.
            </p>
            <span className="mt-3 inline-block text-xs font-medium text-sky-300 group-hover:underline">
              Buka beranda →
            </span>
          </Link>

          <Link
            href="/gallery-project"
            className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg backdrop-blur-md transition hover:border-sky-400/35 hover:bg-white/[0.07]"
          >
            <h2 className="text-base font-semibold text-white">Gallery proyek</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Tambah, edit, hapus proyek, unggah video/galeri.
            </p>
            <span className="mt-3 inline-block text-xs font-medium text-sky-300 group-hover:underline">
              Buka gallery →
            </span>
          </Link>

          <Link
            href="/gallery-project/tambah"
            className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg backdrop-blur-md transition hover:border-sky-400/35 hover:bg-white/[0.07]"
          >
            <h2 className="text-base font-semibold text-white">Tambah proyek</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Form baru; folder media dibuat saat unggah dari panel gallery.
            </p>
            <span className="mt-3 inline-block text-xs font-medium text-sky-300 group-hover:underline">
              Form baru →
            </span>
          </Link>

          {SHOW_DEVICE_BIND_CARD ? (
            <Link
              href="/site-admin/bind"
              className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg backdrop-blur-md transition hover:border-amber-400/35 hover:bg-white/[0.07]"
            >
              <h2 className="text-base font-semibold text-white">Perangkat baru</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Pasangkan cookie perangkat jika mengganti laptop atau browser.
              </p>
              <span className="mt-3 inline-block text-xs font-medium text-amber-200 group-hover:underline">
                Bind ulang →
              </span>
            </Link>
          ) : null}
        </div>
      </div>
    </main>
  );
}
