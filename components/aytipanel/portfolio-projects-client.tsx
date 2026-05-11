"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { PortfolioHomeHeroMedia } from "@/components/aytipanel/gallery-project-card-media";
import { GalleryPhotosCarousel } from "@/components/aytipanel/gallery-photos-carousel";
import { CmsText } from "@/components/site-cms/cms-text";
import { mergeAytiCardClass, mergeAytiIconClass } from "@/lib/ayti-icon-cold";
import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";
import { emptyPortfolioProject } from "@/lib/cms-item-factories";
import type { SiteContent } from "@/lib/site-content-model";

const portfolioCardShell = mergeAytiCardClass(
  "group min-h-0 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] transition-all duration-300 [transition-timing-function:var(--ease-premium-soft)] active:scale-[0.98] md:motion-safe:hover:-translate-y-0.5 md:hover:shadow-[var(--shadow-card-hover)] md:active:scale-100",
);

const SortList = dynamic(
  () => import("@/components/site-cms/cms-sortable-list").then((m) => m.CmsSortableList),
  { ssr: false },
);

const portfolioNavBtnClass =
  "inline-flex size-10 shrink-0 touch-manipulation items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-[opacity,transform,background-color,border-color] duration-200 [transition-timing-function:var(--ease-premium-soft)] hover:border-accent/35 hover:bg-muted-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-35 dark:border-white/20 dark:bg-white/[0.06] dark:text-white dark:hover:border-white/35 dark:hover:bg-white/10 dark:focus-visible:ring-offset-slate-950 md:size-11";

/** Garis pembatas halus navy/sky — industrial premium, bukan abu datar. */
function PortfolioMetaDivider() {
  return (
    <div
      className="h-px w-full bg-gradient-to-r from-transparent via-sky-600/22 to-transparent dark:via-sky-400/18"
      aria-hidden
    />
  );
}

const portfolioLabelClass =
  "text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-sky-200/45";

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 5l6 6-6 6" />
    </svg>
  );
}

function PortfolioProjectsStrip({
  projects,
  renderSlide,
}: {
  projects: SiteContent["portfolio"]["projects"];
  renderSlide: (project: SiteContent["portfolio"]["projects"][number], pi: number) => ReactNode;
}) {
  const stripRef = useRef<HTMLDivElement | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  /** 1-based index kartu yang dianggap “aktif” (terdekat dengan titik tengah strip). */
  const [activeSlide, setActiveSlide] = useState(1);

  const syncStripState = useCallback(() => {
    const root = stripRef.current;
    if (!root) return;
    const { scrollLeft, scrollWidth, clientWidth } = root;
    setAtStart(scrollLeft <= 2);
    setAtEnd(scrollWidth <= clientWidth + 2 || scrollLeft >= scrollWidth - clientWidth - 2);

    const n = root.children.length;
    if (n === 0) return;
    const rootRect = root.getBoundingClientRect();
    const centerX = rootRect.left + rootRect.width / 2;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < n; i++) {
      const el = root.children[i] as HTMLElement;
      const r = el.getBoundingClientRect();
      const mid = r.left + r.width / 2;
      const d = Math.abs(mid - centerX);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    setActiveSlide(best + 1);
  }, []);

  useEffect(() => {
    const root = stripRef.current;
    if (!root) return;
    syncStripState();
    root.addEventListener("scroll", syncStripState, { passive: true });
    const ro = new ResizeObserver(syncStripState);
    ro.observe(root);
    return () => {
      root.removeEventListener("scroll", syncStripState);
      ro.disconnect();
    };
  }, [syncStripState, projects.length]);

  const getStripScrollDeltaPx = useCallback(() => {
    const root = stripRef.current;
    if (!root || root.children.length === 0) return 0;
    const firstSlide = root.children[0] as HTMLElement;
    const gapParsed = parseFloat(getComputedStyle(root).gap || "0");
    const gapPx = Number.isFinite(gapParsed) ? gapParsed : 20;
    const oneCard = firstSlide.offsetWidth + gapPx;
    const isDesktop =
      typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;
    return isDesktop ? oneCard * 2 : oneCard;
  }, []);

  /** Mobile: satu kartu per aksi; desktop (md+): dua kartu terlihat — langkah geser/tombol = dua kartu. */
  const scrollStrip = useCallback(
    (dir: -1 | 1) => {
      const root = stripRef.current;
      if (!root) return;
      const delta = getStripScrollDeltaPx();
      if (!delta) return;
      root.scrollBy({ left: dir * delta, behavior: "smooth" });
    },
    [getStripScrollDeltaPx],
  );

  /** Desktop: geser horizontal (trackpad) dikelompokkan per langkah dua kartu; scroll vertikal tidak di-block. */
  useEffect(() => {
    const root = stripRef.current;
    if (!root || projects.length <= 1) return;
    const mq = window.matchMedia("(min-width: 768px)");
    let accum = 0;
    let cooldown = false;
    let cooldownTimer: ReturnType<typeof setTimeout> | undefined;

    const onWheel = (e: WheelEvent) => {
      if (!mq.matches || cooldown) return;
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      if (absX < absY * 1.15) {
        accum = 0;
        return;
      }
      if (absX < 0.5) return;
      e.preventDefault();
      accum += e.deltaX;
      const threshold = 55;
      if (Math.abs(accum) < threshold) return;
      const dir = accum > 0 ? 1 : -1;
      accum = 0;
      const delta = getStripScrollDeltaPx();
      if (!delta) return;
      cooldown = true;
      root.scrollBy({ left: dir * delta, behavior: "smooth" });
      cooldownTimer = window.setTimeout(() => {
        cooldown = false;
      }, 420);
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      root.removeEventListener("wheel", onWheel);
      if (cooldownTimer !== undefined) window.clearTimeout(cooldownTimer);
    };
  }, [projects.length, getStripScrollDeltaPx]);

  const showNav = projects.length > 1;

  return (
    <div>
      <div
        ref={stripRef}
        className="relative flex w-full min-w-0 snap-x snap-mandatory gap-5 overflow-x-auto overflow-y-visible px-4 pb-2 scroll-auto scrollbar-none overscroll-x-contain [overscroll-behavior-y:auto] transform-gpu [touch-action:manipulation] [-webkit-overflow-scrolling:touch] md:scroll-smooth md:px-0 md:pb-3"
        aria-label="Daftar proyek — geser horizontal untuk melihat lainnya"
      >
        {projects.map((project, pi) => (
          <div
            key={project.id}
            className="w-[92vw] min-w-[92vw] max-w-[92vw] shrink-0 snap-center max-md:last:pr-2 md:w-[calc((100%-1.25rem)/2)] md:min-w-[calc((100%-1.25rem)/2)] md:max-w-[calc((100%-1.25rem)/2)] md:snap-start md:last:pr-0 md:transform-gpu md:[will-change:transform]"
          >
            {renderSlide(project, pi)}
          </div>
        ))}
      </div>

      {showNav ? (
        <div className="mt-3">
          {/* Mobile: selaras indikator carousel kartu layanan — titik + “n / total · geser” */}
          <div
            className="flex flex-col items-center gap-2 px-4 md:hidden"
            aria-live="polite"
            aria-atomic="true"
          >
            <div
              className="flex items-center justify-center gap-1.5"
              role="group"
              aria-label={`Indikator proyek: ${activeSlide} dari ${projects.length}`}
            >
              {projects.map((p, i) => (
                <span
                  key={p.id}
                  role="presentation"
                  className={`h-2 shrink-0 rounded-full transition-[width,background-color] duration-300 [transition-timing-function:var(--ease-premium-out)] ${
                    i === activeSlide - 1
                      ? "w-7 bg-sky-500 dark:bg-sky-400"
                      : "w-2 bg-border dark:bg-white/22"
                  }`}
                />
              ))}
            </div>
            <p className="m-0 text-center font-mono text-[10px] font-medium tabular-nums tracking-wide text-muted-foreground">
              {activeSlide} / {projects.length} · geser
            </p>
          </div>

          {/* Desktop: teks bantuan + tombol + penanda */}
          <div className="hidden flex-col items-center gap-2 md:flex md:gap-2.5 md:px-0">
            <p className="max-w-xl text-center text-xs leading-snug text-muted-foreground">
              Geser horizontal (trackpad) atau tombol panah — di layar lebar tiap langkah memajukan dua kartu sekaligus.
            </p>
            <div className="flex items-center justify-center gap-3 md:gap-4">
              <button
                type="button"
                className={portfolioNavBtnClass}
                aria-label="Proyek sebelumnya"
                disabled={atStart}
                onClick={() => scrollStrip(-1)}
              >
                <ChevronLeftIcon className="size-[1.35rem]" />
              </button>
              <p
                className="min-w-[3.25rem] text-center font-mono text-xs font-semibold tabular-nums tracking-tight text-foreground dark:text-white/90"
                aria-live="polite"
                aria-atomic="true"
              >
                {activeSlide} / {projects.length}
              </p>
              <button
                type="button"
                className={portfolioNavBtnClass}
                aria-label="Proyek berikutnya"
                disabled={atEnd}
                onClick={() => scrollStrip(1)}
              >
                <ChevronRightIcon className="size-[1.35rem]" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function PortfolioProjectsClient({
  projects,
  locationLabel,
  workTypeLabel,
  editorAddProjectLabel,
}: {
  projects: SiteContent["portfolio"]["projects"];
  locationLabel: string;
  workTypeLabel: string;
  editorAddProjectLabel: string;
}) {
  const cms = useSiteCmsOptional();
  const edit = Boolean(cms?.eligible && cms.editMode);

  const renderCard = (project: SiteContent["portfolio"]["projects"][number], pi: number) => (
    <article className={portfolioCardShell}>
      <PortfolioHomeHeroMedia
        cmsProjectIndex={pi}
        uploadSegmentId={project.id}
        name={project.name}
        videoSrc={project.videoSrc}
        videoPosterSrc={project.videoPosterSrc}
        /* Beranda: video kartu hanya setelah interaksi; flag CMS tidak memicu autoplay di strip ini. */
        videoAutoplay={false}
        coverImageSrc={project.coverImageSrc}
        coverImageAlt={project.coverImageAlt}
      />
      <GalleryPhotosCarousel
        cmsProjectIndex={pi}
        projectId={project.id}
        projectName={project.name}
        photos={project.galleryPhotos ?? []}
      />
      {edit ? (
        <div className="border-t border-border bg-muted-bg/40 px-3 py-2 dark:border-white/[0.06] dark:bg-white/[0.03]">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Teks alt foto (aksesibilitas)
          </p>
          <ul className="m-0 list-none space-y-2 p-0">
            {(project.galleryPhotos ?? []).map((ph, gi) => (
              <li key={`${project.id}-alt-${gi}`} className="text-[11px] leading-snug">
                <span className="font-mono text-[10px] text-muted-foreground">#{gi + 1}</span>{" "}
                <CmsText
                  path={`portfolio.projects.${pi}.galleryPhotos.${gi}.alt`}
                  text={ph.alt}
                  as="span"
                  className="inline text-foreground"
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="relative border-t border-sky-500/15 bg-gradient-to-b from-slate-950/[0.03] to-transparent dark:border-sky-400/12 dark:from-white/[0.025] dark:to-transparent">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/45 to-transparent opacity-90 dark:via-sky-400/35"
          aria-hidden
        />
        <div className="px-4 pb-5 pt-5 md:px-5 md:pb-6 md:pt-6">
          <div
            className="relative overflow-hidden rounded-xl border border-sky-500/[0.14] bg-card/85 px-4 py-5 shadow-[inset_0_1px_0_0_rgba(56,189,248,0.07)] backdrop-blur-[2px] [transition-timing-function:var(--ease-premium-soft)] dark:border-sky-400/[0.12] dark:bg-[linear-gradient(168deg,rgba(15,23,42,0.42)_0%,rgba(8,12,22,0.28)_55%,rgba(6,9,18,0.15)_100%)] dark:shadow-[inset_0_1px_0_0_rgba(56,189,248,0.09),0_1px_0_0_rgba(255,255,255,0.03)] md:px-5 md:py-6"
            role="group"
            aria-label="Informasi proyek"
          >
            <span
              className="pointer-events-none absolute left-3 top-5 bottom-5 w-[3px] rounded-full bg-gradient-to-b from-sky-400/25 via-sky-500/45 to-cyan-400/30 opacity-95 shadow-[0_0_14px_rgba(56,189,248,0.12)] dark:from-sky-400/35 dark:via-sky-400/40 dark:to-cyan-400/25 md:left-4"
              aria-hidden
            />
            <div className="relative space-y-0 pl-6 md:pl-7">
              <header className="pb-4 md:pb-5">
                <h3 className="text-balance text-[1.08rem] font-semibold leading-snug tracking-tight text-foreground md:text-[1.05rem] dark:text-slate-50">
                  <CmsText
                    path={`portfolio.projects.${pi}.name`}
                    text={project.name}
                    as="span"
                    className="block"
                  />
                </h3>
              </header>

              <PortfolioMetaDivider />

              <dl className="m-0 divide-y divide-sky-500/[0.13] p-0 dark:divide-sky-400/[0.11]">
                <div className="py-4 md:py-[1.125rem]">
                  <dt className={portfolioLabelClass}>{locationLabel}</dt>
                  <dd className="mt-2.5 text-[0.95rem] font-medium leading-relaxed text-slate-800 md:text-[0.9375rem] dark:text-slate-100">
                    <CmsText
                      path={`portfolio.projects.${pi}.location`}
                      text={project.location}
                      as="span"
                      className="block"
                    />
                  </dd>
                </div>

                <div className="relative pb-1 pt-4 md:pt-[1.125rem]">
                  <span
                    className="pointer-events-none absolute -top-px left-1/2 z-[1] size-1.5 -translate-x-1/2 rounded-full bg-gradient-to-br from-sky-400/85 to-cyan-500/65 shadow-[0_0_12px_rgba(56,189,248,0.35)] ring-2 ring-card dark:from-sky-300/75 dark:to-cyan-400/55 dark:shadow-[0_0_14px_rgba(56,189,248,0.22)] dark:ring-[#0b1222]"
                    aria-hidden
                  />
                  <dt className={portfolioLabelClass}>{workTypeLabel}</dt>
                  <dd className="mt-2.5 text-[0.92rem] leading-relaxed text-slate-600 md:text-[0.9rem] dark:text-slate-300/95">
                    <CmsText
                      path={`portfolio.projects.${pi}.workType`}
                      text={project.workType}
                      as="span"
                      className="block"
                    />
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div
          className="pointer-events-none mx-4 mb-1 h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent opacity-90 md:mx-5 dark:via-sky-400/16"
          aria-hidden
        />
      </div>
    </article>
  );

  if (!edit || !cms) {
    return <PortfolioProjectsStrip projects={projects} renderSlide={(p, pi) => renderCard(p, pi)} />;
  }

  return (
    <SortList
      items={projects}
      patchPath="portfolio.projects"
      patchDeep={cms.patchDeep}
      createItem={emptyPortfolioProject}
      addLabel={editorAddProjectLabel}
      renderItem={(project, pi) =>
        renderCard(project as SiteContent["portfolio"]["projects"][number], pi)
      }
    />
  );
}
