"use client";

import { useCallback, useRef, useState, type ChangeEvent } from "react";

import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";

const PROSES_STEP_SLOTS = [
  { slug: "konsultasi", label: "1 · Konsultasi" },
  { slug: "survey", label: "2 · Survey" },
  { slug: "produksi", label: "3 · Produksi" },
  { slug: "instalasi", label: "4 · Instalasi" },
  { slug: "selesai", label: "5 · Selesai" },
] as const;

type ProsesStepSlug = (typeof PROSES_STEP_SLOTS)[number]["slug"];

type Props = {
  /** Nilai gambar saat ini (untuk label tooltip). */
  images: Partial<Record<ProsesStepSlug, string>>;
};

/**
 * Editor CMS untuk 5 gambar kecil pada strip "proses kerja" di hero.
 * Tiap slot mengunggah ke `/api/site-media/upload?scope=hero` lalu mem-stage
 * URL ke path `hero.prosesStepImages.<slug>`. Reset slot mengembalikan ke
 * default (string kosong) sehingga fallback SVG icon muncul kembali.
 */
export function CmsHeroProsesImagesEditor({ images }: Props) {
  const cms = useSiteCmsOptional();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [activeSlug, setActiveSlug] = useState<ProsesStepSlug | null>(null);
  const [busy, setBusy] = useState(false);

  const pick = useCallback((slug: ProsesStepSlug) => {
    setActiveSlug(slug);
    inputRef.current?.click();
  }, []);

  const onFile = useCallback(
    async (ev: ChangeEvent<HTMLInputElement>) => {
      const file = ev.target.files?.[0];
      ev.target.value = "";
      if (!file || !cms || !activeSlug) return;
      const ok = await cms.ensureWriteSession();
      if (!ok) return;
      setBusy(true);
      try {
        const fd = new FormData();
        fd.set("scope", "hero");
        fd.set("file", file);
        const up = await fetch("/api/site-media/upload", {
          method: "POST",
          credentials: "include",
          body: fd,
        });
        const j = (await up.json().catch(() => ({}))) as { url?: string };
        if (!up.ok || !j.url) throw new Error("Upload gagal");
        const path = `hero.prosesStepImages.${activeSlug}`;
        window.dispatchEvent(
          new CustomEvent("cms-image-preview", {
            detail: { path, url: j.url },
          }),
        );
        cms.stageMediaChange(path, j.url);
        cms.pushToast?.("Gambar proses siap disimpan", "ok");
      } catch (err) {
        console.error(err);
        const msg = err instanceof Error ? err.message : "Coba lagi atau periksa format file.";
        window.alert(`Gagal mengganti gambar proses. ${msg}`);
      } finally {
        setBusy(false);
        setActiveSlug(null);
      }
    },
    [cms, activeSlug],
  );

  const onReset = useCallback(
    (slug: ProsesStepSlug) => {
      if (!cms) return;
      const path = `hero.prosesStepImages.${slug}`;
      window.dispatchEvent(
        new CustomEvent("cms-image-preview", {
          detail: { path, url: "" },
        }),
      );
      cms.stageMediaChange(path, "");
      cms.pushToast?.("Slot direset — pakai ikon fallback", "ok");
    },
    [cms],
  );

  if (!cms?.eligible || !cms.editMode) return null;

  return (
    <div className="pointer-events-auto absolute bottom-44 left-1/2 z-[25] flex max-w-[min(100%,28rem)] -translate-x-1/2 flex-col items-center gap-1 rounded-2xl border border-white/15 bg-black/55 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.12em] text-white/85 shadow-lg backdrop-blur-md md:bottom-48">
      <span className="text-center text-[9px] text-white/70">Gambar proses (5 slot)</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(ev) => void onFile(ev)}
      />
      <div className="flex w-full flex-wrap justify-center gap-1.5">
        {PROSES_STEP_SLOTS.map(({ slug, label }) => {
          const hasImage = Boolean(images[slug]);
          return (
            <div key={slug} className="flex flex-col items-center gap-0.5">
              <button
                type="button"
                disabled={busy}
                onClick={() => pick(slug)}
                title={hasImage ? "Ganti gambar" : "Unggah gambar"}
                className={`min-h-7 rounded-lg border px-2 py-1 text-[9px] font-semibold tracking-wide transition-[background-color,border-color,opacity] duration-200 ease-out disabled:opacity-50 ${
                  hasImage
                    ? "border-sky-300/40 bg-sky-950/60 text-sky-100 hover:bg-sky-900/70"
                    : "border-white/25 bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {label}
              </button>
              <button
                type="button"
                disabled={busy || !hasImage}
                onClick={() => onReset(slug)}
                title="Reset ke icon fallback"
                className="rounded border border-white/20 bg-slate-900/60 px-1.5 py-0.5 text-[8px] font-semibold normal-case tracking-normal text-white/80 hover:bg-slate-800/70 disabled:opacity-40"
              >
                Reset
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
