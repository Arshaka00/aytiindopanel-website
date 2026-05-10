"use client";

import Link from "next/link";
import { useState } from "react";

import { useSiteCms } from "@/components/site-cms/site-cms-provider";

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const key = `${name}=`;
  const entry = document.cookie.split("; ").find((c) => c.startsWith(key));
  if (!entry) return "";
  return decodeURIComponent(entry.slice(key.length));
}

export function SiteSettingsPasswordGate({ onUnlocked }: { onUnlocked: (gateToken: string) => void }) {
  const cms = useSiteCms();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const sessionOk = await cms.ensureWriteSession();
      if (!sessionOk) {
        setError(
          "Login admin Panel dibatalkan. Sandi di kolom ini khusus pengaturan situs, berbeda dari sandi login Panel.",
        );
        return;
      }
      const r = await fetch("/api/site-settings/gate", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-cms-csrf-token": readCookie("cms_csrf_token"),
        },
        body: JSON.stringify({ password }),
      });
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; token?: string; error?: string };
      if (!r.ok || !j.token) {
        setError(j.error ?? "Gagal membuka kunci.");
        return;
      }
      setPassword("");
      onUnlocked(j.token);
    } catch {
      setError("Gagal menghubungi server.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8">
      <div className="space-y-2 text-center">
        <h1 className="font-[family-name:var(--font-sora)] text-2xl font-extrabold tracking-tight text-white">
          Pengaturan situs terkunci
        </h1>
        <p className="text-sm leading-relaxed text-slate-400">
          Pada kunjungan pertama di tab ini Anda akan diminta <span className="text-slate-300">sandi admin Panel</span>{" "}
          (modal, jika perlu) dan <span className="text-slate-300">sandi pengaturan situs</span> di bawah. Setelah
          berhasil, Anda bisa memuat ulang halaman tanpa mengisi lagi sampai tab ditutup atau akses kedaluwarsa.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md"
      >
        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Sandi pengaturan situs
          </span>
          <input
            type="password"
            name="site-settings-password"
            autoComplete="current-password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            className="w-full rounded-xl border border-white/12 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none ring-sky-500/40 placeholder:text-slate-600 focus:border-sky-500/50 focus:ring-2"
            placeholder="••••••••"
            disabled={busy}
          />
        </label>

        {error ? (
          <p className="mt-4 text-center text-sm text-rose-300" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy || !password.trim()}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-900/30 transition hover:from-sky-500 hover:to-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Memverifikasi…" : "Buka kunci"}
        </button>

        <p className="mt-6 text-center text-[11px] text-slate-500">
          Jika CSRF gagal, muat ulang beranda lalu buka halaman ini lagi.
        </p>
      </form>

      <p className="text-center text-sm text-slate-500">
        <Link href="/site-admin" className="text-sky-400 underline-offset-4 hover:text-sky-300 hover:underline">
          ← Kembali ke panel
        </Link>
      </p>
    </div>
  );
}
