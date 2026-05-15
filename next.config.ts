import type { NextConfig } from "next";

import { SITE_APEX_HOSTNAME, SITE_PUBLIC_HOSTNAME } from "./lib/site-public-host";

/** Slug halaman layanan — sinkron dengan `data/layanan-pages/live.json` (hindari import berat di next.config). */
const LAYANAN_PAGE_SLUGS = [
  "sandwich-panel-pu",
  "sandwich-panel-knock-down",
  "cold-storage",
  "cold-storage-portable",
  "blast-freezer",
  "refrigeration-system",
  "cold-room-door",
  "cold-storage-murah",
  "cold-storage-berkualitas",
] as const;

/** Layanan inti dengan canonical di root — tidak diarahkan ke /artikel/layanan. */
const SEO_ROOT_LAYANAN_SLUGS = [
  "cold-storage",
  "cold-room-door",
  "blast-freezer",
  "sandwich-panel-pu",
] as const;

const SEO_ROOT_PUBLIC_PATH: Record<(typeof SEO_ROOT_LAYANAN_SLUGS)[number], string> = {
  "cold-storage": "/cold-storage",
  "cold-room-door": "/cold-room",
  "blast-freezer": "/blast-freezer",
  "sandwich-panel-pu": "/sandwich-panel-pu",
};

const LAYANAN_REDIRECT_TO_ARTIKEL = LAYANAN_PAGE_SLUGS.filter(
  (slug) => !(SEO_ROOT_LAYANAN_SLUGS as readonly string[]).includes(slug),
);

const nextConfig: NextConfig = {
  /**
   * Sembunyikan badge/indikator dev browser (status serupa “Compiling”) saat `next dev`.
   * Hanya pengembangan lokal; **production tidak terpengaruh**. Tidak mengurangi error overlay bila Next tetap menampilkannya untuk masalah nyata.
   */
  devIndicators: false,
  experimental: {
    /** Kurangi bundle surface untuk import bernama besar (tree-shake lebih agresif). */
    optimizePackageImports: [
      "framer-motion",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "embla-carousel-react",
    ],
    /**
     * Default clone body Next ~10MB — melebihi itu memotong multipart sehingga
     * `formData()` gagal ("Form tidak valid"). Selaras `MAX_VIDEO_BYTES` (80MB) di upload route.
     */
    proxyClientMaxBodySize: "96mb",
    serverActions: {
      bodySizeLimit: "96mb",
    },
  },
  /** Apex → www agar satu host canonical (termasuk path & file statis). */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: SITE_APEX_HOSTNAME }],
        destination: `https://${SITE_PUBLIC_HOSTNAME}/:path*`,
        permanent: true,
      },
      /** Halaman indeks katalog dihapus — arahkan ke section Produk di beranda. */
      { source: "/produk", destination: "/#produk", permanent: true },
      /** Halaman layanan sekunder tetap di /artikel/layanan/[slug]. */
      ...LAYANAN_REDIRECT_TO_ARTIKEL.map((slug) => ({
        source: `/${slug}`,
        destination: `/artikel/layanan/${slug}`,
        permanent: true,
      })),
      /** Canonical layanan inti: /artikel/layanan → root. */
      ...SEO_ROOT_LAYANAN_SLUGS.map((slug) => ({
        source: `/artikel/layanan/${slug}`,
        destination: SEO_ROOT_PUBLIC_PATH[slug],
        permanent: true,
      })),
      { source: "/cold-room-door", destination: "/cold-room", permanent: true },
    ];
  },
  allowedDevOrigins: [
    "192.168.110.145",
    "172.20.10.6",
    "localhost",
  ],
  images: {
    formats: ["image/avif", "image/webp"],
    /** Srcset lebih rapat di mobile agar decode mendekati lebar viewport (LCP hero). */
    deviceSizes: [384, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86_400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      /** Media CMS di Vercel Blob (`access: public`). `**` = subdomain berapa pun (picomatch). */
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
    // Hero slides and CMS media use local paths with optional query params.
    // Omitting `search` allows any query string (or none) for matching paths.
    localPatterns: [{ pathname: "/images/**" }, { pathname: "/media/**" }],
  },
};

export default nextConfig;
