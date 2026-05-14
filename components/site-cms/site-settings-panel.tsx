"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { SiteContent } from "@/lib/site-content-model";
import { getSiteSettingsGateHeaderName } from "@/lib/site-settings-gate";
import {
  isValidEmail,
  sanitizeEmail,
  sanitizeWhatsAppToDigits,
} from "@/lib/site-contact";
import { normalizeAbsoluteOriginCandidate } from "@/lib/site-url-resolve";
import { SitePromotionSection } from "@/components/site-cms/site-promotion-section";
import { SiteSettingsEnterpriseSection } from "@/components/site-cms/site-settings-enterprise-section";

function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const key = `${name}=`;
  const entry = document.cookie.split("; ").find((c) => c.startsWith(key));
  if (!entry) return "";
  return decodeURIComponent(entry.slice(key.length));
}

const divider =
  "my-8 h-px w-full rounded-full bg-gradient-to-r from-transparent via-white/18 to-transparent";

type BackupItem = { file: string; createdAt: string; size: number };

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

export function SiteSettingsPanel({
  gateToken,
  onGateInvalid,
}: {
  gateToken: string;
  onGateInvalid?: () => void;
}) {
  const router = useRouter();
  const gateHeaders = useMemo(
    () =>
      ({
        [getSiteSettingsGateHeaderName()]: gateToken,
      }) as Record<string, string>,
    [gateToken],
  );
  const [settings, setSettings] = useState<SiteContent["siteSettings"] | null>(null);
  /** `header.brandName` — teks di samping logo; disimpan bersama patch Site Settings. */
  const [headerBrandName, setHeaderBrandName] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [role, setRole] = useState<string>("viewer");
  const [backups, setBackups] = useState<BackupItem[]>([]);

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
      const j = (await r.json().catch(() => ({}))) as { content?: SiteContent; role?: string };
      setRole(j.role ?? "viewer");
      if (j.content?.siteSettings) {
        setSettings(structuredClone(j.content.siteSettings));
        const bnRaw =
          typeof j.content.header?.brandName === "string" ? j.content.header.brandName.trim() : "";
        const nameFallback =
          typeof j.content.siteSettings?.siteName === "string"
            ? j.content.siteSettings.siteName.trim()
            : "";
        setHeaderBrandName(bnRaw || nameFallback);
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

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const backupResp = await fetch("/api/site-content/backups", {
        credentials: "include",
        headers: gateHeaders,
      }).catch(() => null);
      if (cancelled) return;
      if (backupResp?.status === 403) {
        onGateInvalid?.();
        return;
      }
      const backupJson = (await backupResp?.json().catch(() => ({}))) as { backups?: BackupItem[] };
      setBackups(backupJson.backups ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, [gateHeaders, onGateInvalid]);

  const update = useCallback((patch: Partial<SiteContent["siteSettings"]>) => {
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));
    setStatus("Perubahan belum disimpan.");
  }, []);

  const updateSeo = useCallback((patch: Partial<SiteContent["siteSettings"]["seoContent"]>) => {
    setSettings((prev) =>
      prev ? { ...prev, seoContent: { ...prev.seoContent, ...patch } } : prev,
    );
    setStatus("Perubahan belum disimpan.");
  }, []);

  const save = async () => {
    if (!settings || busy) return;
    for (const p of settings.productionUrls) {
      const t = p.url.trim();
      if (t && !normalizeAbsoluteOriginCandidate(t)) {
        setStatus(`URL tidak valid (${p.label || "domain"}). Contoh: https://www.example.com`);
        return;
      }
    }
    for (const e of settings.emails) {
      const em = sanitizeEmail(e.email);
      if (em && !isValidEmail(em)) {
        setStatus(`Email tidak valid: ${e.label || e.email}`);
        return;
      }
    }
    const bnTrim = headerBrandName.trim();
    if (!bnTrim) {
      setStatus("Teks brand di header (di samping logo) tidak boleh kosong.");
      return;
    }

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
            header: { brandName: bnTrim },
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
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Gagal menyimpan.");
    } finally {
      setBusy(false);
    }
  };

  const publishDraft = async () => {
    if (busy) return;
    setBusy(true);
    setStatus("Publish draft ke live…");
    try {
      const r = await fetch("/api/site-content/publish", {
        method: "POST",
        credentials: "include",
        headers: {
          "x-cms-csrf-token": getCookie("cms_csrf_token"),
          ...gateHeaders,
        },
      });
      if (r.status === 403) {
        onGateInvalid?.();
        setStatus("Akses pengaturan situs perlu dibuka kunci lagi.");
        return;
      }
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "Publish gagal.");
      }
      setStatus("Draft berhasil dipublish ke live.");
      router.refresh();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Publish gagal.");
    } finally {
      setBusy(false);
    }
  };

  const restoreBackup = async (file: string) => {
    if (busy) return;
    setBusy(true);
    setStatus("Memulihkan backup…");
    try {
      const r = await fetch("/api/site-content/backups/restore", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-cms-csrf-token": getCookie("cms_csrf_token"),
          ...gateHeaders,
        },
        body: JSON.stringify({ file, mode: "draft" }),
      });
      if (r.status === 403) {
        onGateInvalid?.();
        setStatus("Akses pengaturan situs perlu dibuka kunci lagi.");
        return;
      }
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "Restore backup gagal.");
      }
      setStatus("Backup dipulihkan ke draft. Muat ulang atau simpan dari form.");
      await load();
      router.refresh();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Restore backup gagal.");
    } finally {
      setBusy(false);
    }
  };

  const downloadBackupFile = async (file: string) => {
    try {
      const r = await fetch(
        `/api/site-content/backups?download=${encodeURIComponent(file)}`,
        {
          credentials: "include",
          headers: gateHeaders,
        },
      );
      if (r.status === 403) {
        onGateInvalid?.();
        return;
      }
      if (!r.ok) return;
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* noop */
    }
  };

  if (!settings) {
    return (
      <p className="text-center text-sm text-slate-400">{status || "Memuat…"}</p>
    );
  }

  const addWa = () => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `wa-${Date.now()}`;
    setSettings((prev) => {
      if (!prev) return prev;
      const next = [...prev.whatsappNumbers.map((w) => ({ ...w, isPrimary: false })), {
        id,
        label: "Baru",
        number: "",
        isPrimary: prev.whatsappNumbers.length === 0,
      }];
      return { ...prev, whatsappNumbers: next };
    });
    setStatus("Perubahan belum disimpan.");
  };

  const addEmail = () => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `em-${Date.now()}`;
    setSettings((prev) => {
      if (!prev) return prev;
      const next = [...prev.emails.map((e) => ({ ...e, isPrimary: false })), {
        id,
        label: "Baru",
        email: "",
        isPrimary: prev.emails.length === 0,
      }];
      return { ...prev, emails: next };
    });
    setStatus("Perubahan belum disimpan.");
  };

  const addProductionUrl = () => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `prod-${Date.now()}`;
    setSettings((prev) => {
      if (!prev) return prev;
      const list = prev.productionUrls?.length ? prev.productionUrls : [{ id: "p0", label: "Utama", url: "", isPrimary: true }];
      const next = [
        ...list.map((p) => ({ ...p, isPrimary: false })),
        { id, label: "Domain tambahan", url: "", isPrimary: false },
      ];
      return { ...prev, productionUrls: next };
    });
    setStatus("Perubahan belum disimpan.");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <header className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300/90">CMS</p>
        <h1 className="text-2xl font-semibold text-white md:text-3xl">Site Settings</h1>
        <p className="text-sm text-slate-400">
          Domain, kontak, meta default beranda, organisasi/schema, draft→live, backup, dan mode publikasi —{" "}
          <span className="text-slate-300">bukan</span> editor halaman{" "}
          <code className="rounded bg-white/10 px-1 py-0.5 text-[11px] text-sky-200/90">/artikel</code>.
        </p>
        <p className="text-xs text-slate-500">
          Artikel di <code className="rounded bg-white/10 px-1 py-0.5 text-[11px] text-sky-200/90">/artikel</code>:{" "}
          <Link href="/site-admin/seo-articles" className="font-medium text-emerald-300/95 hover:text-emerald-200 hover:underline">
            Editor →
          </Link>
        </p>
        <Link
          href="/site-admin"
          className="inline-block text-xs font-medium text-sky-300/90 hover:text-sky-200 hover:underline"
        >
          ← Kembali ke Panel CMS
        </Link>
      </header>

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg backdrop-blur-md motion-safe:animate-[premium-page-reveal_320ms_var(--ease-premium-soft)_both]">
        <h2 className="text-base font-semibold text-white">Draft → live</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Menyalin seluruh konten <span className="text-slate-300">draft</span> ke penyimpanan{" "}
          <span className="text-slate-300">live</span> yang dilihat pengunjung. Hanya{" "}
          <span className="font-semibold text-emerald-200/90">super_admin</span>. Role Anda:{" "}
          <span className="font-semibold text-sky-300">{role}</span>.
        </p>
        <div className="mt-4 flex flex-wrap justify-end">
          <button
            type="button"
            onClick={() => void publishDraft()}
            disabled={busy || role !== "super_admin"}
            className="rounded-lg border border-emerald-300/40 bg-emerald-500/20 px-4 py-2.5 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Publish Live
          </button>
        </div>
      </section>

      <div className={divider} />

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg backdrop-blur-md motion-safe:animate-[premium-page-reveal_380ms_var(--ease-premium-soft)_both]">
        <h2 className="text-base font-semibold text-white">Identitas & URL</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FieldLabel hint="Digunakan metadata, header, dan schema.">Nama website</FieldLabel>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => update({ siteName: e.target.value })}
              className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none ring-sky-500/0 transition placeholder:text-slate-600 focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
              placeholder="PT AYTI INDO PANEL"
            />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel hint="Tampil di bilah atas di samping ikon logo; boleh lebih pendek dari nama website resmi.">
              Teks brand (header)
            </FieldLabel>
            <input
              type="text"
              value={headerBrandName}
              onChange={(e) => {
                setHeaderBrandName(e.target.value);
                setStatus("Perubahan belum disimpan.");
              }}
              className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none ring-sky-500/0 transition placeholder:text-slate-600 focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
              placeholder="PT AYTI INDO PANEL"
            />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel hint="Tema terang vs gelap header; path lokal (/images/…) atau URL HTTPS. Kosongkan untuk logo bawaan.">
              Logo header
            </FieldLabel>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <div>
                <span className="text-[11px] text-slate-500">Terang (sidebar / tema terang)</span>
                <input
                  type="text"
                  value={settings.brandAssets.logoLight}
                  onChange={(e) =>
                    update({
                      brandAssets: { ...settings.brandAssets, logoLight: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 font-mono text-xs text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
                  placeholder="/media/partner/… atau https://…"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500">Gelap (opsional)</span>
                <input
                  type="text"
                  value={settings.brandAssets.logoDark}
                  onChange={(e) =>
                    update({
                      brandAssets: { ...settings.brandAssets, logoDark: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 font-mono text-xs text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
                  placeholder="Sama seperti terang jika kosong"
                />
              </div>
            </div>
          </div>
          <div className="sm:col-span-2">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <FieldLabel hint="Tambahkan beberapa domain jika perlu (www, apex, alias). Yang Utama dipakai canonical & metadata.">
                URL situs produksi
              </FieldLabel>
              <button
                type="button"
                onClick={addProductionUrl}
                className="rounded-lg border border-sky-400/35 bg-sky-500/15 px-3 py-2 text-xs font-semibold text-sky-100 transition hover:bg-sky-500/25"
              >
                + Tambah URL
              </button>
            </div>
            <ul className="mt-3 space-y-3">
              {(settings.productionUrls?.length
                ? settings.productionUrls
                : [{ id: "fallback", label: "Utama", url: settings.siteUrl ?? "", isPrimary: true }]
              ).map((row, idx) => (
                <li
                  key={row.id}
                  className="rounded-xl border border-white/10 bg-slate-950/40 p-4 transition hover:border-sky-400/25"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      URL {idx + 1}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
                        <input
                          type="radio"
                          name="prod-url-primary"
                          checked={row.isPrimary}
                          onChange={() => {
                            setSettings((prev) => {
                              if (!prev) return prev;
                              const list = prev.productionUrls?.length
                                ? prev.productionUrls
                                : [{ id: "fallback", label: "Utama", url: "", isPrimary: true }];
                              return {
                                ...prev,
                                productionUrls: list.map((p) => ({
                                  ...p,
                                  isPrimary: p.id === row.id,
                                })),
                              };
                            });
                            setStatus("Perubahan belum disimpan.");
                          }}
                          className="h-3.5 w-3.5 border-slate-500 text-sky-500"
                        />
                        Utama (canonical)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setSettings((prev) => {
                            if (!prev) return prev;
                            const list = [...(prev.productionUrls ?? [])];
                            if (list.length <= 1) return prev;
                            const filtered = list.filter((p) => p.id !== row.id);
                            const next =
                              filtered.length && !filtered.some((p) => p.isPrimary)
                                ? filtered.map((p, i) => ({ ...p, isPrimary: i === 0 }))
                                : filtered;
                            return { ...prev, productionUrls: next };
                          });
                          setStatus("Perubahan belum disimpan.");
                        }}
                        className="text-xs font-medium text-rose-300/90 hover:text-rose-200"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <span className="text-[11px] text-slate-500">Label</span>
                      <input
                        type="text"
                        value={row.label}
                        onChange={(e) => {
                          const v = e.target.value;
                          setSettings((prev) => {
                            if (!prev) return prev;
                            const list = prev.productionUrls?.length
                              ? prev.productionUrls
                              : [{ id: "fallback", label: "Utama", url: "", isPrimary: true }];
                            return {
                              ...prev,
                              productionUrls: list.map((p) =>
                                p.id === row.id ? { ...p, label: v } : p,
                              ),
                            };
                          });
                          setStatus("Perubahan belum disimpan.");
                        }}
                        className="mt-1 w-full rounded-lg border border-white/12 bg-slate-950/50 px-2.5 py-2 text-sm text-white outline-none focus:border-sky-400/40"
                        placeholder="Utama, www, redirect…"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500">Origin (https://…)</span>
                      <input
                        type="url"
                        value={row.url}
                        onChange={(e) => {
                          const v = e.target.value;
                          setSettings((prev) => {
                            if (!prev) return prev;
                            const list = prev.productionUrls?.length
                              ? prev.productionUrls
                              : [{ id: "fallback", label: "Utama", url: "", isPrimary: true }];
                            return {
                              ...prev,
                              productionUrls: list.map((p) =>
                                p.id === row.id ? { ...p, url: v } : p,
                              ),
                            };
                          });
                          setStatus("Perubahan belum disimpan.");
                        }}
                        className="mt-1 w-full rounded-lg border border-white/12 bg-slate-950/50 px-2.5 py-2 text-sm text-white outline-none focus:border-sky-400/40"
                        placeholder="https://www.example.com"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className={divider} />

      <SitePromotionSection
        shareUrl={
          settings.productionUrls?.find((p) => p.isPrimary)?.url?.trim() ||
          settings.productionUrls?.[0]?.url?.trim() ||
          settings.siteUrl?.trim() ||
          ""
        }
        siteName={settings.siteName}
        profiles={
          settings.socialPromotionProfiles ?? {
            facebookPageUrl: "",
            instagramProfileUrl: "",
            tiktokProfileUrl: "",
            youtubeChannelUrl: "",
            xProfileUrl: "",
          }
        }
        onUpdateProfiles={(patch) => {
          setSettings((prev) =>
            prev
              ? {
                  ...prev,
                  socialPromotionProfiles: {
                    ...(prev.socialPromotionProfiles ?? {
                      facebookPageUrl: "",
                      instagramProfileUrl: "",
                      tiktokProfileUrl: "",
                      youtubeChannelUrl: "",
                      xProfileUrl: "",
                    }),
                    ...patch,
                  },
                }
              : prev,
          );
          setStatus("Perubahan belum disimpan.");
        }}
        onPromoStatus={setStatus}
      />

      <div className={divider} />

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg backdrop-blur-md motion-safe:animate-[premium-page-reveal_420ms_var(--ease-premium-soft)_both]">
        <h2 className="text-base font-semibold text-white">Alamat & jam operasional</h2>
        <div className="mt-4 space-y-4">
          <div>
            <FieldLabel hint="Satu baris per baris alamat.">Alamat perusahaan</FieldLabel>
            <textarea
              value={settings.companyAddress}
              onChange={(e) => update({ companyAddress: e.target.value })}
              rows={4}
              className="mt-2 w-full resize-y rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
            />
          </div>
          <div>
            <FieldLabel hint="Opsional — embed atau tautan share Maps.">Google Maps URL</FieldLabel>
            <input
              type="url"
              value={settings.mapsUrl}
              onChange={(e) => update({ mapsUrl: e.target.value })}
              className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
              placeholder="https://maps.google.com/..."
            />
          </div>
          <div>
            <FieldLabel>Jam operasional</FieldLabel>
            <input
              type="text"
              value={settings.officeHours}
              onChange={(e) => update({ officeHours: e.target.value })}
              className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
            />
          </div>
        </div>
      </section>

      <div className={divider} />

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg backdrop-blur-md">
        <h2 className="text-base font-semibold text-white">Publikasi</h2>
        <p className="mt-2 text-xs text-slate-400">
          Nonaktifkan publish untuk menampilkan halaman maintenance ke pengunjung (admin tetap akses).
        </p>
        <div className="mt-4 space-y-3">
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
      </section>

      <div className={divider} />

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg backdrop-blur-md">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white">WhatsApp</h2>
            <p className="mt-1 text-xs text-slate-400">
              Nomor dinormalisasi otomatis (62…). Utama dipakai untuk CTA situs.
            </p>
          </div>
          <button
            type="button"
            onClick={addWa}
            className="rounded-lg border border-emerald-400/35 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/25"
          >
            + Tambah nomor
          </button>
        </div>
        <ul className="mt-4 space-y-3">
          {settings.whatsappNumbers.map((row, idx) => (
            <li
              key={row.id}
              className="rounded-xl border border-white/10 bg-slate-950/40 p-4 transition hover:border-sky-400/25"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Kontak {idx + 1}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
                    <input
                      type="radio"
                      name="wa-primary"
                      checked={row.isPrimary}
                      onChange={() => {
                        setSettings((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            whatsappNumbers: prev.whatsappNumbers.map((w) => ({
                              ...w,
                              isPrimary: w.id === row.id,
                            })),
                          };
                        });
                        setStatus("Perubahan belum disimpan.");
                      }}
                      className="h-3.5 w-3.5 border-slate-500 text-sky-500"
                    />
                    Utama
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setSettings((prev) => {
                        if (!prev) return prev;
                        const filtered = prev.whatsappNumbers.filter((w) => w.id !== row.id);
                        const next =
                          filtered.length && !filtered.some((w) => w.isPrimary)
                            ? filtered.map((w, i) => ({ ...w, isPrimary: i === 0 }))
                            : filtered;
                        return { ...prev, whatsappNumbers: next };
                      });
                      setStatus("Perubahan belum disimpan.");
                    }}
                    className="text-xs font-medium text-rose-300/90 hover:text-rose-200"
                  >
                    Hapus
                  </button>
                </div>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <span className="text-[11px] text-slate-500">Label</span>
                  <input
                    type="text"
                    value={row.label}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSettings((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          whatsappNumbers: prev.whatsappNumbers.map((w) =>
                            w.id === row.id ? { ...w, label: v } : w,
                          ),
                        };
                      });
                      setStatus("Perubahan belum disimpan.");
                    }}
                    className="mt-1 w-full rounded-lg border border-white/12 bg-slate-950/50 px-2.5 py-2 text-sm text-white outline-none focus:border-sky-400/40"
                    placeholder="Sales"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Nomor / wa.me</span>
                  <input
                    type="text"
                    value={row.number}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSettings((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          whatsappNumbers: prev.whatsappNumbers.map((w) =>
                            w.id === row.id ? { ...w, number: v } : w,
                          ),
                        };
                      });
                      setStatus("Perubahan belum disimpan.");
                    }}
                    onBlur={() => {
                      const digits = sanitizeWhatsAppToDigits(row.number);
                      setSettings((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          whatsappNumbers: prev.whatsappNumbers.map((w) =>
                            w.id === row.id ? { ...w, number: digits || w.number } : w,
                          ),
                        };
                      });
                    }}
                    className="mt-1 w-full rounded-lg border border-white/12 bg-slate-950/50 px-2.5 py-2 text-sm text-white outline-none focus:border-sky-400/40"
                    placeholder="62812… atau wa.me/62812…"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className={divider} />

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg backdrop-blur-md">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white">Email</h2>
            <p className="mt-1 text-xs text-slate-400">Email utama untuk kontak bisnis di halaman kontak.</p>
          </div>
          <button
            type="button"
            onClick={addEmail}
            className="rounded-lg border border-violet-400/35 bg-violet-500/15 px-3 py-2 text-xs font-semibold text-violet-100 transition hover:bg-violet-500/25"
          >
            + Tambah email
          </button>
        </div>
        <ul className="mt-4 space-y-3">
          {settings.emails.map((row, idx) => (
            <li
              key={row.id}
              className="rounded-xl border border-white/10 bg-slate-950/40 p-4 transition hover:border-violet-400/25"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Email {idx + 1}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
                    <input
                      type="radio"
                      name="email-primary"
                      checked={row.isPrimary}
                      onChange={() => {
                        setSettings((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            emails: prev.emails.map((x) => ({
                              ...x,
                              isPrimary: x.id === row.id,
                            })),
                          };
                        });
                        setStatus("Perubahan belum disimpan.");
                      }}
                      className="h-3.5 w-3.5 border-slate-500 text-violet-500"
                    />
                    Utama
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setSettings((prev) => {
                        if (!prev) return prev;
                        const filtered = prev.emails.filter((x) => x.id !== row.id);
                        const next =
                          filtered.length && !filtered.some((x) => x.isPrimary)
                            ? filtered.map((x, i) => ({ ...x, isPrimary: i === 0 }))
                            : filtered;
                        return { ...prev, emails: next };
                      });
                      setStatus("Perubahan belum disimpan.");
                    }}
                    className="text-xs font-medium text-rose-300/90 hover:text-rose-200"
                  >
                    Hapus
                  </button>
                </div>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <span className="text-[11px] text-slate-500">Label</span>
                  <input
                    type="text"
                    value={row.label}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSettings((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          emails: prev.emails.map((x) => (x.id === row.id ? { ...x, label: v } : x)),
                        };
                      });
                      setStatus("Perubahan belum disimpan.");
                    }}
                    className="mt-1 w-full rounded-lg border border-white/12 bg-slate-950/50 px-2.5 py-2 text-sm text-white outline-none focus:border-violet-400/40"
                    placeholder="Support"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Email</span>
                  <input
                    type="email"
                    value={row.email}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSettings((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          emails: prev.emails.map((x) => (x.id === row.id ? { ...x, email: v } : x)),
                        };
                      });
                      setStatus("Perubahan belum disimpan.");
                    }}
                    onBlur={() => {
                      const em = sanitizeEmail(row.email);
                      setSettings((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          emails: prev.emails.map((x) => (x.id === row.id ? { ...x, email: em } : x)),
                        };
                      });
                    }}
                    className="mt-1 w-full rounded-lg border border-white/12 bg-slate-950/50 px-2.5 py-2 text-sm text-white outline-none focus:border-violet-400/40"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className={divider} />

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg backdrop-blur-md">
        <h2 className="text-base font-semibold text-white">Meta default beranda &amp; pratinjau tautan</h2>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          Untuk beranda (<code className="text-slate-300">/</code>) dan pratinjau default bila halaman lain kosong. Tiap
          URL <code className="text-slate-300">/artikel/…</code> punya meta sendiri — sunting lewat{" "}
          <Link href="/site-admin/seo-articles" className="text-emerald-300/95 hover:text-emerald-200 hover:underline">
            editor artikel
          </Link>
          .
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <FieldLabel hint="Judul default situs (bukan judul per artikel).">Meta title (beranda)</FieldLabel>
            <input
              type="text"
              value={settings.seoContent.metaTitle}
              onChange={(e) => updateSeo({ metaTitle: e.target.value })}
              className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
            />
          </div>
          <div>
            <FieldLabel hint="Ringkasan default untuk beranda & pratinjau sosial.">Meta description (beranda)</FieldLabel>
            <textarea
              value={settings.seoContent.metaDescription}
              onChange={(e) => updateSeo({ metaDescription: e.target.value })}
              rows={3}
              className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
            />
          </div>
          <div>
            <FieldLabel hint="Kata kunci umum situs; pisahkan dengan koma. Bukan daftar keyword artikel.">
              Keywords (situs)
            </FieldLabel>
            <textarea
              value={settings.seoContent.keywords}
              onChange={(e) => updateSeo({ keywords: e.target.value })}
              rows={2}
              className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
            />
          </div>
        </div>
      </section>

      <div className={divider} />

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg backdrop-blur-md">
        <h2 className="text-base font-semibold text-white">Organisasi, layanan lokal &amp; footer</h2>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          Schema organisasi, wilayah layanan, footer — tidak menggantikan isi artikel di{" "}
          <code className="text-slate-300">/artikel</code>.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <FieldLabel hint="Teks deskripsi bisnis untuk schema & konteks SEO situs.">
              Deskripsi perusahaan (schema)
            </FieldLabel>
            <textarea
              value={settings.seoContent.companyDescription}
              onChange={(e) => updateSeo({ companyDescription: e.target.value })}
              rows={4}
              className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
            />
          </div>
          <div>
            <FieldLabel hint="Wilayah layanan untuk SEO lokal & schema (pisahkan koma atau baris baru).">
              Service areas
            </FieldLabel>
            <textarea
              value={settings.seoContent.serviceAreas}
              onChange={(e) => updateSeo({ serviceAreas: e.target.value })}
              rows={3}
              className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
              placeholder="Jakarta, Tangerang, Surabaya…"
            />
          </div>
          <div>
            <FieldLabel hint="Paragraf tambahan situs (opsional). Bukan isi halaman /artikel.">
              Konten tambahan situs
            </FieldLabel>
            <textarea
              value={settings.seoContent.additionalSeoContent}
              onChange={(e) => updateSeo({ additionalSeoContent: e.target.value })}
              rows={4}
              className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/25"
            />
          </div>
        </div>
      </section>

      <div className={divider} />

      <SiteSettingsEnterpriseSection settings={settings} update={update} gateHeaders={gateHeaders} />

      <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
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
          className="rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-400 disabled:opacity-40"
        >
          {busy ? "Menyimpan…" : "Simpan"}
        </button>
      </div>
      <p className="text-center text-xs text-slate-500">{status || " "}</p>

      <div className={divider} />

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg backdrop-blur-md motion-safe:animate-[premium-page-reveal_380ms_var(--ease-premium-soft)_both]">
        <h2 className="text-base font-semibold text-white">Backup &amp; restore</h2>
        <p className="mt-2 text-xs text-slate-400">
          Maksimal 20 backup terbaru; restore mengisi draft (lalu simpan atau publish jika perlu).
        </p>
        <div className="mt-3 space-y-2">
          {backups.slice(0, 8).map((b) => (
            <div
              key={b.file}
              className="flex items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs"
            >
              <div className="min-w-0">
                <p className="truncate text-slate-200">{b.file}</p>
                <p className="text-slate-500">{new Date(b.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void downloadBackupFile(b.file)}
                  className="rounded border border-white/20 px-2 py-1 text-slate-200 hover:bg-white/10"
                >
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => void restoreBackup(b.file)}
                  disabled={busy}
                  className="rounded border border-sky-300/30 px-2 py-1 text-sky-200 hover:bg-sky-400/10 disabled:opacity-40"
                >
                  Restore
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
