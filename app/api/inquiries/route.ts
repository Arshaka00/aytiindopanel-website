import { randomUUID } from "node:crypto";
import { mkdir, appendFile, readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse, type NextRequest } from "next/server";

import { rateLimitRequest } from "@/lib/api-rate-limit";
import { canEditContent, resolveCmsRole } from "@/lib/cms-role";
import { hasValidAdminSessionFromRequest, isAllowedAdminDevice } from "@/lib/gallery-admin-auth";

const DATA_DIR = path.join(process.cwd(), "data");
const INQUIRIES_FILE = path.join(DATA_DIR, "inquiries.jsonl");

export type InquiryRecord = {
  id: string;
  nama: string;
  perusahaan: string;
  whatsapp: string;
  email: string;
  pesan: string;
  timestamp: string;
};

/** Form publik: simpan inquiry (rate limited). Admin GET: unduh CSV. */
export async function POST(req: NextRequest) {
  if (!rateLimitRequest(req, "inquiry-post", 12, 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak pengiriman." }, { status: 429 });
  }
  const body = (await req.json().catch(() => null)) as Partial<InquiryRecord> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }
  const nama = String(body.nama ?? "").trim().slice(0, 200);
  const pesan = String(body.pesan ?? "").trim().slice(0, 8000);
  if (!nama || !pesan) {
    return NextResponse.json({ error: "Nama dan pesan wajib." }, { status: 400 });
  }

  const row: InquiryRecord = {
    id: randomUUID(),
    nama,
    perusahaan: String(body.perusahaan ?? "").trim().slice(0, 200),
    whatsapp: String(body.whatsapp ?? "").trim().slice(0, 40),
    email: String(body.email ?? "").trim().slice(0, 200),
    pesan,
    timestamp: new Date().toISOString(),
  };

  try {
    await mkdir(DATA_DIR, { recursive: true });
    await appendFile(INQUIRIES_FILE, `${JSON.stringify(row)}\n`, "utf8");
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  if (!isAllowedAdminDevice(req.headers, req.cookies) || !hasValidAdminSessionFromRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = resolveCmsRole(req);
  if (!canEditContent(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const raw = await readFile(INQUIRIES_FILE, "utf8").catch(() => "");
    const lines = raw.split("\n").filter(Boolean);
    const rows = lines.map((ln) => JSON.parse(ln) as InquiryRecord);
    const header = "id,timestamp,nama,perusahaan,whatsapp,email,pesan\n";
    const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const csv =
      header +
      rows
        .map((r) =>
          [r.id, r.timestamp, r.nama, r.perusahaan, r.whatsapp, r.email, r.pesan].map(escape).join(","),
        )
        .join("\n");
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="inquiries.csv"',
      },
    });
  } catch {
    return NextResponse.json({ error: "Gagal membaca data." }, { status: 500 });
  }
}
