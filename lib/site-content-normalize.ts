import type { SiteContent, SitePageSeoKey, SitePageSeoMap, SiteRedirectRule } from "@/lib/site-content-model";
import { normalizeFullCmsImageTransform, type CmsImageTransform } from "@/lib/cms-image-transform";
import { CONTACT_ADDRESS_LINES } from "@/components/aytipanel/constants";
import {
  normalizeRichTextValue,
  plainTextFromRichValue,
  type CmsRichTextValue,
} from "@/lib/cms-rich-text";
import {
  formatWhatsAppDisplayLocal,
  resolvePrimaryEmail,
  resolvePrimaryWhatsAppDigits,
  sanitizeEmail,
  sanitizeWhatsAppToDigits,
} from "@/lib/site-contact";
import { normalizeAbsoluteOriginCandidate } from "@/lib/site-url-resolve";
import {
  GAMBAR_PRODUK_ACCESSORIES_KANAN,
  GAMBAR_PRODUK_ACCESSORIES_KIRI,
  GAMBAR_PRODUK_SOLUSI_KANAN,
  GAMBAR_PRODUK_SOLUSI_KIRI,
  GAMBAR_PRODUK_UTAMA_KANAN,
  GAMBAR_PRODUK_UTAMA_KIRI,
} from "@/components/aytipanel/gambar-produk-paths";
import { createDefaultSiteContent } from "@/lib/site-content-defaults";
import { normalizeLayananPagesInContent } from "@/lib/layanan-pages/cms-merge";
import { normalizeLandingKotaPagesInContent } from "@/lib/landing-kota-pages/cms-merge";
import {
  pickPrimaryHeaderNav,
  primaryHeaderMobileNavIds,
} from "@/lib/site-header-primary-nav";

/** Simpan penyesuaian logo CMS (zoom/focal/fit) terklamp aman. */
function sanitizeLogoAdjustStored(raw: unknown): Partial<CmsImageTransform> | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  if (Object.keys(raw as object).length === 0) return undefined;
  return normalizeFullCmsImageTransform(raw as Partial<CmsImageTransform>);
}

function nid(prefix: string, i: number): string {
  return `${prefix}-${i}`;
}

/** Pastikan item repeater punya `id` stabil untuk drag/reorder (kompatibel data lama). */
const PORTFOLIO_TECH_SPEC_ORDER = [
  "Temperatur",
  "Kapasitas penyimpanan",
  "Sistem pendingin",
  "Insulasi Ruangan",
] as const;

function canonicalPortfolioSpecLabel(raw: string): (typeof PORTFOLIO_TECH_SPEC_ORDER)[number] | null {
  const n = raw.trim().toLowerCase();
  if (!n || n === "refrigeran") return null;
  if (n === "temperatur" || n === "temperature") return "Temperatur";
  if (n === "kapasitas penyimpanan") return "Kapasitas penyimpanan";
  if (n === "sistem pendingin") return "Sistem pendingin";
  if (n === "panel" || n === "insulasi ruangan") return "Insulasi Ruangan";
  for (const label of PORTFOLIO_TECH_SPEC_ORDER) {
    if (n === label.toLowerCase()) return label;
  }
  return null;
}

function canonicalizePortfolioTechnicalSpecs(
  specs: { label: string; value: string }[],
): { label: string; value: string }[] {
  const byLabel = new Map<string, string>();
  for (const row of specs) {
    const label = canonicalPortfolioSpecLabel(row.label);
    if (!label) continue;
    byLabel.set(label, row.value);
  }
  return PORTFOLIO_TECH_SPEC_ORDER.filter((label) => byLabel.has(label)).map((label) => ({
    label,
    value: byLabel.get(label)!,
  }));
}

export function normalizeSiteContent(c: SiteContent): SiteContent {
  const defaults = createDefaultSiteContent();
  const out = structuredClone(c);
  const defaultHeaderItems = defaults.header.navItems;
  const mergedNavItems = defaultHeaderItems.map((def) => {
    const existing = out.header.navItems.find((x) => x.id === def.id);
    const migratedHref =
      def.id === "nav-gallery-proyek" && existing?.href === "/#proyek"
        ? "/gallery-project"
        : existing?.href;
    return {
      id: def.id,
      label: existing?.label ?? def.label,
      shortLabel: existing?.shortLabel ?? def.shortLabel,
      href: migratedHref ?? def.href,
    };
  });
  /** Navbar utama: hanya jalur konsumen umum — halaman SEO / artikel lewat URL & indeks lain. */
  out.header.navItems = pickPrimaryHeaderNav(
    mergedNavItems,
    defaults.header.navItems,
  );
  out.header.mobileNavIds = [...primaryHeaderMobileNavIds()];
  out.header.siteSearchPlaceholder =
    typeof out.header.siteSearchPlaceholder === "string" && out.header.siteSearchPlaceholder.trim()
      ? out.header.siteSearchPlaceholder.trim()
      : defaults.header.siteSearchPlaceholder;
  out.header.siteSearchNoResultsText =
    typeof out.header.siteSearchNoResultsText === "string" && out.header.siteSearchNoResultsText.trim()
      ? out.header.siteSearchNoResultsText.trim()
      : defaults.header.siteSearchNoResultsText;

  const defCtaWa = defaults.hero.ctaWhatsApp;
  const inCtaWa = out.hero.ctaWhatsApp;
  out.hero.ctaWhatsApp = {
    ...defCtaWa,
    ...inCtaWa,
    label: (inCtaWa?.label ?? defCtaWa.label).trim() || defCtaWa.label,
    message: (inCtaWa?.message ?? defCtaWa.message).trim() || defCtaWa.message,
    ariaLabel:
      (typeof inCtaWa?.ariaLabel === "string" ? inCtaWa.ariaLabel.trim() : "") || defCtaWa.ariaLabel,
  };
  const defCtaSec = defaults.hero.ctaSecondary;
  const inCtaSec = out.hero.ctaSecondary;
  out.hero.ctaSecondary = {
    ...defCtaSec,
    ...inCtaSec,
    label: (inCtaSec?.label ?? defCtaSec.label).trim() || defCtaSec.label,
    href: (inCtaSec?.href ?? defCtaSec.href).trim() || defCtaSec.href,
    ariaLabel:
      (typeof inCtaSec?.ariaLabel === "string" ? inCtaSec.ariaLabel.trim() : "") || defCtaSec.ariaLabel,
  };

  const defIntro = defaults.hero.intro;
  const inIntro = out.hero?.intro;
  /** Segmen intro hero: string atau blok bergaya CMS — normalisasi mempertahankan blok aman. */
  const introPart = (v: unknown, fb: CmsRichTextValue) =>
    normalizeRichTextValue(v === undefined || v === null ? fb : v, plainTextFromRichValue(fb, ""));
  out.hero.intro = {
    before1: introPart(inIntro?.before1, defIntro.before1),
    bold1: introPart(inIntro?.bold1, defIntro.bold1),
    middle: introPart(inIntro?.middle, defIntro.middle),
    bold2: introPart(inIntro?.bold2, defIntro.bold2),
    after2: introPart(inIntro?.after2, defIntro.after2),
    bold3: introPart(inIntro?.bold3, defIntro.bold3),
    after3: introPart(inIntro?.after3, defIntro.after3),
  };
  const introValues = Object.values(out.hero.intro).map((x) => plainTextFromRichValue(x, "").trim());
  if (introValues.every((x) => x.length === 0)) {
    out.hero.intro = { ...defaults.hero.intro };
  }
  const tentangBodyFallback = plainTextFromRichValue(defaults.tentang.body, "");
  let tentangBody = normalizeRichTextValue(out.tentang?.body, tentangBodyFallback);
  const tentangBodyPlain = plainTextFromRichValue(tentangBody, tentangBodyFallback)
    .replace(/,\s*\n\s*/g, ", ")
    .replace(/\s*\n+\s*/g, " ")
    .trim();
  if (typeof tentangBody === "string") {
    tentangBody = tentangBodyPlain;
  } else if (tentangBodyPlain !== plainTextFromRichValue(tentangBody, "")) {
    tentangBody = { ...tentangBody, text: tentangBodyPlain };
  }
  out.tentang.body = tentangBody;
  out.hero.headingMiddle = out.hero?.headingMiddle ?? defaults.hero.headingMiddle;
  const defHero = defaults.hero;
  const heroStr = (v: unknown, fb: string) => {
    const t = typeof v === "string" ? v.trim() : "";
    return t || fb;
  };
  out.hero.introBadge = typeof out.hero.introBadge === "string" ? out.hero.introBadge.trim() : "";
  out.hero.prosesBadge = heroStr(out.hero.prosesBadge, defHero.prosesBadge);

  const clampProsesStepZoom = (raw: unknown, fallback: number): number => {
    const base = typeof raw === "number" && Number.isFinite(raw) ? raw : fallback;
    return Math.min(2.5, Math.max(0.35, base));
  };
  const defProsesZoom = defaults.hero.prosesStepImageZoom;
  const inProsesZoom = out.hero.prosesStepImageZoom ?? defProsesZoom;
  out.hero.prosesStepImageZoom = {
    konsultasi: clampProsesStepZoom(inProsesZoom.konsultasi, defProsesZoom.konsultasi),
    survey: clampProsesStepZoom(inProsesZoom.survey, defProsesZoom.survey),
    produksi: clampProsesStepZoom(inProsesZoom.produksi, defProsesZoom.produksi),
    instalasi: clampProsesStepZoom(inProsesZoom.instalasi, defProsesZoom.instalasi),
    selesai: clampProsesStepZoom(inProsesZoom.selesai, defProsesZoom.selesai),
  };

  const defSs = defaults.siteSettings;
  const ssIn = out.siteSettings ?? defSs;

  const trimStr = (x: unknown, fb: string) => (typeof x === "string" ? x.trim() : fb);

  const seoIn = ssIn.seoContent ?? defSs.seoContent;
  const seoDefaults = defSs.seoContent;
  const seoContent = {
    metaTitle: trimStr(seoIn.metaTitle, seoDefaults.metaTitle) || seoDefaults.metaTitle,
    metaDescription: trimStr(seoIn.metaDescription, seoDefaults.metaDescription) || seoDefaults.metaDescription,
    keywords: trimStr(seoIn.keywords, seoDefaults.keywords) || seoDefaults.keywords,
    companyDescription: trimStr(seoIn.companyDescription, seoDefaults.companyDescription) || seoDefaults.companyDescription,
    serviceAreas: trimStr(seoIn.serviceAreas, seoDefaults.serviceAreas) || seoDefaults.serviceAreas,
    additionalSeoContent: trimStr(seoIn.additionalSeoContent, ""),
  };

  const promoIn = ssIn.socialPromotionProfiles ?? defSs.socialPromotionProfiles;
  const socialPromotionProfiles = {
    facebookPageUrl: trimStr(promoIn.facebookPageUrl, ""),
    instagramProfileUrl: trimStr(promoIn.instagramProfileUrl, ""),
    tiktokProfileUrl: trimStr(promoIn.tiktokProfileUrl, ""),
    youtubeChannelUrl: trimStr(promoIn.youtubeChannelUrl, ""),
    xProfileUrl: trimStr(promoIn.xProfileUrl, ""),
  };

  const waSrc = Array.isArray(ssIn.whatsappNumbers) ? ssIn.whatsappNumbers : defSs.whatsappNumbers;
  let whatsappNumbers = waSrc.map((w, i) => ({
    id: typeof w?.id === "string" && w.id.trim() ? w.id.trim() : `wa-${i}`,
    label: trimStr(w?.label, `Kontak ${i + 1}`) || `Kontak ${i + 1}`,
    number: sanitizeWhatsAppToDigits(String(w?.number ?? "")),
    isPrimary: w?.isPrimary === true,
  }));
  whatsappNumbers = whatsappNumbers.filter((w) => w.number.length > 0);
  if (whatsappNumbers.length === 0) {
    whatsappNumbers = defSs.whatsappNumbers.map((w, i) => ({
      ...w,
      id: w.id || `wa-${i}`,
      number: sanitizeWhatsAppToDigits(w.number),
    }));
  }
  const primaryWaIdx = whatsappNumbers.findIndex((w) => w.isPrimary);
  if (primaryWaIdx === -1) {
    whatsappNumbers = whatsappNumbers.map((w, i) => ({ ...w, isPrimary: i === 0 }));
  } else {
    whatsappNumbers = whatsappNumbers.map((w, i) => ({ ...w, isPrimary: i === primaryWaIdx }));
  }

  const emSrc = Array.isArray(ssIn.emails) ? ssIn.emails : defSs.emails;
  let emails = emSrc.map((e, i) => ({
    id: typeof e?.id === "string" && e.id.trim() ? e.id.trim() : `email-${i}`,
    label: trimStr(e?.label, `Email ${i + 1}`) || `Email ${i + 1}`,
    email: sanitizeEmail(String(e?.email ?? "")),
    isPrimary: e?.isPrimary === true,
  }));
  emails = emails.filter((e) => e.email.length > 0);
  if (emails.length === 0) {
    emails = defSs.emails.map((e, i) => ({
      ...e,
      id: e.id || `email-${i}`,
      email: sanitizeEmail(e.email),
    }));
  }
  const primaryEmIdx = emails.findIndex((e) => e.isPrimary);
  if (primaryEmIdx === -1) {
    emails = emails.map((e, i) => ({ ...e, isPrimary: i === 0 }));
  } else {
    emails = emails.map((e, i) => ({ ...e, isPrimary: i === primaryEmIdx }));
  }

  const puSrc = Array.isArray(ssIn.productionUrls) ? ssIn.productionUrls : [];
  let productionUrls = puSrc.map((row, i) => ({
    id: typeof row?.id === "string" && row.id.trim() ? row.id.trim() : `prod-${i}`,
    label: trimStr(row?.label, `URL ${i + 1}`) || `URL ${i + 1}`,
    url: trimStr(row?.url, ""),
    isPrimary: row?.isPrimary === true,
  }));

  productionUrls = productionUrls.map((r) => {
    const t = r.url.trim();
    const canon = t ? normalizeAbsoluteOriginCandidate(t) ?? "" : "";
    return { ...r, url: canon };
  });
  productionUrls = productionUrls.filter((r) => r.url.length > 0);

  const legacySingle = trimStr(ssIn.siteUrl, "");
  if (productionUrls.length === 0 && legacySingle) {
    const canon = normalizeAbsoluteOriginCandidate(legacySingle) ?? "";
    if (canon) {
      productionUrls = [{ id: "prod-legacy", label: "Utama", url: canon, isPrimary: true }];
    }
  }

  if (productionUrls.length === 0) {
    productionUrls = structuredClone(defSs.productionUrls);
  }

  const primaryPuIdx = productionUrls.findIndex((r) => r.isPrimary);
  if (primaryPuIdx === -1) {
    productionUrls = productionUrls.map((r, i) => ({ ...r, isPrimary: i === 0 }));
  } else {
    productionUrls = productionUrls.map((r, i) => ({ ...r, isPrimary: i === primaryPuIdx }));
  }

  const primaryOrigin =
    productionUrls.find((r) => r.isPrimary)?.url ?? productionUrls[0]?.url ?? "";
  const sanitizedSiteUrl = primaryOrigin || "";

  const baIn = ssIn.brandAssets ?? defSs.brandAssets;
  const brandAssets = {
    logoLight: trimStr(baIn.logoLight, ""),
    logoDark: trimStr(baIn.logoDark, ""),
    favicon: trimStr(baIn.favicon, ""),
    appleTouchIcon: trimStr(baIn.appleTouchIcon, ""),
    defaultOgImage: trimStr(baIn.defaultOgImage, ""),
  };

  const pageSeoRaw =
    ssIn.pageSeo && typeof ssIn.pageSeo === "object"
      ? (ssIn.pageSeo as Record<string, unknown>)
      : {};
  const pageSeoKeys: SitePageSeoKey[] = [
    "home",
    "about",
    "produk",
    "coldStorage",
    "gallery",
    "process",
  ];
  const pageSeo: SitePageSeoMap = {};
  for (const key of pageSeoKeys) {
    const raw = pageSeoRaw[key];
    if (!raw || typeof raw !== "object") continue;
    const p = raw as Record<string, unknown>;
    pageSeo[key] = {
      title: trimStr(p.title, ""),
      description: trimStr(p.description, ""),
      keywords: trimStr(p.keywords, ""),
      ogImage: trimStr(p.ogImage, ""),
      canonical: trimStr(p.canonical, ""),
      noIndex: p.noIndex === true,
    };
  }

  const anIn = ssIn.analytics ?? defSs.analytics;
  const analytics = {
    googleAnalyticsId: trimStr(anIn.googleAnalyticsId, ""),
    googleTagManagerId: trimStr(anIn.googleTagManagerId, ""),
    metaPixelId: trimStr(anIn.metaPixelId, ""),
    microsoftClarityId: trimStr(anIn.microsoftClarityId, ""),
    googleSiteVerification: trimStr(anIn.googleSiteVerification, ""),
  };

  const slIn = ssIn.socialLinks ?? defSs.socialLinks;
  const socialLinks = {
    instagram: trimStr(slIn.instagram, ""),
    linkedin: trimStr(slIn.linkedin, ""),
    youtube: trimStr(slIn.youtube, ""),
    tiktok: trimStr(slIn.tiktok, ""),
    facebook: trimStr(slIn.facebook, ""),
  };

  const scIn = ssIn.seoControl ?? defSs.seoControl;
  const seoControl = {
    allowIndexing: scIn.allowIndexing !== false,
    stagingMode: scIn.stagingMode === true,
  };

  const imgSeoIn = ssIn.imageSeo ?? defSs.imageSeo;
  const imageSeo = {
    defaultAltPrefix: trimStr(imgSeoIn.defaultAltPrefix, ""),
    fallbackOgImage: trimStr(imgSeoIn.fallbackOgImage, ""),
  };

  const locIn = ssIn.localSeo ?? defSs.localSeo;
  const localSeo = {
    latitude: trimStr(locIn.latitude, ""),
    longitude: trimStr(locIn.longitude, ""),
    areaServed: Array.isArray(locIn.areaServed)
      ? locIn.areaServed.map((x) => trimStr(x, "")).filter(Boolean)
      : [],
    openingHours: Array.isArray(locIn.openingHours)
      ? locIn.openingHours.map((x) => trimStr(x, "")).filter(Boolean)
      : [],
  };

  const perfIn = ssIn.performanceMode ?? defSs.performanceMode;
  const performanceMode = {
    lightweightMode: perfIn.lightweightMode === true,
    disableHeavyAnimations: perfIn.disableHeavyAnimations === true,
    disableVideoBackground: perfIn.disableVideoBackground === true,
  };

  const redirectsRaw = Array.isArray(ssIn.redirects) ? ssIn.redirects : [];
  const redirects: SiteRedirectRule[] = [];
  for (const raw of redirectsRaw) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const from = trimStr(r.from, "");
    const to = trimStr(r.to, "");
    if (!from || !to) continue;
    redirects.push({
      from,
      to,
      permanent: r.permanent !== false,
    });
  }

  out.siteSettings = {
    siteName: trimStr(ssIn.siteName, defSs.siteName) || defSs.siteName,
    productionUrls,
    siteUrl: sanitizedSiteUrl,
    companyAddress: trimStr(ssIn.companyAddress, defSs.companyAddress) || defSs.companyAddress,
    whatsappNumbers,
    emails,
    mapsUrl: trimStr(ssIn.mapsUrl, defSs.mapsUrl) || defSs.mapsUrl,
    officeHours: trimStr(ssIn.officeHours, defSs.officeHours) || defSs.officeHours,
    seoContent,
    socialPromotionProfiles,
    brandAssets,
    pageSeo,
    analytics,
    socialLinks,
    seoControl,
    imageSeo,
    localSeo,
    performanceMode,
    redirects,
    published: ssIn.published !== false,
    maintenanceMode: ssIn.maintenanceMode === true,
    maintenanceHeadline:
      trimStr(ssIn.maintenanceHeadline, "") || "Website Sedang Dalam Pemeliharaan",
    maintenanceSubtext:
      trimStr(ssIn.maintenanceSubtext, "") ||
      "Kami sedang melakukan peningkatan sistem untuk pengalaman yang lebih baik.",
    maintenanceShowWhatsApp: ssIn.maintenanceShowWhatsApp !== false,
    maintenanceWhatsAppLabel:
      trimStr(ssIn.maintenanceWhatsAppLabel, "") || "Hubungi Tim via WhatsApp",
    maintenanceWhatsAppMessage:
      trimStr(ssIn.maintenanceWhatsAppMessage, "") ||
      "Halo, saya ingin berkonsultasi terkait kebutuhan cold storage.",
  };
  if (out.siteSettings.maintenanceMode) {
    out.siteSettings.published = false;
  }

  const siteNameFinal = out.siteSettings.siteName.trim();
  if (siteNameFinal) {
    /* Jangan timpa teks header yang sudah diedit CMS (`header.brandName`). */
    if (!out.header.brandName.trim()) {
      out.header.brandName = siteNameFinal;
    }
    out.hero.brandLabel = siteNameFinal;
  }

  const primaryDigits = resolvePrimaryWhatsAppDigits(out.siteSettings);
  out.kontak.whatsappDisplay = formatWhatsAppDisplayLocal(primaryDigits);
  out.kontak.email = resolvePrimaryEmail(out.siteSettings, out.kontak.email);

  const addr = out.siteSettings.companyAddress.trim();
  if (addr) {
    out.kontak.addressLines = addr.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  }

  const maps = out.siteSettings.mapsUrl.trim();
  if (maps) {
    out.kontak.mapEmbedUrl = maps;
  }

  const hours = out.siteSettings.officeHours.trim();
  if (hours) {
    out.kontak.operationalHours = hours;
  }

  out.faq.items = out.faq.items.map((it, i) => ({
    ...it,
    id: it.id ?? nid("faq", i),
  }));

  const defaultPortfolioById = new Map(defaults.portfolio.projects.map((x) => [x.id, x]));
  out.portfolio.projects = out.portfolio.projects.map((p, i) => {
    const id = p.id ?? nid("portfolio", i);
    const def = defaultPortfolioById.get(id) ?? defaults.portfolio.projects[i];

    const trimSrc = (x: unknown) => (typeof x === "string" ? x.trim() : "");
    const normPhotos = (arr: unknown): { src: string; alt: string }[] => {
      if (!Array.isArray(arr)) return [];
      return arr
        .map((ph) => ({
          src: trimSrc((ph as { src?: unknown })?.src),
          alt: trimSrc((ph as { alt?: unknown })?.alt),
        }))
        .filter((ph) => ph.src.length > 0);
    };

    const patchedPhotos = normPhotos(p.galleryPhotos);
    const galleryPhotos =
      patchedPhotos.length > 0 ? patchedPhotos : normPhotos(def?.galleryPhotos);

    const normTechnicalSpecs = (arr: unknown): { label: string; value: string }[] => {
      if (!Array.isArray(arr)) return [];
      return arr
        .map((row) => ({
          label: trimSrc((row as { label?: unknown })?.label),
          value: trimSrc((row as { value?: unknown })?.value),
        }))
        .filter((row) => row.label.length > 0 && row.value.length > 0);
    };
    const patchedSpecs = canonicalizePortfolioTechnicalSpecs(normTechnicalSpecs(p.technicalSpecs));
    const technicalSpecs =
      patchedSpecs.length > 0
        ? patchedSpecs
        : canonicalizePortfolioTechnicalSpecs(normTechnicalSpecs(def?.technicalSpecs));

    const videoSrc = trimSrc(p.videoSrc) || trimSrc(def?.videoSrc) || undefined;
    const videoPosterSrc = trimSrc(p.videoPosterSrc) || trimSrc(def?.videoPosterSrc) || undefined;
    const coverImageSrc = trimSrc(p.coverImageSrc) || trimSrc(def?.coverImageSrc) || undefined;
    const coverImageAlt = trimSrc(p.coverImageAlt) || trimSrc(def?.coverImageAlt) || undefined;

    return {
      ...p,
      id,
      name: trimSrc(p.name) || trimSrc(def?.name) || "",
      location: trimSrc(p.location) || trimSrc(def?.location) || "",
      workType: trimSrc(p.workType) || trimSrc(def?.workType) || "",
      technicalSpecs: technicalSpecs.length > 0 ? technicalSpecs : undefined,
      videoSrc,
      videoPosterSrc,
      videoAutoplay: p.videoAutoplay === true ? true : undefined,
      coverImageSrc,
      coverImageAlt,
      galleryPhotos,
    };
  });

  out.footer.quickLinks = out.footer.quickLinks.map((l, i) => ({
    ...l,
    id: l.id ?? nid("nav", i),
    label: l.label ?? "",
    href: l.href ?? "#",
  }));

  out.customersPartners.industries = out.customersPartners.industries.map((row, i) => {
    const { logoAdjust: rawAdj, ...rest } = row as typeof row & { logoAdjust?: unknown };
    const logoAdjust = sanitizeLogoAdjustStored(rawAdj);
    return {
      ...rest,
      id: row.id ?? nid("ind", i),
      ...(logoAdjust ? { logoAdjust } : {}),
    };
  });

  out.customersPartners.partners = out.customersPartners.partners.map((row, i) => {
    const { logoAdjust: rawAdj, ...rest } = row as typeof row & { logoAdjust?: unknown };
    const logoAdjust = sanitizeLogoAdjustStored(rawAdj);
    return {
      ...rest,
      id: row.id ?? nid("partner", i),
      ...(logoAdjust ? { logoAdjust } : {}),
    };
  });

  const defaultLayananById = new Map(defaults.layanan.cards.map((x) => [x.id, x]));
  out.layanan.cards = out.layanan.cards.map((row, i) => {
    const id = row.id ?? nid("layanan", i);
    const def = defaultLayananById.get(id);
    const body = Array.isArray(row.body) && row.body.length > 0 ? row.body : (def?.body ?? []);
    return {
      ...row,
      id,
      body,
      title: row.title || def?.title || "",
      folderSlug: row.folderSlug || def?.folderSlug || "",
      // Keep photos as an array so nested index patches (`photos.0.src`) persist correctly.
      photos:
        Array.isArray(row.photos) && row.photos.length > 0
          ? row.photos
          : Array.isArray(def?.photos)
            ? def.photos
            : [],
    };
  });

  out.produk.featuredImages = {
    utama: {
      leftSrc: out.produk?.featuredImages?.utama?.leftSrc || GAMBAR_PRODUK_UTAMA_KIRI,
      rightSrc: out.produk?.featuredImages?.utama?.rightSrc || GAMBAR_PRODUK_UTAMA_KANAN,
      leftAlt: out.produk?.featuredImages?.utama?.leftAlt || "Produk utama kiri",
      rightAlt: out.produk?.featuredImages?.utama?.rightAlt || "Produk utama kanan",
    },
    solusi: {
      leftSrc: out.produk?.featuredImages?.solusi?.leftSrc || GAMBAR_PRODUK_SOLUSI_KIRI,
      rightSrc: out.produk?.featuredImages?.solusi?.rightSrc || GAMBAR_PRODUK_SOLUSI_KANAN,
      leftAlt: out.produk?.featuredImages?.solusi?.leftAlt || "Produk solusi kiri",
      rightAlt: out.produk?.featuredImages?.solusi?.rightAlt || "Produk solusi kanan",
    },
    accessories: {
      leftSrc: out.produk?.featuredImages?.accessories?.leftSrc || GAMBAR_PRODUK_ACCESSORIES_KIRI,
      rightSrc: out.produk?.featuredImages?.accessories?.rightSrc || GAMBAR_PRODUK_ACCESSORIES_KANAN,
      leftAlt: out.produk?.featuredImages?.accessories?.leftAlt || "Produk accessories kiri",
      rightAlt: out.produk?.featuredImages?.accessories?.rightAlt || "Produk accessories kanan",
    },
  };

  out.kontak.addressLines =
    Array.isArray(out.kontak?.addressLines) && out.kontak.addressLines.length > 0
      ? out.kontak.addressLines
      : [...CONTACT_ADDRESS_LINES];
  const pickUrl = (fromSettings: string, fromFooter: string) => {
    const a = trimStr(fromSettings, "");
    if (a) return a;
    return trimStr(fromFooter, "");
  };
  out.footer.social = {
    instagram: pickUrl(socialLinks.instagram, out.footer?.social?.instagram ?? ""),
    linkedin: pickUrl(socialLinks.linkedin, out.footer?.social?.linkedin ?? ""),
    facebook: pickUrl(socialLinks.facebook, out.footer?.social?.facebook ?? ""),
    tiktok: pickUrl(socialLinks.tiktok, out.footer?.social?.tiktok ?? ""),
    youtube: pickUrl(socialLinks.youtube, out.footer?.social?.youtube ?? ""),
    x: out.footer?.social?.x ?? "",
  };

  const defCold = defaults.coldStoragePage;
  const inCold = out.coldStoragePage ?? defCold;
  out.coldStoragePage = {
    heroImageSrc: trimStr(inCold.heroImageSrc, defCold.heroImageSrc) || defCold.heroImageSrc,
    heroImageAlt: trimStr(inCold.heroImageAlt, defCold.heroImageAlt) || defCold.heroImageAlt,
  };

  out.layananPages = normalizeLayananPagesInContent(out.layananPages, out.coldStoragePage);

  out.landingKotaPages = normalizeLandingKotaPagesInContent(out.landingKotaPages, defaults.landingKotaPages);

  return out;
}
