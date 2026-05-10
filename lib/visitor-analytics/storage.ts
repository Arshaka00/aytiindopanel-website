import { appendFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type { VisitorAnalyticsEvent } from "@/lib/visitor-analytics/types";

export const VISITOR_ANALYTICS_DIR = path.join(process.cwd(), "data", "visitor-analytics");
export const VISITOR_ANALYTICS_EVENTS_FILE = path.join(VISITOR_ANALYTICS_DIR, "events.jsonl");
export const VISITOR_ANALYTICS_META_FILE = path.join(VISITOR_ANALYTICS_DIR, "meta.json");

/** Jeda minimum antar pembersihan otomatis (sekali per jam). */
export const VISITOR_ANALYTICS_CLEANUP_INTERVAL_MS = 3600000;

export function getRetentionDays(): number {
  const raw = process.env.VISITOR_ANALYTICS_RETENTION_DAYS?.trim();
  const n = raw ? Number.parseInt(raw, 10) : 90;
  if (!Number.isFinite(n) || n < 7) return 90;
  if (n > 365) return 365;
  return n;
}

type MetaFile = {
  lastCleanupAt?: string;
};

export async function readMeta(): Promise<MetaFile> {
  try {
    const raw = await readFile(VISITOR_ANALYTICS_META_FILE, "utf8");
    return JSON.parse(raw) as MetaFile;
  } catch {
    return {};
  }
}

export async function writeMeta(meta: MetaFile): Promise<void> {
  await mkdir(VISITOR_ANALYTICS_DIR, { recursive: true });
  await writeFile(VISITOR_ANALYTICS_META_FILE, JSON.stringify(meta, null, 2), "utf8");
}

/** Tambah satu baris JSONL — tidak diblok untuk respons cepat (dipanggil tanpa await dari route). */
export async function appendVisitorEvent(event: VisitorAnalyticsEvent): Promise<void> {
  await mkdir(VISITOR_ANALYTICS_DIR, { recursive: true });
  await appendFile(VISITOR_ANALYTICS_EVENTS_FILE, `${JSON.stringify(event)}\n`, "utf8");
}

/** Baca seluruh event (untuk agregasi dashboard — sesuaikan retention agar file tidak membengkak). */
export async function readAllVisitorEvents(): Promise<VisitorAnalyticsEvent[]> {
  try {
    const raw = await readFile(VISITOR_ANALYTICS_EVENTS_FILE, "utf8");
    const lines = raw.split("\n").filter(Boolean);
    const out: VisitorAnalyticsEvent[] = [];
    for (const ln of lines) {
      try {
        out.push(JSON.parse(ln) as VisitorAnalyticsEvent);
      } catch {
        /* skip corrupt line */
      }
    }
    return out;
  } catch {
    return [];
  }
}

/** Hapus event lebih lama dari retention; berjalan paling banyak sekali per {@link VISITOR_ANALYTICS_CLEANUP_INTERVAL_MS}. */
export async function cleanupOldEventsIfNeeded(force = false): Promise<void> {
  const retentionMs = getRetentionDays() * 86400000;
  const cutoff = Date.now() - retentionMs;

  const meta = await readMeta();
  const last = meta.lastCleanupAt ? Date.parse(meta.lastCleanupAt) : 0;
  const gap = Date.now() - last;
  if (!force && gap < VISITOR_ANALYTICS_CLEANUP_INTERVAL_MS && last > 0) return;

  let events: VisitorAnalyticsEvent[];
  try {
    events = await readAllVisitorEvents();
  } catch {
    return;
  }

  const kept = events.filter((e) => {
    const t = Date.parse(e.ts);
    return Number.isFinite(t) && t >= cutoff;
  });

  if (kept.length === events.length) {
    await writeMeta({ ...meta, lastCleanupAt: new Date().toISOString() });
    return;
  }

  const tmp = path.join(VISITOR_ANALYTICS_DIR, `events.${Date.now()}.tmp.jsonl`);
  await writeFile(tmp, kept.map((e) => JSON.stringify(e)).join("\n") + (kept.length ? "\n" : ""), "utf8");
  await rename(tmp, VISITOR_ANALYTICS_EVENTS_FILE);
  await writeMeta({ ...meta, lastCleanupAt: new Date().toISOString() }).catch(() => {});
}

async function writeVisitorEventsFile(events: VisitorAnalyticsEvent[]): Promise<void> {
  await mkdir(VISITOR_ANALYTICS_DIR, { recursive: true });
  const tmp = path.join(VISITOR_ANALYTICS_DIR, `events.${Date.now()}.tmp.jsonl`);
  const body = events.map((e) => JSON.stringify(e)).join("\n") + (events.length ? "\n" : "");
  await writeFile(tmp, body, "utf8");
  await rename(tmp, VISITOR_ANALYTICS_EVENTS_FILE);
  const meta = await readMeta();
  await writeMeta({ ...meta, lastCleanupAt: new Date().toISOString() });
}

/** Hanya hapus event sesi (`visit`) & klik WhatsApp — pertahankan `pageview` (halaman/kota/grafik berbasis halaman). */
export async function purgeSessionAndWhatsAppEvents(): Promise<void> {
  const events = await readAllVisitorEvents();
  const kept = events.filter((e) => e.kind === "pageview");
  await writeVisitorEventsFile(kept);
}

/** Kosongkan seluruh file log (aksi manual — termasuk tampilan halaman & kota). */
export async function purgeAllVisitorEvents(): Promise<void> {
  await writeVisitorEventsFile([]);
}
