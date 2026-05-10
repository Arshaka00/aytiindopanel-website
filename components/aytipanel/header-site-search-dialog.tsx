"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { IconSearch } from "@/components/aytipanel/icons";
import type { HeaderSiteSearchTarget } from "@/lib/header-site-search-targets";

type Props = {
  open: boolean;
  onClose: () => void;
  targets: readonly HeaderSiteSearchTarget[];
  onSelectHref: (href: string) => void;
};

export function HeaderSiteSearchDialog({
  open,
  onClose,
  targets,
  onSelectHref,
}: Props) {
  const inputId = useId();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const id = window.setTimeout(() => inputRef.current?.focus(), 16);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const queryTrimmed = query.trim();
  const hasQuery = queryTrimmed.length > 0;

  const filtered = useMemo(() => {
    const q = queryTrimmed.toLowerCase();
    if (!q) return [];
    return targets.filter(
      (t) => t.haystack.includes(q) || t.title.toLowerCase().includes(q),
    );
  }, [targets, queryTrimmed]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[65000] flex items-start justify-center px-3 py-4 pt-[max(0.75rem,env(safe-area-inset-top))] md:px-4 md:py-10"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <button
        type="button"
        className="absolute inset-0 z-0 border-0 bg-black/50 backdrop-blur-[3px]"
        aria-label="Tutup"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pencarian"
        className="relative z-[1] mt-[max(0.25rem,env(safe-area-inset-top))] w-full max-w-lg rounded-2xl border border-slate-400/55 bg-background shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)] dark:border-slate-500/45 dark:shadow-[0_28px_70px_-28px_rgba(0,0,0,0.65)]"
      >
        <div className="px-3 py-3 sm:px-4">
          <div className="flex items-center gap-2 rounded-xl border border-border/90 bg-muted-bg/35 px-3 py-2 dark:bg-white/[0.04]">
            <IconSearch className="size-[1.125rem] shrink-0 text-sky-600/90 dark:text-sky-300/85" aria-hidden />
            <input
              ref={inputRef}
              id={inputId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="masukan kata kunci"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              aria-controls={hasQuery ? listId : undefined}
              aria-label="Cari halaman di situs ini"
              className="min-w-0 flex-1 bg-transparent py-1 text-[0.9375rem] text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted-bg/80 hover:text-foreground"
              aria-label="Tutup"
              onClick={onClose}
            >
              <svg
                className="ayti-icon-cold size-[1.125rem]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        {hasQuery ? (
          <ul
            id={listId}
            role="listbox"
            aria-label="Hasil pencarian"
            className="max-h-[min(52dvh,20rem)] overflow-y-auto overscroll-contain border-t border-border/80 py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-7 text-center text-[0.8125rem] leading-relaxed text-muted-foreground">
                Tidak ada halaman yang cocok dengan pencarian Anda. Coba kata lain atau periksa ejaan.
              </li>
            ) : (
              filtered.map((t) => (
                <li key={t.id} role="presentation">
                  <button
                    type="button"
                    role="option"
                    className="flex w-full px-4 py-2.5 text-left text-[0.9375rem] font-medium text-foreground transition-colors hover:bg-muted-bg/75 active:bg-muted-bg/90"
                    onClick={() => {
                      onSelectHref(t.href);
                      onClose();
                    }}
                  >
                    {t.title}
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
