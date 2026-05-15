import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import { SiteAnalyticsScripts } from "@/components/common/site-analytics-scripts";
import { SiteJsonLd } from "@/components/common/site-json-ld";
import { SiteHeader } from "@/components/aytipanel/site-header";
import { SiteContentAutoRefresh } from "@/components/common/site-content-auto-refresh";
import { VisitorAnalyticsTracker } from "@/components/common/visitor-analytics-tracker";
import { HeroCrystalIceFilters } from "@/components/common/hero-crystal-ice-filters";
import { UaClassFlags } from "@/components/common/ua-class-flags";
import { SiteCmsRoot } from "@/components/site-cms/site-cms-root";
import { validateRuntimeEnvOrThrow } from "@/lib/env-validate";
import { listPublishedSeoArticles } from "@/lib/seo-articles/repository";
import { getDraftSiteContent, getSiteContent } from "@/lib/site-content";
import { getPreviewCookieName, verifyPreviewToken } from "@/lib/preview-token";
import { resolveOgImageUrl } from "@/lib/site-seo-resolve";
import { resolvePublicSiteOrigin } from "@/lib/site-url-resolve";
import { DARK_MODE_ENABLED } from "@/lib/site-theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
  /** Kurangi kontensi preload dengan gambar hero (LCP) — Sora tetap preload untuk judul hero. */
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
  /** Mono jarang di atas fold — hindari preload agar tidak berebut dengan LCP. */
  preload: false,
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
  /** Hanya bobot yang dipakai hero/CMS (medium / semibold / extrabold). */
  weight: ["500", "600", "800"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const ss = content.siteSettings;
  const seo = ss.seoContent;
  const base = resolvePublicSiteOrigin(ss.siteUrl);
  const titleSuffix = " - sandwich panel & refrigerasi sistem";
  const titleBase =
    seo.metaTitle.trim() ||
    `${ss.siteName.trim() || "PT AYTI INDO PANEL"}${titleSuffix}`;
  const desc =
    seo.metaDescription.trim() ||
    "Produksi sandwich panel, instalasi cold room & sistem refrigerasi industri.";
  const kw = seo.keywords
    .split(/[,;\n]+/)
    .map((k) => k.trim())
    .filter(Boolean);

  const ogDefault = resolveOgImageUrl(content, "");
  // Samakan dengan header: bila favicon/apple-touch tidak diset di CMS,
  // fallback otomatis ke logoLight (lalu logoDark) supaya logo header & favicon
  // selalu konsisten secara default.
  const FALLBACK_HEADER_LOGO = "/images/logo_ayti.png";
  const rawLight = ss.brandAssets.logoLight?.trim() ?? "";
  const rawDark = ss.brandAssets.logoDark?.trim() ?? "";
  const headerLogoSrc = rawLight || rawDark || FALLBACK_HEADER_LOGO;
  const fav = ss.brandAssets.favicon.trim() || headerLogoSrc;
  const apple = ss.brandAssets.appleTouchIcon.trim() || headerLogoSrc;
  const verifyGoogle = ss.analytics.googleSiteVerification.trim();

  const globalNoIndex =
    ss.seoControl.stagingMode === true || ss.seoControl.allowIndexing === false;

  return {
    metadataBase: base,
    title: titleBase,
    description: desc,
    ...(kw.length ? { keywords: kw } : {}),
    ...(verifyGoogle ? { verification: { google: verifyGoogle } } : {}),
    robots: globalNoIndex ? { index: false, follow: false } : { index: true, follow: true },
    icons: {
      icon: fav,
      apple,
    },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: base.href,
      siteName: ss.siteName,
      title: titleBase,
      description: desc,
      images: [
        {
          url: ogDefault,
          width: 1200,
          height: 630,
          alt: ss.siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titleBase,
      description: desc,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  validateRuntimeEnvOrThrow();
  const cookieStore = await cookies();
  const previewToken = cookieStore.get(getPreviewCookieName())?.value ?? "";
  const previewMode = verifyPreviewToken(previewToken);
  const [content, seoArticles] = await Promise.all([
    previewMode ? getDraftSiteContent() : getSiteContent(),
    listPublishedSeoArticles(),
  ]);

  const pm = content.siteSettings.performanceMode;

  return (
    <html
      lang="id"
      suppressHydrationWarning
      data-performance-lightweight={pm.lightweightMode ? "1" : "0"}
      data-performance-no-anim={pm.disableHeavyAnimations ? "1" : "0"}
      data-performance-no-video={pm.disableVideoBackground ? "1" : "0"}
      data-dark-mode-enabled={DARK_MODE_ENABLED ? "1" : "0"}
      className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} h-full scroll-smooth bg-background antialiased`}
    >
      <body className="ayti-title-cold-scope flex min-h-[100dvh] flex-col overflow-x-clip bg-background text-foreground">
        <HeroCrystalIceFilters />
        <SiteAnalyticsScripts analytics={content.siteSettings.analytics} />
        <SiteJsonLd content={content} />
        <UaClassFlags />
        <SiteCmsRoot>
          <VisitorAnalyticsTracker />
          <SiteContentAutoRefresh />
          <SiteHeader
            header={content.header}
            homeLayout={content.homeLayout}
            siteContent={content}
            siteSettings={content.siteSettings}
            seoArticles={seoArticles}
          />
          <div className="flex min-h-0 flex-1 flex-col pt-[var(--site-header-height,3.65rem)]">
            {children}
          </div>
        </SiteCmsRoot>
      </body>
    </html>
  );
}
