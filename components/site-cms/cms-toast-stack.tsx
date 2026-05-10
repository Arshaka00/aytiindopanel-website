"use client";

import { useEffect } from "react";

export type ToastItem = { id: string; message: string; kind: "ok" | "err" };

export function CmsToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      className="pointer-events-none fixed left-1/2 top-[max(1rem,env(safe-area-inset-top))] z-[61500] flex w-[min(100%,20rem)] -translate-x-1/2 flex-col gap-2 px-3 md:w-auto md:min-w-[16rem]"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <ToastRow key={t.id} item={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastRow({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDismiss, 3800);
    return () => clearTimeout(id);
  }, [onDismiss]);

  return (
    <div
      className={`pointer-events-auto rounded-xl border px-3 py-2 text-center text-xs font-semibold shadow-lg backdrop-blur-md ${
        item.kind === "ok"
          ? "border-emerald-500/35 bg-emerald-950/90 text-emerald-50"
          : "border-red-500/40 bg-red-950/90 text-red-50"
      }`}
      role="status"
    >
      {item.message}
    </div>
  );
}
