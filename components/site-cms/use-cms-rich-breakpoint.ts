"use client";

import { useSyncExternalStore } from "react";

import type { CmsRichBreakpoint } from "@/lib/cms-rich-text";
import { breakpointFromWidth } from "@/lib/cms-rich-text";

function getWidth(): number | undefined {
  if (typeof window === "undefined") return undefined;
  return window.innerWidth;
}

function subscribeWidth(onChange: () => void) {
  const ro = () => onChange();
  window.addEventListener("resize", ro, { passive: true });
  return () => window.removeEventListener("resize", ro);
}

export function useCmsRichBreakpoint(): CmsRichBreakpoint {
  return useSyncExternalStore(
    subscribeWidth,
    () => breakpointFromWidth(getWidth()),
    () => "desktop",
  );
}
