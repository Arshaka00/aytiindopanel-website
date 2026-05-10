"use client";

import Link from "next/link";
import { useState } from "react";

export function DeviceBindForm() {
  const [serial, setSerial] = useState("");
  const [bindSecret, setBindSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/gallery-admin/device-bind", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serial: serial.trim(), bindSecret: bindSecret.trim() }),
      });
      const j = (await r.json().catch(() => ({}))) as { error?: string; ok?: boolean };
      if (!r.ok) {
        setMsg(j.error ?? "Gagal.");
        return;
      }
      setMsg("Perangkat terikat. Anda dapat membuka beranda — tombol admin akan tampil.");
    } catch {
      setMsg("Jaringan bermasalah.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-[70vh] bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(56,189,248,0.12),transparent_55%),linear-gradient(180deg,#020617,#0f172a)] px-4 py-16 text-slate-100">
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl backdrop-blur-xl">
        <h1 className="text-lg font-semibold text-white">Pasangkan perangkat admin</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Sekali saja pada MacBook yang diizinkan. Serial dan token bind hanya ada di{" "}
          <code className="rounded bg-white/5 px-1">.env</code> server — tidak disematkan di kode
          frontend publik.
        </p>
        <form onSubmit={(ev) => void onSubmit(ev)} className="mt-6 space-y-4">
          <label className="block text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
            Serial perangkat
            <input
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/12 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none focus-visible:border-sky-400/45"
              autoComplete="off"
              placeholder="Contoh: DY9NYPV9TH"
            />
          </label>
          <label className="block text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
            Bind token (dari server)
            <input
              type="password"
              value={bindSecret}
              onChange={(e) => setBindSecret(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/12 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none focus-visible:border-sky-400/45"
              autoComplete="off"
            />
          </label>
          <button
            type="submit"
            disabled={busy || !serial.trim() || !bindSecret.trim()}
            className="w-full rounded-xl bg-sky-500 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-sky-400 disabled:opacity-50"
          >
            {busy ? "Memproses…" : "Pasangkan"}
          </button>
        </form>
        {msg ? <p className="mt-4 text-sm text-sky-200/90">{msg}</p> : null}
        <p className="mt-6 text-center text-xs text-slate-500">
          <Link href="/" className="text-sky-300 hover:underline">
            ← Kembali ke beranda
          </Link>
        </p>
      </div>
    </main>
  );
}
