import type { SiteContent, SitePageSeoKey, SitePageSeoMap, SiteRedirectRule } from "@/lib/site-content-model";
import { CONTACT_ADDRESS_LINES } from "@/components/aytipanel/constants";
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

function nid(prefix: string, i: number): string {
  return `${prefix}-${i}`;
}

/** Pastikan item repeater punya `id` stabil untuk drag/reorder (kompatibel data lama). */
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
  out.header.navItems = mergedNavItems;
  out.header.mobileNavIds = defaults.header.mobileNavIds.filter((id) =>
    out.header.navItems.some((n) => n.id === id),
  );
  out.hero.intro = {
    before1: out.hero?.intro?.before1 ?? defaults.hero.intro.before1,
    bold1: out.hero?.intro?.bold1 ?? defaults.hero.intro.bold1,
    middle: out.hero?.intro?.middle ?? defaults.hero.intro.middle,
    bold2: out.hero?.intro?.bold2 ?? defaults.hero.intro.bold2,
    after2: out.hero?.intro?.after2 ?? defaults.hero.intro.after2,
    bold3: out.hero?.intro?.bold3 ?? defaults.hero.intro.bold3,
    after3: out.hero?.intro?.after3 ?? defaults.hero.intro.after3,
  };
  const introValues = Object.values(out.hero.intro).map((x) => x.trim());
  if (introValues.every((x) => x.length === 0)) {
    out.hero.intro = { ...defaults.hero.intro };
  }
  out.hero.headingMiddle = out.hero?.headingMiddle ?? defaults.hero.headingMiddle;
  const defSs = defaults.siteSettings;
  const ssIn = out.siteSettings ?? defSs;

  const trimStr = (x: unknown, fb: string) => (typeof x === "string" ? x.trim() : fb);

  const seoIn = ssIn.seoContent ?? defSs.seoContent;
  const seoDefaults = defSs.seoContent;
  const seoContent = {
    metaTitle: trimStr(seoIn.metaTitle, seoDefaults.metaTitle) || seoDefaults.metaTitle,
    metaDescription: trimStr(seoIn.metaDescription, seoDefaults.metaDescription) || seoDefaults.metaDescription,
    keywords: trimStr(seoIn.keywords, seoDefaults.keywords) || seoDefaults.keywords,
    footerSeoText: trimStr(seoIn.footerSeoText, ""),
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

  out.customersPartners.industries = out.customersPartners.industries.map((row, i) => ({
    ...row,
    id: row.id ?? nid("ind", i),
  }));

  out.customersPartners.partners = out.customersPartners.partners.map((row, i) => ({
    ...row,
    id: row.id ?? nid("partner", i),
  }));

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

  return out;
}
