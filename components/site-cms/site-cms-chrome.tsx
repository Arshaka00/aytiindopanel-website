"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";
import { isSiteCmsChromeSurfaceAllowed } from "@/lib/cms-chrome-gate";

const HomeSectionPanel = dynamic(
  () => import("@/components/site-cms/home-section-panel").then((m) => m.HomeSectionPanel),
  { ssr: false },
);

export function SiteCmsChrome() {
  const cms = useSiteCmsOptional();
  const pathname = usePathname();
  const [homeOpen, setHomeOpen] = useState(false);
  const [surfaceAllowed, setSurfaceAllowed] = useState(false);

  useEffect(() => {
    const refresh = () => setSurfaceAllowed(isSiteCmsChromeSurfaceAllowed());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("ayti-cms-chrome-session", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("ayti-cms-chrome-session", refresh);
    };
  }, [pathname]);

  if (!cms?.eligible || !surfaceAllowed) return null;

  const saveLabel =
    cms.saveState === "saving"
      ? "Menyimpan…"
      : cms.saveState === "saved"
        ? "Tersimpan"
        : cms.saveState === "error"
          ? "Gagal"
          : cms.pendingRefresh
            ? "Menyegarkan…"
            : null;

  return (
    <>
      <HomeSectionPanel open={homeOpen} onClose={() => setHomeOpen(false)} />

      <div className="pointer-events-none fixed bottom-4 right-4 z-[60020] flex max-w-[min(100vw-2rem,296px)] flex-col items-end gap-2.5 max-[380px]:bottom-[max(1rem,env(safe-area-inset-bottom,0px))] max-[380px]:right-3 motion-safe:transition-[transform,opacity] motion-safe:duration-300 motion-safe:ease-out">
        {cms.editMode && saveLabel ? (
          <div
            className="pointer-events-none rounded-full border border-white/15 bg-slate-950/85 px-2.5 py-1 text-[10px] font-semibold text-sky-200 shadow-md backdrop-blur-md"
            role="status"
          >
            {saveLabel}
          </div>
        ) : null}
        {cms.editMode && cms.dirtyEditingCount > 0 ? (
          <div
            className="pointer-events-none rounded-full border border-amber-300/30 bg-amber-500/15 px-2.5 py-1 text-[10px] font-semibold text-amber-100 shadow-md backdrop-blur-md"
            role="status"
          >
            {cms.dirtyEditingCount} field belum disimpan
          </div>
        ) : null}
        {cms.editMode && cms.stagedHeroProcessPendingCount > 0 ? (
          <div
            className="pointer-events-none rounded-full border border-sky-300/30 bg-sky-500/15 px-2.5 py-1 text-[10px] font-semibold text-sky-100 shadow-md backdrop-blur-md"
            role="status"
          >
            {cms.stagedHeroProcessPendingCount} perubahan hero belum disimpan
          </div>
        ) : null}
        {cms.editMode && cms.stagedHeroProcessPendingCount > 0 ? (
          <div className="pointer-events-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => cms.discardStagedMedia()}
              className="touch-manipulation rounded-full border border-white/20 bg-slate-800/75 px-2.5 py-1 text-[10px] font-semibold text-slate-100 shadow-md backdrop-blur-md transition-[background-color,border-color,transform] duration-200 ease-out hover:bg-slate-700/80 motion-safe:hover:-translate-y-px active:scale-[0.98]"
            >
              Batal hero
            </button>
            <button
              type="button"
              onClick={() => void cms.saveStagedMedia()}
              className="touch-manipulation rounded-full border border-emerald-300/45 bg-emerald-500/25 px-2.5 py-1 text-[10px] font-semibold text-emerald-50 shadow-md backdrop-blur-md transition-[background-color,border-color,transform] duration-200 ease-out hover:bg-emerald-500/35 motion-safe:hover:-translate-y-px active:scale-[0.98]"
            >
              Simpan hero
            </button>
          </div>
        ) : null}
        {cms.editMode && cms.dirtyEditingCount > 0 ? (
          <div className="pointer-events-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                if (!window.confirm("Batalkan semua perubahan inline yang belum disimpan?")) return;
                window.dispatchEvent(new Event("cms-text-cancel-all"));
              }}
              className="touch-manipulation rounded-full border border-white/20 bg-slate-800/75 px-2.5 py-1 text-[10px] font-semibold text-slate-100 shadow-md backdrop-blur-md transition-[background-color,border-color,transform] duration-200 ease-out hover:bg-slate-700/80 motion-safe:hover:-translate-y-px active:scale-[0.98]"
            >
              Batal semua
            </button>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("cms-text-save-all"))}
              className="touch-manipulation rounded-full border border-emerald-300/35 bg-emerald-500/20 px-2.5 py-1 text-[10px] font-semibold text-emerald-50 shadow-md backdrop-blur-md transition-[background-color,border-color,transform] duration-200 ease-out hover:bg-emerald-500/30 motion-safe:hover:-translate-y-px active:scale-[0.98]"
            >
              Simpan semua
            </button>
          </div>
        ) : null}
        <div className="pointer-events-auto flex flex-col gap-2 rounded-2xl border border-white/12 bg-slate-950/85 p-2.5 shadow-[0_16px_46px_rgba(0,0,0,0.48)] backdrop-blur-lg transition-[box-shadow,border-color,background-color] duration-250 ease-out">
          <button
            type="button"
            onClick={() => cms.setEditMode(!cms.editMode)}
            className={`touch-manipulation rounded-xl px-3 py-2 text-left text-xs font-semibold transition-[background-color,color,box-shadow,transform] duration-200 ease-out motion-safe:hover:-translate-y-px active:scale-[0.985] ${
              cms.editMode
                ? "bg-sky-500 text-white shadow-[0_0_24px_rgba(14,165,233,0.35)]"
                : "bg-white/6 text-slate-100 hover:bg-white/12"
            }`}
          >
            {cms.editMode ? "Selesai edit" : "Edit mode"}
          </button>
          {cms.editMode ? (
            <>
              <button
                type="button"
                onClick={() => cms.openMediaLibrary()}
                className="touch-manipulation rounded-xl bg-white/6 px-3 py-2 text-left text-xs font-semibold text-slate-100 transition-[background-color,transform] duration-200 ease-out hover:bg-white/12 motion-safe:hover:-translate-y-px active:scale-[0.985]"
              >
                Media library
              </button>
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new Event("cms-text-save-all"));
                  if (cms.stagedHeroProcessPendingCount > 0) void cms.saveStagedMedia();
                  if (cms.pendingRefresh) cms.refreshPage();
                }}
                className="touch-manipulation rounded-xl border border-emerald-300/45 bg-emerald-500/30 px-3 py-2 text-left text-xs font-semibold text-emerald-50 shadow-[0_8px_20px_-10px_rgba(16,185,129,0.75)] transition-[background-color,border-color,transform] duration-200 ease-out hover:bg-emerald-500/40 motion-safe:hover:-translate-y-px active:scale-[0.985]"
              >
                Simpan sekarang
              </button>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={!cms.canUndo}
                  onClick={() => void cms.undo()}
                  title="Undo (⌘Z)"
                  className="touch-manipulation flex-1 rounded-xl bg-white/6 px-2 py-1.5 text-left text-[10px] font-semibold text-slate-200 transition-[background-color,transform,opacity] duration-200 ease-out hover:bg-white/12 motion-safe:hover:-translate-y-px active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Undo
                </button>
                <button
                  type="button"
                  disabled={!cms.canRedo}
                  onClick={() => void cms.redo()}
                  title="Redo (⇧⌘Z)"
                  className="touch-manipulation flex-1 rounded-xl bg-white/6 px-2 py-1.5 text-left text-[10px] font-semibold text-slate-200 transition-[background-color,transform,opacity] duration-200 ease-out hover:bg-white/12 motion-safe:hover:-translate-y-px active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Redo
                </button>
              </div>
              <button
                type="button"
                onClick={() => setHomeOpen(true)}
                className="touch-manipulation rounded-xl bg-white/6 px-3 py-2 text-left text-xs font-semibold text-slate-100 transition-[background-color,transform] duration-200 ease-out hover:bg-white/12 motion-safe:hover:-translate-y-px active:scale-[0.985]"
              >
                Section beranda
              </button>
            </>
          ) : null}
          <Link
            href="/site-admin"
            className="touch-manipulation rounded-xl bg-white/6 px-3 py-2 text-center text-xs font-semibold text-slate-100 transition-[background-color,transform] duration-200 ease-out hover:bg-white/12 motion-safe:hover:-translate-y-px active:scale-[0.985]"
          >
            CMS
          </Link>
        </div>
      </div>
    </>
  );
}
