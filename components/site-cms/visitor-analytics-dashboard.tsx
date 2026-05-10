"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Summary = {
  visitsToday: number;
  uniqueVisitorsToday: number;
  whatsappClicksToday: number;
  topPage: string;
  topCity: string;
  pathCounts: { key: string; count: number }[];
  cityCounts: { key: string; count: number }[];
  deviceCounts: { key: string; count: number }[];
  browserCounts: { key: string; count: number }[];
  dailyBuckets: { date: string; visits: number; uniqueSid: number }[];
  whatsappClicksTotal: number;
};

type Row = {
  ts: string;
  kind: "pageview" | "visit" | "whatsapp_click";
  path: string;
  browser: string;
  device: string;
  city: string;
  country: string;
  referrerHost: string;
  referrerKind: string;
  waDestSuffix?: string;
};

function formatSource(e: Row): string {
  if (e.kind === "whatsapp_click") {
    const suf = e.waDestSuffix ? `***${e.waDestSuffix}` : "";
    return suf ? `WhatsApp → ${suf}` : "WhatsApp";
  }
  if (!e.referrerHost && e.referrerKind === "direct") return "Langsung / tidak ada";
  if (e.referrerKind === "search") return e.referrerHost ? `Pencarian (${e.referrerHost})` : "Pencarian";
  if (e.referrerKind === "social") return e.referrerHost ? `Sosial (${e.referrerHost})` : "Sosial";
  return e.referrerHost || "Referensi lain";
}

function formatWhen(ts: string): string {
  try {
    const d = new Date(ts);
    return d.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return ts;
  }
}

const divider =
  "my-8 h-px w-full rounded-full bg-gradient-to-r from-transparent via-white/14 to-transparent";

function MiniBars({
  label,
  rows,
  valueKey,
}: {
  label: string;
  rows: { key: string; count: number }[];
  valueKey: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <ul className="mt-3 space-y-2">
        {rows.slice(0, 8).map((r, idx) => (
          <li key={`${valueKey}-${idx}-${r.key}`} className="flex items-center gap-2 text-sm">
            <span className="w-[42%] truncate text-slate-300" title={r.key}>
              {r.key}
            </span>
            <div className="relative h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-800/90">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-500/80 to-cyan-400/55"
                style={{ width: `${Math.round((r.count / max) * 100)}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right tabular-nums text-slate-400">{r.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DailyChart({ buckets }: { buckets: Summary["dailyBuckets"] }) {
  const max = Math.max(1, ...buckets.map((b) => b.visits));
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        Sesi masuk per hari (30 hari)
      </p>
      <div className="mt-4 flex h-28 items-end gap-px overflow-x-auto pb-1">
        {buckets.map((b) => (
          <div key={b.date} className="group flex min-w-[10px] flex-1 flex-col items-center justify-end gap-1">
            <div
              className="w-full max-w-[14px] rounded-t-sm bg-gradient-to-t from-sky-600/60 to-cyan-400/45 transition group-hover:from-sky-500/85 group-hover:to-cyan-300/65"
              style={{
                height: `${Math.max(10, Math.round((b.visits / max) * 104))}px`,
              }}
              title={`${b.date}: ${b.visits} sesi masuk, ~${b.uniqueSid} sid unik`}
            />
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-[10px] text-slate-500">
        Hover bar untuk tanggal &amp; angka (tooltip native title).
      </p>
    </div>
  );
}

export function VisitorAnalyticsDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/visitor-analytics/dashboard?page=${p}&limit=${limit}`, {
        credentials: "include",
      });
      if (!r.ok) throw new Error(r.status === 401 ? "Tidak terotorisasi." : "Gagal memuat.");
      const j = (await r.json()) as {
        summary: Summary;
        rows: Row[];
        totalPages: number;
        total: number;
        page: number;
      };
      setSummary(j.summary);
      setRows(j.rows);
      setTotalPages(j.totalPages);
      setTotal(j.total);
      setPage(j.page);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void load(1);
  }, [load]);

  const exportFile = async (format: "csv" | "json") => {
    const r = await fetch(`/api/visitor-analytics/export?format=${format}`, { credentials: "include" });
    if (!r.ok) return;
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visitor-analytics.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cards = useMemo(() => {
    if (!summary) return null;
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Kunjungan hari ini", summary.visitsToday],
          ["Perkiraan unik hari ini", summary.uniqueVisitorsToday],
          ["Klik WhatsApp hari ini", summary.whatsappClicksToday],
          ["Halaman teratas", summary.topPage],
          ["Kota teratas", summary.topCity],
        ].map(([label, val]) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg backdrop-blur-md"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
            <p className="mt-3 font-mono text-2xl font-semibold tabular-nums text-white md:text-3xl">
              {typeof val === "number" ? val : String(val)}
            </p>
          </div>
        ))}
      </div>
    );
  }, [summary]);

  return (
    <main className="min-h-[85vh] bg-[radial-gradient(120%_85%_at_50%_-15%,rgba(56,189,248,0.12),transparent_55%),linear-gradient(180deg,#020617,#0f172a)] px-4 py-10 text-slate-100 md:px-6 md:py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300/90">CMS</p>
            <h1 className="mt-1 text-2xl font-semibold text-white md:text-3xl">Visitor Analytics</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
              Ringkasan traffic ringan — tanpa data pribadi. Penyimpanan JSONL dengan cleanup otomatis
              (retensi default 90 hari, override env{" "}
              <span className="font-mono text-slate-300">VISITOR_ANALYTICS_RETENTION_DAYS</span>).{" "}
              <span className="text-slate-500">
                Kartu &quot;Kunjungan hari ini&quot; = satu kali per sesi tab saat masuk; pindah halaman tidak
                menambah. Muat ulang di tab yang sama tidak menambah. Tab/jendela baru = sesi baru. Grafik batang &
                kota/perangkat mengacu pada tampilan halaman (bukan angka kunjungan sesi).
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void exportFile("csv")}
              className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => void exportFile("json")}
              className="rounded-xl border border-sky-400/35 px-4 py-2.5 text-xs font-semibold text-sky-200 transition hover:bg-sky-400/10"
            >
              Export JSON
            </button>
          </div>
        </header>

        {loading && !summary ? (
          <p className="text-center text-sm text-slate-500">Memuat analytics…</p>
        ) : null}
        {error ? (
          <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>
        ) : null}

        {cards}

        {summary ? (
          <>
            <div className={divider} />
            <section className="grid gap-6 lg:grid-cols-2">
              <DailyChart buckets={summary.dailyBuckets} />
              <MiniBars label="Perangkat" rows={summary.deviceCounts} valueKey="d" />
            </section>
            <section className="grid gap-6 lg:grid-cols-2">
              <MiniBars label="Browser" rows={summary.browserCounts} valueKey="b" />
              <MiniBars label="Kota (per tampilan halaman)" rows={summary.cityCounts} valueKey="c" />
            </section>
          </>
        ) : null}

        <div className={divider} />

        <section>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-white">Log terbaru</h2>
            <p className="text-xs text-slate-500">
              Total baris: <span className="font-mono text-slate-400">{total}</span>
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] shadow-inner backdrop-blur-md">
            <table className="min-w-[720px] w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-[#0b1224]/95 backdrop-blur-md">
                <tr className="border-b border-white/10 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <th className="px-4 py-3">Waktu</th>
                  <th className="px-4 py-3">Jenis</th>
                  <th className="px-4 py-3">Halaman</th>
                  <th className="px-4 py-3">Device</th>
                  <th className="px-4 py-3">Browser</th>
                  <th className="px-4 py-3">Kota</th>
                  <th className="px-4 py-3">Sumber</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {rows.map((e, i) => (
                  <tr key={`${e.ts}-${i}`} className="text-slate-300 hover:bg-white/[0.04]">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-400">
                      {formatWhen(e.ts)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          e.kind === "whatsapp_click"
                            ? "bg-emerald-500/20 text-emerald-200"
                            : e.kind === "visit"
                              ? "bg-violet-500/20 text-violet-200"
                              : "bg-sky-500/15 text-sky-200"
                        }`}
                      >
                        {e.kind === "whatsapp_click" ? "WA" : e.kind === "visit" ? "Sesi" : "Halaman"}
                      </span>
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3 font-mono text-xs text-slate-200" title={e.path}>
                      {e.path}
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-400">{e.device}</td>
                    <td className="px-4 py-3 text-slate-400">{e.browser}</td>
                    <td className="px-4 py-3 text-slate-400">{e.city !== "—" ? e.city : e.country}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-xs text-slate-400" title={formatSource(e)}>
                      {formatSource(e)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => void load(page - 1)}
              className="rounded-lg border border-white/15 px-4 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/10 disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <span className="text-xs text-slate-500">
              Halaman <span className="font-mono text-slate-300">{page}</span> /{" "}
              <span className="font-mono text-slate-300">{totalPages}</span>
            </span>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => void load(page + 1)}
              className="rounded-lg border border-white/15 px-4 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/10 disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
