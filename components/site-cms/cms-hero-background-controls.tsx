"use client";

import type { SiteContent } from "@/lib/site-content";

export function CmsHeroBackgroundControls({ hero }: { hero: SiteContent["hero"] }) {
  void hero;
  // Hero background is image-only; hide legacy video controls.
  return null;

  /*
  const cms = useSiteCmsOptional();
  const inputRef = useRef<HTMLInputElement>(null);
  const edit = Boolean(cms?.eligible && cms.editMode);

  const upload = useCallback(async () => {
    const ok = await cms?.ensureWriteSession();
    if (!ok) return;
    inputRef.current?.click();
  }, [cms]);

  const onVideo = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !cms) return;
      const fd = new FormData();
      fd.set("scope", "hero");
      fd.set("file", file);
      try {
        const up = await fetch("/api/site-media/upload", {
          method: "POST",
          credentials: "include",
          body: fd,
        });
        const j = (await up.json().catch(() => ({}))) as { url?: string };
        if (!up.ok || !j.url) throw new Error("Upload gagal");
        await cms.patchDeep({
          hero: {
            backgroundVideo: {
              src: j.url,
              muted: true,
            },
          },
        });
      } catch (err) {
        console.error(err);
        window.alert("Gagal mengunggah video.");
      }
    },
    [cms],
  );

  const clearVideo = useCallback(async () => {
    if (!cms) return;
    const ok = await cms.ensureWriteSession();
    if (!ok) return;
    await cms.patchDeep({ hero: { backgroundVideo: null } });
  }, [cms]);

  if (!edit) return null;

  return (
    <div className="pointer-events-auto absolute bottom-40 left-1/2 z-[26] flex max-w-[min(100%,22rem)] -translate-x-1/2 flex-col gap-1.5 rounded-2xl border border-white/15 bg-black/55 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.12em] text-white/90 shadow-lg backdrop-blur-md md:bottom-44">
      <span className="text-center text-[9px] text-white/65">Background video (opsional)</span>
      <input ref={inputRef} type="file" accept="video/mp4,video/webm" className="hidden" onChange={(ev) => void onVideo(ev)} />
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => void upload()}
          className="rounded-lg border border-white/20 bg-white/10 px-2 py-1 hover:bg-white/20"
        >
          Unggah video
        </button>
        {hero.backgroundVideo?.src ? (
          <button
            type="button"
            onClick={() => void clearVideo()}
            className="rounded-lg border border-red-400/35 bg-red-500/15 px-2 py-1 text-red-100 hover:bg-red-500/25"
          >
            Hapus video
          </button>
        ) : null}
      </div>
    </div>
  );
  */
}
