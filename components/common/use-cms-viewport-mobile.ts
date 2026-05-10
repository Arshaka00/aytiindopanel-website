"use client";

import { useEffect, useState } from "react";

const MQ = "(max-width: 767.98px)";

/**
 * true = viewport “mobile” (≤767.98px), selaras breakpoint `max-md` Tailwind.
 * Sebelum mount (SSR) mengembalikan false agar konsisten dengan server.
 */
export function useCmsViewportIsMobile(): boolean {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(MQ);
    const sync = () => setMobile(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  return mobile;
}
