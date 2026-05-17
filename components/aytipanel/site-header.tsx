"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Fragment,
  startTransition,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigationTransition } from "@/components/common/app-navigation-transition";
import { navigateLandingHashFromNav, scrollLandingHomeTop } from "@/components/common/home-nav-scroll";
import {
  parseProductDetailSlug,
} from "@/lib/product-listing-sections";
import {
  detectVisibleHomeLandingSectionId,
  prepareNavigateFromListingToProductDetail,
  prepareNavigateToInternalDetail,
  prepareNavigateToProductDetail,
  saveInternalProductReturnPath,
  setGalleryProjectReturnFromNavbar,
} from "@/components/common/return-section";
import { HeaderSiteSearchDialog } from "@/components/aytipanel/header-site-search-dialog";
import { IconSearch } from "@/components/aytipanel/icons";
import { buildHeaderSiteSearchTargets } from "@/lib/header-site-search-targets";
import { useBandedScrollY } from "@/lib/use-banded-scroll-y";
import { CmsImage } from "@/components/site-cms/cms-image";
import { CmsText } from "@/components/site-cms/cms-text";
import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";
import { createDefaultSiteContent } from "@/lib/site-content-defaults";
import type { SeoArticle } from "@/lib/seo-articles/types";
import type { SiteContent } from "@/lib/site-content-model";

/** Di bawah lapisan ini = konten halaman; di atas = bilah header + menu mobile. */
const Z_HEADER = 60_000;

const MOBILE_MENU_MQ = "(max-width: 767.98px)";

const HOME_NAV_HREF = "/#beranda";
const FALLBACK_HEADER = createDefaultSiteContent().header;


/** Fallback statis — dipakai hanya jika CMS tidak mengisi logo terang maupun gelap. */
const FALLBACK_HEADER_LOGO = "/images/logo_ayti.png";

/** Ukuran intrinsik untuk Next/Image & `<img>` (proporsi lebar:tinggi logo header). */
const HEADER_LOGO_IMG_WIDTH = 180;
const HEADER_LOGO_IMG_HEIGHT = 50;

/**
 * Tanpa logoDark terpisah: satu aset logo (logoLight atau fallback).
 */
function resolveHeaderBrandLogoSrcs(siteSettings?: SiteContent["siteSettings"]) {
  const rawLight = siteSettings?.brandAssets?.logoLight?.trim() ?? "";
  const rawDark = siteSettings?.brandAssets?.logoDark?.trim() ?? "";
  const primary = rawLight || rawDark || FALLBACK_HEADER_LOGO;
  return {
    logoLightSrc: rawLight ? rawLight : primary,
    logoDarkSrc: rawDark ? rawDark : primary,
  };
}

function CmsBrandLogoImg({
  src,
  className,
}: {
  src: string;
  className: string;
}) {
  const s = src.trim();
  const shown = s || FALLBACK_HEADER_LOGO;
  if (/^https?:\/\//.test(shown)) {
    return (
      <img
        key={shown}
        src={shown}
        alt=""
        className={className}
        width={HEADER_LOGO_IMG_WIDTH}
        height={HEADER_LOGO_IMG_HEIGHT}
      />
    );
  }
  return (
    <Image
      key={shown}
      src={shown}
      alt=""
      width={HEADER_LOGO_IMG_WIDTH}
      height={HEADER_LOGO_IMG_HEIGHT}
      className={className}
      priority={false}
      fetchPriority="low"
      decoding="async"
      loading="eager"
    />
  );
}

function logoSrcUnoptimized(src: string) {
  const s = src.trim();
  return s.length === 0 || /^https?:\/\//.test(s);
}

/** Mode edit CMS: klik logo untuk Media/File; simpan batch seperti gambar section lain. */
function HeaderLogoMark({
  logoLightSrc,
  logoDarkSrc,
  compact,
}: {
  logoLightSrc: string;
  logoDarkSrc: string;
  /** Navbar lebih ringkas saat scroll — logo sedikit mengecil */
  compact?: boolean;
}) {
  const cms = useSiteCmsOptional();
  const edit = Boolean(cms?.eligible && cms.editMode);
  const imgCls = compact
    ? "h-7 w-auto max-h-9 object-contain transition-[height,max-height] duration-500 [transition-timing-function:var(--ease-premium-soft)] sm:h-8 sm:max-h-10 md:h-9 md:max-h-[2.5rem]"
    : "h-8 w-auto max-h-10 object-contain transition-[height,max-height] duration-500 [transition-timing-function:var(--ease-premium-soft)] sm:h-9 sm:max-h-[2.75rem] md:h-[2.75rem] md:max-h-[3rem]";
  /** Satu node flex di dalam Link + ruang untuk kontrol CMS yang absolute */
  const wrapCls = `relative inline-flex shrink-0 items-center ${edit ? "overflow-visible" : ""}`;

  if (!edit) {
    const logoSrc = logoLightSrc || logoDarkSrc || FALLBACK_HEADER_LOGO;
    return (
      <span className={wrapCls}>
        <CmsBrandLogoImg src={logoSrc} className={imgCls} />
      </span>
    );
  }

  const light = logoLightSrc || logoDarkSrc || FALLBACK_HEADER_LOGO;
  const dark = logoDarkSrc || light;

  return (
    <span className={wrapCls}>
      <CmsImage
        key={`hdr-logo-l-${light}`}
        srcPath="siteSettings.brandAssets.logoLight"
        src={light}
        alt=""
        width={HEADER_LOGO_IMG_WIDTH}
        height={HEADER_LOGO_IMG_HEIGHT}
        priority={false}
        fetchPriority="low"
        decoding="async"
        loading="eager"
        className={imgCls}
        imageClassName={imgCls}
        uploadScope="partners"
        uploadSegment="header"
        enableZoom={false}
        unoptimized={logoSrcUnoptimized(light)}
      />
      {dark !== light ? (
        <CmsImage
          key={`hdr-logo-d-${dark}`}
          srcPath="siteSettings.brandAssets.logoDark"
          src={dark}
          alt=""
          width={HEADER_LOGO_IMG_WIDTH}
          height={HEADER_LOGO_IMG_HEIGHT}
          priority={false}
          fetchPriority="low"
          decoding="async"
          loading="eager"
          className="sr-only"
          imageClassName={imgCls}
          uploadScope="partners"
          uploadSegment="header"
          enableZoom={false}
          unoptimized={logoSrcUnoptimized(dark)}
        />
      ) : null}
    </span>
  );
}

function hashFromHref(href: string): string | null {
  if (!href.startsWith("/#") && !href.startsWith("#")) return null;
  const i = href.indexOf("#");
  return i >= 0 ? href.slice(i) : null;
}

function isNavItemActive(
  itemHref: string,
  pathname: string,
  activeHash: string,
): boolean {
  const href = itemHref.trim();

  if (!href.startsWith("/#")) {
    const pathOnly = href.split("#")[0] ?? href;
    if (pathOnly.length > 1) {
      return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
    }
    return false;
  }

  if (pathname !== "/") return false;
  const frag = hashFromHref(itemHref);
  if (itemHref === HOME_NAV_HREF)
    return activeHash === "" || activeHash === "#beranda";
  return frag != null && activeHash === frag;
}

function shouldSkipMobileNavInteraction(e: React.PointerEvent | React.MouseEvent) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return true;
  if ("button" in e && typeof e.button === "number" && e.button !== 0) return true;
  return false;
}

/**
 * Desktop: pill glass halus + dot aktif halus.
 * Mobile sheet: tipografi rapi, border kiri halus saat aktif — tanpa glow berat.
 */
const desktopLinkBase =
  "relative inline-flex min-h-7 items-center rounded-[10px] px-3 py-1 text-[0.8125rem] font-semibold leading-none tracking-wide text-foreground/82 transition-[color,background-color,box-shadow,transform] duration-[380ms] [transition-timing-function:var(--ease-premium-out)] hover:bg-white/[0.06] hover:text-foreground hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] dark:text-white/82 dark:hover:bg-white/[0.05] dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400/50 md:min-h-[1.625rem] md:rounded-lg md:px-1.5 md:py-0.5 md:text-[0.78rem] md:tracking-normal lg:px-2.5 lg:text-[0.8125rem]";

const desktopLinkActive =
  "bg-white/[0.1] text-sky-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_0_0_1px_rgba(56,189,248,0.22)_inset] ring-1 ring-sky-400/28 dark:bg-sky-500/[0.14] dark:text-sky-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_0_1px_rgba(56,189,248,0.18)_inset] dark:ring-sky-400/35";

const headerIconBtnBase =
  "inline-flex cursor-pointer items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-foreground/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-sm transition-[border-color,box-shadow,background-color,transform,color] duration-[380ms] [transition-timing-function:var(--ease-premium-soft)] hover:border-sky-400/28 hover:bg-white/[0.07] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_6px_22px_-14px_rgba(56,189,248,0.22)] motion-safe:active:scale-[0.97] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white/90 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] dark:hover:border-sky-400/35 dark:hover:bg-white/[0.07]";

const mobileLinkBase =
  "flex min-h-[46px] w-full items-center rounded-lg border-l-[3px] border-transparent py-2.5 pl-3.5 pr-3.5 text-[0.9375rem] font-bold leading-snug tracking-[0.015em] text-slate-950/92 transition-[border-color,background-color,color] duration-[260ms] [transition-timing-function:var(--ease-premium-soft)] [-webkit-tap-highlight-color:transparent] active:bg-muted-bg/35 dark:text-white/94 dark:[text-shadow:0_1px_16px_rgba(0,0,0,0.48)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none";
const mobileLinkActive =
  "border-accent bg-accent-soft/68 text-sky-800 dark:bg-accent-soft/38 dark:text-sky-50";

export function SiteHeader({
  header = FALLBACK_HEADER,
  homeLayout,
  siteContent,
  siteSettings,
  seoArticles,
}: {
  header?: SiteContent["header"];
  /** Urutan & penyembunyian section beranda — untuk daftar pencarian header */
  homeLayout?: SiteContent["homeLayout"];
  /** Konten situs — dipakai untuk indeks pencarian (WA, alamat, produk, halaman) */
  siteContent?: SiteContent;
  /** Opsional: logo terang/gelap dari Site Settings CMS */
  siteSettings?: SiteContent["siteSettings"];
  /** Artikel /artikel yang dipublikasikan — indeks pencarian header (judul, isi, FAQ). */
  seoArticles?: readonly SeoArticle[];
}) {
  const { logoLightSrc, logoDarkSrc } = useMemo(
    () => resolveHeaderBrandLogoSrcs(siteSettings),
    [siteSettings?.brandAssets?.logoDark, siteSettings?.brandAssets?.logoLight],
  );

  const navItems = useMemo(() => header.navItems, [header.navItems]);
  /** Navbar konsumen sama dengan struktur utama (SEO pages tidak ada di bilah ini). */
  const visibleNavItems = navItems;
  const desktopNavItemsOrdered = useMemo(() => navItems, [navItems]);

  const desktopSearchAfterItemId = useMemo(() => {
    const g = navItems.find((i) => i.id === "nav-gallery-proyek");
    if (g) return "nav-gallery-proyek";
    return navItems[navItems.length - 1]?.id ?? "nav-kontak";
  }, [navItems]);

  const mobileNavIds = useMemo(() => header.mobileNavIds, [header.mobileNavIds]);
  const headerForNav = useMemo(
    () => ({ ...header, navItems, mobileNavIds }),
    [header, navItems, mobileNavIds],
  );
  const siteSearchTargets = useMemo(
    () => buildHeaderSiteSearchTargets(header, homeLayout, siteContent, seoArticles),
    [header, homeLayout, siteContent, seoArticles],
  );

  const mobileNavItems = useMemo(
    () =>
      headerForNav.mobileNavIds
        .map((id) => navItems.find((n) => n.id === id))
        .filter((item): item is SiteContent["header"]["navItems"][number] => Boolean(item)),
    [headerForNav.mobileNavIds, navItems],
  );
  const visibleMobileNavItems = mobileNavItems;
  const navSectionHashes: readonly string[] = useMemo(
    () =>
      visibleNavItems
        .map((item) => {
          const i = item.href.indexOf("#");
          return i >= 0 ? item.href.slice(i) : "";
        })
        .filter((h) => h.length > 1),
    [visibleNavItems],
  );

  const pathname = usePathname();
  const { navigate: spaNavigate } = useNavigationTransition();
  const mobileSheetId = useId();
  const headerRef = useRef<HTMLElement>(null);
  const desktopNavRef = useRef<HTMLElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const pathnameOnNavRef = useRef(pathname);

  const [menuOpen, setMenuOpen] = useState(false);
  const [siteSearchOpen, setSiteSearchOpen] = useState(false);
  const [navHash, setNavHash] = useState("");
  const [activeHash, setActiveHash] = useState("");
  const scrollBand = useBandedScrollY();
  const spyLockUntilRef = useRef(0);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    requestAnimationFrame(() => menuBtnRef.current?.blur());
  }, []);

  const syncNavHashFromWindow = useCallback(() => {
    if (typeof window === "undefined") return;
    setNavHash(window.location.hash);
  }, []);

  const onSyncHashFromHref = useCallback((href: string) => {
    const h = hashFromHref(href);
    if (h === null) return;
    setNavHash(h);
    setActiveHash(h);
    spyLockUntilRef.current = Date.now() + 1050;
  }, []);

  const toggleMenu = useCallback(() => {
    setMenuOpen((open) => !open);
  }, []);

  const prepareReturnBeforeGalleryNav = useCallback(
    (href: string) => {
      let targetPath = href;
      try {
        targetPath = new URL(href, window.location.origin).pathname;
      } catch {
        /* pakai href mentah */
      }
      if (
        targetPath.startsWith("/gallery-project") ||
        targetPath === "/gallery-project"
      ) {
        setGalleryProjectReturnFromNavbar();
      }
    },
    [pathname],
  );

  const onMobileNavPick = useCallback(
    (href: string) => {
      closeMenu();
      prepareReturnBeforeGalleryNav(href);
      onSyncHashFromHref(href);
      navigateLandingHashFromNav(pathname, href, { spaNavigate });
    },
    [closeMenu, onSyncHashFromHref, pathname, prepareReturnBeforeGalleryNav, spaNavigate],
  );

  const onDesktopNavNavigate = useCallback(
    (href: string) => {
      prepareReturnBeforeGalleryNav(href);
      onSyncHashFromHref(href);
      navigateLandingHashFromNav(pathname, href, { spaNavigate });
    },
    [onSyncHashFromHref, pathname, prepareReturnBeforeGalleryNav, spaNavigate],
  );

  const onSiteSearchPick = useCallback(
    (href: string) => {
      let targetPath = href;
      try {
        targetPath = new URL(href, window.location.origin).pathname;
      } catch {
        /* pakai href mentah */
      }
      if (targetPath.startsWith("/produk/")) {
        const productSlug = parseProductDetailSlug(targetPath);
        if (pathname === "/") {
          if (productSlug) {
            prepareNavigateToProductDetail(productSlug);
          } else {
            prepareNavigateFromListingToProductDetail("produk");
          }
        } else {
          saveInternalProductReturnPath();
        }
      } else if (
        targetPath.startsWith("/gallery-project") ||
        targetPath === "/gallery-project"
      ) {
        prepareReturnBeforeGalleryNav(href);
      } else if (targetPath.startsWith("/artikel/")) {
        prepareNavigateToInternalDetail(
          pathname === "/" ? detectVisibleHomeLandingSectionId() ?? "beranda" : "beranda",
        );
      }
      onSyncHashFromHref(href);
      navigateLandingHashFromNav(pathname, href, { spaNavigate });
    },
    [onSyncHashFromHref, pathname, prepareReturnBeforeGalleryNav, spaNavigate],
  );

  const openSiteSearch = useCallback(() => {
    closeMenu();
    setSiteSearchOpen(true);
  }, [closeMenu]);

  /**
   * Logo / brand text:
   * - Di halaman utama (`/`) — scroll halus ke paling atas, tanpa reload.
   *   Hash dibersihkan supaya scroll-spy menandai Home, bukan section lain.
   * - Di halaman selain `/` (mis. `/gallery-project`) — refresh halaman ini saja,
   *   tetap di URL yang sama (TIDAK navigasi ke `/`).
   */
  const onLogoClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (shouldSkipMobileNavInteraction(e)) {
        closeMenu();
        return;
      }
      closeMenu();
      e.preventDefault();
      if (typeof window === "undefined") return;

      if (pathname === "/") {
        if (window.location.hash) {
          history.replaceState(
            null,
            "",
            window.location.pathname + window.location.search,
          );
          setNavHash("");
          setActiveHash("");
        }
        spyLockUntilRef.current = Date.now() + 1100;
        scrollLandingHomeTop("smooth");
        return;
      }

      window.location.reload();
    },
    [closeMenu, pathname],
  );

  useLayoutEffect(() => {
    startTransition(() => {
      syncNavHashFromWindow();
    });
  }, [pathname, syncNavHashFromWindow]);

  useEffect(() => {
    const onHashOrPopState = () => {
      startTransition(() => {
        syncNavHashFromWindow();
      });
      closeMenu();
    };
    window.addEventListener("hashchange", onHashOrPopState);
    window.addEventListener("popstate", onHashOrPopState);
    return () => {
      window.removeEventListener("hashchange", onHashOrPopState);
      window.removeEventListener("popstate", onHashOrPopState);
    };
  }, [syncNavHashFromWindow, closeMenu]);

  useLayoutEffect(() => {
    if (pathnameOnNavRef.current === pathname) return;
    pathnameOnNavRef.current = pathname;
    closeMenu();
  }, [pathname, closeMenu]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(MOBILE_MENU_MQ);
    const onWide = () => {
      if (!mq.matches) closeMenu();
    };
    mq.addEventListener("change", onWide);
    return () => mq.removeEventListener("change", onWide);
  }, [closeMenu]);

  const scrolled = scrollBand >= 1;
  const scrollCompact = scrollBand >= 2;

  /**
   * Header `fixed` — ukur **baris toolbar** (bawah logo/nav), bukan sheet menu terbuka,
   * supaya `padding-top` utama stabil & konsumen `--site-mobile-header-height` tetap akurat.
   */
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(MOBILE_MENU_MQ);
    const sync = () => {
      const toolbar = toolbarRef.current;
      if (!toolbar) return;
      const bottom = Math.ceil(toolbar.getBoundingClientRect().bottom);
      document.documentElement.style.setProperty("--site-header-height", `${bottom}px`);
      if (mq.matches) {
        document.documentElement.style.setProperty("--site-mobile-header-height", `${bottom}px`);
      } else {
        document.documentElement.style.setProperty("--site-mobile-header-height", "0px");
      }
    };
    sync();
    const ro = new ResizeObserver(() => {
      window.requestAnimationFrame(sync);
    });
    const toolbar = toolbarRef.current;
    if (toolbar) ro.observe(toolbar);
    const onOrient = () => requestAnimationFrame(sync);
    window.addEventListener("orientationchange", onOrient);
    mq.addEventListener("change", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", onOrient);
      mq.removeEventListener("change", sync);
      document.documentElement.style.removeProperty("--site-header-height");
      document.documentElement.style.removeProperty("--site-mobile-header-height");
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      closeMenu();
    };
    const onPointer = (e: PointerEvent) => {
      const sheet = sheetRef.current;
      const btn = menuBtnRef.current;
      const target = e.target as Node | null;
      if (!target) return;
      if (sheet && sheet.contains(target)) return;
      if (btn && btn.contains(target)) return;
      closeMenu();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer, true);
    };
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  /**
   * Scroll-spy realtime — pendekatan campuran:
   *   1) `IntersectionObserver` memicu re-compute saat batas tepi section
   *      menyeberangi garis tipis tepat di bawah toolbar (akurat di mobile).
   *   2) `scroll` rAF sebagai cadangan untuk section sangat panjang
   *      (di mana IO bisa diam saat batas tetap di luar threshold).
   * Saat klik nav, jangan tumpang-tindih: kunci 800 ms (`spyLockUntilRef`).
   */
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname !== "/") {
      setActiveHash("");
      return;
    }

    let raf = 0;
    const compute = () => {
      raf = 0;
      if (Date.now() < spyLockUntilRef.current) return;

      /** Di atas fold: selalu Beranda — hindari false-positive "Kontak" saat layout belum tinggi. */
      if (window.scrollY < 96) {
        setActiveHash((prev) => (prev === "#beranda" ? prev : "#beranda"));
        return;
      }

      const headerBottom =
        toolbarRef.current?.getBoundingClientRect().bottom ?? 64;
      const probeY = headerBottom + 8;

      let bestId: string | null = null;
      let bestTop = -Infinity;
      let firstId: string | null = null;
      let lastId: string | null = null;

      for (const hash of navSectionHashes) {
        const el = document.getElementById(hash.slice(1));
        if (!el) continue;
        firstId ??= el.id;
        lastId = el.id;
        const r = el.getBoundingClientRect();
        if (r.top <= probeY && r.top > bestTop) {
          bestId = el.id;
          bestTop = r.top;
        }
      }

      if (!bestId) bestId = firstId;

      const doc = document.documentElement;
      const atBottom =
        window.scrollY >= 120 &&
        window.innerHeight + window.scrollY >= doc.scrollHeight - 8;
      if (atBottom && lastId) bestId = lastId;

      if (bestId) {
        const next = `#${bestId}`;
        setActiveHash((prev) => (prev === next ? prev : next));
      }
    };

    const scheduleCompute = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(compute);
    };

    compute();

    // 1) IntersectionObserver — pemicu utama (akurat & ringan di mobile).
    let observer: IntersectionObserver | null = null;
    const setupObserver = () => {
      observer?.disconnect();
      const headerBottom =
        toolbarRef.current?.getBoundingClientRect().bottom ?? 64;
      const top = Math.max(0, Math.round(headerBottom + 8));
      observer = new IntersectionObserver(scheduleCompute, {
        // Geser viewport observasi: tepi atas tepat di bawah toolbar,
        // tepi bawah hampir sama → trigger ketika section "menyeberang" garis itu.
        rootMargin: `-${top}px 0px -${Math.max(0, window.innerHeight - top - 1)}px 0px`,
        // Banyak ambang agar IO tetap memicu saat rasio persilangan berubah di section panjang
        // (bukan hanya saat melewati 0 atau 1).
        threshold: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
      });
      for (const hash of navSectionHashes) {
        const el = document.getElementById(hash.slice(1));
        if (el) observer.observe(el);
      }
    };
    setupObserver();

    // 2) Pemicu cadangan — diperingan untuk mobile:
    //    - `scroll` window pasif: cukup untuk Chrome/Safari modern (momentum scroll
    //      tetap memunculkan `scroll` event di iOS 13+ & Android Chrome).
    //    - `scrollend` menyegarkan state setelah scroll programmatic / snap.
    //    - `visualViewport` ikut saat address bar / layout viewport berubah.
    //
    //    Penting (mobile perf): TIDAK lagi memasang `touchmove` global. Listener
    //    `touchmove { capture: true }` di document menyebabkan handler dijalankan
    //    pada setiap segmen geseran jari, memicu rAF + 11× getBoundingClientRect()
    //    per frame → layout thrash + jank. Kombinasi IO + `scroll` sudah cukup.
    const onResizeOrOrient = () => {
      setupObserver();
      scheduleCompute();
    };
    const vv = window.visualViewport;
    const onScrollEnd = () => scheduleCompute();

    window.addEventListener("scroll", scheduleCompute, { passive: true });
    window.addEventListener("resize", onResizeOrOrient);
    window.addEventListener("orientationchange", onResizeOrOrient);
    window.addEventListener("scrollend", onScrollEnd as EventListener);
    vv?.addEventListener("scroll", scheduleCompute);
    vv?.addEventListener("resize", onResizeOrOrient);

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener("scroll", scheduleCompute);
      window.removeEventListener("resize", onResizeOrOrient);
      window.removeEventListener("orientationchange", onResizeOrOrient);
      window.removeEventListener("scrollend", onScrollEnd as EventListener);
      vv?.removeEventListener("scroll", scheduleCompute);
      vv?.removeEventListener("resize", onResizeOrOrient);
    };
  }, [pathname, navSectionHashes]);

  const active = activeHash || navHash;

  const toolbarPad = scrollCompact
    ? "px-3 py-1.5 sm:px-3.5 sm:py-1.5 md:px-5 md:pt-1.5 md:pb-2"
    : "px-3.5 py-2 sm:px-4 sm:py-2.5 md:px-6 md:pt-2.5 md:pb-3";

  return (
    <>
      <header
        ref={headerRef}
        data-site-header-sticky=""
        className="pointer-events-none fixed inset-x-0 top-0 z-[120] w-full border-0 bg-transparent shadow-none backdrop-blur-none"
        style={{
          zIndex: Z_HEADER,
          touchAction: "manipulation",
        }}
      >
        <div
          ref={toolbarRef}
          className={`pointer-events-auto relative mx-auto min-w-0 w-full max-w-6xl px-0 pb-1.5 pt-[max(0.3rem,env(safe-area-inset-top))] sm:pb-2 md:max-w-none md:px-0 md:pb-2 ${scrollCompact ? "md:pt-[max(0.1rem,env(safe-area-inset-top))]" : "md:pt-[max(0.18rem,env(safe-area-inset-top))]"}`}
        >
          <div
            className={`site-header-shell relative rounded-[1.125rem] md:rounded-none ${menuOpen ? "overflow-visible" : "overflow-hidden"}`}
            data-header-scrolled={scrolled ? "true" : "false"}
            data-header-compact={scrollCompact ? "true" : "false"}
          >
            <div
              className={`relative z-[2] mx-auto flex min-w-0 w-full max-w-6xl flex-nowrap items-center justify-between gap-1.5 sm:gap-2.5 md:gap-2.5 lg:gap-4 ${toolbarPad}`}
            >
          <Link
            href="/"
            className="group pointer-events-auto flex min-w-0 max-w-[min(100%,12.5rem)] shrink-0 items-center gap-2 rounded-xl py-0 pl-0.5 pr-1 outline-none transition-[color,background-color,transform] duration-[380ms] [transition-timing-function:var(--ease-premium-soft)] motion-safe:active:scale-[0.995] hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-sky-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:hover:bg-white/[0.04] sm:max-w-[min(100%,14rem)] sm:gap-2.5 md:max-w-[min(100%,16rem)] md:gap-2 md:pr-1.5 lg:max-w-[min(100%,20rem)] lg:gap-3 lg:pr-2"
            aria-label={header.logoAriaLabel}
            onClick={onLogoClick}
          >
            <span className="relative inline-flex shrink-0 rounded-[10px] bg-white/[0.06] p-[2px] ring-1 ring-slate-900/[0.07] shadow-[0_0_32px_-18px_rgba(14,165,233,0.14)] transition-[box-shadow,ring-color] duration-500 dark:bg-white/[0.04] dark:ring-white/[0.09] dark:shadow-[0_0_40px_-18px_rgba(56,189,248,0.2)] md:rounded-lg md:p-[2px]">
              <HeaderLogoMark
                logoLightSrc={logoLightSrc}
                logoDarkSrc={logoDarkSrc}
                compact={scrollCompact}
              />
            </span>
            <span
              className={`truncate font-semibold tracking-tight text-foreground/95 transition-[font-size] duration-500 [transition-timing-function:var(--ease-premium-soft)] dark:text-white/95 ${scrollCompact ? "text-[0.78rem] sm:text-[0.8125rem] md:text-[0.8125rem]" : "text-[0.8125rem] sm:text-[0.9375rem] md:text-[0.875rem] lg:text-[0.9375rem]"}`}
            >
              <CmsText path="header.brandName" text={header.brandName} as="span" className="inline" />
            </span>
          </Link>

          <nav
            ref={desktopNavRef}
            data-site-header-desktop-nav=""
            className="hidden min-w-0 flex-1 shrink items-center justify-end overflow-x-auto overflow-y-visible [scrollbar-width:thin] md:flex"
            aria-label={header.navAriaLabel}
          >
            <ul className="flex min-w-max flex-nowrap items-center justify-end gap-x-0.5 md:gap-x-1 lg:gap-x-1.5">
              {desktopNavItemsOrdered.map((item) => {
                const itemIndex = header.navItems.findIndex((n) => n.id === item.id);
                const isActive = isNavItemActive(item.href, pathname, active);
                const cls = `${desktopLinkBase} ${isActive ? desktopLinkActive : ""}`;
                return (
                  <Fragment key={item.id}>
                    <li
                      className="flex shrink-0 items-center"
                      data-nav-item-id={item.id}
                    >
                      <Link
                        href={item.href}
                        className={cls}
                        aria-current={isActive ? "page" : undefined}
                        onClick={(e) => {
                          if (shouldSkipMobileNavInteraction(e)) return;
                          e.preventDefault();
                          onDesktopNavNavigate(item.href);
                        }}
                      >
                        <span className="relative">
                          <>
                            <CmsText
                              path={`header.navItems.${itemIndex}.shortLabel`}
                              text={item.shortLabel || item.label}
                              as="span"
                              className="inline xl:hidden"
                            />
                            <CmsText
                              path={`header.navItems.${itemIndex}.label`}
                              text={item.label}
                              as="span"
                              className="hidden xl:inline"
                            />
                          </>
                          {isActive ? (
                            <span
                              aria-hidden
                              className="pointer-events-none absolute -bottom-1 left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-sky-500/90 shadow-[0_0_14px_rgba(56,189,248,0.35)] motion-safe:animate-[fadeUpSoft_280ms_cubic-bezier(0.22,0.61,0.36,1)_both] dark:bg-sky-400/85 dark:shadow-[0_0_16px_rgba(56,189,248,0.28)]"
                            />
                          ) : null}
                        </span>
                      </Link>
                    </li>
                    {item.id === desktopSearchAfterItemId ? (
                      <li key={`${item.id}-header-search`} className="flex shrink-0 items-center">
                        <button
                          type="button"
                          className={`${headerIconBtnBase} inline-flex min-h-[1.625rem] min-w-[1.625rem] items-center justify-center px-1 py-1 md:min-h-[1.625rem] md:min-w-[1.625rem] lg:min-h-7 lg:min-w-7`}
                          aria-label="Pencarian"
                          onClick={openSiteSearch}
                        >
                          <IconSearch className="size-[1.05rem] shrink-0 opacity-90" aria-hidden />
                        </button>
                      </li>
                    ) : null}
                  </Fragment>
                );
              })}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center justify-end gap-2 md:hidden">
            <button
              type="button"
              className={`${headerIconBtnBase} inline-flex h-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl [-webkit-tap-highlight-color:transparent] [touch-action:manipulation]`}
              aria-label="Pencarian"
              onClick={openSiteSearch}
            >
              <IconSearch className="h-[1.15rem] w-[1.15rem] opacity-90" aria-hidden />
            </button>
            <button
              ref={menuBtnRef}
              type="button"
              className={`${headerIconBtnBase} inline-flex h-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl [-webkit-tap-highlight-color:transparent] [touch-action:manipulation] ${menuOpen ? "border-sky-400/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_28px_-16px_rgba(56,189,248,0.25)] dark:border-sky-400/45" : ""}`}
              aria-controls={mobileSheetId}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              aria-label={menuOpen ? header.mobileMenuCloseAriaLabel : header.mobileMenuOpenAriaLabel}
              onClick={toggleMenu}
            >
              {menuOpen ? (
                <svg
                  className="ayti-icon-cold h-5 w-5 text-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="ayti-icon-cold h-5 w-5 text-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </div>
            </div>

        <nav
          ref={sheetRef}
          id={mobileSheetId}
          aria-label={header.mobileMenuAriaLabel}
          aria-hidden={!menuOpen}
          inert={!menuOpen}
          className={[
            "absolute inset-x-0 top-full z-[1] md:hidden",
            "border-t border-white/[0.12] bg-[color-mix(in_srgb,var(--header-glass-fill-solid)_94%,transparent)] backdrop-blur-xl backdrop-saturate-125 dark:border-white/[0.1] dark:bg-[color-mix(in_srgb,var(--header-glass-fill-solid)_92%,transparent)]",
            "motion-safe:transition-[opacity,transform] motion-safe:duration-[320ms] motion-safe:[transition-timing-function:var(--ease-premium-soft)] motion-reduce:transition-none",
            menuOpen
              ? "pointer-events-auto max-h-[min(60dvh,calc(100dvh-var(--site-header-height,3.75rem)))] translate-y-0 overflow-y-auto overscroll-contain rounded-b-[1.125rem] py-2 opacity-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] md:rounded-b-[1.35rem]"
              : "pointer-events-none max-h-0 -translate-y-1 overflow-hidden border-transparent py-0 opacity-0 shadow-none motion-reduce:translate-y-0",
          ].join(" ")}
        >
          <div className="mx-3 rounded-2xl border border-white/[0.2] bg-white/[0.34] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.52),0_16px_38px_-28px_rgba(15,23,42,0.62)] backdrop-blur-md dark:border-white/[0.12] dark:bg-slate-950/[0.42] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_18px_42px_-30px_rgba(0,0,0,0.8)] sm:mx-4">
            <ul className="mx-auto flex max-w-6xl flex-col gap-1">
              {visibleMobileNavItems.map((item) => {
                const isActive = isNavItemActive(item.href, pathname, active);
                const cls = `${mobileLinkBase} ${isActive ? mobileLinkActive : ""}`;
                const idx = header.navItems.findIndex((n) => n.id === item.id);
                if (idx < 0) return null;
                return (
                  <Fragment key={item.id}>
                    <li>
                      <a
                        href={item.href}
                        className={cls}
                        aria-current={isActive ? "page" : undefined}
                        onClick={(e) => {
                          if (shouldSkipMobileNavInteraction(e)) return;
                          e.preventDefault();
                          onMobileNavPick(item.href);
                        }}
                      >
                        <CmsText
                          path={`header.navItems.${idx}.shortLabel`}
                          text={item.shortLabel}
                          as="span"
                          className="inline"
                        />
                      </a>
                    </li>
                  </Fragment>
                );
              })}
            </ul>
          </div>
        </nav>
          </div>
        </div>
      </header>
      <HeaderSiteSearchDialog
        open={siteSearchOpen}
        onClose={() => setSiteSearchOpen(false)}
        targets={siteSearchTargets}
        onSelectHref={onSiteSearchPick}
        searchPlaceholder={header.siteSearchPlaceholder}
        noResultsText={header.siteSearchNoResultsText}
      />
    </>
  );
}
