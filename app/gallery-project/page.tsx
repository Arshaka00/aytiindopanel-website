import type { Metadata } from "next";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Suspense } from "react";
import { cookies, headers } from "next/headers";

import {
  GALLERY_PROJECTS,
  type GalleryProjectItem,
} from "@/components/aytipanel/gallery-project-data";
import { GalleryProjectPage } from "@/components/aytipanel/gallery-project-page";
import { getAdminCookieName, isAllowedAdminDevice, verifyAdminSessionToken } from "@/lib/gallery-admin-auth";
import { getSiteContent } from "@/lib/site-content";
import { resolveSiteMetadataForPage } from "@/lib/site-seo-resolve";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const name = content.siteSettings.siteName.trim() || "PT AYTI INDO PANEL";
  return resolveSiteMetadataForPage("gallery", content, "/gallery-project", {
    titleFallback: `Gallery Project | ${name}`,
    descriptionFallback:
      "Dokumentasi proyek panel insulated, cold storage, dan refrigerasi untuk kebutuhan industri dan operasional bersuhu terkontrol.",
  });
}

async function readHiddenIdsServer(): Promise<Set<string>> {
  try {
    const filePath = path.join(process.cwd(), "data", "gallery-project-hidden.json");
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is string => typeof x === "string" && x.trim().length > 0));
  } catch {
    return new Set();
  }
}

async function readExtraProjectsServer(): Promise<GalleryProjectItem[]> {
  try {
    const filePath = path.join(process.cwd(), "data", "gallery-project-extra.json");
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as GalleryProjectItem[];
  } catch {
    return [];
  }
}

async function readOverridesServer(): Promise<Partial<Record<string, Partial<GalleryProjectItem>>>> {
  try {
    const filePath = path.join(process.cwd(), "data", "gallery-project-overrides.json");
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Partial<Record<string, Partial<GalleryProjectItem>>>;
  } catch {
    return {};
  }
}

function applyPatch(base: GalleryProjectItem, patch?: Partial<GalleryProjectItem>): GalleryProjectItem {
  if (!patch) return base;
  const next: GalleryProjectItem = { ...base, ...patch, id: base.id };
  return next;
}

export default async function GalleryProjectRoute() {
  const content = await getSiteContent();
  const cookieStore = await cookies();
  const headersStore = await headers();
  const adminDeviceAllowed = isAllowedAdminDevice(headersStore, cookieStore);
  const adminToken = cookieStore.get(getAdminCookieName())?.value ?? "";
  const adminAuthenticated = adminDeviceAllowed && verifyAdminSessionToken(adminToken, headersStore);

  const hiddenIds = await readHiddenIdsServer();
  const extra = await readExtraProjectsServer();
  const overrides = await readOverridesServer();
  const extraVisible = extra.filter((p) => !hiddenIds.has(p.id));
  const extraIds = new Set(extraVisible.map((p) => p.id));
  const baseVisible = GALLERY_PROJECTS.filter((p) => !hiddenIds.has(p.id) && !extraIds.has(p.id)).map((p) =>
    applyPatch(p, overrides[p.id]),
  );
  const initialProjects: GalleryProjectItem[] = [...extraVisible, ...baseVisible];

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center bg-background text-sm text-muted-foreground">
          {content.galleryPage.loadingText}
        </div>
      }
    >
      <GalleryProjectPage
        initialProjects={initialProjects}
        adminDeviceAllowed={adminDeviceAllowed}
        adminAuthenticated={adminAuthenticated}
        copy={content.galleryPage}
      />
    </Suspense>
  );
}
