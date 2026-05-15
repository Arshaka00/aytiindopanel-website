"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { LandingKotaPageCmsEntry } from "@/lib/landing-kota-pages/cms-types";
import type { SiteContent } from "@/lib/site-content-model";

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1")}=([^;]*)`));
  return m?.[1] ? decodeURIComponent(m[1]) : "";
}

const inputClass =
  "mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/0 transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-500/30";
const labelClass = "block text-xs font-medium uppercase tracking-wide text-slate-400";

function hasCityOverrideContent(entry: LandingKotaPageCmsEntry): boolean {
  return Boolean(
    entry.metaTitle?.trim() ||
      entry.metaDescription?.trim() ||
      entry.h1?.trim() ||
      entry.heroSubheadline?.trim() ||
      entry.heroLead?.trim() ||
      entry.introParagraph?.trim() ||
      (entry.keywords?.length ?? 0) > 0 ||
      (entry.coverageAreas?.length ?? 0) > 0 ||
      (entry.relatedGalleryProjectIds?.length ?? 0) > 0,
  );
}

function emptyCityDraft(slug: string): LandingKotaPageCmsEntry {
  return { slug };
}

export function LandingKotaAdminPanel({ allCitySlugs }: { allCitySlugs: string[] }) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<string>("viewer");

  const [indexForm, setIndexForm] = useState<SiteContent["landingKotaPages"]["index"] | null>(null);
  const [pages, setPages] = useState<LandingKotaPageCmsEntry[]>([]);

  const [editKind, setEditKind] = useState<"index" | "city">("index");
  const [citySlugPick, setCitySlugPick] = useState("");
  const [cityDraft, setCityDraft] = useState<LandingKotaPageCmsEntry>({ slug: "" });

  const [slugFilter, setSlugFilter] = useState("");

  const sortedSlugs = useMemo(
    () => [...allCitySlugs].sort((a, b) => a.localeCompare(b, "id")),
    [allCitySlugs],
  );

  const filteredSlugs = useMemo(() => {
    const q = slugFilter.trim().toLowerCase();
    if (!q) return sortedSlugs;
    return sortedSlugs.filter((s) => s.toLowerCase().includes(q));
  }, [sortedSlugs, slugFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/site-content", { credentials: "same-origin" });
      const data = (await res.json().catch(() => null)) as
        | { content?: SiteContent; role?: string; error?: string }
        | null;
      if (!res.ok) {
        setLoadError(data?.error ?? `Gagal memuat (${res.status})`);
        setIndexForm(null);
        return;
      }
      const c = data?.content;
      if (!c?.landingKotaPages) {
        setLoadError("Struktur konten tidak memuat landingKotaPages.");
        setIndexForm(null);
        return;
      }
      setRole(data?.role ?? "viewer");
      setIndexForm(structuredClone(c.landingKotaPages.index));
      setPages(structuredClone(c.landingKotaPages.pages));
      const first = sortedSlugs[0] ?? "";
      setCitySlugPick((prev) => (prev && sortedSlugs.includes(prev) ? prev : first));
      setSaveOk(null);
    } catch {
      setLoadError("Jaringan gagal memuat data.");
      setIndexForm(null);
    } finally {
      setLoading(false);
    }
  }, [sortedSlugs]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (editKind !== "city" || !citySlugPick) return;
    const hit = pages.find((p) => p.slug === citySlugPick);
    setCityDraft(hit ? structuredClone(hit) : emptyCityDraft(citySlugPick));
  }, [editKind, citySlugPick, pages]);

  const canEdit = role !== "viewer";

  const save = useCallback(async () => {
    if (!indexForm) return;
    setSaving(true);
    setSaveError(null);
    setSaveOk(null);
    try {
      let nextPages = [...pages];
      if (editKind === "city" && citySlugPick) {
        const d = { ...cityDraft, slug: citySlugPick };
        nextPages = nextPages.filter((p) => p.slug !== citySlugPick);
        if (hasCityOverrideContent(d)) {
          nextPages.push(d);
        }
      }

      const res = await fetch("/api/site-content", {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "content-type": "application/json",
          "x-cms-csrf-token": readCookie("cms_csrf_token"),
        },
        body: JSON.stringify({
          patch: {
            landingKotaPages: {
              index: indexForm,
              pages: nextPages,
            },
          },
        }),
      });
      const data = (await res.json().catch(() => null)) as { content?: SiteContent; error?: string } | null;
      if (!res.ok) {
        setSaveError(data?.error ?? `Gagal menyimpan (${res.status})`);
        return;
      }
      if (data?.content?.landingKotaPages) {
        setIndexForm(structuredClone(data.content.landingKotaPages.index));
        setPages(structuredClone(data.content.landingKotaPages.pages));
      }
      setSaveOk("Tersimpan ke draft & live (sama seperti patch konten situs lain).");
    } catch {
      setSaveError("Jaringan gagal saat menyimpan.");
    } finally {
      setSaving(false);
    }
  }, [cityDraft, citySlugPick, editKind, indexForm, pages]);

  const overrideCount = pages.length;

  if (loading) {
    return <p className="text-center text-sm text-slate-400">Memuat konten landing kota…</p>;
  }

  if (loadError || !indexForm) {
    return (
      <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-4 text-sm text-rose-100">
        <p>{loadError ?? "Data tidak tersedia."}</p>
        <p className="mt-2 text-xs text-rose-200/80">
          Pastikan sesi admin aktif (login panel gallery) lalu muat ulang halaman ini.
        </p>
        <button type="button" onClick={() => void load()} className="mt-3 text-sm font-semibold text-sky-300 hover:underline">
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <aside className="rounded-xl border border-sky-500/30 bg-sky-950/25 px-4 py-3 text-xs leading-relaxed text-sky-50/95">
        <p>
          <span className="font-semibold text-sky-100">Lingkup:</span> indeks publik{" "}
          <Link href="/artikel/lokasi" className="font-medium text-emerald-300 underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
            /artikel/lokasi
          </Link>{" "}
          dan teks/meta URL kota seperti{" "}
          <code className="rounded bg-black/25 px-1 py-px text-[11px]">/cold-storage-bandung</code>. Prioritas:{" "}
          <span className="font-medium">CMS ini</span> mengalahkan file{" "}
          <code className="rounded bg-black/25 px-1 py-px text-[11px]">content/cms/cities/*.json</code> bila keduanya
          mengisi field yang sama.
        </p>
        <p className="mt-2">
          Saat ini <span className="font-semibold text-sky-100">{overrideCount}</span> kota punya override di CMS.
        </p>
      </aside>

      {!canEdit ? (
        <p className="rounded-lg border border-amber-500/35 bg-amber-950/30 px-3 py-2 text-sm text-amber-100">
          Role <span className="font-mono">viewer</span>: hanya melihat. Minta akses editor untuk menyimpan.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setEditKind("index")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            editKind === "index"
              ? "bg-sky-500/25 text-sky-100 ring-1 ring-sky-400/40"
              : "bg-white/5 text-slate-300 hover:bg-white/10"
          }`}
        >
          Indeks /artikel/lokasi
        </button>
        <button
          type="button"
          onClick={() => setEditKind("city")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            editKind === "city"
              ? "bg-sky-500/25 text-sky-100 ring-1 ring-sky-400/40"
              : "bg-white/5 text-slate-300 hover:bg-white/10"
          }`}
        >
          Per kota
        </button>
      </div>

      {editKind === "index" ? (
        <section className="space-y-4 rounded-xl border border-white/12 bg-white/[0.02] p-5">
          <h2 className="text-lg font-semibold text-white">Teks halaman indeks</h2>
          <div>
            <label htmlFor="lk-idx-eyebrow" className={labelClass}>
              Eyebrow
            </label>
            <input
              id="lk-idx-eyebrow"
              value={indexForm.eyebrow}
              onChange={(e) => setIndexForm((prev) => (prev ? { ...prev, eyebrow: e.target.value } : prev))}
              className={inputClass}
              disabled={!canEdit}
            />
          </div>
          <div>
            <label htmlFor="lk-idx-heading" className={labelClass}>
              Judul (H1)
            </label>
            <input
              id="lk-idx-heading"
              value={indexForm.heading}
              onChange={(e) => setIndexForm((prev) => (prev ? { ...prev, heading: e.target.value } : prev))}
              className={inputClass}
              disabled={!canEdit}
            />
          </div>
          <div>
            <label htmlFor="lk-idx-lead" className={labelClass}>
              Lead / paragraf pembuka
            </label>
            <textarea
              id="lk-idx-lead"
              rows={4}
              value={indexForm.lead}
              onChange={(e) => setIndexForm((prev) => (prev ? { ...prev, lead: e.target.value } : prev))}
              className={inputClass}
              disabled={!canEdit}
            />
          </div>
          <div>
            <label htmlFor="lk-idx-mt" className={labelClass}>
              Meta title (opsional)
            </label>
            <input
              id="lk-idx-mt"
              value={indexForm.metaTitle}
              placeholder="Kosongkan untuk judul otomatis + nama situs"
              onChange={(e) => setIndexForm((prev) => (prev ? { ...prev, metaTitle: e.target.value } : prev))}
              className={inputClass}
              disabled={!canEdit}
            />
          </div>
          <div>
            <label htmlFor="lk-idx-md" className={labelClass}>
              Meta description (opsional)
            </label>
            <textarea
              id="lk-idx-md"
              rows={3}
              value={indexForm.metaDescription}
              placeholder="Kosongkan untuk deskripsi default indeks"
              onChange={(e) =>
                setIndexForm((prev) => (prev ? { ...prev, metaDescription: e.target.value } : prev))
              }
              className={inputClass}
              disabled={!canEdit}
            />
          </div>
        </section>
      ) : (
        <section className="space-y-4 rounded-xl border border-white/12 bg-white/[0.02] p-5">
          <h2 className="text-lg font-semibold text-white">Override satu URL kota</h2>
          <div>
            <label htmlFor="lk-slug-filter" className={labelClass}>
              Cari slug
            </label>
            <input
              id="lk-slug-filter"
              value={slugFilter}
              onChange={(e) => setSlugFilter(e.target.value)}
              placeholder="mis. bandung, cold-storage-"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="lk-slug-pick" className={labelClass}>
              Pilih slug
            </label>
            <select
              id="lk-slug-pick"
              value={citySlugPick}
              onChange={(e) => setCitySlugPick(e.target.value)}
              className={`${inputClass} max-h-48`}
              size={Math.min(12, Math.max(6, filteredSlugs.length))}
              disabled={!canEdit}
            >
              {filteredSlugs.map((s) => (
                <option key={s} value={s}>
                  {s}
                  {pages.some((p) => p.slug === s) ? "  ·  ada override" : ""}
                </option>
              ))}
            </select>
          </div>
          {citySlugPick ? (
            <p className="text-xs text-slate-500">
              Pratinjau:{" "}
              <Link
                href={`/${citySlugPick}`}
                className="text-sky-300 underline-offset-2 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                /{citySlugPick}
              </Link>
            </p>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="lk-mt" className={labelClass}>
                Meta title
              </label>
              <input
                id="lk-mt"
                value={cityDraft.metaTitle ?? ""}
                onChange={(e) => setCityDraft((d) => ({ ...d, metaTitle: e.target.value }))}
                className={inputClass}
                disabled={!canEdit}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="lk-md" className={labelClass}>
                Meta description
              </label>
              <textarea
                id="lk-md"
                rows={3}
                value={cityDraft.metaDescription ?? ""}
                onChange={(e) => setCityDraft((d) => ({ ...d, metaDescription: e.target.value }))}
                className={inputClass}
                disabled={!canEdit}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="lk-kw" className={labelClass}>
                Keywords (pisahkan koma)
              </label>
              <input
                id="lk-kw"
                value={(cityDraft.keywords ?? []).join(", ")}
                onChange={(e) =>
                  setCityDraft((d) => ({
                    ...d,
                    keywords: e.target.value
                      .split(/[,;\n]+/)
                      .map((x) => x.trim())
                      .filter(Boolean),
                  }))
                }
                className={inputClass}
                disabled={!canEdit}
              />
            </div>
            <div>
              <label htmlFor="lk-h1" className={labelClass}>
                H1
              </label>
              <input
                id="lk-h1"
                value={cityDraft.h1 ?? ""}
                onChange={(e) => setCityDraft((d) => ({ ...d, h1: e.target.value }))}
                className={inputClass}
                disabled={!canEdit}
              />
            </div>
            <div>
              <label htmlFor="lk-hs" className={labelClass}>
                Hero subheadline
              </label>
              <input
                id="lk-hs"
                value={cityDraft.heroSubheadline ?? ""}
                onChange={(e) => setCityDraft((d) => ({ ...d, heroSubheadline: e.target.value }))}
                className={inputClass}
                disabled={!canEdit}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="lk-hl" className={labelClass}>
                Hero lead
              </label>
              <textarea
                id="lk-hl"
                rows={2}
                value={cityDraft.heroLead ?? ""}
                onChange={(e) => setCityDraft((d) => ({ ...d, heroLead: e.target.value }))}
                className={inputClass}
                disabled={!canEdit}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="lk-intro" className={labelClass}>
                Intro paragraph
              </label>
              <textarea
                id="lk-intro"
                rows={4}
                value={cityDraft.introParagraph ?? ""}
                onChange={(e) => setCityDraft((d) => ({ ...d, introParagraph: e.target.value }))}
                className={inputClass}
                disabled={!canEdit}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="lk-cov" className={labelClass}>
                Coverage areas (satu baris per item)
              </label>
              <textarea
                id="lk-cov"
                rows={3}
                value={(cityDraft.coverageAreas ?? []).join("\n")}
                onChange={(e) =>
                  setCityDraft((d) => ({
                    ...d,
                    coverageAreas: e.target.value
                      .split("\n")
                      .map((x) => x.trim())
                      .filter(Boolean),
                  }))
                }
                className={inputClass}
                disabled={!canEdit}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="lk-gal" className={labelClass}>
                Related gallery project IDs (pisahkan koma)
              </label>
              <input
                id="lk-gal"
                value={(cityDraft.relatedGalleryProjectIds ?? []).join(", ")}
                onChange={(e) =>
                  setCityDraft((d) => ({
                    ...d,
                    relatedGalleryProjectIds: e.target.value
                      .split(/[,;\s]+/)
                      .map((x) => x.trim())
                      .filter(Boolean),
                  }))
                }
                className={inputClass}
                disabled={!canEdit}
              />
            </div>
          </div>

          {canEdit && citySlugPick ? (
            <button
              type="button"
              onClick={() => {
                setCityDraft(emptyCityDraft(citySlugPick));
              }}
              className="rounded-lg border border-rose-500/35 bg-rose-950/20 px-3 py-2 text-sm font-semibold text-rose-100 hover:bg-rose-950/35"
            >
              Kosongkan form (hapus semua field); lalu Simpan untuk menghapus override kota ini
            </button>
          ) : null}
        </section>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void save()}
          disabled={!canEdit || saving}
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Menyimpan…" : "Simpan"}
        </button>
        {saveOk ? <span className="text-sm text-emerald-300">{saveOk}</span> : null}
        {saveError ? <span className="text-sm text-rose-300">{saveError}</span> : null}
      </div>
    </div>
  );
}
