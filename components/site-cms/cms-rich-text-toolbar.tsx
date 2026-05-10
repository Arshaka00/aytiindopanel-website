"use client";

import { useMemo, useState, type ReactNode } from "react";

import type {
  CmsGradientSpec,
  CmsRichBreakpoint,
  CmsRichTextBlock,
  CmsRichTextStyle,
  CmsTypographyPresetId,
} from "@/lib/cms-rich-text";
import { mergeResponsiveRichStyle, richStyleToReactCss } from "@/lib/cms-rich-text";
import { useCmsRichBreakpoint } from "@/components/site-cms/use-cms-rich-breakpoint";

const PRESET_LIST: { id: CmsTypographyPresetId; label: string }[] = [
  { id: "premium-heading", label: "Premium Heading" },
  { id: "luxury-subtitle", label: "Luxury Subtitle" },
  { id: "industrial-label", label: "Industrial Label" },
  { id: "muted-text", label: "Muted Text" },
  { id: "hero-title", label: "Hero Title" },
  { id: "cta-text", label: "CTA Text" },
];

type Layer = CmsRichBreakpoint;

function layerKey(layer: Layer): "style" | "tablet" | "mobile" {
  if (layer === "desktop") return "style";
  if (layer === "tablet") return "tablet";
  return "mobile";
}

function getLayerStyle(block: CmsRichTextBlock, layer: Layer): Partial<CmsRichTextStyle> {
  const k = layerKey(layer);
  if (k === "style") return { ...(block.style ?? {}) };
  return { ...(block[k] ?? {}) };
}

function setLayerStyle(
  block: CmsRichTextBlock,
  layer: Layer,
  next: Partial<CmsRichTextStyle>,
): CmsRichTextBlock {
  const k = layerKey(layer);
  const out = { ...block, [k]: { ...getLayerStyle(block, layer), ...next } } as CmsRichTextBlock;
  if (k === "style" && out.style && Object.keys(out.style).length === 0) delete out.style;
  if (k === "tablet" && out.tablet && Object.keys(out.tablet).length === 0) delete out.tablet;
  if (k === "mobile" && out.mobile && Object.keys(out.mobile).length === 0) delete out.mobile;
  return out;
}

function toggleFlag(
  block: CmsRichTextBlock,
  layer: Layer,
  key: "fontWeight" | "fontStyle" | "textTransform" | "textDecoration",
  onVal: string,
  offVal: string,
  current: CmsRichTextStyle,
): CmsRichTextBlock {
  const cur = String(current[key] ?? "");
  const isOn = key === "fontWeight" ? Number(cur) >= 600 || cur === "bold" : cur === onVal;
  const nextVal = isOn ? offVal : onVal;
  return setLayerStyle(block, layer, { [key]: nextVal } as Partial<CmsRichTextStyle>);
}

export function CmsRichTextToolbar({
  block,
  onChange,
  activeLayer,
  onActiveLayer,
  preview,
}: {
  block: CmsRichTextBlock;
  onChange: (next: CmsRichTextBlock) => void;
  activeLayer: Layer;
  onActiveLayer: (l: Layer) => void;
  preview?: ReactNode;
}) {
  const viewportBp = useCmsRichBreakpoint();
  const layerStyle = useMemo(() => getLayerStyle(block, activeLayer), [block, activeLayer]);
  const mergedPreview = useMemo(() => mergeResponsiveRichStyle(block, viewportBp), [block, viewportBp]);
  const previewCss = useMemo(() => richStyleToReactCss(mergedPreview), [mergedPreview]);

  const [gradientEnabled, setGradientEnabled] = useState(Boolean(layerStyle.gradient?.stops?.length));

  const applyLayer = (partial: Partial<CmsRichTextStyle>) => {
    onChange(setLayerStyle(block, activeLayer, { ...layerStyle, ...partial }));
  };

  const gradient = layerStyle.gradient;

  const setGradientFromUi = (enabled: boolean, g?: CmsGradientSpec) => {
    if (!enabled) {
      applyLayer({ gradient: undefined, color: layerStyle.color ?? mergedPreview.color });
      setGradientEnabled(false);
      return;
    }
    const base: CmsGradientSpec =
      g ??
      gradient ??
      ({
        kind: "linear",
        angleDeg: 90,
        stops: [
          { color: "#ffffff", positionPct: 0 },
          { color: "#7FE7FF", positionPct: 100 },
        ],
      } as CmsGradientSpec);
    setGradientEnabled(true);
    applyLayer({ gradient: base, color: undefined });
  };

  return (
    <div className="cms-rich-toolbar pointer-events-auto w-full max-w-[26rem] rounded-2xl border border-white/[0.12] bg-[#0a0f1c]/96 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.55)] backdrop-blur-md">
      <div className="mb-2 flex flex-wrap items-center gap-1 border-b border-white/[0.08] pb-2">
        {(["desktop", "tablet", "mobile"] as const).map((bp) => (
          <button
            key={bp}
            type="button"
            onClick={() => onActiveLayer(bp)}
            className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
              activeLayer === bp ? "bg-sky-500/25 text-sky-100" : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
            }`}
          >
            {bp === "desktop" ? "Desktop" : bp === "tablet" ? "Tablet" : "Mobile"}
          </button>
        ))}
      </div>

      {preview ? (
        <div className="mb-3 rounded-xl border border-white/[0.08] bg-black/35 px-3 py-2">
          <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">Live preview</div>
          <div className="min-h-[2rem] truncate text-sm" style={previewCss}>
            {preview}
          </div>
        </div>
      ) : null}

      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Preset</div>
      <select
        value={block.preset ?? ""}
        onChange={(e) => {
          const v = e.target.value as CmsTypographyPresetId | "";
          onChange({
            ...block,
            ...(v ? { preset: v } : { preset: undefined }),
          });
        }}
        className="mb-3 w-full rounded-lg border border-white/[0.12] bg-[#060a14] px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-sky-400/40"
      >
        <option value="">— Tanpa preset —</option>
        {PRESET_LIST.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>

      <div className="mb-2 flex flex-wrap gap-1">
        <ToolbarBtn
          label="B"
          title="Bold"
          active={Number(layerStyle.fontWeight) >= 600 || layerStyle.fontWeight === "bold"}
          onClick={() =>
            onChange(toggleFlag(block, activeLayer, "fontWeight", "700", "400", layerStyle))
          }
        />
        <ToolbarBtn
          label="I"
          title="Italic"
          italic
          active={layerStyle.fontStyle === "italic"}
          onClick={() =>
            onChange(toggleFlag(block, activeLayer, "fontStyle", "italic", "normal", layerStyle))
          }
        />
        <ToolbarBtn
          label="U"
          title="Underline"
          underline
          active={layerStyle.textDecoration === "underline"}
          onClick={() =>
            onChange(
              toggleFlag(block, activeLayer, "textDecoration", "underline", "none", layerStyle),
            )
          }
        />
        <ToolbarBtn
          label="AA"
          title="Uppercase"
          active={layerStyle.textTransform === "uppercase"}
          onClick={() =>
            onChange(
              toggleFlag(block, activeLayer, "textTransform", "uppercase", "none", layerStyle),
            )
          }
        />
        <ToolbarBtn
          label="aa"
          title="Lowercase"
          active={layerStyle.textTransform === "lowercase"}
          onClick={() =>
            onChange(
              toggleFlag(block, activeLayer, "textTransform", "lowercase", "none", layerStyle),
            )
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="block text-[10px] text-slate-400">
          Ukuran
          <input
            value={layerStyle.fontSize ?? ""}
            onChange={(e) => applyLayer({ fontSize: e.target.value || undefined })}
            placeholder="e.g. 1rem"
            className="mt-0.5 w-full rounded-lg border border-white/[0.12] bg-[#060a14] px-2 py-1 text-xs text-slate-100"
          />
        </label>
        <label className="block text-[10px] text-slate-400">
          Weight
          <input
            value={layerStyle.fontWeight ?? ""}
            onChange={(e) => applyLayer({ fontWeight: e.target.value || undefined })}
            placeholder="700"
            className="mt-0.5 w-full rounded-lg border border-white/[0.12] bg-[#060a14] px-2 py-1 text-xs text-slate-100"
          />
        </label>
        <label className="block text-[10px] text-slate-400">
          Line height
          <input
            value={layerStyle.lineHeight ?? ""}
            onChange={(e) => applyLayer({ lineHeight: e.target.value || undefined })}
            placeholder="1.1"
            className="mt-0.5 w-full rounded-lg border border-white/[0.12] bg-[#060a14] px-2 py-1 text-xs text-slate-100"
          />
        </label>
        <label className="block text-[10px] text-slate-400">
          Letter
          <input
            value={layerStyle.letterSpacing ?? ""}
            onChange={(e) => applyLayer({ letterSpacing: e.target.value || undefined })}
            placeholder="-0.02em"
            className="mt-0.5 w-full rounded-lg border border-white/[0.12] bg-[#060a14] px-2 py-1 text-xs text-slate-100"
          />
        </label>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {(["left", "center", "right"] as const).map((al) => (
          <button
            key={al}
            type="button"
            onClick={() => applyLayer({ textAlign: al })}
            className={`rounded-lg px-2 py-1 text-[10px] font-semibold capitalize ${
              (layerStyle.textAlign ?? "inherit") === al ? "bg-white/15 text-white" : "text-slate-400 hover:bg-white/[0.06]"
            }`}
          >
            {al}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="block text-[10px] text-slate-400">
          Warna teks
          <div className="mt-0.5 flex gap-1">
            <input
              type="color"
              value={toHexInput(layerStyle.color ?? mergedPreview.color ?? "#ffffff")}
              onChange={(e) => {
                setGradientFromUi(false);
                applyLayer({ color: e.target.value });
              }}
              className="h-8 w-full cursor-pointer rounded border border-white/15 bg-transparent"
            />
          </div>
        </label>
        <label className="block text-[10px] text-slate-400">
          Opacity
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round((layerStyle.opacity ?? 1) * 100)}
            onChange={(e) => applyLayer({ opacity: Number(e.target.value) / 100 })}
            className="mt-2 w-full accent-sky-400"
          />
        </label>
      </div>

      <div className="mt-3 rounded-xl border border-white/[0.08] bg-black/25 p-2">
        <label className="flex cursor-pointer items-center gap-2 text-[10px] text-slate-300">
          <input
            type="checkbox"
            checked={gradientEnabled && Boolean(gradient?.stops?.length)}
            onChange={(e) => setGradientFromUi(e.target.checked)}
          />
          Gradient teks
        </label>
        {gradientEnabled && gradient ? (
          <div className="mt-2 space-y-2">
            <label className="block text-[10px] text-slate-400">
              Sudut
              <input
                type="range"
                min={0}
                max={360}
                value={gradient.angleDeg}
                onChange={(e) =>
                  applyLayer({
                    gradient: { ...gradient, angleDeg: Number(e.target.value) },
                  })
                }
                className="mt-1 w-full accent-cyan-400"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-[10px] text-slate-400">
                Stop A
                <input
                  type="color"
                  value={toHexInput(gradient.stops[0]?.color ?? "#ffffff")}
                  onChange={(e) => {
                    const stops = [...gradient.stops];
                    stops[0] = { ...stops[0], color: e.target.value, positionPct: stops[0]?.positionPct ?? 0 };
                    applyLayer({ gradient: { ...gradient, stops } });
                  }}
                  className="mt-0.5 h-7 w-full cursor-pointer rounded border border-white/15"
                />
              </label>
              <label className="text-[10px] text-slate-400">
                Stop B
                <input
                  type="color"
                  value={toHexInput(gradient.stops[1]?.color ?? "#7FE7FF")}
                  onChange={(e) => {
                    const stops = [...gradient.stops];
                    const idx = 1;
                    stops[idx] = {
                      ...stops[idx],
                      color: e.target.value,
                      positionPct: stops[idx]?.positionPct ?? 100,
                    };
                    applyLayer({ gradient: { ...gradient, stops } });
                  }}
                  className="mt-0.5 h-7 w-full cursor-pointer rounded border border-white/15"
                />
              </label>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="text-[10px] text-slate-400">
          Glow blur (px)
          <input
            type="range"
            min={0}
            max={48}
            value={layerStyle.glow?.blurPx ?? 0}
            onChange={(e) => {
              const blur = Number(e.target.value);
              if (blur <= 0) applyLayer({ glow: undefined });
              else
                applyLayer({
                  glow: {
                    color: layerStyle.glow?.color ?? "#59D8FF",
                    blurPx: blur,
                    opacity: layerStyle.glow?.opacity ?? 0.45,
                  },
                });
            }}
            className="mt-1 w-full accent-violet-400"
          />
        </label>
        <label className="text-[10px] text-slate-400">
          Margin Y (px)
          <div className="mt-0.5 flex gap-1">
            <input
              placeholder="top"
              value={parsePx(layerStyle.marginTop)}
              onChange={(e) =>
                applyLayer({
                  marginTop: e.target.value ? `${Math.min(120, Math.max(-40, Number(e.target.value)))}px` : undefined,
                })
              }
              className="w-full rounded border border-white/[0.12] bg-[#060a14] px-1 py-0.5 text-[11px] text-slate-100"
            />
            <input
              placeholder="bot"
              value={parsePx(layerStyle.marginBottom)}
              onChange={(e) =>
                applyLayer({
                  marginBottom: e.target.value
                    ? `${Math.min(120, Math.max(-40, Number(e.target.value)))}px`
                    : undefined,
                })
              }
              className="w-full rounded border border-white/[0.12] bg-[#060a14] px-1 py-0.5 text-[11px] text-slate-100"
            />
          </div>
        </label>
      </div>

      <div className="mt-2 text-[9px] leading-snug text-slate-500">
        Tip: edit layer per breakpoint; teks utama diedit di halaman. Property dibatasi whitelist — aman untuk produksi.
      </div>
    </div>
  );
}

function parsePx(v: string | undefined): string {
  if (!v) return "";
  const m = String(v).match(/^(-?\d+)px$/);
  return m ? m[1] : "";
}

function toHexInput(color: string): string {
  const c = color.trim();
  if (/^#[0-9a-f]{6}$/i.test(c)) return c;
  return "#ffffff";
}

function ToolbarBtn({
  label,
  title,
  active,
  italic,
  underline,
  onClick,
}: {
  label: string;
  title: string;
  active?: boolean;
  italic?: boolean;
  underline?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`min-w-[2rem] rounded-lg px-2 py-1 text-xs font-bold transition-colors ${
        active ? "bg-sky-500/35 text-white" : "bg-white/[0.06] text-slate-300 hover:bg-white/10"
      } ${italic ? "italic" : ""} ${underline ? "underline" : ""}`}
    >
      {label}
    </button>
  );
}
