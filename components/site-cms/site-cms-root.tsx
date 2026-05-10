"use client";

import type { ReactNode } from "react";

import { SiteCmsChrome } from "@/components/site-cms/site-cms-chrome";
import { SiteCmsProvider } from "@/components/site-cms/site-cms-provider";

export function SiteCmsRoot({ children }: { children: ReactNode }) {
  return (
    <SiteCmsProvider>
      {children}
      <SiteCmsChrome />
    </SiteCmsProvider>
  );
}
