"use client";

import Image, { type ImageProps } from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { SiteCopyrightImageLightbox } from "@/components/aytipanel/site-copyright-image-lightbox";
import type { MediaLibraryScope } from "@/lib/site-media-constants";
import {
  CMS_IMAGE_TRANSFORM_PREVIEW,
  CMS_IMAGE_TRANSFORM_PREVIEW_RESET,
  cmsImageTransformToReactStyle,
  resolveCmsImageTransformForViewport,
  type CmsImageTransform,
} from "@/lib/cms-image-transform";
import { useCmsViewportIsMobile } from "@/components/common/use-cms-viewport-mobile";
import { mergeAytiMediaClass } from "@/lib/ayti-icon-cold";
import { nestValueAtPath } from "@/lib/cms-nest-patch";
import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";
import { CmsImageTransformModal } from "@/components/site-cms/cms-image-transform-modal";

export type CmsImageUploadScope =
  | "tentang"
  | "layanan"
  | "produk"
  | "portfolio"
  | "project"
  | "partners"
  | "industry"
  | "coldStorage"
  | "hero"
  | "gallery"
  | MediaLibraryScope;

type Props = Omit<ImageProps, "src" | "alt"> & {
  srcPath: string;
  src: string;
  alt: string;
  /** Class untuk elemen `<Image>` */
  imageClassName?: string;
  uploadScope: CmsImageUploadScope;
  uploadSegment?: string;
  /** Wajib jika `uploadScope` = `project` — id folder di `public/images/gallery/projects/{id}/`. */
  uploadProjectId?: string;
  showEditControls?: boolean;
  enableZoom?: boolean;
  /** Nilai tampilan dari konten situs (focal, zoom, object-fit). */
  imageTransform?: Partial<CmsImageTransform>;
  /** Path patch draft untuk menyimpan transform, mis. `tentang.imageAdjust`. */
  transformPatchPath?: string;
};

export function CmsImage({
  srcPath,
  src,
  alt,
  className,
  imageClassName,
  uploadScope,
  uploadSegment,
  uploadProjectId,
  showEditControls = true,
  enableZoom = true,
  imageTransform,
  transformPatchPath,
  ...imgRest
}: Props) {
  const isMobile = useCmsViewportIsMobile();
  const cms = useSiteCmsOptional();
  const inputRef = useRef<HTMLInputElement>(null);
  const localBlobUrlRef = useRef<string | null>(null);
  const lightboxTitleIdRef = useRef(`cms-image-zoom-${Math.random().toString(36).slice(2, 8)}`);
  const [previewSrc, setPreviewSrc] = useState(src);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [transformModalOpen, setTransformModalOpen] = useState(false);
  /** Pratinjau dari modal sebelum simpan draft (event `cms-image-transform-preview`). */
  const [stagedTransformPreview, setStagedTransformPreview] = useState<Partial<CmsImageTransform> | null>(null);
  const edit = Boolean(cms?.eligible && cms.editMode);
  const stagedSrc = cms?.stagedMediaByPath?.[srcPath];

  useEffect(() => {
    if (!transformPatchPath) return;
    const onTf = (ev: Event) => {
      const ce = ev as CustomEvent<{ path?: string; transform?: CmsImageTransform }>;
      if (ce.detail?.path !== transformPatchPath || !ce.detail.transform) return;
      setStagedTransformPreview(ce.detail.transform);
    };
    const onTfReset = (ev: Event) => {
      const ce = ev as CustomEvent<{ path?: string }>;
      if (ce.detail?.path !== transformPatchPath) return;
      setStagedTransformPreview(null);
    };
    window.addEventListener(CMS_IMAGE_TRANSFORM_PREVIEW, onTf as EventListener);
    window.addEventListener(CMS_IMAGE_TRANSFORM_PREVIEW_RESET, onTfReset as EventListener);
    return () => {
      window.removeEventListener(CMS_IMAGE_TRANSFORM_PREVIEW, onTf as EventListener);
      window.removeEventListener(CMS_IMAGE_TRANSFORM_PREVIEW_RESET, onTfReset as EventListener);
    };
  }, [transformPatchPath]);

  const resolvedTransform = useMemo(
    () =>
      resolveCmsImageTransformForViewport(
        { ...imageTransform, ...stagedTransformPreview },
        isMobile,
      ),
    [imageTransform, stagedTransformPreview, isMobile],
  );
  const transformStyle = useMemo(() => cmsImageTransformToReactStyle(resolvedTransform), [resolvedTransform]);
  const showTransformUi = Boolean(edit && transformPatchPath);

  useEffect(() => {
    setPreviewSrc(stagedSrc ?? src);
  }, [src, stagedSrc]);

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

  useEffect(
    () => () => {
      if (localBlobUrlRef.current) {
        URL.revokeObjectURL(localBlobUrlRef.current);
        localBlobUrlRef.current = null;
      }
    },
    [],
  );

  const openLibrary = useCallback(() => {
    if (!cms) return;
    cms.openMediaLibrary({ assignPath: srcPath });
  }, [cms, srcPath]);

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
      if (uploadScope === "project") {
        if (uploadProjectId?.trim()) fd.set("projectId", uploadProjectId.trim());
      } else if (uploadSegment) {
        fd.set("segment", uploadSegment);
      }
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
        if (localBlobUrlRef.current) {
          URL.revokeObjectURL(localBlobUrlRef.current);
          localBlobUrlRef.current = null;
        }
        window.alert("Gagal mengunggah gambar.");
      }
    },
    [cms, src, srcPath, uploadScope, uploadSegment, uploadProjectId],
  );

  const onCommitTransform = useCallback(
    async (t: CmsImageTransform) => {
      if (!cms || !transformPatchPath) return;
      try {
        await cms.patchDeep(nestValueAtPath(transformPatchPath, t));
      } catch {
        /* toast dari provider */
      }
    },
    [cms, transformPatchPath],
  );

  const isFill = Boolean((imgRest as { fill?: boolean }).fill);
  const imgPriority = Boolean((imgRest as { priority?: boolean }).priority);
  const imgLoading = (imgRest as { loading?: ImageProps["loading"] }).loading;
  const imgSizes = (imgRest as { sizes?: string }).sizes;
  const safeSrc = typeof previewSrc === "string" && previewSrc.trim().length > 0 ? previewSrc : null;
  const ring = edit
    ? "cursor-pointer ring-1 ring-transparent ring-offset-2 ring-offset-background transition-[box-shadow,ring-color,transform,opacity] duration-300 ease-out hover:ring-sky-400/50"
    : "";
  const zoomable = Boolean(enableZoom && !edit && safeSrc);
  const wrapClass = [isFill ? "relative block h-full w-full min-h-0" : "relative inline-block", ring, mergeAytiMediaClass(className)]
    .filter(Boolean)
    .join(" ");

  const onOpenZoom = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!zoomable) return;
      const interactiveAncestor = (e.target as HTMLElement).closest("button,a,[role='button']");
      if (interactiveAncestor && interactiveAncestor !== e.currentTarget) return;
      setZoomOpen(true);
    },
    [zoomable],
  );

  const legacyImgClass = (imgRest as { className?: string }).className ?? "";
  const mergedImageClass = [imageClassName ?? legacyImgClass, "cms-media-fit-anchor", "select-none"]
    .filter(Boolean)
    .join(" ");

  const defaultFillSizes =
    "(max-width: 767px) 100vw, (max-width: 1280px) 96vw, min(1200px, 100vw)";
  const imageNode =
    safeSrc ? (
      <Image
        {...imgRest}
        src={safeSrc}
        alt={alt}
        sizes={imgSizes ?? (isFill ? defaultFillSizes : undefined)}
        loading={imgPriority ? undefined : imgLoading ?? "lazy"}
        style={{ ...(typeof imgRest.style === "object" && imgRest.style ? imgRest.style : {}), ...transformStyle }}
        className={`${mergedImageClass} transition-[opacity,filter,transform] duration-300 ease-out`}
      />
    ) : (
      <span className="flex min-h-[120px] w-full items-center justify-center rounded-lg border border-dashed border-white/25 bg-white/[0.03] px-3 text-xs text-slate-400">
        Gambar belum tersedia
      </span>
    );

  const clipZoom = Math.abs(resolvedTransform.zoom - 1) > 0.001;
  const inner =
    safeSrc && (isFill || clipZoom) ? (
      <span
        className={
          isFill
            ? "cms-media-responsive-frame absolute inset-0 overflow-hidden"
            : "cms-media-responsive-frame relative inline-block max-w-full overflow-hidden align-top"
        }
      >
        {imageNode}
      </span>
    ) : (
      imageNode
    );

  return (
    <span
      className={`${wrapClass} ${zoomable ? "cursor-zoom-in" : ""}`.trim()}
      onClick={onOpenZoom}
    >
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(ev) => void onFile(ev)} />
      {inner}
      {edit && showEditControls ? (
        <span
          className="pointer-events-auto absolute inset-x-2 top-2 z-[200] flex justify-end gap-1 sm:inset-x-auto sm:right-2 sm:top-2"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {showTransformUi ? (
            <button
              type="button"
              onClick={() => setTransformModalOpen(true)}
              title="Atur posisi, zoom, dan mode tampilan"
              className="min-h-8 rounded-lg border border-sky-400/45 bg-sky-950/75 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-100 shadow-md backdrop-blur-sm transition-[background-color,border-color,transform,opacity] duration-200 ease-out hover:bg-sky-900/85 motion-safe:hover:-translate-y-px active:translate-y-0"
            >
              Atur
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => openLibrary()}
            title="Pilih dari media library"
            className="min-h-8 rounded-lg border border-white/25 bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-md backdrop-blur-sm transition-[background-color,border-color,transform,opacity] duration-200 ease-out hover:bg-black/85 motion-safe:hover:-translate-y-px active:translate-y-0"
          >
            Media
          </button>
          <button
            type="button"
            onClick={() => void pickFileDirect()}
            title="Unggah berkas dari perangkat"
            className="min-h-8 rounded-lg border border-white/25 bg-slate-900/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/95 shadow-md backdrop-blur-sm transition-[background-color,border-color,transform,opacity] duration-200 ease-out hover:bg-slate-800/85 motion-safe:hover:-translate-y-px active:translate-y-0"
          >
            File
          </button>
        </span>
      ) : null}
      {zoomOpen && safeSrc ? (
        <SiteCopyrightImageLightbox
          src={safeSrc}
          alt={alt}
          titleId={lightboxTitleIdRef.current}
          onClose={() => setZoomOpen(false)}
          srHeading="Pratinjau gambar"
        />
      ) : null}
      {showTransformUi && safeSrc ? (
        <CmsImageTransformModal
          open={transformModalOpen}
          onClose={() => setTransformModalOpen(false)}
          imageSrc={safeSrc}
          initial={{ ...imageTransform, ...stagedTransformPreview }}
          previewPath={transformPatchPath}
          onCommit={(t) => void onCommitTransform(t)}
        />
      ) : null}
    </span>
  );
}
