"use client";

import { useCallback, useRef, type VideoHTMLAttributes } from "react";
import { useEffect, useState } from "react";

import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";
import { mergeAytiMediaClass } from "@/lib/ayti-icon-cold";

type Props = Omit<VideoHTMLAttributes<HTMLVideoElement>, "src" | "poster"> & {
  /** Path di SiteContent untuk URL video (mis. `hero.backgroundVideo.src`). */
  srcPath: string;
  src: string;
  uploadScope: "hero" | "gallery" | "portfolio";
  uploadSegment?: string;
  /** Path untuk poster (gambar); ikut staging media terpisah dari video. */
  posterPath?: string;
  poster?: string;
};

/** Video dengan opsi ganti file di mode admin (simpan URL ke JSON). */
export function CmsVideo({
  srcPath,
  src,
  uploadScope,
  uploadSegment,
  posterPath,
  poster,
  className,
  ...rest
}: Props) {
  const cms = useSiteCmsOptional();
  const inputRef = useRef<HTMLInputElement>(null);
  const localBlobUrlRef = useRef<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState(src);
  const [posterPreview, setPosterPreview] = useState(poster ?? "");
  const edit = Boolean(cms?.eligible && cms.editMode);
  const stagedSrc = cms?.stagedMediaByPath?.[srcPath];
  const stagedPoster =
    posterPath && cms?.stagedMediaByPath?.[posterPath] !== undefined
      ? cms.stagedMediaByPath[posterPath]
      : undefined;

  useEffect(() => {
    setPreviewSrc(stagedSrc ?? src);
  }, [src, stagedSrc]);

  useEffect(() => {
    setPosterPreview(stagedPoster ?? poster ?? "");
  }, [poster, stagedPoster]);

  useEffect(() => {
    const onPreview = (ev: Event) => {
      const ce = ev as CustomEvent<{ path?: string; url?: string }>;
      if (ce.detail?.path !== srcPath) return;
      if (typeof ce.detail?.url === "string" && ce.detail.url.trim().length > 0) {
        setPreviewSrc(ce.detail.url);
      }
    };
    const onPreviewReset = (ev: Event) => {
      const ce = ev as CustomEvent<{ path?: string }>;
      if (ce.detail?.path !== srcPath) return;
      setPreviewSrc(cms?.stagedMediaByPath?.[srcPath] ?? src);
    };
    window.addEventListener("cms-image-preview", onPreview as EventListener);
    window.addEventListener("cms-image-preview-reset", onPreviewReset as EventListener);
    return () => {
      window.removeEventListener("cms-image-preview", onPreview as EventListener);
      window.removeEventListener("cms-image-preview-reset", onPreviewReset as EventListener);
    };
  }, [cms, src, srcPath]);

  useEffect(() => {
    if (!posterPath) return;
    const onPosterPreview = (ev: Event) => {
      const ce = ev as CustomEvent<{ path?: string; url?: string }>;
      if (ce.detail?.path !== posterPath) return;
      if (typeof ce.detail?.url === "string") setPosterPreview(ce.detail.url);
    };
    window.addEventListener("cms-image-preview", onPosterPreview as EventListener);
    return () => window.removeEventListener("cms-image-preview", onPosterPreview as EventListener);
  }, [posterPath]);

  const openLibrary = useCallback(() => {
    if (!cms) return;
    cms.openMediaLibrary({ assignPath: srcPath });
  }, [cms, srcPath]);

  const openPosterLibrary = useCallback(() => {
    if (!cms || !posterPath) return;
    cms.openMediaLibrary({ assignPath: posterPath });
  }, [cms, posterPath]);

  const pickFileDirect = useCallback(async () => {
    if (!cms) return;
    const ok = await cms.ensureWriteSession();
    if (!ok) return;
    inputRef.current?.click();
  }, [cms]);

  const onFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !cms) return;
      if (localBlobUrlRef.current) {
        URL.revokeObjectURL(localBlobUrlRef.current);
        localBlobUrlRef.current = null;
      }
      const blobUrl = URL.createObjectURL(file);
      localBlobUrlRef.current = blobUrl;
      setPreviewSrc(blobUrl);
      const fd = new FormData();
      fd.set("scope", uploadScope);
      if (uploadSegment) fd.set("segment", uploadSegment);
      fd.set("file", file);
      try {
        const up = await fetch("/api/site-media/upload", {
          method: "POST",
          credentials: "include",
          body: fd,
        });
        const j = (await up.json().catch(() => ({}))) as { url?: string };
        if (!up.ok || !j.url) throw new Error("Upload gagal");
        setPreviewSrc(j.url);
        if (localBlobUrlRef.current) {
          URL.revokeObjectURL(localBlobUrlRef.current);
          localBlobUrlRef.current = null;
        }
        cms.stageMediaChange(srcPath, j.url);
        cms.pushToast?.("Perubahan media siap disimpan", "ok");
      } catch (err) {
        console.error(err);
        setPreviewSrc(src);
        window.alert("Gagal mengunggah video.");
      }
    },
    [cms, src, srcPath, uploadScope, uploadSegment],
  );

  const ring = edit
    ? "cursor-pointer ring-1 ring-transparent ring-offset-2 ring-offset-background transition-[box-shadow,ring-color,transform,opacity] duration-300 ease-out hover:ring-sky-400/50"
    : "";

  return (
    <span className={edit ? "relative block h-full min-h-0 w-full" : "contents"}>
      <video
        src={previewSrc || undefined}
        poster={posterPreview?.trim() ? posterPreview : undefined}
        className={`${ring} ${mergeAytiMediaClass(className)} transition-[opacity,filter,transform] duration-300 ease-out`.trim()}
        {...rest}
      />
      {edit ? (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            className="sr-only"
            aria-hidden
            tabIndex={-1}
            onChange={(ev) => void onFile(ev)}
          />
          <span className="pointer-events-none absolute inset-x-2 bottom-2 z-10 flex flex-wrap justify-end gap-1 sm:inset-x-auto sm:right-2 sm:pointer-events-auto">
            <button
              type="button"
              onClick={() => openLibrary()}
              title="Pilih dari media library"
              className="pointer-events-auto min-h-8 rounded-lg border border-white/25 bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-md backdrop-blur-sm transition-[background-color,border-color,transform,opacity] duration-200 ease-out hover:bg-black/85 motion-safe:hover:-translate-y-px active:translate-y-0"
            >
              Media
            </button>
            <button
              type="button"
              onClick={() => void pickFileDirect()}
              title="Unggah berkas dari perangkat"
              className="pointer-events-auto min-h-8 rounded-lg border border-white/25 bg-slate-900/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/95 shadow-md backdrop-blur-sm transition-[background-color,border-color,transform,opacity] duration-200 ease-out hover:bg-slate-800/85 motion-safe:hover:-translate-y-px active:translate-y-0"
            >
              File
            </button>
            {posterPath ? (
              <button
                type="button"
                onClick={() => openPosterLibrary()}
                title="Pilih poster (gambar) dari media library"
                className="pointer-events-auto min-h-8 rounded-lg border border-emerald-400/35 bg-emerald-950/75 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-100 shadow-md backdrop-blur-sm transition-[background-color,border-color,transform,opacity] duration-200 ease-out hover:bg-emerald-900/85 motion-safe:hover:-translate-y-px active:translate-y-0"
              >
                Poster
              </button>
            ) : null}
          </span>
        </>
      ) : null}
    </span>
  );
}
