"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const RECONNECT_MS = 2500;
/** Halaman publik: tunda SSE agar tidak berebut koneksi/CPU dengan LCP & hydration. */
const PUBLIC_SSE_DEFER_MS = 4000;

export function SiteContentAutoRefresh() {
  const pathname = usePathname() ?? "";
  const versionRef = useRef<string | null>(null);

  useEffect(() => {
    const isSiteAdmin = pathname.startsWith("/site-admin");
    let stopped = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let es: EventSource | null = null;
    let deferIdleId: number | undefined;
    /** DOM `setTimeout` → `number` (selaras lib DOM, hindari bentrok NodeJS.Timeout). */
    let deferTimeoutId: number | undefined;

    const connect = () => {
      if (stopped) return;
      es = new EventSource("/api/site-content/stream");
      es.addEventListener("version", (evt) => {
        if (document.visibilityState !== "visible") return;
        const payload = JSON.parse((evt as MessageEvent<string>).data) as { version?: string };
        const next = payload.version ?? null;
        if (!next) return;
        const lastReloadVersion = sessionStorage.getItem("site-content-last-reload-version");
        if (lastReloadVersion === next) {
          versionRef.current = next;
          return;
        }
        if (versionRef.current === null) {
          console.debug("[SiteContentAutoRefresh] current version:", next);
          versionRef.current = next;
          return;
        }
        console.debug("[SiteContentAutoRefresh] incoming version:", next, "current:", versionRef.current);
        if (versionRef.current !== next) {
          versionRef.current = next;
          sessionStorage.setItem("site-content-last-reload-version", next);
          console.debug("[SiteContentAutoRefresh] reload trigger");
          window.location.reload();
        }
      });
      es.onerror = () => {
        es?.close();
        es = null;
        if (stopped) return;
        reconnectTimer = setTimeout(connect, RECONNECT_MS);
      };
    };

    const startStreaming = () => {
      if (stopped) return;
      connect();
    };

    if (isSiteAdmin) {
      startStreaming();
    } else {
      let connectOnce = false;
      const run = () => {
        if (connectOnce) return;
        connectOnce = true;
        if (deferIdleId !== undefined && typeof window.cancelIdleCallback === "function") {
          window.cancelIdleCallback(deferIdleId);
          deferIdleId = undefined;
        }
        if (deferTimeoutId !== undefined) {
          window.clearTimeout(deferTimeoutId);
          deferTimeoutId = undefined;
        }
        startStreaming();
      };
      if (typeof window.requestIdleCallback === "function") {
        deferIdleId = window.requestIdleCallback(run, { timeout: PUBLIC_SSE_DEFER_MS + 3500 });
      }
      deferTimeoutId = window.setTimeout(run, PUBLIC_SSE_DEFER_MS);
    }

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (!es || es.readyState === EventSource.CLOSED) {
        if (reconnectTimer) clearTimeout(reconnectTimer);
        connect();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      stopped = true;
      if (deferIdleId !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(deferIdleId);
      }
      if (deferTimeoutId !== undefined) window.clearTimeout(deferTimeoutId);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      es?.close();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pathname]);

  return null;
}
