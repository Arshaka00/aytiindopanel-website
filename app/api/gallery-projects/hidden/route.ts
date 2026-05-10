import { promises as fs } from "node:fs";
import path from "node:path";

import { NextResponse, type NextRequest } from "next/server";
import { hasValidAdminSessionFromRequest, isAllowedAdminDevice } from "@/lib/gallery-admin-auth";

const STORE_PATH = path.join(process.cwd(), "data", "gallery-project-hidden.json");

async function readHiddenIds(): Promise<string[]> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  } catch {
    return [];
  }
}

async function writeHiddenIds(ids: string[]): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(ids, null, 2), "utf8");
}

export async function GET() {
  const ids = await readHiddenIds();
  return NextResponse.json({ ids });
}

export async function POST(req: NextRequest) {
  if (!isAllowedAdminDevice(req.headers, req.cookies) || !hasValidAdminSessionFromRequest(req)) {
    return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 401 });
  }

  try {
    const body = (await req.json()) as { id?: unknown };
    const id = typeof body.id === "string" ? body.id.trim() : "";
    if (!id) {
      return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });
    }
    const current = await readHiddenIds();
    if (!current.includes(id)) {
      current.push(id);
      await writeHiddenIds(current);
    }
    return NextResponse.json({ ok: true, ids: current });
  } catch {
    return NextResponse.json({ error: "payload tidak valid" }, { status: 400 });
  }
}
