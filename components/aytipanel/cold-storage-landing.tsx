import {
  COLD_STORAGE_LEAD_SOURCE,
  WHATSAPP_COLD_STORAGE_PREFILL_MESSAGE,
} from "@/components/aytipanel/constants";
import { ScrollRevealSection } from "@/components/aytipanel/scroll-reveal-section";
import { SiteFooter } from "@/components/aytipanel/site-footer";
import { SiteCopyrightImagePreview } from "@/components/aytipanel/site-copyright-image-preview";
import {
  IconManufacturing,
  IconProcessConsult,
  IconProcessInstall,
  IconProcessSurvey,
  IconWhatsApp,
} from "@/components/aytipanel/icons";
import { WhatsAppCTAButton } from "@/components/aytipanel/whatsapp-cta-button";
import { mergeAytiCardClass, mergeAytiCtaClass, mergeAytiTitleClass } from "@/lib/ayti-icon-cold";

const coldStorageWa = {
  message: WHATSAPP_COLD_STORAGE_PREFILL_MESSAGE,
  dataSource: COLD_STORAGE_LEAD_SOURCE,
} as const;

const COLD_STORAGE_IMG_ALT = "cold storage project tangerang";

const cardPremium = mergeAytiCardClass(
  "rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] backdrop-blur-[2px] transition-all duration-300 ease-out motion-safe:hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]",
);

const faqCard = mergeAytiCardClass(
  "rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-colors hover:border-accent/30",
);

const PROCESS_STEPS = [
  { title: "Konsultasi", Icon: IconProcessConsult },
  { title: "Survey", Icon: IconProcessSurvey },
  { title: "Produksi", Icon: IconManufacturing },
  { title: "Instalasi", Icon: IconProcessInstall },
] as const;

const PORTFOLIO_DUMMY = [
  {
    name: "Cold room distribusi protein",
    location: "Jakarta",
    workType: "Chiller, panel PU, instalasi mesin dingin",
    description:
      "Zona suhu untuk stok harian dengan buka-tutup pintu ramai. Fokus: stabilitas suhu dan efisiensi muat barang.",
    outcome: "Hasil yang dituju: stok harian lebih konsisten aman dan keluhan suhu dari QC berkurang.",
  },
  {
    name: "Blast freezer komoditas",
    location: "Jawa Barat",
    workType: "Ruangan freezer, envelope dingin, uji dingin",
    description:
      "Kebutuhan pembekuan cepat dengan target core temperature. Fokus: ketahanan isolasi dan downtime minim.",
    outcome: "Hasil yang dituju: pembekuan lebih merata sehingga reject akibat suhu tidak optimal turun.",
  },
  {
    name: "Multi-zone hub logistik",
    location: "Nasional",
    workType: "Chiller + freezer, integrasi area dock",
    description:
      "Beberapa suhu dalam satu hub agar satu lokasi melayani banyak SKU. Fokus: alur truk dan pemisahan zona.",
    outcome: "Hasil yang dituju: satu lokasi melayani banyak jenis barang tanpa saling ganggu suhu antar zona.",
  },
] as const;

const FAQ_ITEMS = [
  {
    q: "Berapa lama pengerjaan?",
    a: "Bergantung luas dan tingkat kerumitan. Setelah survei, kami kirim gambaran jadwal yang bisa diikat di kontrak.",
  },
  {
    q: "Bisa custom?",
    a: "Ya. Ukuran ruang, suhu target, pintu, dan pola operasi Anda menjadi acuan desain.",
  },
  {
    q: "Area layanan?",
    a: "Nasional — banyak proyek di Tangerang dan Jabodetabek; tim bisa mobil ke kota lain sesuai jadwal cold storage Anda.",
  },
] as const;

export function ColdStorageLanding({ footerSeoText = "" }: { footerSeoText?: string }) {
  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <main>
        <section
          className="relative flex min-h-[500px] scroll-mt-24 items-center overflow-hidden border-b border-border bg-background px-6 py-24"
          aria-labelledby="cold-hero-heading"
        >
          <SiteCopyrightImagePreview
            fill
            src="/images/cold-storage.jpg"
            alt={COLD_STORAGE_IMG_ALT}
            priority
            sizes="100vw"
            buttonClassName="absolute inset-0 z-[1] block h-full min-h-[500px] w-full md:min-h-full"
            imageClassName="object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--hero-from)] to-[var(--hero-to)] opacity-[0.82]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/40 to-black/10"
            aria-hidden
          />
          <div className="relative z-10 mx-auto w-full max-w-6xl">
            <div className="max-w-2xl space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
                PT AYTI INDO PANEL — Jasa cold storage, panel &amp; refrigerasi
              </p>
              <h1
                id="cold-hero-heading"
                className="text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl lg:text-[2.5rem]"
              >
                Jasa Pembuatan Cold Storage Chiller &amp; Freezer
              </h1>
              <p className="text-xl font-semibold leading-snug text-white/92 md:text-2xl md:leading-snug">
                Stok lebih aman dengan ruang dingin yang stabil dan siap operasi — dari panel hingga sistem refrigerasi.
              </p>
              <p className="text-lg leading-relaxed text-white/88">
                Kurangi risiko rusak dan biaya boros. Kami bangunkan cold storage lengkap untuk industri: bangunan
                insulated, pemasangan panel, dan penyelarasan mesin pendingin agar operasi Anda berjalan tenang.
              </p>
              <p className="text-base leading-relaxed text-white/82">
                Cocok untuk bisnis yang membutuhkan stabilitas suhu tanpa risiko kerusakan produk.
              </p>
              <ul className="space-y-2 border-l-2 border-white/35 pl-4 text-sm leading-snug text-white/85 sm:text-[0.9375rem]" role="list">
                <li className="flex gap-2">
                  <span className="text-emerald-300" aria-hidden>
                    ✓
                  </span>
                  <span>Pengalaman menangani proyek ruang dingin skala usaha</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-300" aria-hidden>
                    ✓
                  </span>
                  <span>Satu arah kerja: bangunan dingin + mesin pendingin</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-300" aria-hidden>
                    ✓
                  </span>
                  <span>Tanya jawab awal cepat lewat WhatsApp</span>
                </li>
              </ul>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <WhatsAppCTAButton
                  className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/85 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-[2px] transition-all duration-200 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  ariaLabel="Konsultasi proyek cold storage via WhatsApp"
                  message={coldStorageWa.message}
                  dataSource={coldStorageWa.dataSource}
                >
                  <IconWhatsApp className="h-4 w-4 shrink-0 opacity-95" aria-hidden />
                  Konsultasi Proyek Sekarang
                </WhatsAppCTAButton>
                <a
                  href="#solusi-cold"
                  className={mergeAytiCtaClass(
                    "rounded-md px-1.5 py-0.5 text-sm font-semibold text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline",
                  )}
                >
                  Lihat solusi
                </a>
              </div>
              <p className="text-xs font-medium tracking-wide text-white/65">
                Respon cepat • Konsultasi gratis • Tanpa komitmen
              </p>
            </div>
          </div>
        </section>

        <ScrollRevealSection>
        <section
          className="border-t border-b border-border bg-muted-bg px-6 py-20"
          aria-labelledby="cold-masalah-heading"
        >
          <div className="mx-auto max-w-6xl space-y-6">
            <header className="max-w-3xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Mengapa ini penting
              </p>
              <h2
                id="cold-masalah-heading"
                className="text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl"
              >
                Masalah
              </h2>
              <p className="text-lg leading-relaxed text-muted">
                Pada cold storage yang kurang pas, suhu, layout panel, atau sistem refrigerasi mudah tidak selaras
                dengan cara Anda beroperasi — dan tim Anda sering menanggung dampaknya setiap hari.
              </p>
            </header>
            <ul className="grid gap-6 pt-6 md:grid-cols-3" role="list">
              {[
                {
                  title: "Suhu tidak stabil",
                  body: "Produk cepat rusak, reject QC naik, retur dari pelanggan atau mitra. Kerugian operasional menumpuk dari stok yang tidak layak jual.",
                },
                {
                  title: "Penyimpanan tidak efisien",
                  body: "Putaran barang lambat, slot kosong terbuang, overtime tim gudang. Biaya per meter kubik stok terasa mahal tanpa hasil.",
                },
                {
                  title: "Mesin dingin boros",
                  body: "Tagihan listrik membengkak tapi ruangan cold storage tetap “tidak nyaman dingin”. Budget bulanan tersedot untuk refrigerasi yang seharusnya bisa lebih terukur.",
                },
              ].map((item) => (
                <li key={item.title} className={cardPremium}>
                  <h3 className="text-lg font-semibold leading-snug text-foreground">{item.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-muted">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
        </ScrollRevealSection>

        <ScrollRevealSection>
        <section
          id="solusi-cold"
          className="scroll-mt-24 border-t border-b border-border bg-background px-6 py-20"
          aria-labelledby="cold-solusi-heading"
        >
          <div className="mx-auto max-w-6xl space-y-6">
            <header className="max-w-3xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Solusi kami
              </p>
              <h2
                id="cold-solusi-heading"
                className="text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl"
              >
                Solusi
              </h2>
              <p className="text-lg leading-relaxed text-muted">
                Hasil akhir yang biasanya dicari setelah cold storage selesai — dengan panel dan refrigerasi yang saling
                mendukung.
              </p>
            </header>
            <div className={`${cardPremium} max-w-3xl pt-8`}>
              <ul className="space-y-4 text-base leading-relaxed text-foreground" role="list">
                <li className="flex gap-3">
                  <span className="mt-0.5 shrink-0 font-semibold text-accent" aria-hidden>
                    •
                  </span>
                  <span className="text-muted">
                    <strong className="font-semibold text-foreground">Produk lebih terlindungi</strong>
                    {" — "}suhu tidak “naik-turun” seenaknya; risiko rusak, retur, dan komplain dari mitra berkurang.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 shrink-0 font-semibold text-accent" aria-hidden>
                    •
                  </span>
                  <span className="text-muted">
                    <strong className="font-semibold text-foreground">Operasi gudang lebih lancar</strong>
                    {" — "}alur muat dan zonasi ruang mendukung ritme harian; waktu tunggu dan salah tempat turun.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 shrink-0 font-semibold text-accent" aria-hidden>
                    •
                  </span>
                  <span className="text-muted">
                    <strong className="font-semibold text-foreground">Biaya refrigerasi lebih terkendali</strong>
                    {" — "}kapasitas mesin dan envelope panel saling pas; pemborosan listrik karena “dipaksa dingin” bisa
                    ditekan.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        </ScrollRevealSection>

        <ScrollRevealSection>
        <section
          className="border-t border-b border-border bg-accent-soft px-6 py-20"
          aria-labelledby="cold-keunggulan-heading"
        >
          <div className="mx-auto max-w-6xl space-y-6">
            <header className="max-w-3xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Mengapa PT AYTI INDO PANEL
              </p>
              <h2
                id="cold-keunggulan-heading"
                className="text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl"
              >
                Keunggulan
              </h2>
              <p className="text-lg leading-relaxed text-muted">
                Ringkas dan cocok untuk tim yang sibuk — termasuk pengerjaan cold storage di kawasan Tangerang dan
                Jabodetabek.
              </p>
            </header>
            <div className={`${cardPremium} !p-8 sm:!p-10`}>
              <ul className="grid gap-4 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-5" role="list">
                {[
                  "Custom mengikuti kebutuhan operasi cold storage Anda",
                  "Instalasi panel dan mesin rapi oleh tim lapangan berpengalaman",
                  "Material dan cara kerja mengikuti kesepakatan proyek",
                  "Satu jalur komunikasi sampai ruangan refrigerasi dipakai",
                ].map((text) => (
                  <li
                    key={text}
                    className="flex items-start gap-3 text-base font-semibold leading-snug text-foreground"
                  >
                    <span className="mt-0.5 shrink-0 text-accent" aria-hidden>
                      ✔
                    </span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        </ScrollRevealSection>

        <ScrollRevealSection>
        <section
          className="border-t border-b border-border bg-background px-6 py-20"
          aria-labelledby="cold-portfolio-heading"
        >
          <div className="mx-auto max-w-6xl space-y-6">
            <header className="max-w-3xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Portfolio
              </p>
              <h2
                id="cold-portfolio-heading"
                className="text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl"
              >
                Contoh bentuk pekerjaan (ilustrasi)
              </h2>
              <p className="text-lg leading-relaxed text-muted">
                Contoh skenario cold storage (ilustrasi). Detail nyata menyesuaikan lokasi — termasuk kebutuhan panel dan
                sistem refrigerasi Anda.
              </p>
            </header>
            <div className="grid gap-6 pt-6 md:grid-cols-3">
              {PORTFOLIO_DUMMY.map((project) => (
                <article
                  key={project.name}
                  className={mergeAytiCardClass(
                    "overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] backdrop-blur-[2px] transition-all duration-300 ease-out motion-safe:hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]",
                  )}
                >
                  <div className="relative aspect-[4/3] bg-muted-bg-strong">
                    <SiteCopyrightImagePreview
                      fill
                      src="/images/cold-storage.jpg"
                      alt={COLD_STORAGE_IMG_ALT}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      buttonClassName="absolute inset-0 block size-full"
                      imageClassName="object-cover"
                    />
                  </div>
                  <div className="space-y-4 p-6">
                    <h3 className="text-base font-semibold leading-snug text-foreground">{project.name}</h3>
                    <p className="text-base leading-relaxed text-muted">{project.description}</p>
                    <p className="text-sm font-semibold leading-snug text-foreground">{project.outcome}</p>
                    <dl className="space-y-3 border-t border-border pt-4 text-sm leading-relaxed">
                      <div>
                        <dt className="font-semibold uppercase tracking-wide text-muted">Lokasi</dt>
                        <dd className="mt-1 text-foreground">{project.location}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold uppercase tracking-wide text-muted">Ruang lingkup</dt>
                        <dd className="mt-1 text-muted">{project.workType}</dd>
                      </div>
                    </dl>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        </ScrollRevealSection>

        <ScrollRevealSection>
        <section
          className="border-t border-b border-border bg-muted-bg px-6 py-14"
          aria-label="Pengingat konsultasi WhatsApp"
        >
          <div
            className={mergeAytiCardClass(
              "mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 rounded-2xl border border-border bg-card px-6 py-8 shadow-[var(--shadow-card)] sm:flex-row sm:px-10",
            )}
          >
            <div className="max-w-xl space-y-3 text-center sm:text-left">
              <p className="text-base font-semibold leading-snug text-foreground">
                Masih ragu menentukan sistem cold storage yang tepat?
              </p>
              <p className="text-base leading-relaxed text-muted">
                Kirim perkiraan luas atau gambar layout — arah sistem dan perkiraan langkah kerja bisa dibahas tanpa
                komitmen dulu.
              </p>
            </div>
            <WhatsAppCTAButton
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 motion-safe:hover:scale-[1.02]"
              ariaLabel="Chat WhatsApp untuk kebutuhan cold storage"
              message={coldStorageWa.message}
              dataSource={coldStorageWa.dataSource}
            >
              <IconWhatsApp className="h-4 w-4 shrink-0 opacity-95" aria-hidden />
              Chat WhatsApp
            </WhatsAppCTAButton>
          </div>
        </section>

        </ScrollRevealSection>

        <ScrollRevealSection>
        <section
          className="border-t border-b border-border bg-background px-6 py-20"
          aria-labelledby="cold-proses-heading"
        >
          <div className="mx-auto max-w-6xl space-y-6">
            <header className="mx-auto max-w-3xl space-y-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Proses
              </p>
              <h2
                id="cold-proses-heading"
                className="text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl"
              >
                Empat langkah hingga ruang dingin dipakai
              </h2>
            </header>
            <ol className="grid grid-cols-1 gap-8 pt-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {PROCESS_STEPS.map((step, index) => {
                const Icon = step.Icon;
                return (
                  <li key={step.title} className="flex flex-col items-center text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-card text-accent shadow-[var(--shadow-card)] ring-1 ring-border/80">
                      <Icon className="h-5 w-5 shrink-0" aria-hidden />
                    </span>
                    <p className="mt-1 text-xs font-semibold text-muted">Langkah {index + 1}</p>
                    <p className="mt-2 text-base font-semibold text-foreground">{step.title}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        </ScrollRevealSection>

        <ScrollRevealSection>
        <section
          className="border-t border-b border-border bg-muted-bg px-6 py-20"
          aria-labelledby="cold-faq-heading"
        >
          <div className="mx-auto max-w-3xl space-y-8">
            <header className="space-y-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                FAQ
              </p>
              <h2
                id="cold-faq-heading"
                className="text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl"
              >
                Agar Anda lebih yakin melangkah
              </h2>
            </header>
            <div className="space-y-4">
              {FAQ_ITEMS.map((item) => (
                <details key={item.q} className={`group ${faqCard}`}>
                  <summary
                    className={mergeAytiTitleClass(
                      "flex cursor-pointer list-none items-start justify-between gap-4 font-semibold leading-snug text-foreground marker:hidden [&::-webkit-details-marker]:hidden",
                    )}
                  >
                    <span>{item.q}</span>
                    <span className="mt-0.5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180">
                      ▾
                    </span>
                  </summary>
                  <p className="mt-4 border-t border-border pt-4 text-base leading-relaxed text-muted">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        </ScrollRevealSection>

        <ScrollRevealSection>
        <section
          className="border-t border-b border-border bg-background px-6 py-20"
          aria-label="Konsultasi cold storage"
        >
          <div className="mx-auto max-w-6xl rounded-2xl bg-gradient-to-r from-primary to-accent px-8 py-16 text-white shadow-[var(--shadow-cta)] md:px-14 md:py-20">
            <div className="flex flex-col items-center justify-between gap-10 text-center lg:flex-row lg:items-center lg:text-left">
              <div className="max-w-xl space-y-4 lg:pr-8">
                <h2 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-[2.35rem]">
                  Konsultasikan Kebutuhan Cold Storage Anda Sekarang
                </h2>
                <p className="text-lg leading-relaxed text-white/82">
                  Tanpa komitmen, cukup diskusi kebutuhan proyek Anda.
                </p>
                <p className="text-sm font-medium text-white/70">
                  Respon cepat • Konsultasi gratis • Tanpa komitmen
                </p>
              </div>
              <WhatsAppCTAButton
                className="inline-flex w-full min-w-[min(100%,280px)] shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-12 py-5 text-lg font-semibold text-brand-contrast shadow-[0_10px_40px_rgba(0,0,0,0.18)] transition-all duration-200 hover:opacity-95 motion-safe:hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:w-auto"
                ariaLabel="Chat WhatsApp konsultasi cold storage"
                message={coldStorageWa.message}
                dataSource={coldStorageWa.dataSource}
              >
                <IconWhatsApp className="h-7 w-7 shrink-0 text-[#25D366]" aria-hidden />
                Chat WhatsApp
              </WhatsAppCTAButton>
            </div>
          </div>
        </section>
        </ScrollRevealSection>
      </main>
      <SiteFooter footerSeoText={footerSeoText} whatsappFunnel={coldStorageWa} />
    </div>
  );
}
