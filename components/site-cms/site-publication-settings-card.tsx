"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { SiteContent } from "@/lib/site-content-model";
import { getSiteSettingsGateHeaderName } from "@/lib/site-settings-gate";

function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const key = `${name}=`;
  const entry = document.cookie.split("; ").find((c) => c.startsWith(key));
  if (!entry) return "";
  return decodeURIComponent(entry.slice(key.length));
}

function FieldLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{children}</label>
      {hint ? <p className="text-[11px] leading-snug text-slate-500">{hint}</p> : null}
    </div>
  );
}

/**
 * Kartu Published / maintenance / saluran WhatsApp halaman maintenance — dipakai di Deployment Center.
 */
export function SitePublicationSettingsCard({
  gateToken,
  onGateInvalid,
  onSaved,
}: {
  gateToken: string;
  onGateInvalid?: () => void;
  onSaved?: () => void;
}) {
  const gateHeaders = useMemo(
    () =>
      ({
        [getSiteSettingsGateHeaderName()]: gateToken,
      }) as Record<string, string>,
    [gateToken],
  );

  const [settings, setSettings] = useState<SiteContent["siteSettings"] | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/site-content?siteSettingsContext=1", {
        credentials: "include",
        headers: gateHeaders,
      });
      if (r.status === 403) {
        onGateInvalid?.();
        setStatus("Akses pengaturan situs perlu dibuka kunci lagi.");
        return;
      }
      const j = (await r.json().catch(() => ({}))) as { content?: SiteContent };
      if (j.content?.siteSettings) {
        setSettings(structuredClone(j.content.siteSettings));
        setStatus("");
      } else {
        setStatus("Gagal memuat pengaturan.");
      }
    } catch {
      setStatus("Gagal memuat pengaturan.");
    }
  }, [gateHeaders, onGateInvalid]);

  useEffect(() => {
    void load();
  }, [load]);

  const update = useCallback((patch: Partial<SiteContent["siteSettings"]>) => {
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));
    setStatus("Perubahan belum disimpan.");
  }, []);

  const save = async () => {
    if (!settings || busy) return;
    setBusy(true);
    setStatus("Menyimpan...");
    try {
      const r = await fetch("/api/site-content", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-cms-csrf-token": getCookie("cms_csrf_token"),
          ...gateHeaders,
        },
        body: JSON.stringify({
          patch: {
            siteSettings: structuredClone(settings),
          },
        }),
      });
      if (r.status === 403) {
        onGateInvalid?.();
        setStatus("Akses pengaturan situs perlu dibuka kunci lagi.");
        return;
      }
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "Gagal menyimpan.");
      }
      setStatus("Tersimpan.");
      await load();
      onSaved?.();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Gagal menyimpan.");
    } finally {
      setBusy(false);
    }
  };

  if (!settings) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-lg backdrop-blur-md md:p-7">
        <h2 className="text-base font-semibold text-white">Publikasi</h2>
        <p className="mt-3 text-sm text-slate-400">{status || "Memuat…"}</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-cyan-400/18 bg-gradient-to-br from-cyan-500/[0.06] via-slate-950/55 to-slate-950/90 p-6 shadow-md shadow-black/15 backdrop-blur-md motion-safe:animate-[premium-page-reveal_420ms_var(--ease-premium-soft)_both] md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200/75">Tayang &amp; maintenance</p>
          <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-white md:text-xl">Publikasi</h2>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-400">
            Nonaktifkan publish untuk menampilkan halaman maintenance ke pengunjung (admin tetap akses).
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900/35 px-3 py-2.5">
          <span className="text-sm font-medium text-slate-100">Published</span>
          <input
            type="checkbox"
            checked={settings.published}
            disabled={busy}
            onChange={(e) => {
              const published = e.target.checked;
              update({
                published,
                ...(published ? { maintenanceMode: false } : {}),
              });
            }}
            className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-sky-500"
          />
        </label>
        <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900/35 px-3 py-2.5">
          <span className="text-sm font-medium text-slate-100">Maintenance mode</span>
          <input
            type="checkbox"
            checked={settings.maintenanceMode}
            disabled={busy}
            onChange={(e) => {
              const maintenanceMode = e.target.checked;
              update({
                maintenanceMode,
                published: maintenanceMode ? false : settings.published,
              });
            }}
            className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-amber-500"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-3">
        <div>
          <FieldLabel>Judul maintenance</FieldLabel>
          <input
            type="text"
            value={settings.maintenanceHeadline}
            onChange={(e) => update({ maintenanceHeadline: e.target.value })}
            className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
          />
        </div>
        <div>
          <FieldLabel>Teks penjelasan maintenance</FieldLabel>
          <textarea
            value={settings.maintenanceSubtext}
            onChange={(e) => update({ maintenanceSubtext: e.target.value })}
            rows={3}
            className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
          />
        </div>
        <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900/35 px-3 py-2.5">
          <span className="text-sm font-medium text-slate-100">Tampilkan tombol WhatsApp</span>
          <input
            type="checkbox"
            checked={settings.maintenanceShowWhatsApp}
            onChange={(e) => update({ maintenanceShowWhatsApp: e.target.checked })}
            className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-emerald-500"
          />
        </label>
        <div>
          <FieldLabel>Label tombol WhatsApp</FieldLabel>
          <input
            type="text"
            value={settings.maintenanceWhatsAppLabel}
            onChange={(e) => update({ maintenanceWhatsAppLabel: e.target.value })}
            className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
          />
        </div>
        <div>
          <FieldLabel>Pesan WhatsApp</FieldLabel>
          <textarea
            value={settings.maintenanceWhatsAppMessage}
            onChange={(e) => update({ maintenanceWhatsAppMessage: e.target.value })}
            rows={4}
            className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-white/[0.08] pt-5">
        <button
          type="button"
          onClick={() => void load()}
          disabled={busy}
          className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:opacity-40"
        >
          Muat ulang
        </button>
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy}
          className="rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/18 transition hover:bg-cyan-400 disabled:opacity-40"
        >
          {busy ? "Menyimpan…" : "Simpan"}
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">{status || " "}</p>
    </section>
  );
}
