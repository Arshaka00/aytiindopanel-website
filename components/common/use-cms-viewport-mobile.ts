"use client";

import { useEffect, useState } from "react";

const MQ = "(max-width: 767.98px)";

/**
 * true = viewport “mobile” (≤767.98px), selaras breakpoint `max-md` Tailwind.
 *
 * `initialMatch` dari server (User-Agent) menyelaraskan crop/transform hero SSR dengan
 * klien pertama — kurangi CLS saat hydrasi. Tanpa argumen: sama seperti sebelumnya (`false` di SSR).
 */
export function useCmsViewportIsMobile(initialMatch?: boolean): boolean {
  const [mobile, setMobile] = useState(() =>
    typeof initialMatch === "boolean" ? initialMatch : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(MQ);
    const sync = () => setMobile(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  return mobile;
}
