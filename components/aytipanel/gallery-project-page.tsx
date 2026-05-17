"use client";

import { prepareProgrammaticNavigateToInternalDetail } from "@/components/common/return-section";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { GalleryProjectBackNavPinned } from "@/components/aytipanel/gallery-project-back-nav";
import { ScrollRevealSection } from "@/components/aytipanel/scroll-reveal-section";
import { SiteFooter } from "@/components/aytipanel/site-footer";
import {
  PROJECT_CATEGORIES,
  type GalleryProjectItem,
  type ProjectCategory,
} from "@/components/aytipanel/gallery-project-data";
import { GalleryProjectShowcaseCard } from "@/components/aytipanel/gallery-project-showcase-card";
import { IconSearch } from "@/components/aytipanel/icons";
import { mergeAytiCtaClass } from "@/lib/ayti-icon-cold";
import {
  lightSectionInsetX,
  lightSectionMax,
  lightSectionY,
  lightSurfaceBandWarm,
  lightSurfaceBandWhite,
} from "@/components/aytipanel/light-section-ui";
import { CmsText } from "@/components/site-cms/cms-text";
import type { SiteContent } from "@/lib/site-content-model";

const VISIBLE_STEP = 6;

/** Gallery hero — dark glass controls (enterprise), sejajar dalam kolom max ~650px */
const galleryFilterShell =
  "relative isolate z-50 pointer-events-auto mx-auto w-full max-w-[40.625rem] space-y-2.5 px-1 pt-1.5 pb-0 md:space-y-3 md:px-0 md:py-0";

const galleryPillBase =
  "inline-flex h-10 shrink-0 cursor-pointer touch-manipulation select-none items-center justify-center whitespace-nowrap rounded-full border-2 px-4 text-[13px] font-bold tracking-[0.01em] ring-1 ring-inset ring-sky-200/20 [-webkit-tap-highlight-color:transparent] transition-all duration-300 ease-out active:scale-[0.98] md:h-10 md:px-4 md:text-sm";

const galleryPillIdle =
  "border-sky-400/35 bg-background/60 text-foreground/85 hover:border-sky-400/55 hover:text-foreground";

const galleryPillActive =
  "border-sky-400/75 bg-sky-500/14 text-sky-700 ring-sky-300/45 shadow-[0_10px_24px_-16px_rgba(14,165,233,0.45)] dark:text-sky-200";

/**
 * Mode terang: kartu tema; mode gelap: glass seperti sebelumnya.
 * `text-base lg:text-sm`: iOS Safari mem-zoom halaman jika ukuran font input di bawah 16px saat fokus.
 */
const galleryFieldBase =
  "h-[50px] w-full rounded-full border-2 border-sky-400/55 bg-background/70 py-3 pl-4 pr-4 text-center text-[14px] text-foreground ring-1 ring-inset ring-sky-200/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_10px_20px_-18px_rgba(2,6,23,0.6)] transition-[border-color,box-shadow,background-color] duration-300 placeholder:text-[12px] placeholder:text-foreground/60 sm:pl-12 sm:pr-11 sm:text-left sm:placeholder:text-[14px] focus-visible:outline-none focus-visible:border-sky-400/85 focus-visible:ring-4 focus-visible:ring-sky-500/18";

type GalleryProjectPageProps = {
  initialProjects: readonly GalleryProjectItem[];
  adminDeviceAllowed: boolean;
  adminAuthenticated: boolean;
  copy: SiteContent["galleryPage"];
};

export function GalleryProjectPage({
  initialProjects,
  adminDeviceAllowed,
  adminAuthenticated,
  copy,
}: GalleryProjectPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const galleryNotice: "added" | "updated" | null =
    searchParams.get("added") === "1"
      ? "added"
      : searchParams.get("updated") === "1"
        ? "updated"
        : null;

  const [allProjects, setAllProjects] = useState<GalleryProjectItem[]>(() => [...initialProjects]);
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(VISIBLE_STEP);
  const [adminGranted, setAdminGranted] = useState(adminAuthenticated);
  const [authOpen, setAuthOpen] = useState(false);
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [postAuthAction, setPostAuthAction] = useState<null | (() => void)>(null);
  const categoryCtaLabel: Record<ProjectCategory, string> = useMemo(
    () => ({
      All: copy.categoryLabels.all,
      "Cold Storage": copy.categoryLabels.coldStorage,
      "CS Portable": copy.categoryLabels.csPortable,
      "ABF (Air Blast Freezer)": copy.categoryLabels.abf,
      "Proses Area": copy.categoryLabels.prosesArea,
      "Clean Room": copy.categoryLabels.cleanRoom,
      "Refrigeration System": copy.categoryLabels.refrigeration,
      Maintenance: copy.categoryLabels.maintenance,
    }),
    [copy.categoryLabels],
  );

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allProjects.filter((project) => {
      const byCategory = activeCategory === "All" || project.category === activeCategory;
      const byQuery =
        q.length === 0 ||
        [
          project.name,
          project.category,
          project.location,
          project.year ?? "",
          project.systemType,
          project.description,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);

      return byCategory && byQuery;
    });
  }, [activeCategory, allProjects, searchQuery]);

  const visibleProjects = useMemo(
    () => filteredProjects.slice(0, visibleCount),
    [filteredProjects, visibleCount],
  );
  const hasSearchQuery = searchQuery.trim().length > 0;
  const handleCategoryTap = useCallback((category: ProjectCategory) => {
    setActiveCategory(category);
    setVisibleCount(VISIBLE_STEP);
  }, []);

  const runAdminAction = useCallback(
    (action: () => void) => {
      if (!adminDeviceAllowed) return;
      if (adminGranted) {
        action();
        return;
      }
      setPostAuthAction(() => action);
      setAuthError(null);
      setAuthPassword("");
      setAuthOpen(true);
    },
    [adminDeviceAllowed, adminGranted],
  );

  const submitAdminPassword = useCallback(async () => {
    if (!adminDeviceAllowed || authSubmitting) return;
    setAuthSubmitting(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/gallery-admin/auth", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: authPassword }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(json?.error ?? copy.authDeniedError);
      }
      setAdminGranted(true);
      setAuthOpen(false);
      setAuthPassword("");
      const action = postAuthAction;
      setPostAuthAction(null);
      action?.();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : copy.authDeniedError);
    } finally {
      setAuthSubmitting(false);
    }
  }, [adminDeviceAllowed, authPassword, authSubmitting, copy.authDeniedError, postAuthAction]);

  const handleDeleteProject = useCallback(async (project: GalleryProjectItem) => {
    const confirmText = copy.deleteConfirmTemplate.replace("{name}", project.name);
    if (!window.confirm(confirmText)) return;
    try {
      const res = await fetch(`/api/gallery-projects/${encodeURIComponent(project.id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(json?.error ?? copy.deleteFailedError);
      }
      setAllProjects((prev) => prev.filter((p) => p.id !== project.id));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : copy.deleteFailedError);
    }
  }, [copy.deleteConfirmTemplate, copy.deleteFailedError]);

  useEffect(() => {
    if (!galleryNotice) return;
    const id = window.setTimeout(() => {
      router.replace(pathname);
    }, 6000);
    return () => clearTimeout(id);
  }, [galleryNotice, pathname, router]);

  return (
    <div className="flex min-h-full min-w-0 max-w-full flex-col overflow-x-clip bg-background text-foreground [touch-action:pan-y_pinch-zoom]">
      <main className="min-w-0 max-w-full flex-1 overflow-x-clip pb-24 md:pb-28 [touch-action:pan-y_pinch-zoom]">
        <section
          className={`scroll-mt-24 ${lightSurfaceBandWarm} ${lightSectionInsetX} py-5 sm:py-6 md:py-8`}
          aria-labelledby="gallery-project-heading"
        >
          <div className={`${lightSectionMax} space-y-4 md:space-y-3.5`}>
            <GalleryProjectBackNavPinned />
            <header className="mx-auto max-w-4xl space-y-0.5 pb-2 text-center md:space-y-1.5 md:pb-1.5">
              <div
                className="mx-auto h-px w-14 shrink-0 rounded-full bg-gradient-to-r from-transparent via-sky-500/35 to-transparent md:w-16 dark:via-sky-400/45"
                aria-hidden
              />
              <h1
                id="gallery-project-heading"
                className="text-balance text-[1.5rem] font-semibold leading-[1.18] tracking-[-0.015em] text-foreground sm:text-3xl md:text-[2rem] md:leading-[1.18] lg:text-[2.25rem]"
              >
                <span className="flex w-full min-w-0 items-center justify-center gap-1.5 sm:gap-2.5">
                  <span
                    className="h-px min-h-px min-w-[1.25rem] max-w-[5.5rem] flex-1 rounded-full bg-gradient-to-r from-transparent via-sky-500/38 to-sky-600/55 dark:via-sky-400/42 dark:to-sky-300/58"
                    aria-hidden
                  />
                  <span className="max-w-[min(100%,38rem)] min-w-0 bg-gradient-to-r from-sky-700 via-sky-600 to-sky-700 bg-clip-text px-0.5 text-balance text-center text-[1.5rem] font-semibold leading-[1.18] tracking-[-0.015em] text-transparent sm:text-3xl md:text-[2rem] md:leading-[1.18] lg:text-[2.25rem] dark:from-sky-200 dark:via-sky-300 dark:to-sky-200">
                    <CmsText path="galleryPage.title" text={copy.title} as="span" className="inline" />
                  </span>
                  <span
                    className="h-px min-h-px min-w-[1.25rem] max-w-[5.5rem] flex-1 rounded-full bg-gradient-to-l from-transparent via-sky-500/38 to-sky-600/55 dark:via-sky-400/42 dark:to-sky-300/58"
                    aria-hidden
                  />
                </span>
              </h1>
              <div
                className="mx-auto mt-2.5 block h-[2px] w-12 rounded-full bg-gradient-to-r from-sky-400/0 via-sky-500/95 to-sky-400/0 shadow-[0_0_10px_rgba(14,165,233,0.5)] md:mt-3 md:w-16 md:via-sky-500/85 md:shadow-[0_0_8px_rgba(14,165,233,0.35)]"
                aria-hidden
              />
            </header>

            <div className={galleryFilterShell}>
              <section
                className="relative z-50 pointer-events-auto"
                aria-label={copy.filterAriaLabel}
              >
                <div className="-mx-0.5 overflow-x-auto pb-0.5 [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
                  <div className="flex min-w-max items-center gap-2 px-0.5">
                    {PROJECT_CATEGORIES.map((category) => {
                      const active = activeCategory === category;
                      return (
                        <button
                          key={category}
                          type="button"
                          aria-pressed={active}
                          onClick={() => handleCategoryTap(category)}
                          className={`pointer-events-auto snap-start ${galleryPillBase} ${active ? galleryPillActive : galleryPillIdle}`}
                        >
                          {categoryCtaLabel[category]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              <p className="px-1 text-center text-[10px] font-medium leading-relaxed text-foreground/80 sm:text-xs">
                <CmsText path="galleryPage.resultPrefix" text={copy.resultPrefix} as="span" className="inline" />{" "}
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-sky-500/14 px-1.5 py-[1px] text-[10px] font-semibold text-sky-700 dark:bg-sky-400/25 dark:text-sky-100">
                  {filteredProjects.length}
                </span>{" "}
                <CmsText path="galleryPage.resultCategoryText" text={copy.resultCategoryText} as="span" className="inline" />{" "}
                <span className="font-semibold text-sky-700 dark:text-sky-300">{activeCategory}</span>
                {hasSearchQuery ? (
                  <>
                    {" "}
                    <CmsText path="galleryPage.resultSearchPrefix" text={copy.resultSearchPrefix} as="span" className="inline" />{" "}
                    <span className="text-foreground">“{searchQuery.trim()}”</span>
                  </>
                ) : null}
              </p>

              <div className="sticky top-[calc(var(--site-mobile-header-height,88px)+0.35rem)] z-30 md:static">
                <label className="relative block min-h-0 min-w-0 flex-1 sm:flex-[2]">
                  <span className="pointer-events-none absolute left-3 top-1/2 z-[1] hidden -translate-y-1/2 text-sky-700/85 dark:text-sky-200/85 sm:block">
                    <IconSearch className="size-[0.95rem] shrink-0" aria-hidden />
                  </span>
                  <input
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setVisibleCount(VISIBLE_STEP);
                    }}
                    type="search"
                    placeholder={copy.searchPlaceholder}
                    aria-label={copy.searchAriaLabel}
                    suppressHydrationWarning
                    className={galleryFieldBase}
                  />
                  {hasSearchQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setVisibleCount(VISIBLE_STEP);
                      }}
                      className="absolute right-3 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-border/75 bg-background/85 text-[12px] text-foreground/85 transition-colors hover:bg-background"
                      aria-label="Hapus pencarian"
                    >
                      ×
                    </button>
                  ) : null}
                </label>
              </div>
            </div>
          </div>
        </section>

        <ScrollRevealSection>
        <section className={`${lightSurfaceBandWhite} ${lightSectionY} max-md:pt-2`} aria-label={copy.listAriaLabel}>
          <div className={`${lightSectionMax} space-y-5`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeCategory}-${searchQuery}`}
                data-gallery-card-swipe="true"
                className="relative flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-visible px-4 pb-2 scroll-auto scrollbar-none overscroll-x-contain [overscroll-behavior-y:auto] transform-gpu [touch-action:manipulation] [-webkit-overflow-scrolling:touch] md:scroll-smooth lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0 lg:snap-none xl:grid-cols-3 xl:gap-6"
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-5 bg-gradient-to-r from-background via-background/70 to-transparent lg:hidden"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-5 bg-gradient-to-l from-background via-background/70 to-transparent lg:hidden"
                  aria-hidden
                />
                {visibleProjects.map((project) => (
                  <div
                    key={project.id}
                    className="mt-1 w-[92vw] min-w-[92vw] max-w-[92vw] snap-center first:ml-0 last:pr-4 transition-all duration-300 [transition-timing-function:var(--ease-premium-soft)] active:scale-[0.98] md:transform-gpu md:[will-change:transform] lg:mt-0 lg:w-full lg:min-w-0 lg:max-w-none lg:snap-start lg:pr-0 lg:will-change-auto lg:active:scale-100"
                  >
                    <GalleryProjectShowcaseCard
                      project={project}
                      showAdminActions={adminDeviceAllowed}
                      onDelete={() => runAdminAction(() => void handleDeleteProject(project))}
                      onEdit={() =>
                        runAdminAction(() => {
                          prepareProgrammaticNavigateToInternalDetail();
                          router.push(`/gallery-project/edit/${encodeURIComponent(project.id)}`);
                        })
                      }
                    />
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

            {filteredProjects.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
                {hasSearchQuery ? (
                  <>
                    {copy.emptyNoResultPrefix} <strong>{activeCategory}</strong> {copy.emptyNoResultSearchSuffix}{" "}
                    <strong>“{searchQuery.trim()}”</strong>.
                  </>
                ) : (
                  <>
                    {copy.emptyNoCategoryPrefix} <strong>{activeCategory}</strong> saat ini.
                  </>
                )}
              </div>
            ) : null}

            {filteredProjects.length > visibleProjects.length ? (
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + VISIBLE_STEP)}
                  className={mergeAytiCtaClass(
                    "inline-flex min-h-11 items-center justify-center rounded-[10px] border border-sky-500/35 bg-sky-500/12 px-5 py-2.5 text-sm font-semibold text-foreground transition-[transform,box-shadow,border-color,background-color] duration-250 hover:border-sky-400/55 hover:bg-sky-500/18 hover:shadow-[0_10px_28px_-16px_rgba(56,189,248,0.7)] motion-safe:hover:-translate-y-0.5",
                  )}
                >
                  {copy.loadMoreLabel}
                </button>
              </div>
            ) : null}
          </div>
        </section>
        </ScrollRevealSection>
        <SiteFooter />
      </main>

      {adminDeviceAllowed ? (
        <button
          type="button"
          onClick={() =>
            runAdminAction(() => {
              prepareProgrammaticNavigateToInternalDetail();
              router.push("/gallery-project/tambah");
            })
          }
          className="pointer-events-auto fixed bottom-6 right-6 z-[90] inline-flex min-h-11 max-w-[calc(100vw-3rem)] items-center justify-center rounded-[10px] border border-sky-500/35 bg-gradient-to-r from-sky-500/18 via-blue-600/18 to-sky-500/18 px-4 py-2.5 text-sm font-semibold text-foreground shadow-[0_10px_40px_-12px_rgba(56,189,248,0.55),var(--shadow-card)] backdrop-blur-sm transition-[transform,box-shadow,border-color,background-color] duration-250 hover:border-sky-400/55 hover:from-sky-500/26 hover:via-blue-600/24 hover:to-sky-500/26 hover:shadow-[0_12px_36px_-14px_rgba(56,189,248,0.65)] motion-safe:hover:-translate-y-0.5 supports-[padding:max(0px)]:bottom-[max(1.5rem,env(safe-area-inset-bottom))] supports-[padding:max(0px)]:right-[max(1.5rem,env(safe-area-inset-right))]"
          aria-label={copy.addProjectLabel}
        >
          {copy.addProjectLabel}
        </button>
      ) : null}

      <AnimatePresence>
        {authOpen ? (
          <motion.div
            key="gallery-admin-auth"
            className="fixed inset-0 z-[190] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              onClick={() => {
                if (authSubmitting) return;
                setAuthOpen(false);
                setPostAuthAction(null);
              }}
              className="absolute inset-0 bg-[#020617]/80 backdrop-blur-[2px]"
              aria-label={copy.authCloseAriaLabel}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full max-w-sm rounded-2xl border border-white/15 bg-[linear-gradient(165deg,rgba(15,23,42,0.96),rgba(2,6,23,0.96))] p-5 text-slate-100 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-300/85">
                {copy.authAccessBadge}
              </p>
              <h2 className="mt-2 text-lg font-semibold text-white">{copy.authTitle}</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-300">
                {copy.authLead}
              </p>
              <label className="mt-4 block space-y-1.5">
                <span className="text-xs font-medium text-slate-300">{copy.authPasswordLabel}</span>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="h-11 w-full rounded-xl border border-white/15 bg-[#020617]/85 px-3.5 text-base text-white outline-none transition-[border-color,box-shadow] focus:border-sky-400/55 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.2)] lg:text-sm"
                  placeholder="••••••••"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void submitAdminPassword();
                    }
                  }}
                />
              </label>
              {authError ? (
                <p className="mt-2 text-xs font-medium text-red-300" role="alert">
                  {authError}
                </p>
              ) : null}
              <div className="mt-4 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (authSubmitting) return;
                    setAuthOpen(false);
                    setPostAuthAction(null);
                  }}
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10"
                >
                  {copy.authCancelLabel}
                </button>
                <button
                  type="button"
                  onClick={() => void submitAdminPassword()}
                  disabled={authSubmitting || authPassword.trim().length === 0}
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-sky-400/40 bg-sky-500/20 px-3 text-sm font-semibold text-sky-100 transition-colors hover:bg-sky-500/28 disabled:opacity-50"
                >
                  {authSubmitting ? copy.authContinueBusyLabel : copy.authContinueLabel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}

        {galleryNotice ? (
          <motion.div
            key={`gallery-toast-${galleryNotice}`}
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto fixed bottom-6 left-1/2 z-[100] w-[min(100%-2rem,26rem)] -translate-x-1/2 supports-[padding:max(0px)]:bottom-[max(1.5rem,env(safe-area-inset-bottom))]"
          >
            <div
              className={
                galleryNotice === "added"
                  ? "flex items-start gap-3 rounded-xl border border-emerald-400/35 bg-[linear-gradient(145deg,rgba(6,78,59,0.95),rgba(15,23,42,0.97))] px-4 py-3.5 text-sm text-emerald-50 shadow-[0_12px_40px_-14px_rgba(16,185,129,0.45),0_0_0_1px_rgba(16,185,129,0.12)]"
                  : "flex items-start gap-3 rounded-xl border border-sky-400/40 bg-[linear-gradient(145deg,rgba(12,74,110,0.95),rgba(15,23,42,0.97))] px-4 py-3.5 text-sm text-sky-50 shadow-[0_12px_40px_-14px_rgba(56,189,248,0.4),0_0_0_1px_rgba(56,189,248,0.12)]"
              }
            >
              <span
                className={
                  galleryNotice === "added"
                    ? "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/25 text-base font-bold text-emerald-200"
                    : "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-500/25 text-base font-bold text-sky-200"
                }
              >
                ✓
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="font-semibold leading-tight text-white">
                  {galleryNotice === "added" ? copy.toastAddedTitle : copy.toastUpdatedTitle}
                </p>
                <p
                  className={
                    galleryNotice === "added"
                      ? "mt-1 text-[13px] leading-relaxed text-emerald-100/90"
                      : "mt-1 text-[13px] leading-relaxed text-sky-100/90"
                  }
                >
                  {galleryNotice === "added" ? (
                    <>
                      {copy.toastAddedBodyPrefix}
                      <code className="rounded bg-black/30 px-1 py-0.5 font-mono text-[11px] text-emerald-100">
                        public/images/
                      </code>
                      {copy.toastAddedBodySuffix}
                    </>
                  ) : (
                    <>{copy.toastUpdatedBody}</>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.replace(pathname)}
                className={
                  galleryNotice === "added"
                    ? "shrink-0 rounded-lg p-1.5 text-emerald-200/90 transition-colors hover:bg-white/10 hover:text-white"
                    : "shrink-0 rounded-lg p-1.5 text-sky-200/90 transition-colors hover:bg-white/10 hover:text-white"
                }
                aria-label={copy.toastCloseAriaLabel}
              >
                ×
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

    </div>
  );
}
