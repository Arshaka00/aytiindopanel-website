"use client";

import {
  Component,
  type ErrorInfo,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ElementType,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";

import { nestValueAtPath } from "@/lib/cms-nest-patch";
import type { CmsRichTextBlock, CmsRichTextValue } from "@/lib/cms-rich-text";
import {
  mergeResponsiveRichStyle,
  plainTextFromRichValue,
  richStyleToReactCss,
  sanitizeRichTextBlock,
} from "@/lib/cms-rich-text";
import { CmsRichTextToolbar } from "@/components/site-cms/cms-rich-text-toolbar";
import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";
import { useCmsRichBreakpoint } from "@/components/site-cms/use-cms-rich-breakpoint";

type CmsRichStyledTextProps<T extends ElementType> = {
  path: string;
  /** Nilai field dari JSON konten (string legacy atau blok rich). */
  richValue: unknown;
  fallbackText: string;
  as?: T;
  className?: string;
  id?: string;
};

function toBlock(raw: unknown, fallback: string): CmsRichTextBlock {
  if (typeof raw === "string") {
    return { text: raw.trim() || fallback };
  }
  const s = sanitizeRichTextBlock(raw);
  if (s && s.text.trim()) return s;
  return { text: fallback };
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/**
 * Panel dock di bawah layar (tengah), di atas bilah CMS & safe area — tidak bergantung pada posisi teks
 * sehingga tidak tertimpa hero / `overflow-x-clip` pada body dan selalu terlihat.
 */
/** Tangkap error render `CmsRichTextToolbar` (mis. data tak terduga) supaya tidak “kosong” tanpa pesan. */
class CmsRichToolbarBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[CmsRichTextToolbar]", error.message, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-xl border border-red-400/45 bg-red-950/50 p-3 text-left text-xs text-red-100">
          <div className="font-semibold">Panel gaya gagal dimuat</div>
          <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap break-all font-mono text-[10px] text-red-200/90">
            {this.state.error.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

/** Ruang untuk bilah CMS + tombol kanan bawah (`site-cms-chrome`). */
const CMS_CORNER_RESERVE_PX = 112;

const commonToolbarBox: Pick<
  CSSProperties,
  "position" | "zIndex" | "display" | "flexDirection" | "overflow" | "boxSizing" | "pointerEvents" | "overscrollBehavior"
> = {
  position: "fixed",
  zIndex: 2147483647,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  boxSizing: "border-box",
  pointerEvents: "auto",
  overscrollBehavior: "contain",
};

/**
 * Penempatan aman: tidak menutupi anchor teks jika memungkinkan.
 * - Layar lebar: rel kanan (teks hero/pusat tetap terlihat).
 * - Sempit: dock atas atau bawah mengikuti posisi vertikal teks & ruang kosong.
 */
function computeDockedToolbarStyle(anchorEl: HTMLElement | null): CSSProperties {
  const vw = typeof window !== "undefined" ? window.innerWidth : 400;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const panelW = Math.max(260, Math.min(vw - 16, 28 * 16));
  const estimatedPanelH = Math.min(vh * 0.44, 460);
  const gap = 14;

  /** Rail kanan desktop — jarang overlap blok teks utama di kiri/tengah. */
  if (vw >= 900) {
    return {
      ...commonToolbarBox,
      right: "max(0.75rem, env(safe-area-inset-right, 0px))",
      left: "auto",
      top: "max(0.65rem, env(safe-area-inset-top, 0px))",
      bottom: `max(${CMS_CORNER_RESERVE_PX}px, calc(env(safe-area-inset-bottom, 0px) + 5.25rem))`,
      transform: "none",
      width: Math.min(panelW, 380),
      maxWidth: "min(380px, calc(100vw - 1.25rem))",
      maxHeight: `min(calc(100vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - ${CMS_CORNER_RESERVE_PX}px), 560px)`,
    };
  }

  const fallbackBottom = (): CSSProperties => ({
    ...commonToolbarBox,
    left: "50%",
    right: "auto",
    top: "auto",
    bottom:
      vh < 720
        ? "max(7rem, calc(env(safe-area-inset-bottom, 0px) + 6rem))"
        : "max(6.25rem, calc(env(safe-area-inset-bottom, 0px) + 5.5rem))",
    transform: "translateX(-50%)",
    width: panelW,
    maxWidth: "min(calc(100vw - 1rem), 28rem)",
    maxHeight: "min(58vh, 480px)",
  });

  const fallbackTop = (): CSSProperties => ({
    ...commonToolbarBox,
    left: "50%",
    right: "auto",
    top: "max(0.5rem, env(safe-area-inset-top, 0px))",
    bottom: "auto",
    transform: "translateX(-50%)",
    width: panelW,
    maxWidth: "min(calc(100vw - 1rem), 28rem)",
    maxHeight: "min(52vh, 440px)",
  });

  if (!anchorEl || typeof anchorEl.getBoundingClientRect !== "function") {
    return fallbackBottom();
  }

  const r = anchorEl.getBoundingClientRect();
  const midY = r.top + r.height / 2;
  const spaceAbove = r.top;
  const spaceBelow = vh - r.bottom;
  const editingLowerHalf = midY > vh * 0.36;
  const needTop =
    editingLowerHalf || (spaceBelow < estimatedPanelH + gap + 48 && spaceAbove >= spaceBelow);

  if (needTop && spaceAbove >= gap + Math.min(estimatedPanelH * 0.65, 280)) {
    return fallbackTop();
  }
  if (!needTop && spaceBelow >= estimatedPanelH + gap + 40) {
    return fallbackBottom();
  }
  if (spaceAbove > spaceBelow) {
    return fallbackTop();
  }
  return fallbackBottom();
}

export function CmsRichStyledText<T extends ElementType = "span">({
  path,
  richValue,
  fallbackText,
  as,
  className,
  id,
}: CmsRichStyledTextProps<T>) {
  const cms = useSiteCmsOptional();
  const Tag = (as ?? "span") as ElementType;
  const bp = useCmsRichBreakpoint();

  const baseBlock = useMemo(() => toBlock(richValue, fallbackText), [richValue, fallbackText]);

  const [localBlock, setLocalBlock] = useState<CmsRichTextBlock | null>(null);
  const effectiveBlock = localBlock ?? baseBlock;

  const syncKey = useMemo(() => JSON.stringify(richValue), [richValue]);

  const mergedStyle = useMemo(() => mergeResponsiveRichStyle(effectiveBlock, bp), [effectiveBlock, bp]);
  const richCss = useMemo(() => richStyleToReactCss(mergedStyle), [mergedStyle]);

  const editCss = useMemo(() => {
    if (!richCss.backgroundImage) return richCss;
    return {
      ...richCss,
      backgroundImage: undefined,
      WebkitBackgroundClip: undefined,
      backgroundClip: undefined,
      WebkitTextFillColor: undefined,
      color: mergedStyle.color ?? "#F5F7FF",
    };
  }, [richCss, mergedStyle.color]);

  const cmsEligible = Boolean(cms?.eligible && cms.editMode);
  const reactId = useId();
  const editorIdRef = useRef(`${path}-${reactId}`);
  const elRef = useRef<HTMLElement | null>(null);
  const dirty = useRef(false);
  const dirtyStateRef = useRef(false);
  const originRef = useRef(effectiveBlock.text);
  const [isDirty, setIsDirty] = useState(false);
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const [styleLayer, setStyleLayer] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [, bump] = useState(0);
  const isClient = useIsClient();
  const [toolbarFixedStyle, setToolbarFixedStyle] = useState<CSSProperties | null>(null);
  const toolbarPortalRef = useRef<HTMLDivElement | null>(null);

  const updateToolbarPosition = useCallback(() => {
    if (typeof window === "undefined") return;
    setToolbarFixedStyle(computeDockedToolbarStyle(elRef.current));
  }, []);

  useLayoutEffect(() => {
    const el = elRef.current;
    if (!el || !cmsEligible) return;
    if (!dirty.current && el.innerText !== effectiveBlock.text) {
      el.innerText = effectiveBlock.text;
      originRef.current = effectiveBlock.text;
    }
  }, [effectiveBlock.text, cmsEligible]);

  const patchBlock = useCallback(
    async (next: CmsRichTextBlock) => {
      if (!cms) return;
      const cleaned = sanitizeRichTextBlock(next);
      if (!cleaned?.text.trim()) return;
      const hasMeta = Boolean(
        cleaned.preset || cleaned.style || cleaned.tablet || cleaned.mobile || cleaned.motion,
      );
      const value: CmsRichTextValue = hasMeta ? cleaned : cleaned.text;
      const patch =
        typeof value === "string"
          ? nestValueAtPath(path, value)
          : nestValueAtPath(path, cleaned as unknown);
      await cms.patchDeep(patch);
    },
    [cms, path],
  );

  const commit = useCallback(async () => {
    if (!cms) return;
    const el = elRef.current;
    const textNext = (el?.innerText ?? "").trim();
    const prev = originRef.current.trim();
    const nextBlock: CmsRichTextBlock = {
      ...effectiveBlock,
      text: textNext || fallbackText,
    };
    const textSame = textNext === prev;
    if (textSame && !localBlock) {
      dirty.current = false;
      if (dirtyStateRef.current) {
        dirtyStateRef.current = false;
        window.dispatchEvent(
          new CustomEvent("cms-text-dirty", {
            detail: { editorId: editorIdRef.current, dirty: false },
          }),
        );
      }
      setIsDirty(false);
      setToolbarOpen(false);
      return;
    }
    try {
      await patchBlock(nextBlock);
      originRef.current = nextBlock.text;
      setLocalBlock(null);
    } catch (e) {
      console.error(e);
      if (el) el.innerText = originRef.current;
    } finally {
      dirty.current = false;
      if (dirtyStateRef.current) {
        dirtyStateRef.current = false;
        window.dispatchEvent(
          new CustomEvent("cms-text-dirty", {
            detail: { editorId: editorIdRef.current, dirty: false },
          }),
        );
      }
      setIsDirty(false);
      setToolbarOpen(false);
      bump((n) => n + 1);
    }
  }, [cms, effectiveBlock, fallbackText, localBlock, patchBlock]);

  const cancelEdit = useCallback(() => {
    const el = elRef.current;
    if (el) {
      el.innerText = originRef.current;
      el.blur();
    }
    dirty.current = false;
    setLocalBlock(null);
    if (dirtyStateRef.current) {
      dirtyStateRef.current = false;
      window.dispatchEvent(
        new CustomEvent("cms-text-dirty", {
          detail: { editorId: editorIdRef.current, dirty: false },
        }),
      );
    }
    setIsDirty(false);
    setToolbarOpen(false);
  }, []);

  useEffect(() => {
    const onActivate = (ev: Event) => {
      const ce = ev as CustomEvent<{ editorId?: string }>;
      if (ce.detail?.editorId === editorIdRef.current) return;
      setToolbarOpen(false);
    };
    window.addEventListener("cms-text-activate", onActivate as EventListener);
    return () => window.removeEventListener("cms-text-activate", onActivate as EventListener);
  }, []);

  useLayoutEffect(() => {
    if (!toolbarOpen || !cmsEligible) return;
    const onResize = () => updateToolbarPosition();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [toolbarOpen, cmsEligible, updateToolbarPosition]);

  useEffect(() => {
    const onSaveAll = () => {
      if (!dirty.current) return;
      void commit();
    };
    const onCancelAll = () => {
      if (!dirty.current) return;
      cancelEdit();
    };
    window.addEventListener("cms-text-save-all", onSaveAll);
    window.addEventListener("cms-text-cancel-all", onCancelAll);
    return () => {
      window.removeEventListener("cms-text-save-all", onSaveAll);
      window.removeEventListener("cms-text-cancel-all", onCancelAll);
    };
  }, [cancelEdit, commit]);

  const plain = plainTextFromRichValue(richValue, fallbackText);

  if (!cmsEligible) {
    return (
      <Tag className={className} id={id} style={richCss}>
        {plain}
      </Tag>
    );
  }

  return (
    <span key={syncKey} className="relative inline-block max-w-full align-top">
      <Tag
        id={id}
        ref={elRef as never}
        className={`${className ?? ""} cursor-text select-text rounded-sm outline-none transition-[box-shadow,background-color] duration-200 ease-out [text-rendering:optimizeLegibility] hover:bg-sky-500/[0.08] hover:shadow-[0_0_0_1px_rgba(56,189,248,0.42)] focus:bg-sky-500/[0.08] focus:shadow-[0_0_0_2px_rgba(56,189,248,0.48)] focus-visible:bg-sky-500/[0.08] ${isDirty ? "bg-amber-500/[0.09] shadow-[0_0_0_1px_rgba(251,191,36,0.58)]" : ""}`}
        style={toolbarOpen ? editCss : richCss}
        contentEditable
        suppressContentEditableWarning
        data-cms-edit
        data-cms-rich-styled="true"
        tabIndex={0}
        role="textbox"
        aria-label={`Editable rich text: ${path}`}
        spellCheck={false}
        onPointerDownCapture={(e: ReactPointerEvent<HTMLElement>) => {
          e.stopPropagation();
        }}
        onClick={() => {
          elRef.current?.focus();
        }}
        onFocus={() => {
          originRef.current = elRef.current?.innerText ?? effectiveBlock.text;
          if (typeof window !== "undefined") {
            setToolbarFixedStyle(computeDockedToolbarStyle(elRef.current));
          }
          setToolbarOpen(true);
          queueMicrotask(() => {
            window.dispatchEvent(
              new CustomEvent("cms-text-activate", {
                detail: { editorId: editorIdRef.current },
              }),
            );
          });
          /**
           * 1) Scroll teks ke tengah.
           * 2) Hitung ulang posisi panel dari `getBoundingClientRect` supaya dock atas/bawah/kanan tidak menimpa anchor.
           */
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const el = elRef.current;
              if (!el) {
                setToolbarFixedStyle(computeDockedToolbarStyle(null));
                return;
              }
              const reduceMotion =
                typeof window !== "undefined" &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              el.scrollIntoView({
                block: "center",
                inline: "nearest",
                behavior: reduceMotion ? "auto" : "smooth",
              });
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  setToolbarFixedStyle(computeDockedToolbarStyle(elRef.current));
                });
              });
            });
          });
        }}
        onInput={() => {
          dirty.current = true;
          const t = elRef.current?.innerText ?? "";
          setLocalBlock({ ...effectiveBlock, text: t });
          if (!dirtyStateRef.current) {
            dirtyStateRef.current = true;
            window.dispatchEvent(
              new CustomEvent("cms-text-dirty", {
                detail: { editorId: editorIdRef.current, dirty: true },
              }),
            );
          }
          setIsDirty(true);
        }}
        onKeyDown={(e: ReactKeyboardEvent<HTMLElement>) => {
          if (e.key === "Escape") {
            e.preventDefault();
            cancelEdit();
            return;
          }
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            void commit();
          }
        }}
        onBlur={(e: ReactFocusEvent<HTMLElement>) => {
          const nextTarget = e.relatedTarget as Node | null;
          if (nextTarget && (e.currentTarget.parentElement?.contains(nextTarget) ?? false)) return;
          if (nextTarget && toolbarPortalRef.current?.contains(nextTarget)) return;
          const portalEl = toolbarPortalRef.current;
          /**
           * WebKit / Safari: `relatedTarget` sering `null` saat fokus pindah ke portal (panel dock).
           * Tanpa penundaan, panel langsung ditutup sebelum kontrol terlihat.
           */
          window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
              const ae = document.activeElement;
              if (portalEl?.contains(ae)) return;
              if (dirty.current) void commit();
              else setToolbarOpen(false);
            });
          });
        }}
      />

      {toolbarOpen && isClient && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={toolbarPortalRef}
              data-cms-rich-toolbar
              tabIndex={-1}
              className="pointer-events-auto min-w-0 rounded-2xl border border-white/15 bg-[#070b14]/98 shadow-[0_12px_40px_rgba(0,0,0,0.65)] backdrop-blur-md"
              style={toolbarFixedStyle ?? computeDockedToolbarStyle(elRef.current)}
            >
              <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-200/95">
                <span className="truncate">Gaya teks CMS</span>
                <span className="font-mono text-[9px] font-normal normal-case tracking-normal text-slate-500">
                  {path}
                </span>
              </div>
              <div
                className="min-w-0 shrink-0 px-2 py-2"
                style={{
                  minHeight: 220,
                  maxHeight: "min(52vh, 440px)",
                  overflowY: "auto",
                  overflowX: "hidden",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <CmsRichToolbarBoundary key={path}>
                  <CmsRichTextToolbar
                    block={effectiveBlock}
                    activeLayer={styleLayer}
                    onActiveLayer={setStyleLayer}
                    onChange={(next) => {
                      setLocalBlock(next);
                      dirty.current = true;
                      if (!dirtyStateRef.current) {
                        dirtyStateRef.current = true;
                        window.dispatchEvent(
                          new CustomEvent("cms-text-dirty", {
                            detail: { editorId: editorIdRef.current, dirty: true },
                          }),
                        );
                      }
                      setIsDirty(true);
                    }}
                    preview={effectiveBlock.text}
                  />
                </CmsRichToolbarBoundary>
              </div>
              <div className="flex shrink-0 justify-center gap-2 border-t border-white/10 bg-[#050812]/95 px-3 py-2">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => void commit()}
                  className="rounded-lg bg-emerald-500/85 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-400"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={cancelEdit}
                  className="rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
                >
                  Batal
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </span>
  );
}
