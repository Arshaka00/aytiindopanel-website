"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  CMS_IMAGE_TRANSFORM_PREVIEW,
  CMS_IMAGE_TRANSFORM_PREVIEW_RESET,
  DEFAULT_CMS_IMAGE_TRANSFORM,
  type CmsImageMobileAdjust,
  type CmsImageTransform,
  clamp01pct,
  clampZoom,
  cmsImageTransformToReactStyle,
  normalizeFullCmsImageTransform,
  resolveCmsImageTransform,
  resolveCmsImageTransformForViewport,
} from "@/lib/cms-image-transform";

type Props = {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  initial: Partial<CmsImageTransform> | null | undefined;
  onCommit: (t: CmsImageTransform) => void | Promise<void>;
  /** Sama dengan path patch JSON (mis. `tentang.imageAdjust`, `hero.slides.0`) — untuk pratinjau di halaman. */
  previewPath?: string;
  title?: string;
};

type EditorTab = "desktop" | "mobile";

function hydrateDraft(initial?: Partial<CmsImageTransform> | null): CmsImageTransform {
  const core = resolveCmsImageTransform(initial);
  const m = initial?.mobile;
  if (!m || typeof m !== "object") return { ...core };
  const mobile: CmsImageMobileAdjust = {};
  if (m.objectFit === "cover" || m.objectFit === "contain" || m.objectFit === "fill") {
    mobile.objectFit = m.objectFit;
  }
  if (typeof m.focalX === "number") mobile.focalX = m.focalX;
  if (typeof m.focalY === "number") mobile.focalY = m.focalY;
  if (typeof m.zoom === "number") mobile.zoom = m.zoom;
  if (Object.keys(mobile).length === 0) return { ...core };
  return { ...core, mobile };
}

/**
 * Editor: focal + zoom + object-fit terpisah desktop vs mobile; geser = titik fokus.
 * Dua pratinjau (desktop / mobile) real-time; kontrol mengikuti tab aktif.
 */
export function CmsImageTransformModal({
  open,
  onClose,
  imageSrc,
  initial,
  onCommit,
  previewPath,
  title = "Atur tampilan gambar",
}: Props) {
  const [draft, setDraft] = useState<CmsImageTransform>(() => hydrateDraft(initial));
  const [activeTab, setActiveTab] = useState<EditorTab>("desktop");
  const desktopPreviewRef = useRef<HTMLDivElement | null>(null);
  const mobilePreviewRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    tab: EditorTab;
    startX: number;
    startY: number;
    startFocalX: number;
    startFocalY: number;
  } | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(hydrateDraft(initial));
      setActiveTab("desktop");
    }
  }, [open, initial]);

  const desktopResolved = useMemo(() => resolveCmsImageTransform(draft), [draft]);
  const mobileResolved = useMemo(() => resolveCmsImageTransformForViewport(draft, true), [draft]);

  const desktopStyle = useMemo(() => cmsImageTransformToReactStyle(desktopResolved), [desktopResolved]);
  const mobileStyle = useMemo(() => cmsImageTransformToReactStyle(mobileResolved), [mobileResolved]);

  const controlsResolved = useMemo(
    () => (activeTab === "mobile" ? mobileResolved : desktopResolved),
    [activeTab, desktopResolved, mobileResolved],
  );

  const setZoomForTab = useCallback((tab: EditorTab, value: number) => {
    const z = clampZoom(value);
    if (tab === "desktop") {
      setDraft((prev) => ({ ...prev, zoom: z }));
    } else {
      setDraft((prev) => ({ ...prev, mobile: { ...prev.mobile, zoom: z } }));
    }
  }, []);

  const setObjectFitForTab = useCallback((tab: EditorTab, fit: CmsImageTransform["objectFit"]) => {
    if (tab === "desktop") {
      setDraft((prev) => ({ ...prev, objectFit: fit }));
    } else {
      setDraft((prev) => ({ ...prev, mobile: { ...prev.mobile, objectFit: fit } }));
    }
  }, []);

  const startDrag = useCallback(
    (tab: EditorTab, e: React.PointerEvent<HTMLDivElement>) => {
      const el = tab === "desktop" ? desktopPreviewRef.current : mobilePreviewRef.current;
      if (!el) return;
      setActiveTab(tab);
      e.currentTarget.setPointerCapture(e.pointerId);
      const eff = resolveCmsImageTransformForViewport(draft, tab === "mobile");
      dragRef.current = {
        tab,
        startX: e.clientX,
        startY: e.clientY,
        startFocalX: eff.focalX,
        startFocalY: eff.focalY,
      };
    },
    [draft],
  );

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const d0 = dragRef.current;
    const el = d0?.tab === "desktop" ? desktopPreviewRef.current : mobilePreviewRef.current;
    if (!d0 || !el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (w < 1 || h < 1) return;
    const dx = e.clientX - d0.startX;
    const dy = e.clientY - d0.startY;
    const sens = 0.9;
    const nextFx = clamp01pct(d0.startFocalX - (dx / w) * 100 * sens);
    const nextFy = clamp01pct(d0.startFocalY - (dy / h) * 100 * sens);
    if (d0.tab === "desktop") {
      setDraft((prev) => ({ ...prev, focalX: nextFx, focalY: nextFy }));
    } else {
      setDraft((prev) => ({
        ...prev,
        mobile: { ...prev.mobile, focalX: nextFx, focalY: nextFy },
      }));
    }
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    dragRef.current = null;
  }, []);

  const reset = useCallback(() => {
    setDraft({ ...DEFAULT_CMS_IMAGE_TRANSFORM });
    setActiveTab("desktop");
  }, []);

  const copyDesktopToMobile = useCallback(() => {
    setDraft((prev) => ({
      ...prev,
      mobile: {
        objectFit: prev.objectFit,
        focalX: prev.focalX,
        focalY: prev.focalY,
        zoom: prev.zoom,
      },
    }));
    setActiveTab("mobile");
  }, []);

  const dispatchPreviewReset = useCallback(() => {
    if (!previewPath) return;
    window.dispatchEvent(new CustomEvent(CMS_IMAGE_TRANSFORM_PREVIEW_RESET, { detail: { path: previewPath } }));
  }, [previewPath]);

  const previewOnPage = useCallback(() => {
    if (!previewPath) return;
    const t = normalizeFullCmsImageTransform(draft);
    window.dispatchEvent(
      new CustomEvent(CMS_IMAGE_TRANSFORM_PREVIEW, {
        detail: { path: previewPath, transform: t },
      }),
    );
  }, [draft, previewPath]);

  const handleClose = useCallback(() => {
    dispatchPreviewReset();
    onClose();
  }, [dispatchPreviewReset, onClose]);

  const apply = useCallback(() => {
    void (async () => {
      const t = normalizeFullCmsImageTransform(draft);
      await Promise.resolve(onCommit(t));
      if (previewPath) {
        window.dispatchEvent(new CustomEvent(CMS_IMAGE_TRANSFORM_PREVIEW_RESET, { detail: { path: previewPath } }));
      }
      onClose();
    })();
  }, [draft, onCommit, onClose, previewPath]);

  if (!open) return null;

  const tabBtn =
    "rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors border border-transparent";
  const tabActive = "border-sky-500/40 bg-sky-500/15 text-sky-900 dark:text-sky-50";
  const tabIdle = "border-border bg-muted-bg/60 text-muted-foreground hover:bg-muted-bg";

  return (
    <div
      className="fixed inset-0 z-[80000] flex items-end justify-center bg-black/55 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:items-center sm:p-4"
      role="dialog"
      aria-modal
      aria-labelledby="cms-image-transform-title"
    >
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Tutup" onClick={handleClose} />
      <div className="relative z-[1] flex max-h-[min(92dvh,920px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-400/45 bg-background shadow-2xl dark:border-slate-500/40">
        <div className="border-b border-border px-4 py-3">
          <h2 id="cms-image-transform-title" className="text-sm font-semibold text-foreground">
            {title}
          </h2>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
            Desktop dan mobile bisa berbeda (crop/zoom). Seret pada pratinjau untuk focal point. Tab{" "}
            <span className="font-medium text-foreground">Mobile</span> mengatur tampilan ≤768px.{" "}
            <span className="font-medium text-foreground">Pratinjau di halaman</span> tanpa menyimpan;{" "}
            <span className="font-medium text-foreground">Simpan ke draft</span> menulis konten.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              className={`${tabBtn} ${activeTab === "desktop" ? tabActive : tabIdle}`}
              onClick={() => setActiveTab("desktop")}
            >
              Desktop
            </button>
            <button
              type="button"
              className={`${tabBtn} ${activeTab === "mobile" ? tabActive : tabIdle}`}
              onClick={() => setActiveTab("mobile")}
            >
              Mobile (≤768px)
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Pratinjau desktop
              </div>
              <div
                ref={desktopPreviewRef}
                className={`cms-media-responsive-frame relative aspect-video w-full cursor-grab overflow-hidden rounded-xl bg-muted-bg ring-1 ring-border active:cursor-grabbing ${activeTab === "desktop" ? "ring-2 ring-sky-500/45" : ""}`}
                onPointerDown={(e) => startDrag("desktop", e)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageSrc}
                  alt=""
                  className="cms-media-fit-anchor pointer-events-none absolute inset-0 h-full w-full select-none"
                  style={desktopStyle}
                  draggable={false}
                />
              </div>
              <div className="mt-1 grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
                <span>X {desktopResolved.focalX.toFixed(1)}%</span>
                <span>Y {desktopResolved.focalY.toFixed(1)}%</span>
              </div>
            </div>

            <div>
              <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Pratinjau mobile
              </div>
              <div
                ref={mobilePreviewRef}
                className={`cms-media-responsive-frame relative aspect-video w-full cursor-grab overflow-hidden rounded-xl bg-muted-bg ring-1 ring-border active:cursor-grabbing ${activeTab === "mobile" ? "ring-2 ring-sky-500/45" : ""}`}
                onPointerDown={(e) => startDrag("mobile", e)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageSrc}
                  alt=""
                  className="cms-media-fit-anchor pointer-events-none absolute inset-0 h-full w-full select-none"
                  style={mobileStyle}
                  draggable={false}
                />
              </div>
              <div className="mt-1 grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
                <span>X {mobileResolved.focalX.toFixed(1)}%</span>
                <span>Y {mobileResolved.focalY.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <p className="text-[10px] text-muted-foreground">
              Mengatur: <span className="font-medium text-foreground">{activeTab === "mobile" ? "Mobile" : "Desktop"}</span>
            </p>

            <label className="block text-[11px] font-medium text-foreground">
              Zoom ({activeTab === "mobile" ? "mobile" : "desktop"})
              <input
                type="range"
                min={1}
                max={3}
                step={0.02}
                value={controlsResolved.zoom}
                onChange={(e) => setZoomForTab(activeTab, Number.parseFloat(e.target.value))}
                className="mt-1 w-full accent-sky-500"
              />
              <span className="text-[10px] text-muted-foreground">{controlsResolved.zoom.toFixed(2)}×</span>
            </label>

            <label className="block text-[11px] font-medium text-foreground">
              Mode isi bingkai
              <select
                value={controlsResolved.objectFit}
                onChange={(e) =>
                  setObjectFitForTab(activeTab, e.target.value as CmsImageTransform["objectFit"])
                }
                className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-sm text-foreground"
              >
                <option value="cover">Cover — isi penuh, potong jika perlu</option>
                <option value="contain">Contain — seluruh gambar terlihat</option>
                <option value="fill">Fill — stretch ke bingkai</option>
              </select>
            </label>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-muted-foreground">Fokus X</span>
                <div className="font-mono text-foreground">{controlsResolved.focalX.toFixed(1)}%</div>
              </div>
              <div>
                <span className="text-muted-foreground">Fokus Y</span>
                <div className="font-mono text-foreground">{controlsResolved.focalY.toFixed(1)}%</div>
              </div>
            </div>

            <button
              type="button"
              className="w-full rounded-lg border border-border px-3 py-2 text-[11px] font-medium text-foreground hover:bg-muted-bg"
              onClick={copyDesktopToMobile}
            >
              Salin pengaturan desktop ke mobile
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-4 py-3">
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted-bg"
            onClick={reset}
          >
            Reset
          </button>
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted-bg"
            onClick={handleClose}
          >
            Batal
          </button>
          {previewPath ? (
            <button
              type="button"
              className="rounded-lg border border-sky-500/45 bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-500/15 dark:text-sky-100"
              onClick={previewOnPage}
            >
              Pratinjau di halaman
            </button>
          ) : null}
          <button
            type="button"
            className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-700"
            onClick={apply}
          >
            Simpan ke draft
          </button>
        </div>
      </div>
    </div>
  );
}
