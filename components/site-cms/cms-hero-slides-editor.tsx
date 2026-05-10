"use client";

import { useCallback, useRef, useState, type ChangeEvent } from "react";

import { CmsImageTransformModal } from "@/components/site-cms/cms-image-transform-modal";
import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";
import type { CmsImageTransform } from "@/lib/cms-image-transform";
import { nestValueAtPath } from "@/lib/cms-nest-patch";
import type { HeroSlideEntry } from "@/lib/site-content-model";

export function CmsHeroSlidesEditor({ slides }: { slides: readonly HeroSlideEntry[] }) {
  const cms = useSiteCmsOptional();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [transformIndex, setTransformIndex] = useState<number | null>(null);

  const pick = useCallback((i: number) => {
    setIndex(i);
    inputRef.current?.click();
  }, []);

  const onFile = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !cms || index === null) return;
      const ok = await cms.ensureWriteSession();
      if (!ok) return;
      setBusy(true);
      try {
        const fd = new FormData();
        fd.set("scope", "hero");
        fd.set("file", file);
        const up = await fetch("/api/site-media/upload", { method: "POST", credentials: "include", body: fd });
        const j = (await up.json().catch(() => ({}))) as { url?: string };
        if (!up.ok || !j.url) throw new Error("Upload gagal");
        window.dispatchEvent(
          new CustomEvent("cms-image-preview", {
            detail: { path: `hero.slides.${index}.src`, url: j.url },
          }),
        );
        cms.stageMediaChange(`hero.slides.${index}.src`, j.url);
        cms.pushToast?.("Perubahan slide siap disimpan", "ok");
      } catch (err) {
        console.error(err);
        const msg = err instanceof Error ? err.message : "Coba lagi atau periksa format file.";
        window.alert(`Gagal mengganti slide. ${msg}`);
      } finally {
        setBusy(false);
        setIndex(null);
      }
    },
    [cms, index, slides],
  );

  const onCommitTransform = useCallback(
    async (t: CmsImageTransform) => {
      if (!cms || transformIndex === null) return;
      try {
        await cms.patchDeep(nestValueAtPath(`hero.slides.${transformIndex}`, t));
      } catch {
        /* toast dari provider */
      }
    },
    [cms, transformIndex],
  );

  if (!cms?.eligible || !cms.editMode) return null;

  const tfSlide =
    transformIndex !== null && slides[transformIndex]
      ? slides[transformIndex]
      : null;

  return (
    <>
      <div className="pointer-events-auto absolute bottom-24 left-1/2 z-[25] flex max-w-[min(100%,24rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-2xl border border-white/15 bg-black/50 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.12em] text-white/85 shadow-lg backdrop-blur-md md:bottom-28">
        <span className="w-full text-center text-[9px] text-white/70">Hero slides</span>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(ev) => void onFile(ev)} />
        <div className="flex w-full flex-wrap justify-center gap-2">
          {slides.map((s, i) => (
            <div key={`slide-${s.src}-${i}`} className="flex flex-col items-center gap-0.5">
              <button
                type="button"
                disabled={busy}
                onClick={() => pick(i)}
                className="rounded-lg border border-white/20 bg-white/10 px-2 py-1 hover:bg-white/20 disabled:opacity-50"
              >
                {i + 1}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setTransformIndex(i)}
                className="rounded border border-sky-400/35 bg-sky-950/60 px-1.5 py-0.5 text-[8px] font-semibold normal-case tracking-normal text-sky-100 hover:bg-sky-900/70 disabled:opacity-50"
              >
                Atur
              </button>
            </div>
          ))}
        </div>
      </div>
      {tfSlide && transformIndex !== null ? (
        <CmsImageTransformModal
          open
          onClose={() => setTransformIndex(null)}
          imageSrc={tfSlide.src}
          initial={tfSlide}
          previewPath={`hero.slides.${transformIndex}`}
          title={`Hero slide ${transformIndex + 1}`}
          onCommit={(t) => void onCommitTransform(t)}
        />
      ) : null}
    </>
  );
}
