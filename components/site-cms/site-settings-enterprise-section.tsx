"use client";

import type { SiteContent, SitePageSeoEntry, SitePageSeoKey } from "@/lib/site-content-model";

const subDivider =
  "my-5 h-px w-full rounded-full bg-gradient-to-r from-transparent via-white/14 to-transparent";

type Props = {
  settings: SiteContent["siteSettings"];
  update: (patch: Partial<SiteContent["siteSettings"]>) => void;
  gateHeaders: Record<string, string>;
};

function FieldLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{children}</label>
      {hint ? <p className="text-[11px] leading-snug text-slate-500">{hint}</p> : null}
    </div>
  );
}

const PAGE_SEO_LABELS: { key: SitePageSeoKey; label: string; path: string }[] = [
  { key: "home", label: "Beranda", path: "/" },
  { key: "about", label: "Tentang", path: "/tentang" },
  { key: "produk", label: "Produk", path: "/produk" },
  { key: "coldStorage", label: "Cold storage", path: "/cold-storage" },
  { key: "gallery", label: "Gallery", path: "/gallery-project" },
  { key: "process", label: "Proses (default)", path: "/proses/*" },
];

export function SiteSettingsEnterpriseSection({ settings, update, gateHeaders }: Props) {
  const ba = settings.brandAssets;
  const an = settings.analytics;
  const sc = settings.seoControl;
  const imgSeo = settings.imageSeo;
  const loc = settings.localSeo;
  const perf = settings.performanceMode;

  const exportJson = async () => {
    const r = await fetch("/api/site-settings/export", { credentials: "include", headers: gateHeaders });
    if (!r.ok) return;
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `site-settings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text) as unknown;
        const r = await fetch("/api/site-settings/import", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...gateHeaders,
          },
          body: JSON.stringify(parsed),
        });
        if (r.ok) window.location.reload();
      } catch {
        /* invalid json */
      }
    };
    input.click();
  };

  const patchPageSeo = (key: SitePageSeoKey, patch: Partial<SitePageSeoEntry>) => {
    const prev = settings.pageSeo[key] ?? {};
    update({
      pageSeo: {
        ...settings.pageSeo,
        [key]: { ...prev, ...patch },
      },
    });
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg backdrop-blur-md">
      <h2 className="text-base font-semibold text-white">Enterprise — brand, SEO lanjutan &amp; integrasi</h2>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">
        Path gambar lokal (mis.{" "}
        <span className="font-mono text-slate-300">/images/logo.svg</span>) atau URL HTTPS publik.
      </p>

      <div className={subDivider} />

      <h3 className="text-sm font-semibold text-sky-200/90">Brand assets</h3>
      <p className="mt-1 text-[11px] leading-snug text-slate-500">
        Logo header diatur di bagian <span className="text-slate-400">Identitas &amp; URL</span> (Site Settings).
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {(
          [
            ["favicon", "Favicon", ba.favicon],
            ["appleTouchIcon", "Apple touch icon", ba.appleTouchIcon],
            ["defaultOgImage", "Default Open Graph image", ba.defaultOgImage],
          ] as const
        ).map(([key, label, val]) => (
          <div key={key} className="sm:col-span-2">
            <FieldLabel>{label}</FieldLabel>
            <input
              type="text"
              value={val}
              onChange={(e) =>
                update({
                  brandAssets: { ...ba, [key]: e.target.value },
                })
              }
              className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 font-mono text-xs text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
              placeholder="https://… atau /images/…"
            />
          </div>
        ))}
      </div>

      <div className={subDivider} />

      <h3 className="text-sm font-semibold text-sky-200/90">Analytics &amp; verifikasi</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Google Tag Manager (container ID)</FieldLabel>
          <input
            type="text"
            value={an.googleTagManagerId}
            onChange={(e) => update({ analytics: { ...an, googleTagManagerId: e.target.value } })}
            className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 font-mono text-xs text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
            placeholder="GTM-XXXX"
          />
        </div>
        <div>
          <FieldLabel>Google Analytics 4 (Measurement ID)</FieldLabel>
          <input
            type="text"
            value={an.googleAnalyticsId}
            onChange={(e) => update({ analytics: { ...an, googleAnalyticsId: e.target.value } })}
            className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 font-mono text-xs text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
            placeholder="G-XXXXXXXX"
          />
        </div>
        <div>
          <FieldLabel>Meta Pixel ID</FieldLabel>
          <input
            type="text"
            value={an.metaPixelId}
            onChange={(e) => update({ analytics: { ...an, metaPixelId: e.target.value } })}
            className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 font-mono text-xs text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
          />
        </div>
        <div>
          <FieldLabel>Microsoft Clarity</FieldLabel>
          <input
            type="text"
            value={an.microsoftClarityId}
            onChange={(e) => update({ analytics: { ...an, microsoftClarityId: e.target.value } })}
            className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 font-mono text-xs text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
          />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel hint="Terpasang di metadata verification Google Search Console.">
            Google site verification
          </FieldLabel>
          <input
            type="text"
            value={an.googleSiteVerification}
            onChange={(e) => update({ analytics: { ...an, googleSiteVerification: e.target.value } })}
            className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 font-mono text-xs text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
          />
        </div>
      </div>

      <div className={subDivider} />

      <h3 className="text-sm font-semibold text-sky-200/90">Social (sinkron footer)</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {(
          [
            ["instagram", "Instagram"],
            ["linkedin", "LinkedIn"],
            ["youtube", "YouTube"],
            ["tiktok", "TikTok"],
            ["facebook", "Facebook"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className={key === "facebook" ? "sm:col-span-2" : undefined}>
            <FieldLabel>{label}</FieldLabel>
            <input
              type="text"
              value={settings.socialLinks[key]}
              onChange={(e) =>
                update({
                  socialLinks: { ...settings.socialLinks, [key]: e.target.value },
                })
              }
              className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
              placeholder="https://"
            />
          </div>
        ))}
      </div>

      <div className={subDivider} />

      <h3 className="text-sm font-semibold text-sky-200/90">Indexing &amp; staging</h3>
      <div className="mt-4 flex flex-wrap gap-6">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={sc.allowIndexing}
            onChange={(e) => update({ seoControl: { ...sc, allowIndexing: e.target.checked } })}
            className="size-4 rounded border-white/20 bg-slate-950"
          />
          Izinkan indeks (robots)
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={sc.stagingMode}
            onChange={(e) => update({ seoControl: { ...sc, stagingMode: e.target.checked } })}
            className="size-4 rounded border-white/20 bg-slate-950"
          />
          Mode staging (noindex global)
        </label>
      </div>

      <div className={subDivider} />

      <h3 className="text-sm font-semibold text-sky-200/90">Image SEO</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FieldLabel hint="Digunakan jika alt gambar kosong (helper server).">Prefiks alt default</FieldLabel>
          <input
            type="text"
            value={imgSeo.defaultAltPrefix}
            onChange={(e) => update({ imageSeo: { ...imgSeo, defaultAltPrefix: e.target.value } })}
            className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
          />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel hint="Fallback OG jika halaman tidak mengisi gambar.">Fallback OG image</FieldLabel>
          <input
            type="text"
            value={imgSeo.fallbackOgImage}
            onChange={(e) => update({ imageSeo: { ...imgSeo, fallbackOgImage: e.target.value } })}
            className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 font-mono text-xs text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
            placeholder="/images/og-default.webp"
          />
        </div>
      </div>

      <div className={subDivider} />

      <h3 className="text-sm font-semibold text-sky-200/90">Local SEO (schema)</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Latitude</FieldLabel>
          <input
            type="text"
            value={loc.latitude}
            onChange={(e) => update({ localSeo: { ...loc, latitude: e.target.value } })}
            className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 font-mono text-xs text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
          />
        </div>
        <div>
          <FieldLabel>Longitude</FieldLabel>
          <input
            type="text"
            value={loc.longitude}
            onChange={(e) => update({ localSeo: { ...loc, longitude: e.target.value } })}
            className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 font-mono text-xs text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
          />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel hint="Satu wilayah per baris.">Area served</FieldLabel>
          <textarea
            value={loc.areaServed.join("\n")}
            onChange={(e) =>
              update({
                localSeo: {
                  ...loc,
                  areaServed: e.target.value.split(/\r?\n/).map((s) => s.trim()).filter(Boolean),
                },
              })
            }
            rows={4}
            className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
          />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel hint="Ringkatan jam operasional (teks bebas untuk schema).">Opening hours</FieldLabel>
          <textarea
            value={loc.openingHours.join("\n")}
            onChange={(e) =>
              update({
                localSeo: {
                  ...loc,
                  openingHours: e.target.value.split(/\r?\n/).map((s) => s.trim()).filter(Boolean),
                },
              })
            }
            rows={3}
            className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
          />
        </div>
      </div>

      <div className={subDivider} />

      <h3 className="text-sm font-semibold text-sky-200/90">Performance darurat</h3>
      <div className="mt-4 flex flex-col gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={perf.lightweightMode}
            onChange={(e) => update({ performanceMode: { ...perf, lightweightMode: e.target.checked } })}
            className="size-4 rounded border-white/20 bg-slate-950"
          />
          Lightweight mode (data-attribute untuk tema / hero)
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={perf.disableHeavyAnimations}
            onChange={(e) =>
              update({ performanceMode: { ...perf, disableHeavyAnimations: e.target.checked } })
            }
            className="size-4 rounded border-white/20 bg-slate-950"
          />
          Kurangi animasi berat
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={perf.disableVideoBackground}
            onChange={(e) =>
              update({ performanceMode: { ...perf, disableVideoBackground: e.target.checked } })
            }
            className="size-4 rounded border-white/20 bg-slate-950"
          />
          Nonaktifkan video hero (flag)
        </label>
      </div>

      <div className={subDivider} />

      <h3 className="text-sm font-semibold text-sky-200/90">Redirect manager</h3>
      <p className="mt-1 text-[11px] text-slate-500">
        Path relatif → tujuan relatif atau URL absolut. Centang permanen untuk 308.
      </p>
      <div className="mt-3 space-y-3">
        {(settings.redirects.length ? settings.redirects : [{ from: "", to: "", permanent: true }]).map(
          (row, i) => {
            const rowsTemplate = settings.redirects.length
              ? [...settings.redirects]
              : [{ from: "", to: "", permanent: true }];
            return (
              <div
                key={`redirect-${i}`}
                className="grid gap-2 rounded-xl border border-white/10 bg-slate-950/40 p-3 sm:grid-cols-[1fr_1fr_auto_auto]"
              >
                <input
                  type="text"
                  value={row.from}
                  onChange={(e) => {
                    const next = [...rowsTemplate];
                    next[i] = { ...next[i], from: e.target.value };
                    update({ redirects: next });
                  }}
                  placeholder="/path-lama"
                  className="rounded-lg border border-white/15 bg-slate-950/60 px-2 py-2 font-mono text-xs text-white outline-none focus:border-sky-400/40"
                />
                <input
                  type="text"
                  value={row.to}
                  onChange={(e) => {
                    const next = [...rowsTemplate];
                    next[i] = { ...next[i], to: e.target.value };
                    update({ redirects: next });
                  }}
                  placeholder="/baru atau https://…"
                  className="rounded-lg border border-white/15 bg-slate-950/60 px-2 py-2 font-mono text-xs text-white outline-none focus:border-sky-400/40"
                />
                <label className="flex items-center gap-1 text-[11px] text-slate-400">
                  <input
                    type="checkbox"
                    checked={row.permanent}
                    onChange={(e) => {
                      const next = [...rowsTemplate];
                      next[i] = { ...next[i], permanent: e.target.checked };
                      update({ redirects: next });
                    }}
                    className="size-3.5"
                  />
                  301/308
                </label>
                <button
                  type="button"
                  className="rounded-lg border border-red-400/30 px-2 py-1 text-[11px] text-red-200 hover:bg-red-500/10"
                  onClick={() => {
                    const next = settings.redirects.filter((_, j) => j !== i);
                    update({ redirects: next });
                  }}
                >
                  Hapus
                </button>
              </div>
            );
          },
        )}
        <button
          type="button"
          className="rounded-lg border border-white/15 px-3 py-2 text-xs text-slate-200 hover:bg-white/10"
          onClick={() =>
            update({
              redirects: [...(settings.redirects.length ? settings.redirects : []), { from: "", to: "", permanent: true }],
            })
          }
        >
          + Tambah redirect
        </button>
      </div>

      <div className={subDivider} />

      <h3 className="text-sm font-semibold text-sky-200/90">SEO per halaman (override)</h3>
      <p className="mt-1 text-[11px] text-slate-500">
        Mengalahkan SEO global jika diisi. Canonical absolut atau path relatif.
      </p>
      <div className="mt-4 space-y-6">
        {PAGE_SEO_LABELS.map(({ key, label, path }) => {
          const pe = settings.pageSeo[key] ?? {};
          return (
            <div key={key} className="rounded-xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs font-semibold text-slate-300">
                {label}{" "}
                <span className="font-mono font-normal text-slate-500">({path})</span>
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FieldLabel>Title</FieldLabel>
                  <input
                    type="text"
                    value={pe.title ?? ""}
                    onChange={(e) => patchPageSeo(key, { title: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
                  />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    value={pe.description ?? ""}
                    onChange={(e) => patchPageSeo(key, { description: e.target.value })}
                    rows={2}
                    className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
                  />
                </div>
                <div>
                  <FieldLabel>Keywords</FieldLabel>
                  <input
                    type="text"
                    value={pe.keywords ?? ""}
                    onChange={(e) => patchPageSeo(key, { keywords: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
                  />
                </div>
                <div>
                  <FieldLabel>OG image (path / URL)</FieldLabel>
                  <input
                    type="text"
                    value={pe.ogImage ?? ""}
                    onChange={(e) => patchPageSeo(key, { ogImage: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2 font-mono text-xs text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
                  />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel>Canonical (opsional)</FieldLabel>
                  <input
                    type="text"
                    value={pe.canonical ?? ""}
                    onChange={(e) => patchPageSeo(key, { canonical: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2 font-mono text-xs text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
                    placeholder="https://… atau /path"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={pe.noIndex === true}
                    onChange={(e) => patchPageSeo(key, { noIndex: e.target.checked })}
                    className="size-4 rounded border-white/20 bg-slate-950"
                  />
                  noindex halaman ini
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <div className={subDivider} />

      <h3 className="text-sm font-semibold text-sky-200/90">Export / import Site Settings</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void exportJson()}
          className="rounded-lg border border-white/15 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-white/10"
        >
          Export JSON
        </button>
        <button
          type="button"
          onClick={() => importJson()}
          className="rounded-lg border border-sky-400/35 px-4 py-2 text-xs font-medium text-sky-200 hover:bg-sky-400/10"
        >
          Import JSON
        </button>
      </div>
    </section>
  );
}
