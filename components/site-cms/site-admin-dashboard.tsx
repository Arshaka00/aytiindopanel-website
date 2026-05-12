"use client";

import Link from "next/link";

import { SiteAdminDeploymentCard } from "@/components/site-cms/site-admin-deployment-card";

const SHOW_DEVICE_BIND_CARD = false;

/** Kartu pintasan Konten & galeri — tinggi kolom seragam, CTA di bawah. */
const contentShortcutCardClass =
  "group flex h-full min-h-[10.5rem] flex-col rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 shadow-sm backdrop-blur-md transition duration-200 hover:border-sky-400/35 hover:bg-white/[0.055] hover:shadow-[0_12px_40px_-28px_rgba(56,189,248,0.22)] md:p-5";

const contentShortcutCtaClass =
  "mt-auto pt-4 text-xs font-semibold text-sky-300/95 group-hover:underline decoration-sky-400/50 underline-offset-2";

export function SiteAdminDashboard() {
  return (
    <main className="min-h-[85vh] bg-[radial-gradient(115%_80%_at_50%_-12%,rgba(56,189,248,0.08),transparent_55%),linear-gradient(180deg,#020617,#0f172a)] px-4 py-12 text-slate-100 sm:px-5 md:py-14">
      <div className="mx-auto max-w-4xl space-y-9 md:space-y-11">
        <header className="space-y-3 text-center md:space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300/85">Internal</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Panel CMS</h1>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-slate-400">
            <span className="text-slate-300">Deployment</span> untuk marker build (mode sederhana bila{" "}
            <code className="rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-[11px] text-slate-300">
              CMS_ENABLE_GLOBAL_PUBLISH=false
            </code>
            , atau alur publish global penuh bila diaktifkan). <span className="text-slate-300">Site Settings</span> untuk
            domain, SEO, kontak, backup, dan utilitas lanjutan.
          </p>
        </header>

        <section aria-labelledby="ops-deployment-heading" className="space-y-3 md:space-y-4">
          <div className="flex flex-col gap-1 border-b border-white/[0.06] pb-3 px-0.5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="ops-deployment-heading" className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-200/85">
                Deployment
              </h2>
              <p className="mt-1 text-xs text-slate-500">Ringkasan build — konfigurasi situs ada di Site Settings.</p>
            </div>
          </div>
          <SiteAdminDeploymentCard />
        </section>

        <section aria-labelledby="config-shortcuts-heading" className="space-y-4 md:space-y-5">
          <h2 id="config-shortcuts-heading" className="sr-only">
            Pintasan konfigurasi dan alat
          </h2>
          <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-4 lg:gap-5">
            <Link
              href="/site-admin/visitor-analytics"
              className="group flex h-full flex-col rounded-2xl border border-indigo-400/24 bg-gradient-to-br from-indigo-500/10 to-slate-950/55 p-5 shadow-sm backdrop-blur-md transition duration-300 hover:border-indigo-400/38 hover:from-indigo-500/14 md:p-6"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-300/88">Analytics</p>
              <h3 className="mt-2 text-base font-semibold text-white md:text-lg">Visitor Analytics</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
                Kunjungan, halaman, perangkat, klik WhatsApp — ringkas, penyimpanan internal.
              </p>
              <span className="mt-4 text-xs font-semibold text-indigo-200/95 group-hover:underline">Buka dashboard →</span>
            </Link>

            <Link
              href="/site-admin/site-settings#site-configuration"
              className="group flex h-full flex-col rounded-2xl border border-cyan-400/24 bg-gradient-to-br from-cyan-500/08 to-slate-950/55 p-5 shadow-sm backdrop-blur-md transition duration-300 hover:border-cyan-400/38 hover:from-cyan-500/12 md:p-6"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300/88">System configuration</p>
              <h3 className="mt-2 text-base font-semibold text-white md:text-lg">Site Settings</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
                Domain &amp; URL, WhatsApp &amp; email, SEO, mode tayang, backup &amp; restore. Utilitas salin draft→live
                manual (Advanced) hanya ditampilkan bila publish global diaktifkan di environment.
              </p>
              <span className="mt-4 text-xs font-semibold text-cyan-200/95 group-hover:underline">Buka konfigurasi →</span>
            </Link>
          </div>
        </section>

        <section aria-labelledby="content-shortcuts-heading" className="space-y-3 md:space-y-4">
          <div className="flex flex-col gap-1 border-b border-white/[0.06] pb-3 px-0.5">
            <h2 id="content-shortcuts-heading" className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Konten &amp; galeri
            </h2>
            <p className="text-xs leading-relaxed text-slate-600">
              Pintasan ke beranda situs dan gallery. Form tambah membutuhkan sesi admin.
            </p>
          </div>
          <div className="grid auto-rows-fr gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
            <Link href="/" className={contentShortcutCardClass}>
              <h3 className="text-base font-semibold tracking-tight text-white">Beranda</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
                Edit inline, urutan section, dan media lewat tombol mengambang.
              </p>
              <p className="mt-2 text-[13px] leading-snug text-slate-500">
                Toolbar CMS hanya jika perangkat/session eligible — tanpa itu, tampilan beranda normal untuk pengunjung.
              </p>
              <span className={contentShortcutCtaClass}>Buka beranda →</span>
            </Link>

            <Link href="/gallery-project" className={contentShortcutCardClass}>
              <h3 className="text-base font-semibold tracking-tight text-white">Gallery proyek</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
                Kelola proyek, video, strip galeri, dan visibilitas di daftar.
              </p>
              <span className={contentShortcutCtaClass}>Buka gallery →</span>
            </Link>

            <Link href="/gallery-project/tambah" className={contentShortcutCardClass}>
              <h3 className="text-base font-semibold tracking-tight text-white">Tambah proyek</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
                Form admin: simpan ke server, unggah ke subfolder per ID di{" "}
                <code className="rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-[11px] text-slate-300">
                  public/images/gallery/projects/
                </code>
              </p>
              <p className="mt-2 text-[13px] leading-snug text-slate-500">
                Path manual ke{" "}
                <code className="rounded bg-white/[0.06] px-1 font-mono text-[11px] text-slate-400">/images/gallery/</code>{" "}
                tetap didukung.
              </p>
              <span className={contentShortcutCtaClass}>Form baru →</span>
            </Link>

            {SHOW_DEVICE_BIND_CARD ? (
              <Link
                href="/site-admin/bind"
                className="group flex h-full min-h-[10.5rem] flex-col rounded-2xl border border-amber-400/20 bg-white/[0.035] p-5 shadow-sm backdrop-blur-md transition hover:border-amber-400/40 hover:bg-white/[0.055]"
              >
                <h3 className="text-base font-semibold tracking-tight text-white">Perangkat baru</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">Bind cookie perangkat admin.</p>
                <span className="mt-auto pt-4 text-xs font-semibold text-amber-200/95 group-hover:underline">
                  Bind ulang →
                </span>
              </Link>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
