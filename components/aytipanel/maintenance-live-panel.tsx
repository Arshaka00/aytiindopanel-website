"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  etaIso?: string | null;
};

const MESSAGES = [
  "Menyiapkan optimasi performa halaman.",
  "Sinkronisasi konten dan media sedang berjalan.",
  "Peningkatan stabilitas sistem sedang diproses.",
];

function formatRemain(ms: number): string {
  const sec = Math.max(0, Math.floor(ms / 1000));
  const hh = Math.floor(sec / 3600);
  const mm = Math.floor((sec % 3600) / 60);
  const ss = sec % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export function MaintenanceLivePanel({ etaIso }: Props) {
  const eta = useMemo(() => (etaIso ? new Date(etaIso).getTime() : null), [etaIso]);
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  const remainText = eta ? formatRemain(eta - now) : "Estimasi segera tersedia";
  const progress = eta ? Math.max(8, Math.min(97, 100 - Math.floor((Math.max(eta - now, 0) / (1000 * 60 * 60)) * 16))) : 62;

  return (
    <div className="mt-5 space-y-3 rounded-xl border border-slate-300/80 bg-slate-50/90 p-3 dark:border-white/15 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-700 dark:text-slate-200">System Status</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-200">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" aria-hidden="true" />
          Maintenance Active
        </span>
      </div>
      <div className="space-y-1">
        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-300">
          ETA: <span className="font-semibold">{remainText}</span>
        </p>
      </div>
      <p className="text-xs text-slate-600 transition-opacity duration-300 dark:text-slate-300">{MESSAGES[index]}</p>
    </div>
  );
}
