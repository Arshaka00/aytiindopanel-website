"use client";

import { useCallback, useEffect, useRef } from "react";

const SLOP_SQ = 28 * 28;

export type TouchSafeButtonBinding = readonly [
  (node: HTMLButtonElement | null) => void,
  (e: React.MouseEvent<HTMLButtonElement>) => void,
];

/**
 * Aktivasi tombol di mobile WebKit: `touchend` dengan `{ passive: false }` + slop gerakan,
 * supaya `preventDefault` membatalkan click hantu dan tap terbaca konsisten.
 *
 * Mengembalikan tuple `[setNode, onClick]` agar lolos eslint-plugin-react-hooks (bukan objek `.ref`).
 */
export function useTouchSafeButtonActivate(onActivate: () => void): TouchSafeButtonBinding {
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const suppressClickRef = useRef(false);
  const detachRef = useRef<(() => void) | undefined>(undefined);

  const setButtonRef = useCallback(
    (node: HTMLButtonElement | null) => {
      detachRef.current?.();
      detachRef.current = undefined;

      if (!node) return;

      const onTouchStart = (e: TouchEvent) => {
        const t = e.targetTouches[0];
        if (t) startRef.current = { x: t.clientX, y: t.clientY };
      };

      const onTouchEnd = (e: TouchEvent) => {
        const s = startRef.current;
        startRef.current = null;
        const t = e.changedTouches[0];
        if (!s || !t) return;
        const dx = t.clientX - s.x;
        const dy = t.clientY - s.y;
        if (dx * dx + dy * dy > SLOP_SQ) return;
        suppressClickRef.current = true;
        e.preventDefault();
        onActivate();
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 450);
      };

      node.addEventListener("touchstart", onTouchStart, { passive: true });
      node.addEventListener("touchend", onTouchEnd, { passive: false });

      detachRef.current = () => {
        node.removeEventListener("touchstart", onTouchStart);
        node.removeEventListener("touchend", onTouchEnd);
      };
    },
    [onActivate],
  );

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (suppressClickRef.current) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      onActivate();
    },
    [onActivate],
  );

  useEffect(() => () => detachRef.current?.(), []);

  return [setButtonRef, onClick] as const;
}
