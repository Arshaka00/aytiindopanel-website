import { randomUUID } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import { rateLimitRequest } from "@/lib/api-rate-limit";
import {
  classifyBrowser,
  classifyDevice,
  isLikelyBot,
  parseReferrer,
  waHrefToSafeSuffix,
} from "@/lib/visitor-analytics/parse";
import { appendVisitorEvent } from "@/lib/visitor-analytics/storage";
import type { VisitorAnalyticsEvent } from "@/lib/visitor-analytics/types";

const SID_RX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function sanitizePath(raw: string | undefined): string | null {
  if (typeof raw !== "string") return null;
  let p = raw.trim();
  if (!p.startsWith("/")) return null;
  if (p.startsWith("/site-admin") || p.startsWith("/api") || p.startsWith("/_next")) return null;
  if (p.includes("..")) return null;
  return p.slice(0, 512);
}

/** Beacon ringan — tanpa auth; rate limited & bot-filtered. */
export async function POST(req: NextRequest) {
  try {
    if (!rateLimitRequest(req, "visitor-collect", 180, 60_000)) {
      return new NextResponse(null, { status: 429 });
    }

    const ua = req.headers.get("user-agent") ?? "";
    if (isLikelyBot(ua)) {
      return new NextResponse(null, { status: 204 });
    }

    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body || typeof body !== "object") {
      return new NextResponse(null, { status: 400 });
    }

    const kind =
      body.kind === "whatsapp_click"
        ? "whatsapp_click"
        : body.kind === "visit"
          ? "visit"
          : "pageview";
    const path = sanitizePath(typeof body.path === "string" ? body.path : "");
    if (!path) {
      return new NextResponse(null, { status: 400 });
    }

    const existingSid = req.cookies.get("va_sid")?.value ?? "";
    let sid = existingSid;
    if (!SID_RX.test(sid)) {
      sid = randomUUID();
    }

    const country =
      req.headers.get("x-vercel-ip-country")?.trim() ||
      req.headers.get("cf-ipcountry")?.trim() ||
      "—";
    const cityHeader =
      req.headers.get("x-vercel-ip-city")?.trim() ||
      req.headers.get("x-vercel-ip-country-region")?.trim() ||
      "";

    const clientRef =
      typeof body.referrer === "string" && body.referrer.trim().length > 0 ? body.referrer : null;
    const headerRef = req.headers.get("referer");
    const refParsed = parseReferrer(clientRef ?? headerRef);

    const base = {
      ts: new Date().toISOString(),
      path,
      sid,
      browser: classifyBrowser(ua),
      device: classifyDevice(ua),
      country: country || "—",
      city: cityHeader || "—",
      referrerHost: refParsed.host,
      referrerKind: refParsed.kind,
    };

    let event: VisitorAnalyticsEvent;
    if (kind === "whatsapp_click") {
      const waHref = typeof body.waHref === "string" ? body.waHref : "";
      event = {
        ...base,
        kind: "whatsapp_click",
        waDestSuffix: waHref ? waHrefToSafeSuffix(waHref) : "unknown",
      };
    } else if (kind === "visit") {
      event = {
        ...base,
        kind: "visit",
      };
    } else {
      event = {
        ...base,
        kind: "pageview",
      };
    }

    void appendVisitorEvent(event).catch(() => {});

    const res = new NextResponse(null, { status: 204 });
    if (!SID_RX.test(existingSid)) {
      res.cookies.set("va_sid", sid, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 400,
      });
    }
    return res;
  } catch {
    return new NextResponse(null, { status: 400 });
  }
}
