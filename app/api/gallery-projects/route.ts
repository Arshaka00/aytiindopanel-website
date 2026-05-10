import { promises as fs } from "node:fs";
import path from "node:path";

import { NextResponse, type NextRequest } from "next/server";

import {
  PROJECT_CATEGORIES,
  type GalleryProjectItem,
  type ProjectStatus,
} from "@/components/aytipanel/gallery-project-data";
import { hasValidAdminSessionFromRequest, isAllowedAdminDevice } from "@/lib/gallery-admin-auth";

const EXTRA_STORE_PATH = path.join(process.cwd(), "data", "gallery-project-extra.json");
const ALLOWED_STATUS: readonly ProjectStatus[] = [
  "Ongoing",
  "Completed",
  "Maintenance",
  "Commissioning",
];
const ALLOWED_CATEGORIES = new Set(
  PROJECT_CATEGORIES.filter((c): c is Exclude<(typeof PROJECT_CATEGORIES)[number], "All"> => c !== "All"),
);

async function readExtraProjects(): Promise<GalleryProjectItem[]> {
  try {
    const raw = await fs.readFile(EXTRA_STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as GalleryProjectItem[];
  } catch {
    return [];
  }
}

async function writeExtraProjects(projects: GalleryProjectItem[]): Promise<void> {
  await fs.mkdir(path.dirname(EXTRA_STORE_PATH), { recursive: true });
  await fs.writeFile(EXTRA_STORE_PATH, JSON.stringify(projects, null, 2), "utf8");
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isValidProjectInput(v: unknown): v is GalleryProjectItem {
  if (!v || typeof v !== "object") return false;
  const p = v as Record<string, unknown>;
  if (!isNonEmptyString(p.id)) return false;
  if (!isNonEmptyString(p.name)) return false;
  if (!isNonEmptyString(p.location)) return false;
  if (!isNonEmptyString(p.systemType)) return false;
  if (!isNonEmptyString(p.description)) return false;
  if (!isNonEmptyString(p.imageSrc) || !p.imageSrc.startsWith("/")) return false;
  if (!isNonEmptyString(p.imageAlt)) return false;
  if (!isNonEmptyString(p.category) || !ALLOWED_CATEGORIES.has(p.category as Exclude<(typeof PROJECT_CATEGORIES)[number], "All">))
    return false;
  if (!isNonEmptyString(p.status) || !ALLOWED_STATUS.includes(p.status as ProjectStatus)) return false;
  if (p.year !== undefined && typeof p.year !== "string") return false;
  if (p.progress !== undefined && (typeof p.progress !== "number" || p.progress < 0 || p.progress > 100)) return false;
  if (p.videoSrc !== undefined && typeof p.videoSrc !== "string") return false;
  if (p.videoPosterSrc !== undefined && typeof p.videoPosterSrc !== "string") return false;
  if (p.videoAutoplay !== undefined && typeof p.videoAutoplay !== "boolean") return false;
  if (p.galleryPhotos !== undefined) {
    if (!Array.isArray(p.galleryPhotos)) return false;
    for (const ph of p.galleryPhotos) {
      if (!ph || typeof ph !== "object") return false;
      const x = ph as Record<string, unknown>;
      if (!isNonEmptyString(x.src) || !x.src.startsWith("/")) return false;
      if (!isNonEmptyString(x.alt)) return false;
    }
  }
  return true;
}

export async function GET() {
  const projects = await readExtraProjects();
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  if (!isAllowedAdminDevice(req.headers, req.cookies) || !hasValidAdminSessionFromRequest(req)) {
    return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 401 });
  }

  try {
    const body = (await req.json()) as { project?: unknown };
    if (!isValidProjectInput(body.project)) {
      return NextResponse.json({ error: "data project tidak valid" }, { status: 400 });
    }

    const project = body.project;
    const current = await readExtraProjects();
    const next = [project, ...current.filter((p) => p.id !== project.id)];
    await writeExtraProjects(next);
    return NextResponse.json({ ok: true, project });
  } catch {
    return NextResponse.json({ error: "payload tidak valid" }, { status: 400 });
  }
}
