"use client";

import type { ReactNode } from "react";

/** Transisi mikro konten utama antar-route — opacity halus, tanpa geser layout. */
export default function RootTemplate({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="flex min-h-0 flex-1 flex-col motion-reduce:animate-none motion-safe:animate-[premium-page-reveal_280ms_var(--ease-premium-out)_both] md:motion-safe:animate-[premium-page-reveal_380ms_var(--ease-premium-out)_both]">
      {children}
    </div>
  );
}
