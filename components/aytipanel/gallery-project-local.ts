import {
  GALLERY_PROJECTS,
  PROJECT_CATEGORIES,
  type GalleryProjectItem,
  type ProjectCategory,
  type ProjectStatus,
} from "@/components/aytipanel/gallery-project-data";

export const GALLERY_EXTRA_STORAGE_KEY = "aytipanel-gallery-extra-projects-v1";
/** ID proyek bawaan (`gallery-project-data`) yang disembunyikan pengguna di browser ini */
export const GALLERY_HIDDEN_IDS_KEY = "aytipanel-gallery-hidden-ids-v1";
/** Field yang diubah pengguna untuk proyek statis (disimpan terpisah dari bundle) */
export const GALLERY_OVERRIDES_KEY = "aytipanel-gallery-overrides-v1";

type GalleryOverridesMap = Partial<Record<string, Partial<GalleryProjectItem>>>;

const allowedCategories = new Set(
  PROJECT_CATEGORIES.filter((c): c is Exclude<ProjectCategory, "All"> => c !== "All"),
);

/** Nama kategori lama / dihapus → kategori yang masih dipakai (localStorage) */
const LEGACY_GALLERY_CATEGORY: Partial<
  Record<string, Exclude<ProjectCategory, "All">>
> = {
  "Cold Room": "Proses Area",
  "Loading Area": "Proses Area",
  Refrigeration: "Refrigeration System",
  "Panel Insulated": "CS Portable",
  "Cold Storage Portable": "CS Portable",
  "Loading & Proses": "Proses Area",
  ABF: "ABF (Air Blast Freezer)",
};

function migrateGalleryCategory(
  raw: unknown,
): Exclude<ProjectCategory, "All"> | null {
  if (typeof raw !== "string") return null;
  const next = LEGACY_GALLERY_CATEGORY[raw] ?? raw;
  return allowedCategories.has(next as Exclude<ProjectCategory, "All">)
    ? (next as Exclude<ProjectCategory, "All">)
    : null;
}

const allowedStatus: ProjectStatus[] = ["Ongoing", "Completed", "Maintenance", "Commissioning"];

function isProjectStatus(s: unknown): s is ProjectStatus {
  return typeof s === "string" && (allowedStatus as readonly string[]).includes(s);
}

function isValidGalleryPhoto(o: unknown): o is { src: string; alt: string } {
  if (!o || typeof o !== "object") return false;
  const x = o as Record<string, unknown>;
  return typeof x.src === "string" && x.src.startsWith("/") && typeof x.alt === "string" && x.alt.trim() !== "";
}

/** Video: path public atau URL https/http (embed / file). */
function isValidStoredVideoSrc(s: string): boolean {
  const t = s.trim();
  if (t === "") return false;
  if (t.startsWith("/")) return true;
  return t.startsWith("https://") || t.startsWith("http://");
}

function isValidVideoPosterSrc(s: string): boolean {
  const t = s.trim();
  if (t.startsWith("/")) return true;
  return t.startsWith("data:image/jpeg") || t.startsWith("data:image/png") || t.startsWith("data:image/webp");
}

function isValidExtraItem(raw: unknown): raw is GalleryProjectItem {
  if (!raw || typeof raw !== "object") return false;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || o.id.trim() === "") return false;
  if (typeof o.name !== "string" || o.name.trim() === "") return false;
  if (typeof o.category !== "string" || migrateGalleryCategory(o.category) === null) return false;
  if (typeof o.location !== "string") return false;
  if (o.year !== undefined && typeof o.year !== "string") return false;
  if (typeof o.systemType !== "string") return false;
  if (!isProjectStatus(o.status)) return false;
  if (typeof o.description !== "string") return false;
  if (typeof o.imageSrc !== "string" || !o.imageSrc.startsWith("/")) return false;
  if (typeof o.imageAlt !== "string" || o.imageAlt.trim() === "") return false;

  if (o.progress !== undefined) {
    if (typeof o.progress !== "number" || o.progress < 0 || o.progress > 100) return false;
  }
  if (o.videoSrc !== undefined) {
    if (typeof o.videoSrc !== "string" || !isValidStoredVideoSrc(o.videoSrc)) return false;
  }
  if (o.videoPosterSrc !== undefined) {
    if (typeof o.videoPosterSrc !== "string" || !isValidVideoPosterSrc(o.videoPosterSrc)) return false;
  }
  if (o.videoAutoplay !== undefined && typeof o.videoAutoplay !== "boolean") return false;
  if (o.galleryPhotos !== undefined) {
    if (!Array.isArray(o.galleryPhotos)) return false;
    for (const p of o.galleryPhotos) {
      if (!isValidGalleryPhoto(p)) return false;
    }
  }
  return true;
}

export function readExtraProjects(): GalleryProjectItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GALLERY_EXTRA_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const migrated = parsed.map((item) => {
      if (!item || typeof item !== "object") return item;
      const o = item as Record<string, unknown>;
      const { beforeAfter: _ba, ...rest } = o;
      const cat = migrateGalleryCategory(o.category);
      if (cat !== null && o.category !== cat) return { ...rest, category: cat };
      return rest;
    });
    return migrated.filter(isValidExtraItem) as GalleryProjectItem[];
  } catch {
    return [];
  }
}

export function readHiddenProjectIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GALLERY_HIDDEN_IDS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  } catch {
    return [];
  }
}

function writeHiddenProjectIds(ids: readonly string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GALLERY_HIDDEN_IDS_KEY, JSON.stringify([...ids]));
}

export function readOverrides(): GalleryOverridesMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(GALLERY_OVERRIDES_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as GalleryOverridesMap;
  } catch {
    return {};
  }
}

export function writeOverrides(map: GalleryOverridesMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GALLERY_OVERRIDES_KEY, JSON.stringify(map));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      throw new Error("Penyimpanan browser penuh. Tidak bisa menyimpan perubahan.");
    }
    throw new Error("Gagal menyimpan perubahan proyek.");
  }
}

function applyProjectPatches(project: GalleryProjectItem): GalleryProjectItem {
  const patch = readOverrides()[project.id];
  if (!patch) return project;

  const rawProg = patch.progress as number | null | undefined;
  const progress =
    rawProg === null ? undefined : rawProg !== undefined ? rawProg : project.progress;

  const rawVs = patch.videoSrc as string | null | undefined;
  const videoSrc =
    rawVs === null ? undefined : rawVs !== undefined ? (rawVs.trim() === "" ? undefined : rawVs.trim()) : project.videoSrc;

  const rawGp = patch.galleryPhotos as GalleryProjectItem["galleryPhotos"] | null | undefined;
  const galleryPhotos =
    rawGp === null ? undefined : rawGp !== undefined ? rawGp : project.galleryPhotos;

  const rawVpos = patch.videoPosterSrc as string | null | undefined;
  const videoPosterSrc =
    rawVpos === null
      ? undefined
      : rawVpos !== undefined
        ? rawVpos
        : project.videoPosterSrc;

  const rawVa = patch.videoAutoplay as boolean | null | undefined;
  const videoAutoplay =
    rawVa === null ? undefined : rawVa !== undefined ? rawVa : project.videoAutoplay;

  const rawYear = patch.year as string | null | undefined;
  const year =
    rawYear === null
      ? undefined
      : rawYear !== undefined
        ? rawYear.trim() === ""
          ? undefined
          : rawYear.trim()
        : project.year;

  const { beforeAfter: _omitBa, ...patchRest } = patch as Partial<GalleryProjectItem> & {
    beforeAfter?: unknown;
  };

  const merged: GalleryProjectItem = {
    ...project,
    ...patchRest,
    id: project.id,
    progress,
    videoSrc,
    galleryPhotos,
    videoPosterSrc,
    videoAutoplay,
    year,
  };
  const cat = migrateGalleryCategory(merged.category);
  if (cat !== null) merged.category = cat;
  return merged;
}

export function writeExtraProjects(projects: GalleryProjectItem[]): void {
  if (typeof window === "undefined") {
    throw new Error("Penyimpanan hanya tersedia di browser.");
  }
  try {
    window.localStorage.setItem(GALLERY_EXTRA_STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      throw new Error("Penyimpanan browser penuh.");
    }
    throw new Error("Gagal menulis daftar proyek tambahan.");
  }
}

export function hideStaticProjectId(projectId: string): void {
  if (typeof window === "undefined") {
    throw new Error("Penyimpanan hanya tersedia di browser.");
  }
  const id = projectId.trim();
  if (!id) return;
  try {
    const hidden = readHiddenProjectIds();
    if (hidden.includes(id)) return;
    writeHiddenProjectIds([...hidden, id]);
  } catch {
    throw new Error("Gagal menyimpan preferensi penyembunyian proyek.");
  }
}

/** Hapus satu entri dari daftar proyek tambahan (localStorage). */
export function removeExtraProject(projectId: string): void {
  if (typeof window === "undefined") {
    throw new Error("Penyimpanan hanya tersedia di browser.");
  }
  try {
    const current = readExtraProjects();
    const next = current.filter((p) => p.id !== projectId);
    writeExtraProjects(next);
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      throw new Error("Penyimpanan browser penuh.");
    }
    throw new Error("Gagal menghapus proyek dari penyimpanan browser.");
  }
}

/**
 * Perbarui proyek: entri `localStorage` jika proyek tambahan, atau patch override jika proyek statis.
 */
export function updateGalleryProject(
  projectId: string,
  updates: Partial<Omit<GalleryProjectItem, "id">>,
): void {
  if (typeof window === "undefined") {
    throw new Error("Simpan perubahan hanya bisa di browser.");
  }
  const id = projectId.trim();
  const patch = { ...updates } as Partial<GalleryProjectItem>;
  delete (patch as { id?: string }).id;

  const extra = readExtraProjects();
  const ei = extra.findIndex((p) => p.id === id);
  if (ei !== -1) {
    const merged = { ...extra[ei], ...patch, id } as GalleryProjectItem;
    delete (merged as Record<string, unknown>).beforeAfter;
    if ((patch as { progress?: null }).progress === null) {
      delete merged.progress;
    }
    if ((patch as { videoSrc?: null }).videoSrc === null) {
      delete merged.videoSrc;
    }
    if ((patch as { galleryPhotos?: null }).galleryPhotos === null) {
      delete merged.galleryPhotos;
    }
    if ((patch as { videoPosterSrc?: null }).videoPosterSrc === null) {
      delete merged.videoPosterSrc;
    }
    if ((patch as { videoAutoplay?: null }).videoAutoplay === null) {
      delete merged.videoAutoplay;
    }
    if ((patch as { year?: null }).year === null) {
      delete merged.year;
    }
    const next = [...extra];
    next[ei] = merged;
    writeExtraProjects(next);
    return;
  }

  if (GALLERY_PROJECTS.some((p) => p.id === id)) {
    const all = readOverrides();
    const next = { ...all[id], ...patch } as Record<string, unknown>;
    delete next.beforeAfter;
    all[id] = next as Partial<GalleryProjectItem>;
    writeOverrides(all);
    return;
  }

  throw new Error("Proyek tidak ditemukan.");
}

/**
 * Hapus proyek dari tampilan gallery di browser ini:
 * - proyek tambahan pengguna → dihapus dari localStorage extra;
 * - proyek dari data statis → id dicatat sebagai disembunyikan.
 */
export function deleteGalleryProject(projectId: string): void {
  if (typeof window === "undefined") {
    throw new Error("Hapus proyek hanya bisa dilakukan di browser.");
  }
  const id = projectId.trim();
  if (!id) return;

  const extra = readExtraProjects();
  if (extra.some((p) => p.id === id)) {
    removeExtraProject(id);
    return;
  }

  if (GALLERY_PROJECTS.some((p) => p.id === id)) {
    hideStaticProjectId(id);
  }
}

/**
 * Gabungkan proyek tambahan (browser) dengan data statis. Item dengan id sama di
 * daftar extra mengesampingkan yang di base. Id di daftar hidden tidak ditampilkan.
 */
export function mergeGalleryProjects(): GalleryProjectItem[] {
  const hidden = new Set(readHiddenProjectIds());
  const extra = readExtraProjects();
  const extraIds = new Set(extra.map((p) => p.id));
  const base = GALLERY_PROJECTS.filter((p) => !extraIds.has(p.id) && !hidden.has(p.id));
  const extraVisible = extra.filter((p) => !hidden.has(p.id));
  const raw = [...extraVisible, ...base];
  return raw.map(applyProjectPatches);
}

/** Gabungan + override; untuk form edit (client). */
export function getGalleryProjectById(projectId: string): GalleryProjectItem | null {
  if (typeof window === "undefined") return null;
  const id = projectId.trim();
  return mergeGalleryProjects().find((p) => p.id === id) ?? null;
}

export function appendExtraProject(project: GalleryProjectItem): void {
  if (typeof window === "undefined") {
    throw new Error("Penyimpanan proyek hanya bisa dilakukan di browser.");
  }
  try {
    const current = readExtraProjects();
    const next = [project, ...current.filter((p) => p.id !== project.id)];
    writeExtraProjects(next);
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      throw new Error(
        "Penyimpanan browser penuh. Hapus proyek lama di gallery atau bersihkan data situs untuk browser ini.",
      );
    }
    throw new Error(
      "Gagal menyimpan: localStorage nonaktif, diblokir, atau mode penyamaran tidak mengizinkan penyimpanan.",
    );
  }
}

export function generateGalleryProjectId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `local-${crypto.randomUUID()}`;
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
