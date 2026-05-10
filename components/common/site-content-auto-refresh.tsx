"use client";

import { useEffect, useRef } from "react";

const RECONNECT_MS = 2500;

export function SiteContentAutoRefresh() {
  const versionRef = useRef<string | null>(null);

  useEffect(() => {
    let stopped = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let es: EventSource | null = null;

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

    connect();
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
      if (reconnectTimer) clearTimeout(reconnectTimer);
      es?.close();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}
