"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

/** Satu “masuk” per tab sampai tab ditutup; muat ulang di tab sama tidak mengirim visit lagi. */
const VISIT_SESSION_KEY = "va_visit_session_v1";

function sendCollect(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
  void fetch("/api/visitor-analytics/collect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    credentials: "same-origin",
    keepalive: true,
  }).catch(() => {});
}

function VisitorAnalyticsTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const guardRef = useRef<{ path: string; at: number }>({ path: "", at: 0 });
  /** Fallback jika sessionStorage tidak ada (mode privat): maks. satu visit per mount komponen (setara satu tab). */
  const visitFallbackRef = useRef(false);

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/site-admin")) return;
    if (pathname.startsWith("/api")) return;

    const qs = searchParams?.toString();
    const pathWithQs = qs ? `${pathname}?${qs}` : pathname;
    if (pathWithQs.length > 900) return;

    const now = Date.now();
    if (
      guardRef.current.path === pathWithQs &&
      now - guardRef.current.at < 750 &&
      guardRef.current.at > 0
    ) {
      return;
    }
    guardRef.current = { path: pathWithQs, at: now };

    let recordVisit = false;
    if (typeof window !== "undefined") {
      try {
        if (!sessionStorage.getItem(VISIT_SESSION_KEY)) {
          sessionStorage.setItem(VISIT_SESSION_KEY, "1");
          recordVisit = true;
        }
      } catch {
        if (!visitFallbackRef.current) {
          visitFallbackRef.current = true;
          recordVisit = true;
        }
      }
    }

    const run = () => {
      const referrer = typeof document !== "undefined" ? document.referrer || "" : "";
      if (recordVisit) {
        sendCollect({
          kind: "visit",
          path: pathWithQs,
          referrer,
        });
      }
      sendCollect({
        kind: "pageview",
        path: pathWithQs,
        referrer,
      });
    };

    const ric = globalThis.requestIdleCallback as
      | ((cb: () => void, opts?: { timeout: number }) => number)
      | undefined;
    if (typeof ric === "function") {
      ric(() => run(), { timeout: 2500 });
    } else {
      globalThis.setTimeout(run, 1);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const onWaClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.("a");
      if (!el?.href) return;
      const href = el.href;
      if (!/wa\.me|api\.whatsapp\.com|whatsapp\.com\/send/i.test(href)) return;

      const pathWithQs =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`.slice(0, 900)
          : "/";

      sendCollect({
        kind: "whatsapp_click",
        path: pathWithQs || "/",
        waHref: href.slice(0, 2000),
        referrer: typeof document !== "undefined" ? document.referrer || "" : "",
      });
    };

    document.addEventListener("click", onWaClick, true);
    return () => document.removeEventListener("click", onWaClick, true);
  }, []);

  return null;
}

export function VisitorAnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <VisitorAnalyticsTrackerInner />
    </Suspense>
  );
}
