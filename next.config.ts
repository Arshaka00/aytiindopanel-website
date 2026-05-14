import type { NextConfig } from "next";

import { SITE_APEX_HOSTNAME, SITE_PUBLIC_HOSTNAME } from "./lib/site-public-host";

const nextConfig: NextConfig = {
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
