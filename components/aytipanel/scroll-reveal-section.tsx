"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { pickScrollRevealPreset } from "@/lib/scroll-reveal-preset";

/**
 * Premium scroll-reveal: fade + transform ringan, satu kali saat masuk viewport.
 *
 * Karakter visual (lihat juga `app/globals.css` → `.scroll-reveal-section`):
 *   - opacity 0 → 1 + translate / scale halus (preset bervariasi per `sectionKey`, stabil per build)
 *   - desktop: jarak & durasi lebih cinematic; mobile: section pakai translate3d ringan + opacity (GPU-friendly)
 *   - cubic-bezier(0.22, 1, 0.36, 1) — easing premium / cinematic
 *   - tanpa rotate / blur pada reveal — aman di iPhone Safari & Android Chrome
 *
 * Kenapa pakai IntersectionObserver + class CSS (bukan Framer Motion):
 *   - lebih ringan: tidak ada per-frame React render saat reveal
 *   - one-time: observer otomatis disconnect setelah elemen ter-intersect
 *   - kompatibel dengan toggle `data-performance-no-anim` global (lihat globals.css)
 */
export type ScrollRevealSectionProps = {
  children: ReactNode;
  className?: string;
  /**
   * `section` (default) — durasi & jarak lebih cinematic.
   * `card` — lebih cepat & ringan, cocok untuk stagger.
   * `image` — fade + translateY kecil + scale 0.985 → 1 (untuk frame gambar/video).
   */
  variant?: "section" | "card" | "image";
  /**
   * Delay dalam ms untuk stagger (mis. antar kartu di grid).
   * Hanya berlaku saat elemen masih `hidden`; setelah revealed dibebaskan agar tidak
   * memengaruhi transisi lain (hover/focus) di dalam pembungkus.
   */
  delay?: number;
  /**
   * Threshold IntersectionObserver (0..1).
   * Default: 0.08 (section) / 0.12 (card).
   */
  amount?: number;
  /**
   * Margin observer. Default `0px 0px -8% 0px` — reveal sedikit sebelum benar-benar
   * sampai tepi bawah viewport (terasa lebih hidup tanpa harus menunggu scroll penuh).
   */
  rootMargin?: string;
  /** Optional id pada div pembungkus (mis. anchor lokal). */
  id?: string;
  /**
   * Kunci section beranda — memilih preset animasi reveal secara deterministik
   * (variasi “acak” antar section, konsisten SSR + mobile + desktop).
   * Hanya berpengaruh jika `variant` = `"section"`.
   */
  sectionKey?: string;
  /**
   * Langsung dalam keadaan ter-reveal (tanpa fade masuk). Untuk hero / above-the-fold
   * supaya SSR + hydrasi tidak sempat opacity 0 sekali frame.
   */
  initialRevealed?: boolean;
};

/** Ambang “sudah terlihat saat mount”: jika top section < 85% tinggi viewport, anggap sudah dilihat. */
const ALREADY_VISIBLE_RATIO = 0.85;

export function ScrollRevealSection({
  children,
  className,
  variant = "section",
  delay = 0,
  amount,
  rootMargin = "0px 0px -8% 0px",
  id,
  sectionKey,
  initialRevealed = false,
}: ScrollRevealSectionProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(initialRevealed);

  const preset =
    variant === "section" && sectionKey?.trim()
      ? pickScrollRevealPreset(sectionKey.trim())
      : undefined;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined") return;

    // Hormati preferensi pengguna & toggle CMS performance-mode.
    const prefersReduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const noAnim = document.documentElement.dataset.performanceNoAnim === "1";

    if (prefersReduce || noAnim) {
      setRevealed(true);
      return;
    }

    if (initialRevealed) {
      setRevealed(true);
      return;
    }

    // Saat mount (mis. user refresh halaman dengan scroll-position di tengah halaman):
    // kalau elemen sudah terlihat, langsung reveal — tidak perlu animasi “masuk”.
    const rect = el.getBoundingClientRect();
    const wasVisibleAtMount =
      rect.top < window.innerHeight * ALREADY_VISIBLE_RATIO && rect.bottom > 0;
    if (wasVisibleAtMount) {
      setRevealed(true);
      return;
    }

    // Fallback bila browser tidak mendukung IntersectionObserver — reveal langsung.
    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }

    let cancelled = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (cancelled) return;
            setRevealed(true);
            io.disconnect();
            break;
          }
        }
      },
      {
        rootMargin,
        threshold:
          amount ??
          (variant === "section" ? 0.08 : variant === "image" ? 0.15 : 0.12),
      },
    );
    io.observe(el);

    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [variant, rootMargin, amount, sectionKey, initialRevealed]);

  const [revealComplete, setRevealComplete] = useState(false);

  // Saat user mount halaman dengan elemen sudah terlihat, kita langsung set
  // revealed=true tanpa transisi. Pada kasus tersebut tidak akan ada
  // `transitionend`, jadi tandai juga "complete" agar GPU layer dilepas.
  useEffect(() => {
    if (revealed && !revealComplete) {
      const id = window.setTimeout(() => setRevealComplete(true), 1500);
      return () => window.clearTimeout(id);
    }
  }, [revealed, revealComplete]);

  const baseClass =
    variant === "section"
      ? "scroll-reveal-section"
      : variant === "image"
        ? "scroll-reveal-image"
        : "scroll-reveal-card";
  const finalClass = [baseClass, revealed ? "is-revealed" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  const onTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    // Hanya tandai komplet ketika transform/opacity sudah selesai pada elemen
    // root pembungkus (bukan dari child). Setelah ini, CSS memaksa transform
    // ke `none` → browser melepas GPU layer.
    if (event.target !== event.currentTarget) return;
    if (event.propertyName !== "transform" && event.propertyName !== "opacity") return;
    if (!revealComplete) setRevealComplete(true);
  };

  return (
    <div
      ref={ref}
      id={id}
      className={finalClass}
      data-scroll-reveal-preset={preset}
      data-reveal-complete={revealComplete ? "1" : undefined}
      onTransitionEnd={onTransitionEnd}
      style={
        delay > 0 && !revealed
          ? { transitionDelay: `${delay}ms` }
          : undefined
      }
    >
      {children}
    </div>
  );
}
