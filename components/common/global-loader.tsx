"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { GlobalLoaderLiteShell } from "@/components/common/global-loader-lite-shell";
import {
  markGlobalLoaderIntroDone,
  shouldRunGlobalLoaderIntro,
} from "@/lib/global-loader-session";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { useSiteLoaderMotionTier } from "@/lib/use-site-loader-motion-tier";

const GlobalLoaderFullShell = dynamic(
  () =>
    import("@/components/common/global-loader-full-shell").then((m) => m.GlobalLoaderFullShell),
  { ssr: false },
);

const REVEAL_AT_MS_FULL = 1400;
const REVEAL_AT_MS_LITE = 880;
const EXIT_DURATION_S_FULL = 0.48;
const EXIT_DURATION_S_LITE = 0.28;

type GlobalLoaderProps = {
  /** Matikan intro (mis. mode performa ringan / tanpa animasi berat dari CMS). */
  disabled?: boolean;
};

type IntroGate = "pending" | "run" | "skip";

/**
 * Full-screen loader pada **load / refresh dokumen** (semua rute).
 * Satu kali per tab (sessionStorage); tidak muncul lagi saat navigasi SPA meski layout remount.
 */
export function GlobalLoader({ disabled = false }: GlobalLoaderProps) {
  const reduceMotion = usePrefersReducedMotion();
  const motionTier = useSiteLoaderMotionTier();
  const lite = motionTier === "lite";

  const [gate, setGate] = useState<IntroGate>("pending");
  const [dismissed, setDismissed] = useState(true);
  const [exitComplete, setExitComplete] = useState(true);
  const scrollLockRef = useRef<{ y: number } | null>(null);

  const revealMs = lite ? REVEAL_AT_MS_LITE : REVEAL_AT_MS_FULL;
  const exitDurationS = lite ? EXIT_DURATION_S_LITE : EXIT_DURATION_S_FULL;

  useLayoutEffect(() => {
    if (disabled || reduceMotion) {
      setGate("skip");
      return;
    }
    if (!shouldRunGlobalLoaderIntro()) {
      setGate("skip");
      return;
    }
    setGate("run");
    setDismissed(false);
    setExitComplete(false);
  }, [disabled, reduceMotion]);

  const finishIntro = useCallback(() => {
    markGlobalLoaderIntroDone();
    setDismissed(true);
    setExitComplete(true);
  }, []);

  const shouldRun = gate === "run";
  const visible = shouldRun && !dismissed;
  const scrollLocked = shouldRun && visible;

  useEffect(() => {
    if (!visible || lite) return;
    const t = window.setTimeout(() => setDismissed(true), revealMs);
    return () => clearTimeout(t);
  }, [visible, lite, revealMs]);

  useEffect(() => {
    if (!scrollLocked) return;

    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyTop = body.style.top;
    const prevBodyWidth = body.style.width;
    const y = window.scrollY;

    scrollLockRef.current = { y };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.width = "100%";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.position = prevBodyPosition;
      body.style.top = prevBodyTop;
      body.style.width = prevBodyWidth;
      const lock = scrollLockRef.current;
      scrollLockRef.current = null;
      if (lock != null) {
        const hasSectionHash =
          typeof window !== "undefined" && window.location.hash.length > 1;
        if (!hasSectionHash || lock.y > 0) {
          window.scrollTo(0, lock.y);
        }
      }
    };
  }, [scrollLocked]);

  useEffect(() => {
    if (dismissed && shouldRun) {
      markGlobalLoaderIntroDone();
    }
  }, [dismissed, shouldRun]);

  if (gate === "pending" || gate === "skip") {
    return null;
  }

  if (!visible && exitComplete) {
    return null;
  }

  if (lite) {
    if (exitComplete) return null;
    return (
      <GlobalLoaderLiteShell
        revealMs={revealMs}
        exitMs={Math.round(exitDurationS * 1000)}
        onExitComplete={finishIntro}
      />
    );
  }

  return (
    <GlobalLoaderFullShell
      visible={visible}
      revealMs={revealMs}
      exitDurationS={exitDurationS}
      onExitComplete={finishIntro}
    />
  );
}
