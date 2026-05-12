"use client";

import Link from "next/link";

const SHOW_DEVICE_BIND_CARD = false;

type PrimaryTone = "violet" | "indigo" | "cyan" | "emerald";

const primaryToneStyles: Record<
  PrimaryTone,
  { border: string; hoverBorder: string; gradient: string; hoverGradient: string; kicker: string; cta: string }
> = {
  violet: {
    border: "border-violet-400/30",
    hoverBorder: "hover:border-violet-300/50",
    gradient: "from-violet-500/12 to-slate-900/55",
    hoverGradient: "hover:from-violet-500/20",
    kicker: "text-violet-300/95",
    cta: "text-violet-200",
  },
  indigo: {
    border: "border-indigo-400/30",
    hoverBorder: "hover:border-indigo-300/50",
    gradient: "from-indigo-500/12 to-slate-900/55",
    hoverGradient: "hover:from-indigo-500/20",
    kicker: "text-indigo-300/95",
    cta: "text-indigo-200",
  },
  cyan: {
    border: "border-cyan-400/30",
    hoverBorder: "hover:border-cyan-300/50",
    gradient: "from-cyan-500/12 to-slate-900/55",
    hoverGradient: "hover:from-cyan-500/20",
    kicker: "text-cyan-300/95",
    cta: "text-cyan-200",
  },
  emerald: {
    border: "border-emerald-400/30",
    hoverBorder: "hover:border-emerald-300/50",
    gradient: "from-emerald-500/12 to-slate-900/55",
    hoverGradient: "hover:from-emerald-500/20",
    kicker: "text-emerald-300/95",
    cta: "text-emerald-200",
  },
};

const primaryLinks: {
  href: string;
  tone: PrimaryTone;
  kicker: string;
  title: string;
  description: string;
  cta: string;
}[] = [
  {
    href: "/site-admin/deployment",
    tone: "violet",
    kicker: "Deploy",
    title: "Deployment",
    description: "Commit build, lingkungan Vercel, status tayang konten, dan tautan ke dashboard / deployment.",
    cta: "Buka ringkasan deployment",
  },
  {
    href: "/site-admin/visitor-analytics",
    tone: "indigo",
    kicker: "Analytics",
    title: "Visitor Analytics",
    description:
      "Traffic ringan: kunjungan, halaman populer, kota, perangkat, klik WhatsApp — penyimpanan JSONL internal.",
    cta: "Buka dashboard",
  },
  {
    href: "/site-admin/site-settings",
    tone: "cyan",
    kicker: "Utama",
    title: "Site Settings",
    description:
      "Domain, kontak, meta default beranda, organisasi/schema & footer, indexing, draft→live, backup — tanpa editor /artikel.",
    cta: "Buka Site Settings",
  },
  {
    href: "/site-admin/seo-articles",
    tone: "emerald",
    kicker: "Artikel",
    title: "Editor artikel /artikel",
    description:
      "Judul, slug, Markdown, FAQ, taut terkait — file `data/seo-articles/live.json`. Khusus URL /artikel; beda jalur dengan Site Settings.",
    cta: "Buka editor artikel",
  },
];

const secondaryLinks: { href: string; title: string; description: string; cta: string }[] = [
  {
    href: "/",
    title: "Beranda",
    description: "Edit mode: teks/gambar inline, urutan section, media library — tombol mengambang.",
    cta: "Buka beranda",
  },
  {
    href: "/gallery-project",
    title: "Gallery proyek",
    description: "Tambah, edit, hapus proyek, unggah video/galeri.",
    cta: "Buka gallery",
  },
  {
    href: "/gallery-project/tambah",
    title: "Tambah proyek",
    description: "Form baru; folder media dibuat saat unggah dari panel gallery.",
    cta: "Form baru",
  },
];

const cardBase =
  "group flex h-full flex-col rounded-2xl border bg-white/[0.03] p-5 shadow-lg backdrop-blur-md transition duration-200 md:p-6";

export function SiteAdminDashboard() {
  return (
    <main className="min-h-[85vh] bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(56,189,248,0.12),transparent_50%),linear-gradient(180deg,#020617,#0f172a)] px-4 py-10 text-slate-100 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <header className="border-b border-white/10 pb-8 text-center sm:pb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/25 bg-sky-500/10 px-3 py-1">
            <span className="size-1.5 shrink-0 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" aria-hidden />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-200/95">Internal</span>
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Panel CMS</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-[15px]">
            <span className="text-slate-300">Site Settings</span> mengatur situs global;{" "}
            <span className="text-slate-300">Editor artikel /artikel</span> mengisi halaman{" "}
            <code className="rounded bg-white/10 px-1 py-px text-[12px] text-sky-200/90">/artikel</code> saja. Di bawah:
            deploy, analytics, Site Settings + editor itu, lalu konten beranda/galeri.
          </p>
        </header>

        <section className="mt-10 sm:mt-12">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Infrastruktur &amp; konfigurasi</h2>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-500">
            Dua kartu pertama: build &amp; trafik. Dua kartu berikutnya saling terpisah —{" "}
            <span className="text-slate-400">Site Settings</span> (meta beranda, domain, draft→live) dan{" "}
            <span className="text-slate-400">Editor artikel /artikel</span> (file{" "}
            <code className="text-slate-400">data/seo-articles/live.json</code>).
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {primaryLinks.map((item) => {
              const t = primaryToneStyles[item.tone];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${cardBase} ${t.border} ${t.hoverBorder} bg-gradient-to-br ${t.gradient} ${t.hoverGradient} hover:bg-white/[0.05]`}
                >
                  <p className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${t.kicker}`}>{item.kicker}</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-300/95">{item.description}</p>
                  <span className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold ${t.cta} group-hover:gap-2`}>
                    {item.cta}
                    <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-10 sm:mt-12">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Konten situs</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {secondaryLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${cardBase} border-white/10 hover:border-sky-400/35 hover:bg-white/[0.06]`}
              >
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{item.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-sky-300 group-hover:gap-1.5 group-hover:underline">
                  {item.cta}
                  <span aria-hidden>→</span>
                </span>
              </Link>
            ))}

            {SHOW_DEVICE_BIND_CARD ? (
              <Link
                href="/site-admin/bind"
                className={`${cardBase} border-white/10 hover:border-amber-400/40 hover:bg-white/[0.06]`}
              >
                <h3 className="text-base font-semibold text-white">Perangkat baru</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
                  Pasangkan cookie perangkat jika mengganti laptop atau browser.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-amber-200 group-hover:underline">
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
