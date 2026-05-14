"use client";

import { motion } from "framer-motion";

import { GalleryCardHeroMedia } from "@/components/aytipanel/gallery-project-card-media";
import { GalleryPhotosCarousel } from "@/components/aytipanel/gallery-photos-carousel";
import type { GalleryProjectItem } from "@/components/aytipanel/gallery-project-data";
import { mergeAytiCardClass } from "@/lib/ayti-icon-cold";

type Props = {
  project: GalleryProjectItem;
  showAdminActions: boolean;
  onDelete: () => void;
  onEdit: () => void;
};

export function GalleryProjectShowcaseCard({ project, showAdminActions, onDelete, onEdit }: Props) {
  const pct =
    typeof project.progress === "number" ? Math.min(100, Math.max(0, project.progress)) : null;

  return (
    <motion.article
      layout
      transition={{ layout: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
      className={mergeAytiCardClass(
        "group relative h-full min-h-[70vh] overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-[var(--shadow-card)] ring-1 ring-black/[0.04] transition-[transform,box-shadow,border-color] duration-[420ms] [transition-timing-function:var(--ease-premium-soft)] hover:border-sky-500/35 hover:shadow-[var(--shadow-card-hover)] motion-safe:hover:-translate-y-1 lg:min-h-0 dark:border-white/[0.07] dark:bg-[linear-gradient(165deg,rgba(12,18,32,0.98)_0%,rgba(8,12,22,0.99)_55%,rgba(6,9,18,1)_100%)] dark:text-slate-100 dark:shadow-[0_20px_50px_-28px_rgba(0,0,0,0.85),0_0_0_1px_rgba(56,189,248,0.06)] dark:ring-white/[0.03] dark:hover:border-sky-400/25 dark:hover:shadow-[0_28px_60px_-28px_rgba(56,189,248,0.28)]",
      )}
    >
      {/* 1 · Video / hero */}
      <GalleryCardHeroMedia
        project={project}
        cmsOverrideBasePath={`galleryProjectOverrides.${project.id}`}
      />

      {/* 2 · Galeri horizontal */}
      <GalleryPhotosCarousel
        projectId={project.id}
        projectName={project.name}
        photos={project.galleryPhotos ?? []}
        cmsGalleryBasePath={`galleryProjectOverrides.${project.id}`}
      />

      <div className="relative space-y-4 border-t border-border px-5 pb-5 pt-5 dark:border-white/[0.1] md:space-y-3.5 md:px-6 md:pb-5 md:pt-5">
        {/* Informasi proyek */}
        <div className="space-y-2 border-b border-border pb-3.5 dark:border-white/[0.06]">
          <h2 className="text-balance text-[1.15rem] font-semibold leading-snug tracking-tight text-foreground md:text-lg dark:text-white">
            {project.name}
          </h2>
          <div className="border-t border-border pt-2 dark:border-white/[0.1]">
            <p className="text-[0.95rem] leading-snug text-muted-foreground md:text-sm dark:text-slate-400">
              {project.description}
            </p>
          </div>
        </div>

        {/* Detail: kiri lokasi+kategori, kanan tipe+tahun */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[0.95rem] md:text-sm">
          <div className="flex flex-col gap-3">
            <div className="space-y-0.5">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground dark:text-slate-500">
                Lokasi
              </dt>
              <dd className="font-medium leading-snug text-foreground dark:text-slate-100">{project.location}</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground dark:text-slate-500">
                Kategori
              </dt>
              <dd className="font-medium leading-snug text-foreground dark:text-slate-100">{project.category}</dd>
            </div>
          </div>
          <div className="flex flex-col gap-3 border-l border-border pl-11 dark:border-white/[0.12] sm:pl-16">
            <div className="space-y-0.5">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground dark:text-slate-500">
                Tipe sistem
              </dt>
              <dd className="font-medium leading-snug text-foreground dark:text-slate-100">{project.systemType}</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground dark:text-slate-500">
                Tahun
              </dt>
              <dd className="font-medium leading-snug text-foreground tabular-nums dark:text-slate-100">
                {project.year?.trim() ? project.year.trim() : "—"}
              </dd>
            </div>
          </div>
        </dl>

        {/* Progress */}
        <div className="space-y-1.5 pt-0">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground dark:text-slate-500">
            <span>Progress</span>
            <span className="tabular-nums text-foreground dark:text-slate-300">{pct !== null ? `${pct}%` : "—"}</span>
          </div>
          {pct !== null ? (
            <div className="h-[6px] w-full overflow-hidden rounded-full bg-muted ring-1 ring-border dark:bg-white/[0.07] dark:ring-white/[0.04]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-400"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          ) : (
            <div
              className="h-[6px] w-full rounded-full bg-muted/80 ring-1 ring-border dark:bg-white/[0.05] dark:ring-white/[0.04]"
              aria-hidden
            />
          )}
        </div>

        {showAdminActions ? (
          <div className="flex flex-col gap-2 border-t border-border pt-3 dark:border-white/[0.06] sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-sky-500/40 bg-sky-500/10 px-3 py-2.5 text-sm font-semibold text-sky-800 transition-[border-color,background-color,box-shadow,transform] duration-[260ms] [transition-timing-function:var(--ease-premium-soft)] motion-safe:active:translate-y-px hover:border-sky-500/55 hover:bg-sky-500/[0.16] dark:border-sky-400/40 dark:bg-sky-500/12 dark:text-sky-100 dark:hover:border-sky-400/55 dark:hover:bg-sky-500/22 dark:hover:shadow-[0_8px_28px_-14px_rgba(56,189,248,0.35)]"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-red-500/40 bg-red-500/[0.08] px-3 py-2.5 text-sm font-semibold text-red-800 transition-[border-color,background-color,transform] duration-[260ms] [transition-timing-function:var(--ease-premium-soft)] motion-safe:active:translate-y-px hover:border-red-500/55 hover:bg-red-500/15 dark:border-red-400/35 dark:bg-red-500/10 dark:text-red-100 dark:hover:border-red-400/50 dark:hover:bg-red-500/18"
            >
              Hapus dari gallery
            </button>
          </div>
        ) : null}
      </div>
    </motion.article>
  );
}
