"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  MEDIA_LIBRARY_SCOPES,
  MEDIA_SCOPE_TO_DIR,
  type MediaLibraryScope,
} from "@/lib/site-media-constants";
import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";

type MediaItem = {
  scope: MediaLibraryScope;
  url: string;
  thumbUrl?: string;
  kind: "image" | "video";
  name: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  /** Set konten site ke path gambar (opsional). */
  assignPath?: string;
};

export function SiteMediaLibraryModal({ open, onClose, assignPath }: Props) {
  const cms = useSiteCmsOptional();
  const [scope, setScope] = useState<MediaLibraryScope | "all">("all");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sp = new URLSearchParams();
      if (scope !== "all") sp.set("scope", scope);
      const r = await fetch(`/api/site-media/list?${sp.toString()}`, { credentials: "include" });
      const j = (await r.json().catch(() => ({}))) as { items?: MediaItem[]; error?: string };
      if (!r.ok) throw new Error(j.error ?? "Gagal memuat media.");
      setItems(Array.isArray(j.items) ? j.items : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    if (!open) return;
    void load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const s = q.trim().toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(s));
  }, [items, q]);

  const assignToField = async (url: string) => {
    if (!assignPath || !cms) return;
    window.dispatchEvent(new CustomEvent("cms-image-preview", { detail: { path: assignPath, url } }));
    cms.stageMediaChange(assignPath, url);
    cms.pushToast?.("Perubahan media siap disimpan", "ok");
    onClose();
  };

  const uploadFile = async (file: File) => {
    if (!cms) return;
    const ok = await cms.ensureWriteSession();
    if (!ok) return;
    const scopeUpload: MediaLibraryScope = scope === "all" ? "mediaGallery" : scope;
    const fd = new FormData();
    fd.set("scope", scopeUpload);
    fd.set("file", file);
    setUploadPct(0);
    setError(null);
    let uploadedUrl: string | undefined;
    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/site-media/upload");
        xhr.withCredentials = true;
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) setUploadPct(Math.round((ev.loaded / ev.total) * 100));
        };
        xhr.onload = () => {
          try {
            const j = JSON.parse(xhr.responseText) as { ok?: boolean; error?: string; url?: string };
            if (xhr.status >= 200 && xhr.status < 300 && j.ok && j.url) {
              uploadedUrl = j.url;
              if (!assignPath) cms.pushToast?.("Unggah selesai", "ok");
              resolve();
            } else {
              reject(new Error(j.error ?? "Upload gagal"));
            }
          } catch {
            reject(new Error("Respons tidak valid"));
          }
        };
        xhr.onerror = () => reject(new Error("Jaringan"));
        xhr.send(fd);
      });
      if (assignPath && uploadedUrl) {
        await assignToField(uploadedUrl);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unggah gagal";
      setError(msg);
      cms.pushToast?.(msg, "err");
    } finally {
      setUploadPct(null);
      void load();
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void uploadFile(f);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) void uploadFile(f);
  };

  const deleteItem = async (url: string) => {
    if (!confirm("Hapus media ini?")) return;
    try {
      const r = await fetch("/api/site-media/delete", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: url }),
      });
      const j = (await r.json().catch(() => ({}))) as { error?: string };
      if (!r.ok) throw new Error(j.error ?? "Gagal hapus");
      cms?.pushToast?.("Media dihapus", "ok");
      void load();
      setPreview(null);
    } catch (e) {
      cms?.pushToast?.(e instanceof Error ? e.message : "Gagal hapus", "err");
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60100] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm motion-safe:animate-[cmsFadeIn_240ms_var(--ease-premium-out)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-lib-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl motion-safe:animate-[cmsScaleIn_280ms_var(--ease-premium-out)] motion-reduce:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div>
            <h2 id="media-lib-title" className="text-sm font-semibold text-white">
              Media library
            </h2>
            <p className="text-[11px] text-slate-400">Unggah, cari, pakai ulang, hapus</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="touch-manipulation rounded-lg border border-white/15 px-2.5 py-1 text-xs font-semibold text-slate-200 transition-[background-color,border-color,transform] duration-200 ease-out hover:bg-white/10 motion-safe:hover:-translate-y-px active:scale-[0.98]"
          >
            Tutup
          </button>
        </header>

        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-4 py-2">
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as MediaLibraryScope | "all")}
            className="rounded-lg border border-white/15 bg-slate-900/80 px-2 py-1.5 text-xs text-slate-100 transition-[border-color,background-color] duration-200 ease-out focus-visible:border-sky-400/55 focus-visible:outline-none"
          >
            <option value="all">Semua folder</option>
            {MEDIA_LIBRARY_SCOPES.map((s) => (
              <option key={s} value={s}>
                {MEDIA_SCOPE_TO_DIR[s]}
              </option>
            ))}
          </select>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama berkas…"
            className="min-w-[10rem] flex-1 rounded-lg border border-white/15 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 transition-[border-color,background-color] duration-200 ease-out focus-visible:border-sky-400/55 focus-visible:outline-none"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="touch-manipulation rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white transition-[background-color,transform,box-shadow] duration-200 ease-out hover:bg-sky-400 motion-safe:hover:-translate-y-px active:scale-[0.98]"
          >
            Unggah
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4,video/webm"
            className="hidden"
            onChange={onPick}
          />
        </div>

        <div
          ref={dropRef}
          className={`mx-4 mt-2 rounded-xl border border-dashed px-3 py-4 text-center text-[11px] transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out ${dragOver ? "border-sky-300/65 bg-sky-400/[0.14] shadow-[0_0_0_1px_rgba(125,211,252,0.45),0_10px_30px_-18px_rgba(56,189,248,0.6)]" : "border-sky-500/30 bg-sky-500/[0.06] text-sky-100/90"}`}
          onDragOver={(e) => {
            e.preventDefault();
            if (!dragOver) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          Seret berkas ke sini atau klik Unggah
          {uploadPct !== null ? (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-sky-500 transition-all"
                style={{ width: `${uploadPct}%` }}
              />
            </div>
          ) : null}
        </div>

        {error ? <p className="px-4 py-2 text-xs text-red-300">{error}</p> : null}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 [webkit-overflow-scrolling:touch]">
          {loading && !items.length ? (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4" aria-hidden>
              {Array.from({ length: 8 }).map((_, i) => (
                <li
                  key={i}
                  className="aspect-square animate-pulse rounded-xl border border-white/5 bg-slate-800/50"
                />
              ))}
            </ul>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-xs text-slate-500">
              {q.trim()
                ? "Tidak ada hasil untuk pencarian ini."
                : "Belum ada media di folder ini. Unggah untuk mulai."}
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {filtered.map((it) => (
                <li
                  key={it.url}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/60 transition-[border-color,transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-sky-300/35 hover:shadow-[0_10px_24px_-18px_rgba(56,189,248,0.5)]"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (assignPath) void assignToField(it.url);
                      else setPreview(it);
                    }}
                    className="touch-manipulation relative block aspect-square w-full bg-slate-900 active:scale-[0.995]"
                  >
                    {it.kind === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.thumbUrl ?? it.url}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl">▶</div>
                    )}
                    <span className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-1 py-0.5 text-[9px] text-white">
                      {it.name}
                    </span>
                  </button>
                  <div className="absolute right-1 top-1 z-10 flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                    <button
                      type="button"
                      title="Salin URL"
                      onClick={() => void navigator.clipboard.writeText(it.url)}
                      className="touch-manipulation rounded bg-black/55 px-1.5 py-0.5 text-[10px] text-white transition-[background-color,transform] duration-200 ease-out hover:bg-black/70 motion-safe:hover:-translate-y-px active:scale-[0.97]"
                    >
                      ⧉
                    </button>
                    <button
                      type="button"
                      title="Hapus"
                      onClick={() => void deleteItem(it.url)}
                      className="touch-manipulation rounded bg-red-600/90 px-1.5 py-0.5 text-[10px] text-white transition-[background-color,transform] duration-200 ease-out hover:bg-red-500 motion-safe:hover:-translate-y-px active:scale-[0.97]"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {preview ? (
        <div
          className="fixed inset-0 z-[60250] flex items-center justify-center bg-black/75 p-4 motion-safe:animate-[cmsFadeIn_200ms_var(--ease-premium-out)]"
          role="presentation"
          onClick={() => setPreview(null)}
        >
          <div
            className="max-h-[85vh] max-w-3xl overflow-auto rounded-xl border border-white/10 bg-slate-950 p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between gap-2">
              <p className="truncate text-xs text-slate-300">{preview.url}</p>
              {assignPath && cms ? (
                <button
                  type="button"
                  onClick={() => void assignToField(preview.url)}
                  className="touch-manipulation shrink-0 rounded-lg bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white transition-[background-color,transform] duration-200 ease-out hover:bg-emerald-500 motion-safe:hover:-translate-y-px active:scale-[0.98]"
                >
                  Pakai untuk field ini
                </button>
              ) : null}
            </div>
            {preview.kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview.url} alt="" className="mt-2 max-h-[70vh] w-auto object-contain" />
            ) : (
              <video src={preview.url} controls className="mt-2 max-h-[70vh] w-full" />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
