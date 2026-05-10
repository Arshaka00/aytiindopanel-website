import { NextResponse, type NextRequest } from "next/server";

import { hasAdminSessionCookieEdge, isAllowedAdminDeviceEdge } from "@/lib/gallery-admin-auth-edge";
import { getNormalizedLiveSiteContentForMiddleware } from "@/lib/site-content-middleware";
import { normalizeUrlPathname } from "@/lib/site-url-resolve";
import {
  getPreviewCookieNameEdge,
  getPreviewTtlSecEdge,
  verifyPreviewTokenEdge,
} from "@/lib/preview-token-edge";

const PUBLIC_FILE = /\.(.*)$/;

function shouldBypass(pathname: string): boolean {
  if (pathname === "/maintenance") return true;
  if (pathname.startsWith("/site-admin")) return true;
  if (pathname.startsWith("/api")) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/images")) return true;
  if (pathname.startsWith("/media")) return true;
  if (pathname.startsWith("/favicon")) return true;
  if (pathname.startsWith("/robots")) return true;
  if (pathname.startsWith("/sitemap")) return true;
  if (PUBLIC_FILE.test(pathname)) return true;
  return false;
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (shouldBypass(pathname)) return NextResponse.next();

  const normalizedPath = normalizeUrlPathname(pathname);
  if (req.method === "GET" && pathname !== normalizedPath && !pathname.includes(".")) {
    const url = req.nextUrl.clone();
    url.pathname = normalizedPath;
    return NextResponse.redirect(url, 308);
  }

  try {
    const siteContent = await getNormalizedLiveSiteContentForMiddleware();
    for (const rule of siteContent.siteSettings.redirects) {
      const from = normalizeUrlPathname(rule.from);
      if (from === normalizedPath) {
        const target = rule.to.trim();
        const dest = /\w+:\/\//.test(target)
          ? target
          : new URL(target.startsWith("/") ? target : `/${target}`, req.nextUrl.origin).href;
        return NextResponse.redirect(dest, rule.permanent ? 308 : 307);
      }
    }
  } catch {
    /* redirect config unavailable — lanjut */
  }

  const previewQuery = req.nextUrl.searchParams.get("preview") ?? "";
  if (previewQuery && (await verifyPreviewTokenEdge(previewQuery))) {
    const cleanUrl = req.nextUrl.clone();
    cleanUrl.searchParams.delete("preview");
    const res = NextResponse.redirect(cleanUrl, 307);
    res.cookies.set(getPreviewCookieNameEdge(), previewQuery, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: getPreviewTtlSecEdge(),
    });
    return res;
  }
  const previewCookie = req.cookies.get(getPreviewCookieNameEdge())?.value ?? "";
  if (previewCookie && (await verifyPreviewTokenEdge(previewCookie))) {
    return NextResponse.next();
  }

  const isAdminAllowed = isAllowedAdminDeviceEdge(req) && hasAdminSessionCookieEdge(req);
  if (isAdminAllowed) return NextResponse.next();

  const maintenanceActive = await getCachedSiteStatus(req);
  if (!maintenanceActive) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/maintenance";
  url.search = "";
  const response = NextResponse.rewrite(url, { status: 503 });
  response.headers.set("retry-after", "120");
  response.headers.set("x-robots-tag", "noindex, nofollow, noarchive");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};

export const runtime = "nodejs";

type StatusCache = {
  value: boolean;
  expiresAt: number;
};

let statusCache: StatusCache | null = null;
const STATUS_TTL_MS = 0;

async function getCachedSiteStatus(req: NextRequest): Promise<boolean> {
  const now = Date.now();
  if (statusCache && statusCache.expiresAt > now) return statusCache.value;
  const cookie = req.headers.get("cookie") ?? "";
  const statusUrl = new URL("/api/site-content/status", req.url);
  const resp = await fetch(statusUrl, {
    headers: cookie ? { cookie } : undefined,
    cache: "no-store",
  }).catch(() => null);
  const json = (await resp?.json().catch(() => null)) as
    | { maintenanceActive?: boolean }
    | null;
  const value = json?.maintenanceActive === true;
  if (value) {
    console.debug("[middleware] redirect reason: maintenance active");
  } else {
    console.debug("[middleware] allow reason: site live");
  }
  statusCache = { value, expiresAt: now + STATUS_TTL_MS };
  return value;
}
