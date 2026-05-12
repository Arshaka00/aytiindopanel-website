"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { SeoArticle, SeoArticleFaqItem, SeoArticlesFile } from "@/lib/seo-articles/types";

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1")}=([^;]*)`));
  return m?.[1] ? decodeURIComponent(m[1]) : "";
}

const inputClass =
  "mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/0 transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-500/30";
const labelClass = "block text-xs font-medium uppercase tracking-wide text-slate-400";

export function SeoArticlesAdminPanel() {
  const [file, setFile] = useState<SeoArticlesFile | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [idx, setIdx] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/seo-articles", { credentials: "same-origin" });
      const data = (await res.json().catch(() => null)) as { error?: string } & Partial<SeoArticlesFile> | null;
      if (!res.ok) {
        setLoadError(data?.error ?? `Gagal memuat (${res.status})`);
        setFile(null);
        return;
      }
      setFile(data as SeoArticlesFile);
      setIdx(0);
    } catch {
      setLoadError("Jaringan gagal memuat data.");
      setFile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const article = useMemo(() => file?.articles[idx] ?? null, [file, idx]);

  const patchArticle = useCallback(
    (patch: Partial<SeoArticle>) => {
      setFile((prev) => {
        if (!prev) return prev;
        const next = prev.articles.map((a, i) => (i === idx ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a));
        return { ...prev, articles: next };
      });
    },
    [idx],
  );

  const patchFaq = useCallback(
    (faqIndex: number, patch: Partial<SeoArticleFaqItem>) => {
      if (!article) return;
      const faq = article.faq.map((f, i) => (i === faqIndex ? { ...f, ...patch } : f));
      patchArticle({ faq });
    },
    [article, patchArticle],
  );

  const addFaq = useCallback(() => {
    if (!article) return;
    const row: SeoArticleFaqItem = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `faq_${Date.now()}`,
      question: "Pertanyaan baru",
      answerMarkdown: "Jawaban satu atau dua kalimat.",
    };
    patchArticle({ faq: [...article.faq, row] });
  }, [article, patchArticle]);

  const removeFaq = useCallback(
    (faqIndex: number) => {
      if (!article) return;
      patchArticle({ faq: article.faq.filter((_, i) => i !== faqIndex) });
    },
    [article, patchArticle],
  );

  const save = useCallback(async () => {
    if (!file) return;
    setSaving(true);
    setSaveError(null);
    setSaveOk(null);
    try {
      const res = await fetch("/api/seo-articles", {
        method: "PUT",
        credentials: "same-origin",
        headers: {
          "content-type": "application/json",
          "x-cms-csrf-token": readCookie("cms_csrf_token"),
        },
        body: JSON.stringify({ version: 1 as const, articles: file.articles }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } & Partial<SeoArticlesFile> | null;
      if (!res.ok) {
        setSaveError(data?.error ?? `Gagal menyimpan (${res.status})`);
        return;
      }
      setFile(data as SeoArticlesFile);
      setSaveOk("Tersimpan.");
    } catch {
      setSaveError("Jaringan gagal saat menyimpan.");
    } finally {
      setSaving(false);
    }
  }, [file]);

  if (loading) {
    return <p className="text-center text-sm text-slate-400">Memuat daftar artikel…</p>;
  }

  if (loadError || !file || !article) {
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
      <aside className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-xs leading-relaxed text-emerald-50/95">
        <p>
          <span className="font-semibold text-emerald-100">Lingkup:</span> hanya artikel publik di{" "}
          <code className="rounded bg-black/25 px-1 py-px text-[11px]">/artikel/…</code> (file{" "}
          <code className="rounded bg-black/25 px-1 py-px text-[11px]">data/seo-articles/live.json</code>). Untuk meta
          default beranda, deskripsi organisasi, footer situs, dan draft→live CMS utama buka{" "}
          <Link href="/site-admin/site-settings" className="font-medium text-sky-300 underline-offset-2 hover:underline">
            Site Settings
          </Link>
          .
        </p>
        <p className="mt-3 border-t border-emerald-500/20 pt-3 font-semibold text-emerald-100/95">Tip nada tulisan</p>
        <ul className="mt-1.5 list-disc space-y-1 pl-4 marker:text-emerald-400/80">
          <li>Deck: boleh langsung ke masalah lapangan, hindari definisi panjang.</li>
          <li>Hindari rangkaian H2 + bullet kosong; satu istilah teknis per paragraf biasanya cukup.</li>
          <li>Penutup: satu paragraf konkret, bukan formula panjang &ldquo;Secara kesimpulan&hellip;&rdquo; berulang.</li>
          <li>FAQ: jawab seperti obrolan teknisi, bukan kotak ensiklopedia.</li>
        </ul>
      </aside>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <label htmlFor="seo-article-pick" className={labelClass}>
            Pilih artikel
          </label>
          <select
            id="seo-article-pick"
            value={idx}
            onChange={(e) => setIdx(Number(e.target.value))}
            className={`${inputClass} max-w-xl`}
          >
            {file.articles.map((a, i) => (
              <option key={a.id} value={i}>
                {a.slug} — {a.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/artikel" className="text-sm font-medium text-sky-300 hover:underline" target="_blank" rel="noreferrer">
            Lihat indeks →
          </Link>
          <Link
            href={`/artikel/${article.slug}`}
            className="text-sm font-medium text-sky-300 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Pratinjau publik →
          </Link>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-500 disabled:opacity-50"
          >
            {saving ? "Menyimpan…" : "Simpan ke live.json"}
          </button>
        </div>
      </div>

      {saveError ? <p className="text-sm text-rose-300">{saveError}</p> : null}
      {saveOk ? <p className="text-sm text-emerald-300">{saveOk}</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <span className={labelClass}>Judul</span>
            <input className={inputClass} value={article.title} onChange={(e) => patchArticle({ title: e.target.value })} />
          </div>
          <div>
            <span className={labelClass}>Slug (huruf kecil, angka, hubung)</span>
            <input className={inputClass} value={article.slug} onChange={(e) => patchArticle({ slug: e.target.value })} />
          </div>
          <div>
            <span className={labelClass}>Deck</span>
            <textarea className={`${inputClass} min-h-[72px]`} value={article.deck} onChange={(e) => patchArticle({ deck: e.target.value })} />
          </div>
          <div>
            <span className={labelClass}>Keyword utama</span>
            <input
              className={inputClass}
              value={article.primaryKeyword}
              onChange={(e) => patchArticle({ primaryKeyword: e.target.value })}
            />
          </div>
          <div>
            <span className={labelClass}>Tags (koma)</span>
            <input
              className={inputClass}
              value={article.tags.join(", ")}
              onChange={(e) =>
                patchArticle({
                  tags: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
          <div>
            <span className={labelClass}>Hero image (path atau URL)</span>
            <input className={inputClass} value={article.heroImage} onChange={(e) => patchArticle({ heroImage: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={article.published}
              onChange={(e) => patchArticle({ published: e.target.checked })}
            />
            Tayang (published)
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <span className={labelClass}>Meta title</span>
            <input className={inputClass} value={article.metaTitle} onChange={(e) => patchArticle({ metaTitle: e.target.value })} />
          </div>
          <div>
            <span className={labelClass}>Meta description</span>
            <textarea
              className={`${inputClass} min-h-[80px]`}
              value={article.metaDescription}
              onChange={(e) => patchArticle({ metaDescription: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className={labelClass}>Published at (ISO)</span>
              <input
                className={inputClass}
                value={article.publishedAt}
                onChange={(e) => patchArticle({ publishedAt: e.target.value })}
              />
            </div>
            <div>
              <span className={labelClass}>Updated at (ISO)</span>
              <input className={inputClass} value={article.updatedAt} onChange={(e) => patchArticle({ updatedAt: e.target.value })} />
            </div>
          </div>
          <div>
            <span className={labelClass}>Nama penulis</span>
            <input className={inputClass} value={article.authorName} onChange={(e) => patchArticle({ authorName: e.target.value })} />
          </div>
          <div>
            <span className={labelClass}>Related slugs (koma)</span>
            <input
              className={inputClass}
              value={article.relatedSlugs.join(", ")}
              onChange={(e) =>
                patchArticle({
                  relatedSlugs: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
        </div>
      </div>

      <div>
        <span className={labelClass}>Isi (Markdown: ##, ###, **tebal**, [teks](/path))</span>
        <textarea
          className={`${inputClass} min-h-[280px] font-mono text-xs leading-relaxed md:text-sm`}
          value={article.bodyMarkdown}
          onChange={(e) => patchArticle({ bodyMarkdown: e.target.value })}
        />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-white">FAQ</h2>
          <button type="button" onClick={addFaq} className="text-sm font-medium text-sky-300 hover:underline">
            + Tambah FAQ
          </button>
        </div>
        <div className="space-y-4">
          {article.faq.map((row, fi) => (
            <div key={row.id} className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
              <div className="flex justify-end">
                <button type="button" onClick={() => removeFaq(fi)} className="text-xs text-rose-300 hover:underline">
                  Hapus
                </button>
              </div>
              <div className="mt-2">
                <span className={labelClass}>Pertanyaan</span>
                <input className={inputClass} value={row.question} onChange={(e) => patchFaq(fi, { question: e.target.value })} />
              </div>
              <div className="mt-3">
                <span className={labelClass}>Jawaban (Markdown ringan)</span>
                <textarea
                  className={`${inputClass} min-h-[100px]`}
                  value={row.answerMarkdown}
                  onChange={(e) => patchFaq(fi, { answerMarkdown: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
