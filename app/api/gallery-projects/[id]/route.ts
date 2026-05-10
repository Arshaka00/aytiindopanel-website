import { promises as fs } from "node:fs";
import path from "node:path";

import { NextResponse, type NextRequest } from "next/server";

import {
  GALLERY_PROJECTS,
  PROJECT_CATEGORIES,
  type GalleryProjectItem,
  type ProjectStatus,
} from "@/components/aytipanel/gallery-project-data";
import { hasValidAdminSessionFromRequest, isAllowedAdminDevice } from "@/lib/gallery-admin-auth";

const EXTRA_PATH = path.join(process.cwd(), "data", "gallery-project-extra.json");
const OVERRIDES_PATH = path.join(process.cwd(), "data", "gallery-project-overrides.json");
const ALLOWED_STATUS: readonly ProjectStatus[] = [
  "Ongoing",
  "Completed",
  "Maintenance",
  "Commissioning",
];
const ALLOWED_CATEGORIES = new Set(
  PROJECT_CATEGORIES.filter((c): c is Exclude<(typeof PROJECT_CATEGORIES)[number], "All"> => c !== "All"),
);

type ProjectUpdates = Partial<Omit<GalleryProjectItem, "id">>;

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}

function isProjectStatus(v: unknown): v is ProjectStatus {
  return typeof v === "string" && ALLOWED_STATUS.includes(v as ProjectStatus);
}

function isCategory(v: unknown): v is Exclude<(typeof PROJECT_CATEGORIES)[number], "All"> {
  return typeof v === "string" && ALLOWED_CATEGORIES.has(v as Exclude<(typeof PROJECT_CATEGORIES)[number], "All">);
}

function isGalleryPhotos(v: unknown): v is { src: string; alt: string }[] {
  if (!Array.isArray(v)) return false;
  return v.every((x) => {
    if (!x || typeof x !== "object") return false;
    const p = x as Record<string, unknown>;
    return typeof p.src === "string" && p.src.startsWith("/") && typeof p.alt === "string" && p.alt.trim().length > 0;
  });
}

function sanitizeUpdates(input: unknown): ProjectUpdates | null {
  if (!input || typeof input !== "object") return null;
  const u = input as Record<string, unknown>;
  const out: ProjectUpdates = {};

  if (u.name !== undefined) {
    if (typeof u.name !== "string" || u.name.trim() === "") return null;
    out.name = u.name.trim();
  }
  if (u.category !== undefined) {
    if (!isCategory(u.category)) return null;
    out.category = u.category;
  }
  if (u.location !== undefined) {
    if (typeof u.location !== "string") return null;
    out.location = u.location;
  }
  if (u.year !== undefined) {
    if (u.year !== null && typeof u.year !== "string") return null;
    out.year = (u.year ?? undefined) as string | undefined;
  }
  if (u.systemType !== undefined) {
    if (typeof u.systemType !== "string") return null;
    out.systemType = u.systemType;
  }
  if (u.status !== undefined) {
    if (!isProjectStatus(u.status)) return null;
    out.status = u.status;
  }
  if (u.description !== undefined) {
    if (typeof u.description !== "string") return null;
    out.description = u.description;
  }
  if (u.imageSrc !== undefined) {
    if (typeof u.imageSrc !== "string" || !u.imageSrc.startsWith("/")) return null;
    out.imageSrc = u.imageSrc;
  }
  if (u.imageAlt !== undefined) {
    if (typeof u.imageAlt !== "string" || u.imageAlt.trim() === "") return null;
    out.imageAlt = u.imageAlt;
  }
  if (u.progress !== undefined) {
    if (u.progress !== null && (typeof u.progress !== "number" || u.progress < 0 || u.progress > 100)) return null;
    out.progress = (u.progress ?? undefined) as number | undefined;
  }
  if (u.videoSrc !== undefined) {
    if (u.videoSrc !== null && typeof u.videoSrc !== "string") return null;
    out.videoSrc = (u.videoSrc ?? undefined) as string | undefined;
  }
  if (u.videoPosterSrc !== undefined) {
    if (u.videoPosterSrc !== null && typeof u.videoPosterSrc !== "string") return null;
    out.videoPosterSrc = (u.videoPosterSrc ?? undefined) as string | undefined;
  }
  if (u.videoAutoplay !== undefined) {
    if (u.videoAutoplay !== null && typeof u.videoAutoplay !== "boolean") return null;
    out.videoAutoplay = (u.videoAutoplay ?? undefined) as boolean | undefined;
  }
  if (u.galleryPhotos !== undefined) {
    if (u.galleryPhotos !== null && !isGalleryPhotos(u.galleryPhotos)) return null;
    out.galleryPhotos = (u.galleryPhotos ?? undefined) as { src: string; alt: string }[] | undefined;
  }
  return out;
}

function applyUpdates(base: GalleryProjectItem, updates: ProjectUpdates): GalleryProjectItem {
  const next: GalleryProjectItem = { ...base, ...updates };
  if ("year" in updates && updates.year === undefined) delete next.year;
  if ("progress" in updates && updates.progress === undefined) delete next.progress;
  if ("videoSrc" in updates && updates.videoSrc === undefined) delete next.videoSrc;
  if ("videoPosterSrc" in updates && updates.videoPosterSrc === undefined) delete next.videoPosterSrc;
  if ("videoAutoplay" in updates && updates.videoAutoplay === undefined) delete next.videoAutoplay;
  if ("galleryPhotos" in updates && updates.galleryPhotos === undefined) delete next.galleryPhotos;
  return next;
}

function compactPatch(patch: ProjectUpdates): ProjectUpdates {
  const x: ProjectUpdates = { ...patch };
  for (const k of Object.keys(x) as (keyof ProjectUpdates)[]) {
    if (x[k] === undefined) delete x[k];
  }
  return x;
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await ctx.params;
  const id = decodeURIComponent(rawId).trim();
  if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

  const extra = await readJsonFile<GalleryProjectItem[]>(EXTRA_PATH, []);
  const foundExtra = extra.find((p) => p.id === id);
  if (foundExtra) return NextResponse.json({ project: foundExtra });

  const base = GALLERY_PROJECTS.find((p) => p.id === id);
  if (!base) return NextResponse.json({ error: "project tidak ditemukan" }, { status: 404 });

  const overrides = await readJsonFile<Record<string, ProjectUpdates>>(OVERRIDES_PATH, {});
  const patch = overrides[id] ?? {};
  return NextResponse.json({ project: applyUpdates(base, patch) });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAllowedAdminDevice(req.headers, req.cookies) || !hasValidAdminSessionFromRequest(req)) {
    return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 401 });
  }

  const { id: rawId } = await ctx.params;
  const id = decodeURIComponent(rawId).trim();
  if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

  const body = (await req.json().catch(() => null)) as { updates?: unknown } | null;
  const updates = sanitizeUpdates(body?.updates);
  if (!updates) return NextResponse.json({ error: "updates tidak valid" }, { status: 400 });

  const extra = await readJsonFile<GalleryProjectItem[]>(EXTRA_PATH, []);
  const ei = extra.findIndex((p) => p.id === id);
  if (ei !== -1) {
    const updated = applyUpdates(extra[ei], updates);
    const next = [...extra];
    next[ei] = updated;
    await writeJsonFile(EXTRA_PATH, next);
    return NextResponse.json({ ok: true, project: updated });
  }

  const base = GALLERY_PROJECTS.find((p) => p.id === id);
  if (!base) return NextResponse.json({ error: "project tidak ditemukan" }, { status: 404 });

  const overrides = await readJsonFile<Record<string, ProjectUpdates>>(OVERRIDES_PATH, {});
  const mergedPatch = compactPatch({ ...(overrides[id] ?? {}), ...updates });
  overrides[id] = mergedPatch;
  await writeJsonFile(OVERRIDES_PATH, overrides);

  return NextResponse.json({ ok: true, project: applyUpdates(base, mergedPatch) });
}

const HIDDEN_PATH = path.join(process.cwd(), "data", "gallery-project-hidden.json");

async function readHiddenIds(): Promise<string[]> {
  try {
    const raw = await fs.readFile(HIDDEN_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  } catch {
    return [];
  }
}

async function writeHiddenIds(ids: string[]): Promise<void> {
  await fs.mkdir(path.dirname(HIDDEN_PATH), { recursive: true });
  await fs.writeFile(HIDDEN_PATH, JSON.stringify(ids, null, 2), "utf8");
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAllowedAdminDevice(req.headers, req.cookies) || !hasValidAdminSessionFromRequest(req)) {
    return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 401 });
  }

  const { id: rawId } = await ctx.params;
  const id = decodeURIComponent(rawId).trim();
  if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

  const extra = await readJsonFile<GalleryProjectItem[]>(EXTRA_PATH, []);
  const ei = extra.findIndex((p) => p.id === id);
  if (ei !== -1) {
    const nextExtra = extra.filter((p) => p.id !== id);
    await writeJsonFile(EXTRA_PATH, nextExtra);
    const overrides = await readJsonFile<Record<string, ProjectUpdates>>(OVERRIDES_PATH, {});
    if (overrides[id]) {
      delete overrides[id];
      await writeJsonFile(OVERRIDES_PATH, overrides);
    }
    return NextResponse.json({ ok: true, mode: "removed_extra" });
  }

  const base = GALLERY_PROJECTS.find((p) => p.id === id);
  if (!base) return NextResponse.json({ error: "project tidak ditemukan" }, { status: 404 });

  const hidden = await readHiddenIds();
  if (!hidden.includes(id)) {
    hidden.push(id);
    await writeHiddenIds(hidden);
  }
  const overrides = await readJsonFile<Record<string, ProjectUpdates>>(OVERRIDES_PATH, {});
  if (overrides[id]) {
    delete overrides[id];
    await writeJsonFile(OVERRIDES_PATH, overrides);
  }
  return NextResponse.json({ ok: true, mode: "hidden_base" });
}
