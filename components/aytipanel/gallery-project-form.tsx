"use client";

import { useRouter } from "next/navigation";
import { mergeAytiCardClass } from "@/lib/ayti-icon-cold";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  PROJECT_CATEGORIES,
  type GalleryProjectItem,
  type ProjectStatus,
} from "@/components/aytipanel/gallery-project-data";
import { generateGalleryProjectId } from "@/components/aytipanel/gallery-project-local";
import { captureStableVideoPosterDataUrl } from "@/components/aytipanel/gallery-video-poster";

const CATEGORY_OPTIONS = PROJECT_CATEGORIES.filter(
  (c): c is Exclude<(typeof PROJECT_CATEGORIES)[number], "All"> => c !== "All",
);

const STATUS_OPTIONS: ProjectStatus[] = [
  "Ongoing",
  "Completed",
  "Maintenance",
  "Commissioning",
];

type FieldErrors = Partial<
  Record<"name" | "progress" | "videoSrc" | "galleryPhotos", string>
>;

/** Folder static Next: `aytipanel/public/images/gallery` → URL `/images/gallery/...` */
export const GALLERY_UPLOAD_PUBLIC_DIR = "/images/gallery";

/** Gambar hero cadangan jika tidak ada foto di galeri (path di `public`). */
export const GALLERY_FALLBACK_HERO_IMAGE = "/images/gallery/peta_indonesia.png";

function normalizePath(s: string): string {
  const t = s.trim();
  if (!t) return "";
  return t.startsWith("/") ? t : `/${t.replace(/^\/+/, "")}`;
}

/** Nama file aman untuk path URL (satu nama dengan file yang Anda salin ke `public/images/gallery/`). */
function isFormVideoSrcOk(s: string): boolean {
  const t = s.trim();
  if (t === "") return true;
  if (t.startsWith("/")) return t.length > 1;
  return t.startsWith("https://") || t.startsWith("http://");
}

function parseGalleryPhotosLines(
  raw: string,
  defaultAlt: string,
): { ok: true; photos: { src: string; alt: string }[] } | { ok: false; message: string } {
  const photos: { src: string; alt: string }[] = [];
  const lines = raw.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const pipe = trimmed.indexOf("|");
    let srcRaw: string;
    let alt: string;
    if (pipe === -1) {
      srcRaw = trimmed;
      alt = defaultAlt;
    } else {
      srcRaw = trimmed.slice(0, pipe).trim();
      alt = trimmed.slice(pipe + 1).trim() || defaultAlt;
    }
    const src = normalizePath(srcRaw);
    if (!src.startsWith("/")) {
      return {
        ok: false,
        message: "Setiap path foto galeri harus dimulai dengan / (file di folder public).",
      };
    }
    photos.push({ src, alt });
  }
  return { ok: true, photos };
}

/**
 * Path URL untuk video di `public/images/gallery/` — nama file di-encode (RFC 3986)
 * supaya sama dengan berkas asli di disk (spasi, titik, dll.), bukan nama yang di-strip.
 */
function galleryVideoPublicPathFromFile(file: File): string {
  const name = file.name.trim();
  if (!name) return `${GALLERY_UPLOAD_PUBLIC_DIR}/video-${Date.now()}.mp4`;
  return `${GALLERY_UPLOAD_PUBLIC_DIR}/${encodeURIComponent(name)}`;
}

export type GalleryProjectFormProps =
  | { mode: "create" }
  | { mode: "edit"; projectId: string };

export function GalleryProjectForm(props: GalleryProjectFormProps) {
  const router = useRouter();
  const mode = props.mode;
  const editId = mode === "edit" ? props.projectId.trim() : "";

  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const galleryMultiInputRef = useRef<HTMLInputElement>(null);
  const prevVideoSrcRef = useRef("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORY_OPTIONS)[number]>("Cold Storage");
  const [location, setLocation] = useState("");
  const [year, setYear] = useState("");
  const [systemType, setSystemType] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("Completed");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState("");
  const [videoSrc, setVideoSrc] = useState("");
  const [videoPosterSrc, setVideoPosterSrc] = useState("");
  const [videoAutoplay, setVideoAutoplay] = useState(false);
  const [videoPosterGenerating, setVideoPosterGenerating] = useState(false);
  const [galleryPhotosText, setGalleryPhotosText] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "ready" | "notfound">(() =>
    mode === "edit" ? "loading" : "ready",
  );

  const progressNum = useMemo(() => {
    const t = progress.trim();
    if (t === "") return undefined;
    const n = Number(t);
    return Number.isFinite(n) ? Math.round(n) : NaN;
  }, [progress]);

  const validate = useCallback((): GalleryProjectItem | null => {
    const next: FieldErrors = {};
    if (!name.trim()) next.name = "Nama proyek wajib diisi.";

    if (progress.trim() !== "") {
      if (!Number.isFinite(progressNum) || progressNum === undefined || progressNum < 0 || progressNum > 100) {
        next.progress = "Progress harus angka 0–100 atau dikosongkan.";
      }
    }

    if (videoSrc.trim() && !isFormVideoSrcOk(videoSrc)) {
      next.videoSrc = "Gunakan path dari public (mis. /images/gallery/...) atau URL https untuk embed YouTube/Vimeo atau file .mp4.";
    }

    let galleryPhotos: GalleryProjectItem["galleryPhotos"];
    if (galleryPhotosText.trim()) {
      const parsed = parseGalleryPhotosLines(galleryPhotosText, name.trim() || "Galeri proyek");
      if (!parsed.ok) next.galleryPhotos = parsed.message;
      else galleryPhotos = parsed.photos.length > 0 ? parsed.photos : undefined;
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return null;

    const galleryFirst = galleryPhotos?.[0];
    const heroSrc = galleryFirst?.src ?? GALLERY_FALLBACK_HERO_IMAGE;
    const heroAlt =
      galleryFirst?.alt ?? `${name.trim() || "Proyek"} — dokumentasi proyek`;

    const projectId = mode === "edit" ? editId : generateGalleryProjectId();
    const item: GalleryProjectItem = {
      id: projectId,
      name: name.trim(),
      category,
      location: location.trim(),
      systemType: systemType.trim(),
      status,
      description: description.trim(),
      imageSrc: normalizePath(heroSrc),
      imageAlt: heroAlt,
    };
    if (year.trim()) item.year = year.trim();
    if (Number.isFinite(progressNum) && progressNum !== undefined) {
      item.progress = progressNum;
    }
    if (videoSrc.trim()) {
      item.videoSrc = videoSrc.trim();
      const isRemoteEmbed = /^https?:\/\//i.test(videoSrc.trim());
      if (videoPosterSrc.trim() && !isRemoteEmbed) item.videoPosterSrc = videoPosterSrc.trim();
      item.videoAutoplay = videoAutoplay;
    }
    if (galleryPhotos?.length) item.galleryPhotos = galleryPhotos;
    return item;
  }, [
    mode,
    editId,
    name,
    category,
    location,
    year,
    systemType,
    status,
    description,
    progress,
    progressNum,
    videoSrc,
    videoPosterSrc,
    videoAutoplay,
    galleryPhotosText,
  ]);

  useEffect(() => {
    if (mode !== "edit" || !editId) return;
    setLoadState("loading");
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/gallery-projects/${encodeURIComponent(editId)}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          if (!cancelled) setLoadState("notfound");
          return;
        }
        const json = (await res.json()) as { project?: GalleryProjectItem };
        const p = json.project;
        if (!p) {
          if (!cancelled) setLoadState("notfound");
          return;
        }
        if (cancelled) return;
        setName(p.name);
        setCategory(
          CATEGORY_OPTIONS.includes(p.category as (typeof CATEGORY_OPTIONS)[number])
            ? (p.category as (typeof CATEGORY_OPTIONS)[number])
            : "Cold Storage",
        );
        setLocation(p.location);
        setYear(p.year ?? "");
        setSystemType(p.systemType);
        setStatus(p.status);
        setDescription(p.description);
        setProgress(typeof p.progress === "number" ? String(p.progress) : "");
        setVideoSrc(p.videoSrc ?? "");
        setVideoPosterSrc(p.videoPosterSrc ?? "");
        setVideoAutoplay(p.videoAutoplay === true);
        prevVideoSrcRef.current = p.videoSrc ?? "";
        setGalleryPhotosText(
          p.galleryPhotos?.length
            ? p.galleryPhotos.map((ph) => (ph.alt.trim() ? `${ph.src} | ${ph.alt}` : ph.src)).join("\n")
            : "",
        );
        setLoadState("ready");
      } catch {
        if (!cancelled) setLoadState("notfound");
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [mode, editId]);

  const applyPickedVideoFile = useCallback(async (file: File | undefined, input: HTMLInputElement | null) => {
    if (!file) return;
    setVideoSrc(galleryVideoPublicPathFromFile(file));
    setVideoPosterGenerating(true);
    try {
      const dataUrl = await captureStableVideoPosterDataUrl(file, { maxWidth: 960, jpegQuality: 0.8 });
      setVideoPosterSrc(dataUrl);
    } catch {
      setVideoPosterSrc("");
    } finally {
      setVideoPosterGenerating(false);
      if (input) input.value = "";
    }
  }, []);

  useEffect(() => {
    const prev = prevVideoSrcRef.current;
    if (prev && !videoSrc.trim()) {
      setVideoPosterSrc("");
      setVideoAutoplay(true);
    }
    prevVideoSrcRef.current = videoSrc;
  }, [videoSrc]);

  const appendGalleryImagesFromFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      const altBase = name.trim() || "Galeri proyek";
      const lines: string[] = [];
      for (const file of Array.from(files)) {
        const rawName = file.name.trim() || `foto-${Date.now()}.jpg`;
        const path = `${GALLERY_UPLOAD_PUBLIC_DIR}/${encodeURIComponent(rawName)}`;
        lines.push(`${path} | ${altBase}`);
      }
      setGalleryPhotosText((prev) => {
        const base = prev.trim();
        return base ? `${base}\n${lines.join("\n")}` : lines.join("\n");
      });
    },
    [name],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const item = validate();
    if (!item) return;
    setSubmitting(true);
    try {
      if (mode === "create") {
        const res = await fetch("/api/gallery-projects", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ project: item }),
        });
        if (!res.ok) {
          throw new Error("Gagal menyimpan proyek ke server.");
        }
        router.push("/gallery-project?added=1");
      } else {
        const { id: _omit, ...rest } = item;
        const updates: Partial<Omit<GalleryProjectItem, "id">> = { ...rest };
        const embedRemote = videoSrc.trim() && /^https?:\/\//i.test(videoSrc.trim());
        if (embedRemote) {
          (updates as { videoPosterSrc?: null }).videoPosterSrc = null;
          (updates as { videoAutoplay?: null }).videoAutoplay = null;
        }
        if (progress.trim() === "") {
          (updates as { progress?: null }).progress = null;
        }
        if (year.trim() === "") {
          (updates as { year?: null }).year = null;
        }
        if (!videoSrc.trim()) {
          (updates as { videoSrc?: null }).videoSrc = null;
          (updates as { videoPosterSrc?: null }).videoPosterSrc = null;
          (updates as { videoAutoplay?: null }).videoAutoplay = null;
        } else if (!embedRemote) {
          if (!videoPosterSrc.trim()) {
            (updates as { videoPosterSrc?: null }).videoPosterSrc = null;
          }
          updates.videoAutoplay = videoAutoplay;
        }
        if (!galleryPhotosText.trim()) {
          (updates as { galleryPhotos?: null }).galleryPhotos = null;
        }
        const res = await fetch(`/api/gallery-projects/${encodeURIComponent(editId)}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ updates }),
        });
        if (!res.ok) {
          throw new Error("Gagal menyimpan perubahan proyek ke server.");
        }
        router.push("/gallery-project?updated=1");
      }
      router.refresh();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : mode === "create" ? "Gagal menambahkan proyek ke gallery." : "Gagal menyimpan perubahan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === "edit" && loadState === "loading") {
    return (
      <div
        className={mergeAytiCardClass(
          "rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-[var(--shadow-card)]",
        )}
        role="status"
      >
        Memuat data proyek…
      </div>
    );
  }

  if (mode === "edit" && loadState === "notfound") {
    return (
      <div
        role="alert"
        className={mergeAytiCardClass(
          "space-y-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-6 text-center text-sm text-foreground shadow-[var(--shadow-card)]",
        )}
      >
        <p>Proyek tidak ditemukan di gallery (mungkin sudah dihapus dari tampilan di browser ini).</p>
        <button
          type="button"
          onClick={() => router.push("/gallery-project")}
          className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-border bg-card px-4 py-2.5 text-sm font-semibold transition-colors hover:border-sky-400/40"
        >
          Kembali ke Gallery
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={mergeAytiCardClass(
        "space-y-6 rounded-2xl border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] p-5 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.35)] ring-1 ring-black/[0.03] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.92))] dark:shadow-[0_24px_55px_-22px_rgba(0,0,0,0.7)] dark:ring-white/[0.04] md:p-7",
      )}
    >
      <div className="rounded-xl border border-border/70 bg-background/70 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] dark:bg-slate-950/35 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300/90">
          Form Proyek
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Isi data inti terlebih dahulu, lalu lanjut ke media proyek di bagian bawah.
        </p>
      </div>


      <div className="space-y-1.5">
        <label htmlFor="gp-name" className="text-sm font-semibold text-foreground">
          Nama proyek <span className="text-red-500">*</span>
        </label>
        <input
          id="gp-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11 w-full rounded-[10px] border border-border bg-background px-3.5 text-base outline-none transition-[border-color,box-shadow] focus:border-sky-400/55 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.16)] lg:text-sm"
          placeholder="Contoh: Cold Storage Distribusi Regional"
          autoComplete="off"
        />
        {errors.name ? <p className="text-xs text-red-500">{errors.name}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="gp-category" className="text-sm font-semibold text-foreground">
            Kategori <span className="text-red-500">*</span>
          </label>
          <select
            id="gp-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as (typeof CATEGORY_OPTIONS)[number])}
            className="h-11 w-full rounded-xl border border-border/80 bg-background/85 px-3.5 text-base outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-[border-color,box-shadow,background-color] focus:border-sky-400/55 focus:bg-background focus:shadow-[0_0_0_3px_rgba(56,189,248,0.14),inset_0_1px_0_rgba(255,255,255,0.45)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] lg:text-sm"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="gp-status" className="text-sm font-semibold text-foreground">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            id="gp-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            className="h-11 w-full rounded-xl border border-border/80 bg-background/85 px-3.5 text-base outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-[border-color,box-shadow,background-color] focus:border-sky-400/55 focus:bg-background focus:shadow-[0_0_0_3px_rgba(56,189,248,0.14),inset_0_1px_0_rgba(255,255,255,0.45)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] lg:text-sm"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="gp-location" className="text-sm font-semibold text-foreground">
            Lokasi
          </label>
          <input
            id="gp-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-11 w-full rounded-xl border border-border/80 bg-background/85 px-3.5 text-base outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-[border-color,box-shadow,background-color] focus:border-sky-400/55 focus:bg-background focus:shadow-[0_0_0_3px_rgba(56,189,248,0.14),inset_0_1px_0_rgba(255,255,255,0.45)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] lg:text-sm"
            placeholder="Contoh: Jabodetabek"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="gp-system" className="text-sm font-semibold text-foreground">
            Tipe sistem
          </label>
          <input
            id="gp-system"
            value={systemType}
            onChange={(e) => setSystemType(e.target.value)}
            className="h-11 w-full rounded-xl border border-border/80 bg-background/85 px-3.5 text-base outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-[border-color,box-shadow,background-color] focus:border-sky-400/55 focus:bg-background focus:shadow-[0_0_0_3px_rgba(56,189,248,0.14),inset_0_1px_0_rgba(255,255,255,0.45)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] lg:text-sm"
            placeholder="Contoh: Multi-zone chiller + panel PU"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="gp-year" className="text-sm font-semibold text-foreground">
          Tahun
        </label>
        <input
          id="gp-year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="h-11 w-full max-w-xs rounded-xl border border-border/80 bg-background/85 px-3.5 text-base outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-[border-color,box-shadow,background-color] focus:border-sky-400/55 focus:bg-background focus:shadow-[0_0_0_3px_rgba(56,189,248,0.14),inset_0_1px_0_rgba(255,255,255,0.45)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] lg:text-sm"
          placeholder="Contoh: 2024 atau 2023–2025"
          autoComplete="off"
          inputMode="text"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="gp-desc" className="text-sm font-semibold text-foreground">
          Deskripsi singkat
        </label>
        <textarea
          id="gp-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-border/80 bg-background/85 px-3.5 py-3 text-base leading-relaxed outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-[border-color,box-shadow,background-color] focus:border-sky-400/55 focus:bg-background focus:shadow-[0_0_0_3px_rgba(56,189,248,0.14),inset_0_1px_0_rgba(255,255,255,0.45)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] lg:text-sm"
          placeholder="Ringkasan scope, konteks industri, atau hasil yang ditonjolkan."
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="gp-progress" className="text-sm font-semibold text-foreground">
          Progress (opsional)
        </label>
        <input
          id="gp-progress"
          inputMode="numeric"
          value={progress}
          onChange={(e) => setProgress(e.target.value)}
          className="h-11 w-full max-w-[12rem] rounded-xl border border-border/80 bg-background/85 px-3.5 text-base outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-[border-color,box-shadow,background-color] focus:border-sky-400/55 focus:bg-background focus:shadow-[0_0_0_3px_rgba(56,189,248,0.14),inset_0_1px_0_rgba(255,255,255,0.45)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] lg:text-sm"
          placeholder="0–100"
        />
        {errors.progress ? <p className="text-xs text-red-500">{errors.progress}</p> : null}
      </div>

      <div className="space-y-1.5 rounded-xl border border-border/75 bg-muted-bg/35 p-4 md:p-5">
        <label htmlFor="gp-video" className="text-sm font-semibold text-foreground">
          Video (opsional)
        </label>
        <input
          ref={videoFileInputRef}
          type="file"
          accept="video/*"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => void applyPickedVideoFile(e.target.files?.[0], e.target)}
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <input
            id="gp-video"
            value={videoSrc}
            onChange={(e) => setVideoSrc(e.target.value)}
            className="h-11 min-w-0 flex-1 rounded-xl border border-border/80 bg-background/85 px-3.5 font-mono text-base outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-[border-color,box-shadow,background-color] focus:border-sky-400/55 focus:bg-background focus:shadow-[0_0_0_3px_rgba(56,189,248,0.14),inset_0_1px_0_rgba(255,255,255,0.45)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] lg:text-sm"
            placeholder="/images/gallery/proyek.mp4 atau https://www.youtube.com/embed/..."
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => videoFileInputRef.current?.click()}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-sky-500/35 bg-gradient-to-r from-sky-500/15 to-blue-600/15 px-4 text-sm font-semibold text-foreground shadow-[0_10px_24px_-16px_rgba(56,189,248,0.8)] transition-[border-color,background-color,transform,box-shadow] hover:border-sky-400/60 hover:from-sky-500/25 hover:to-blue-600/25 hover:shadow-[0_12px_28px_-16px_rgba(56,189,248,0.9)] motion-safe:active:scale-[0.99]"
          >
            Pilih video
          </button>
        </div>
        {errors.videoSrc ? <p className="text-xs text-red-500">{errors.videoSrc}</p> : null}
        <p className="text-xs text-muted-foreground">
          Pilih file dari komputer — path diisi ke{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">{GALLERY_UPLOAD_PUBLIC_DIR}/</code>.
          Salin file yang sama ke{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">public/images/gallery/</code> agar video
          bisa diputar, atau tempel URL embed YouTube/Vimeo pada kolom di atas.
        </p>
        {videoPosterGenerating ? (
          <p className="text-xs font-medium text-sky-600 dark:text-sky-400">Menghasilkan thumbnail poster dari video…</p>
        ) : null}
        {videoPosterSrc.startsWith("data:image") ? (
          <div className="flex items-start gap-3 pt-1">
            <div className="relative h-[4.5rem] w-32 overflow-hidden rounded-xl border border-border shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={videoPosterSrc} alt="" className="h-full w-full object-cover" />
            </div>
            <p className="max-w-xs pt-1 text-[11px] leading-relaxed text-muted-foreground">
              Poster diambil dari frame stabil (~12% durasi). Disimpan bersama proyek untuk tampilan kartu.
            </p>
          </div>
        ) : null}
        <label className="flex cursor-pointer items-start gap-3 pt-2">
          <input
            type="checkbox"
            checked={videoAutoplay}
            onChange={(e) => setVideoAutoplay(e.target.checked)}
            className="mt-1 size-4 rounded border-border"
          />
          <span className="text-sm leading-snug text-foreground">
            Putar otomatis di kartu (muted + loop) untuk file lokal dan embed YouTube/Vimeo — matikan secara default;
            centang untuk mengaktifkan.
          </span>
        </label>
      </div>

      <div className="space-y-1.5 rounded-xl border border-border/75 bg-muted-bg/35 p-4 md:p-5">
        <label htmlFor="gp-gallery-photos" className="text-sm font-semibold text-foreground">
          Galeri foto (opsional)
        </label>
        <input
          ref={galleryMultiInputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            appendGalleryImagesFromFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => galleryMultiInputRef.current?.click()}
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-sky-500/35 bg-gradient-to-r from-sky-500/12 to-blue-600/12 px-4 text-sm font-semibold text-foreground shadow-[0_8px_22px_-16px_rgba(56,189,248,0.8)] transition-[border-color,background-color,box-shadow] hover:border-sky-400/55 hover:from-sky-500/22 hover:to-blue-600/22 hover:shadow-[0_10px_24px_-16px_rgba(56,189,248,0.9)]"
          >
            Unggah beberapa foto galeri
          </button>
          <span className="text-xs text-muted-foreground">
            Path otomatis ke <code className="rounded bg-muted px-1 font-mono text-[11px]">{GALLERY_UPLOAD_PUBLIC_DIR}/</code>
            — salin file ke <code className="rounded bg-muted px-1 font-mono text-[11px]">public/images/gallery/</code>.
          </span>
        </div>
        <textarea
          id="gp-gallery-photos"
          value={galleryPhotosText}
          onChange={(e) => setGalleryPhotosText(e.target.value)}
          rows={5}
          className="w-full rounded-xl border border-border/80 bg-background/85 px-3.5 py-3 font-mono text-base leading-relaxed outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-[border-color,box-shadow,background-color] focus:border-sky-400/55 focus:bg-background focus:shadow-[0_0_0_3px_rgba(56,189,248,0.14),inset_0_1px_0_rgba(255,255,255,0.45)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] lg:text-sm"
          placeholder={`/images/gallery/a.jpg\n/images/gallery/b.jpg | Keterangan foto`}
        />
        {errors.galleryPhotos ? <p className="text-xs text-red-500">{errors.galleryPhotos}</p> : null}
        <p className="text-xs text-muted-foreground">
          Satu path per baris (dimulai dengan <code className="rounded bg-muted px-1 text-[11px]">/</code>). Tambahkan{" "}
          <code className="rounded bg-muted px-1 text-[11px]">|</code> lalu teks alternatif bila perlu. Foto pertama juga
          dipakai sebagai gambar hero proyek (jika tidak ada video); jika galeri kosong dipakai gambar cadangan bawaan.
          Strip foto berada di bawah video dan bisa digeser mendatar.
        </p>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Data proyek ini disimpan di penyimpanan browser (localStorage) perangkat ini. Untuk dipublikasikan permanen ke
        seluruh pengunjung, salin entri ke{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">gallery-project-data.ts</code> atau
        hubungi developer.
      </p>

      {submitError ? (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-xl border border-red-500/45 bg-red-500/12 px-4 py-3 text-sm leading-relaxed text-red-100 shadow-[0_8px_24px_-12px_rgba(239,68,68,0.45)]"
        >
          <span className="font-semibold text-red-50">Gagal menyimpan — </span>
          {submitError}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="submit"
          disabled={submitting || (mode === "edit" && loadState !== "ready")}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-sky-500/35 bg-gradient-to-r from-sky-500/20 via-blue-600/24 to-sky-500/20 px-5 py-3 text-sm font-semibold text-foreground shadow-[0_16px_38px_-20px_rgba(56,189,248,0.85)] transition-[transform,box-shadow,opacity,border-color] duration-200 hover:border-sky-400/55 hover:shadow-[0_20px_42px_-20px_rgba(56,189,248,0.95)] disabled:opacity-60 motion-safe:hover:-translate-y-0.5 sm:w-auto sm:min-w-[220px]"
        >
          {submitting ? "Menyimpan…" : mode === "create" ? "Simpan & lihat di Gallery" : "Simpan perubahan"}
        </button>
      </div>
    </form>
  );
}
