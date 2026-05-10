import type { NextConfig } from "next";

import { SITE_APEX_HOSTNAME, SITE_PUBLIC_HOSTNAME } from "./lib/site-public-host";

const nextConfig: NextConfig = {
  /** Apex → www agar satu host canonical (termasuk path & file statis). */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: SITE_APEX_HOSTNAME }],
        destination: `https://${SITE_PUBLIC_HOSTNAME}/:path*`,
        permanent: true,
      },
    ];
  },
  allowedDevOrigins: [
    "192.168.110.145",
    "172.20.10.6",
    "localhost",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
    // Hero slides and CMS media use local paths with optional query params.
    // Omitting `search` allows any query string (or none) for matching paths.
    localPatterns: [{ pathname: "/images/**" }, { pathname: "/media/**" }],
  },
};

export default nextConfig;
