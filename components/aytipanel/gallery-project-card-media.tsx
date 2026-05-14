"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import {
  GALLERY_PROJECT_STATUS_BADGE_CLASS,
  type GalleryProjectItem,
} from "@/components/aytipanel/gallery-project-data";
import { CmsImage } from "@/components/site-cms/cms-image";
import { CmsText } from "@/components/site-cms/cms-text";
import { CmsVideo } from "@/components/site-cms/cms-video";
import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";

type GalleryCardProps = {
  project: GalleryProjectItem;
  /**
   * Aktifkan CmsImage / CmsVideo / CmsText saat mode edit CMS (mis. `galleryProjectOverrides.{id}`).
   */
  cmsOverrideBasePath?: string;
};

function videoPresentation(url: string): "iframe" | "video" {
  const t = url.trim();
  /** Path file lokal selalu diputar sebagai tag video, hindari false positive di nama file (mis. mengandung "youtu"). */
  if (t.startsWith("/")) return "video";
  const u = t.toLowerCase();
  if (
    u.includes("youtube.com/embed") ||
    u.includes("youtube-nocookie.com/embed") ||
    u.includes("youtu.be/") ||
    u.includes("youtube.com/watch") ||
    u.includes("player.vimeo.com")
  ) {
    return "iframe";
  }
  return "video";
}

function toYoutubeEmbedIfWatchUrl(url: string): string {
  const t = url.trim();
  const m = t.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (m && t.includes("youtube.com/watch")) {
    return `https://www.youtube.com/embed/${m[1]}`;
  }
  const short = t.match(/^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (short) {
    return `https://www.youtube.com/embed/${short[1]}`;
  }
  return t;
}

/** Autoplay + loop embed memerlukan mute (kebijakan browser); YouTube perlu playlist=id untuk loop. */
function appendEmbedAutoplayLoopMuted(embedUrl: string): string {
  const raw = embedUrl.trim();
  const lower = raw.toLowerCase();
  try {
    const u = new URL(raw);
    if (lower.includes("youtube.com/embed") || lower.includes("youtube-nocookie.com/embed")) {
      const after = u.pathname.split("/embed/")[1] ?? "";
      const videoId = after.split("/")[0]?.split("?")[0];
      if (videoId) {
        u.searchParams.set("autoplay", "1");
        u.searchParams.set("mute", "1");
        u.searchParams.set("loop", "1");
        u.searchParams.set("playlist", videoId);
      }
      return u.toString();
    }
    if (lower.includes("player.vimeo.com") || lower.includes("vimeo.com")) {
      u.searchParams.set("autoplay", "1");
      u.searchParams.set("muted", "1");
      u.searchParams.set("loop", "1");
      return u.toString();
    }
  } catch {
    /* invalid URL — pakai asal */
  }
  return raw;
}

/** Path relatif situs (/...) — encode huruf/spasi di nama file agar browser memuat file dari `public/` dengan benar. */
function normalizePlaybackUrl(raw: string): string {
  const t = raw.trim();
  if (!t.startsWith("/")) return t;
  const q = t.indexOf("?");
  const pathPart = q === -1 ? t : t.slice(0, q);
  const queryPart = q === -1 ? "" : t.slice(q);
  try {
    return encodeURI(decodeURI(pathPart)) + queryPart;
  } catch {
    return encodeURI(pathPart) + queryPart;
  }
}

function isLikelyLocalPublicPath(url: string): boolean {
  const t = url.trim();
  return t.startsWith("/") && !t.startsWith("//");
}

const defaultVideoBoxClass =
  "relative aspect-[4/3] w-full overflow-hidden bg-[#030712] sm:aspect-video";

/** Hero strip Portfolio di beranda — mobile: penuh lebar kartu; tinggi dibatasi agar tidak dominan. */
export const PORTFOLIO_HOME_HERO_SHELL =
  "relative w-full overflow-hidden bg-[#030712] aspect-video max-md:max-h-[min(38vh,240px)] md:aspect-[4/3] md:max-h-none md:rounded-none md:shadow-none lg:aspect-video";

/** Sampul / placeholder proyek — selaras lebar dengan video di mobile (full bleed dalam kartu). */
const PORTFOLIO_HOME_COVER_WRAP =
  "relative w-full overflow-hidden md:rounded-none md:shadow-none";

const PORTFOLIO_HOME_COVER_ASPECT =
  "relative aspect-video w-full overflow-hidden max-md:max-h-[min(38vh,240px)] sm:aspect-[4/3] md:max-h-none md:aspect-[4/3] lg:aspect-video";

function Html5GalleryVideo({
  videoSrc,
  posterSrc,
  title,
  autoPlayMuted,
  shellClassName,
}: {
  videoSrc: string;
  posterSrc?: string;
  title: string;
  autoPlayMuted?: boolean;
  /** Ganti wadah luar (mis. {@link PORTFOLIO_HOME_HERO_SHELL} untuk kartu beranda). */
  shellClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const playbackSrc = useMemo(() => normalizePlaybackUrl(videoSrc), [videoSrc]);
  const isLocal = isLikelyLocalPublicPath(videoSrc);

  const boxClass = shellClassName ?? defaultVideoBoxClass;

  if (failed) {
    return (
      <div
        className={`relative flex w-full flex-col items-center justify-center gap-2 overflow-hidden bg-[#0a101f] px-4 text-center ${shellClassName ? "aspect-video max-md:min-h-[8rem] max-md:max-h-[min(38vh,240px)] md:aspect-[4/3] lg:aspect-video" : "aspect-[4/3] sm:aspect-video"}`}
      >
        <p className="text-sm font-medium text-slate-200">Video tidak bisa diputar</p>
        <p className="max-w-md text-xs leading-relaxed text-slate-400">
          {isLocal ? (
            <>
              Pastikan berkas ada persis di{" "}
              <code className="rounded bg-black/40 px-1 py-0.5 font-mono text-[11px] text-slate-300">
                public
                {(() => {
                  try {
                    return decodeURIComponent(playbackSrc.split("?")[0]);
                  } catch {
                    return playbackSrc.split("?")[0];
                  }
                })()}
              </code>{" "}
              (nama file mengikuti yang Anda salin ke folder; gunakan tombol &quot;Pilih video&quot; agar path otomatis
              cocok). Untuk Chrome/Windows gunakan MP4 ber-codec{" "}
              <strong className="font-semibold text-slate-300">H.264 + AAC</strong>; video WhatsApp berbasis HEVC
              sering tidak diputar di Chrome — ekspor ulang atau konversi ke H.264.
            </>
          ) : (
            <>Periksa URL atau coba unduh file dan simpan di public/images/gallery/ lalu gunakan path yang dimulai dengan /.</>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className={boxClass}>
      <video
        key={`${playbackSrc}-${autoPlayMuted ? "ap" : "noap"}`}
        src={playbackSrc}
        controls
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
        title={`Video ${title}`}
        onError={() => setFailed(true)}
        {...(posterSrc ? { poster: posterSrc } : {})}
        {...(autoPlayMuted ? { autoPlay: true, muted: true, loop: true } : {})}
      />
    </div>
  );
}

function GalleryVideo({
  videoSrc,
  posterSrc,
  title,
  autoPlayMuted,
  shellClassName,
}: {
  videoSrc: string;
  posterSrc?: string;
  title: string;
  autoPlayMuted?: boolean;
  shellClassName?: string;
}) {
  const src = toYoutubeEmbedIfWatchUrl(videoSrc);
  const mode = videoPresentation(src);
  const iframeSrc = autoPlayMuted ? appendEmbedAutoplayLoopMuted(src) : src;
  const iframeShell =
    shellClassName ?? "relative aspect-[4/3] w-full overflow-hidden bg-black sm:aspect-video";

  if (mode === "iframe") {
    return (
      <div className={iframeShell}>
        <iframe
          src={iframeSrc}
          title={`Video ${title}`}
          className="absolute inset-0 h-full w-full border-0 object-cover"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <Html5GalleryVideo
      videoSrc={src}
      posterSrc={posterSrc}
      title={title}
      autoPlayMuted={autoPlayMuted}
      shellClassName={shellClassName}
    />
  );
}

/** Hero portfolio beranda: video, atau gambar sampul, atau placeholder — tanpa badge status galeri. */
export function PortfolioHomeHeroMedia({
  cmsProjectIndex,
  uploadSegmentId,
  name,
  videoSrc,
  videoPosterSrc,
  videoAutoplay,
  coverImageSrc,
  coverImageAlt,
}: {
  /** Diisi saat mode edit CMS — untuk staging media & path JSON. */
  cmsProjectIndex?: number;
  /** Folder unggahan (`/images/cms/portfolio/{id}/…`). Default `project.id`. */
  uploadSegmentId?: string;
  name: string;
  videoSrc?: string;
  videoPosterSrc?: string;
  videoAutoplay?: boolean;
  coverImageSrc?: string;
  coverImageAlt?: string;
}) {
  const cms = useSiteCmsOptional();
  const cmsEdit =
    Boolean(cms?.eligible && cms?.editMode) && typeof cmsProjectIndex === "number";
  const basePath =
    typeof cmsProjectIndex === "number" ? `portfolio.projects.${cmsProjectIndex}` : "";
  const staged = cms?.stagedMediaByPath ?? {};

  const mergedVideo =
    cmsEdit && basePath ? (staged[`${basePath}.videoSrc`] ?? videoSrc) : videoSrc;
  const mergedPoster =
    cmsEdit && basePath ? (staged[`${basePath}.videoPosterSrc`] ?? videoPosterSrc) : videoPosterSrc;
  const mergedCover =
    cmsEdit && basePath ? (staged[`${basePath}.coverImageSrc`] ?? coverImageSrc) : coverImageSrc;

  const vs = mergedVideo?.trim() ?? "";
  const poster = mergedPoster?.trim() ?? "";
  /** Autoplay + loop hanya jika `videoAutoplay: true` di konten (opt-in). */
  const autoplay = videoAutoplay === true;
  const cover = mergedCover?.trim() ?? "";
  const coverAlt = (coverImageAlt ?? "").trim() || name;
  const uploadSeg = uploadSegmentId?.trim() || "general";

  const embedEditPanel =
    cmsEdit && basePath ? (
      <div className="border-t border-border bg-muted-bg/90 px-3 py-2 dark:border-white/[0.08]">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          URL video (YouTube / Vimeo / path file /images/…)
        </p>
        <CmsText
          path={`${basePath}.videoSrc`}
          text={videoSrc ?? ""}
          as="span"
          className="block max-h-24 overflow-y-auto break-all font-mono text-[11px] leading-snug text-foreground"
        />
      </div>
    ) : null;

  if (cmsEdit && basePath) {
    if (vs && videoPresentation(vs) === "iframe") {
      return (
        <div className="relative overflow-hidden rounded-t-xl">
          <GalleryVideo
            videoSrc={vs}
            posterSrc={poster || undefined}
            title={name}
            autoPlayMuted={autoplay}
            shellClassName={PORTFOLIO_HOME_HERO_SHELL}
          />
          {embedEditPanel}
        </div>
      );
    }
    if (!vs && cover) {
      return (
        <div className="relative overflow-hidden rounded-t-xl">
          <div className={`${PORTFOLIO_HOME_COVER_WRAP} overflow-hidden max-md:rounded-xl`}>
            <div className={PORTFOLIO_HOME_COVER_ASPECT}>
            <CmsImage
              fill
              src={cover}
              srcPath={`${basePath}.coverImageSrc`}
              alt={coverAlt}
              uploadScope="portfolio"
              uploadSegment={uploadSeg}
              sizes="(max-width: 768px) 92vw, (max-width: 1280px) 46vw, 33vw"
              imageClassName="object-cover"
              className="block h-full w-full"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.42] via-black/[0.08] to-transparent dark:from-[#020617]/80 dark:via-[#020617]/12" />
            <div className="absolute bottom-0 left-0 right-0 z-[5] border-t border-white/10 bg-black/55 px-2 py-1.5 backdrop-blur-sm">
              <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/70">
                Teks alt sampul
              </p>
              <CmsText
                path={`${basePath}.coverImageAlt`}
                text={coverImageAlt ?? ""}
                as="span"
                className="block text-[11px] leading-snug text-white"
              />
            </div>
          </div>
          </div>
        </div>
      );
    }
    return (
      <div className="relative overflow-hidden rounded-t-xl">
        <div className={PORTFOLIO_HOME_HERO_SHELL}>
          <CmsVideo
            srcPath={`${basePath}.videoSrc`}
            src={vs}
            posterPath={`${basePath}.videoPosterSrc`}
            poster={poster || undefined}
            uploadScope="portfolio"
            uploadSegment={uploadSeg}
            className="absolute inset-0 h-full w-full object-cover"
            controls
            playsInline
            preload="metadata"
            title={`Video ${name}`}
            {...(autoplay ? { autoPlay: true, muted: true, loop: true } : {})}
          />
        </div>
        {embedEditPanel}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-t-xl">
      {vs ? (
        <GalleryVideo
          videoSrc={vs}
          posterSrc={poster || undefined}
          title={name}
          autoPlayMuted={autoplay}
          shellClassName={PORTFOLIO_HOME_HERO_SHELL}
        />
      ) : cover ? (
        <div className={`${PORTFOLIO_HOME_COVER_WRAP} overflow-hidden`}>
          <div className={PORTFOLIO_HOME_COVER_ASPECT}>
            <Image
              src={cover}
              alt={coverAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 72vw, (max-width: 1280px) 46vw, 33vw"
              unoptimized={cover.startsWith("data:")}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.42] via-black/[0.08] to-transparent dark:from-[#020617]/80 dark:via-[#020617]/12" />
          </div>
        </div>
      ) : (
        <div className={PORTFOLIO_HOME_COVER_WRAP}>
          <div
            className={`${PORTFOLIO_HOME_COVER_ASPECT} bg-image-placeholder`}
            role="img"
            aria-label={`Ilustrasi proyek: ${name}`}
          />
        </div>
      )}
    </div>
  );
}

/** Hero kartu Gallery Project: rasio sama dengan tampilan publik. */
const GALLERY_SHOWCASE_HERO_SHELL =
  "relative aspect-[4/3] w-full overflow-hidden bg-[#030712] sm:aspect-video";

/** Hero atas kartu: video (poster opsional dari CMS) atau gambar utama + badge status mengambang. */
export function GalleryCardHeroMedia({ project, cmsOverrideBasePath }: GalleryCardProps) {
  const cms = useSiteCmsOptional();
  const base = cmsOverrideBasePath?.trim() ?? "";
  const cmsEdit = Boolean(cms?.eligible && cms?.editMode && base.length > 0);
  const staged = cms?.stagedMediaByPath ?? {};

  const mergedVideo = cmsEdit ? (staged[`${base}.videoSrc`] ?? project.videoSrc) : project.videoSrc;
  const mergedPoster = cmsEdit
    ? (staged[`${base}.videoPosterSrc`] ?? project.videoPosterSrc)
    : project.videoPosterSrc;
  const mergedImageSrc = cmsEdit ? (staged[`${base}.imageSrc`] ?? project.imageSrc) : project.imageSrc;
  /** Sama pola sampul beranda: alt wajar bila string kosong. */
  const imageAltForDisplay = ((project.imageAlt ?? "").trim() || project.name).trim() || "Proyek";

  const videoSrc = mergedVideo?.trim();
  const videoPosterOnly = mergedPoster?.trim() || undefined;
  const autoplay = project.videoAutoplay === true;
  const imageSrc = mergedImageSrc;
  const imageAlt = imageAltForDisplay;

  const embedEditPanel =
    cmsEdit && base ? (
      <div className="border-t border-border bg-muted-bg/90 px-3 py-2 dark:border-white/[0.08]">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          URL video (YouTube / Vimeo / path file /images/…)
        </p>
        <CmsText
          path={`${base}.videoSrc`}
          text={project.videoSrc ?? ""}
          as="span"
          className="block max-h-24 overflow-y-auto break-all font-mono text-[11px] leading-snug text-foreground"
        />
      </div>
    ) : null;

  if (cmsEdit && base) {
    const vs = videoSrc ?? "";
    if (vs && videoPresentation(vs) === "iframe") {
      return (
        <div className="relative overflow-hidden rounded-t-2xl">
          <GalleryVideo
            videoSrc={vs}
            posterSrc={videoPosterOnly}
            title={project.name}
            autoPlayMuted={autoplay}
            shellClassName={GALLERY_SHOWCASE_HERO_SHELL}
          />
          {embedEditPanel}
          <span
            className={`pointer-events-none absolute right-3 top-3 z-20 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.85)] backdrop-blur-[2px] ${GALLERY_PROJECT_STATUS_BADGE_CLASS[project.status]}`}
          >
            {project.status}
          </span>
        </div>
      );
    }
    if (!vs && imageSrc?.trim()) {
      return (
        <div className="relative overflow-hidden rounded-t-2xl">
          <div className="relative aspect-[4/3] w-full sm:aspect-video">
            <CmsImage
              fill
              src={imageSrc}
              srcPath={`${base}.imageSrc`}
              alt={imageAlt}
              uploadScope="project"
              uploadProjectId={project.id}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              imageClassName="object-cover"
              className="block h-full w-full"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.42] via-black/[0.08] to-transparent dark:from-[#020617]/80 dark:via-[#020617]/12" />
            <div className="absolute bottom-0 left-0 right-0 z-[5] border-t border-white/10 bg-black/55 px-2 py-1.5 backdrop-blur-sm">
              <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/70">
                Alt gambar hero
              </p>
              <CmsText
                path={`${base}.imageAlt`}
                text={project.imageAlt ?? ""}
                as="span"
                className="block text-[11px] leading-snug text-white"
              />
            </div>
          </div>
          <span
            className={`pointer-events-none absolute right-3 top-3 z-20 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.85)] backdrop-blur-[2px] ${GALLERY_PROJECT_STATUS_BADGE_CLASS[project.status]}`}
          >
            {project.status}
          </span>
        </div>
      );
    }
    if (vs) {
      return (
        <div className="relative overflow-hidden rounded-t-2xl">
          <div className={GALLERY_SHOWCASE_HERO_SHELL}>
            <CmsVideo
              srcPath={`${base}.videoSrc`}
              src={vs}
              posterPath={`${base}.videoPosterSrc`}
              poster={videoPosterOnly}
              uploadScope="project"
              uploadProjectId={project.id}
              className="absolute inset-0 h-full w-full object-cover"
              controls
              playsInline
              preload="metadata"
              title={`Video ${project.name}`}
              {...(autoplay ? { autoPlay: true, muted: true, loop: true } : {})}
            />
          </div>
          {embedEditPanel}
          <span
            className={`pointer-events-none absolute right-3 top-3 z-20 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.85)] backdrop-blur-[2px] ${GALLERY_PROJECT_STATUS_BADGE_CLASS[project.status]}`}
          >
            {project.status}
          </span>
        </div>
      );
    }
    return (
      <div className="relative overflow-hidden rounded-t-2xl">
        <div className={GALLERY_SHOWCASE_HERO_SHELL}>
          <CmsVideo
            srcPath={`${base}.videoSrc`}
            src=""
            posterPath={`${base}.videoPosterSrc`}
            poster={videoPosterOnly}
            uploadScope="project"
            uploadProjectId={project.id}
            className="absolute inset-0 h-full w-full object-cover"
            controls
            playsInline
            preload="metadata"
            title={`Video ${project.name}`}
          />
        </div>
        {embedEditPanel}
        <span
          className={`pointer-events-none absolute right-3 top-3 z-20 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.85)] backdrop-blur-[2px] ${GALLERY_PROJECT_STATUS_BADGE_CLASS[project.status]}`}
        >
          {project.status}
        </span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-t-2xl">
      {videoSrc ? (
        <GalleryVideo
          videoSrc={videoSrc}
          posterSrc={videoPosterOnly}
          title={project.name}
          autoPlayMuted={autoplay}
          shellClassName={GALLERY_SHOWCASE_HERO_SHELL}
        />
      ) : (
        <div className="relative aspect-[4/3] w-full sm:aspect-video">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            unoptimized={imageSrc.startsWith("data:")}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.42] via-black/[0.08] to-transparent dark:from-[#020617]/80 dark:via-[#020617]/12" />
        </div>
      )}

      <span
        className={`pointer-events-none absolute right-3 top-3 z-20 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.85)] backdrop-blur-[2px] ${GALLERY_PROJECT_STATUS_BADGE_CLASS[project.status]}`}
      >
        {project.status}
      </span>
    </div>
  );
}

/** @deprecated Gunakan {@link GalleryCardHeroMedia} + {@link GalleryPhotosCarousel} di showcase card. */
export function GalleryProjectCardTopMedia({ project }: GalleryCardProps) {
  return <GalleryCardHeroMedia project={project} />;
}
