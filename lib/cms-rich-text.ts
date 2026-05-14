import type { CSSProperties } from "react";

/** Nilai field CMS: string legacy atau blok bergaya. */
export type CmsRichTextValue = string | CmsRichTextBlock;

export type CmsTypographyPresetId =
  | "premium-heading"
  | "luxury-subtitle"
  | "industrial-label"
  | "muted-text"
  | "hero-title"
  | "cta-text";

/** Skala tipografi — bisa dipakai bersama override manual. */
export type CmsTypographyScaleToken = "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "hero";

export type CmsGradientSpec = {
  kind: "linear";
  angleDeg: number;
  stops: { color: string; positionPct: number }[];
};

export type CmsGlowSpec = {
  color: string;
  blurPx: number;
  /** 0–1 */
  opacity?: number;
};

export type CmsTextShadowSpec = {
  offsetXpx: number;
  offsetYpx: number;
  blurPx: number;
  color: string;
};

/** Motion / animasi — struktur masa depan (tanpa runtime motion di v1). */
export type CmsRichTextMotion = {
  preset?: "none" | "fade-up" | "reveal" | "typing" | "gradient-shift";
  delayMs?: number;
  durationMs?: number;
};

export type CmsRichTextStyle = {
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: "normal" | "italic";
  textAlign?: "left" | "center" | "right" | "justify";
  lineHeight?: string;
  letterSpacing?: string;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  textDecoration?: "none" | "underline" | "line-through";
  opacity?: number;
  marginTop?: string;
  marginBottom?: string;
  paddingTop?: string;
  paddingBottom?: string;
  /** Gradient teks aman (bukan CSS mentah). */
  gradient?: CmsGradientSpec | null;
  glow?: CmsGlowSpec | null;
  textShadow?: CmsTextShadowSpec | null;
  typographyScale?: CmsTypographyScaleToken;
};

export type CmsRichTextBlock = {
  text: string;
  style?: CmsRichTextStyle;
  tablet?: Partial<CmsRichTextStyle>;
  mobile?: Partial<CmsRichTextStyle>;
  preset?: CmsTypographyPresetId;
  motion?: CmsRichTextMotion;
};

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

function sanitizeHexColor(input: string): string | undefined {
  const s = input.trim();
  if (!HEX.test(s)) return undefined;
  return s;
}

function sanitizeRgbLike(input: string): string | undefined {
  const s = input.replace(/\s+/g, "");
  const m = s.match(/^rgba?\((\d{1,3}),(\d{1,3}),(\d{1,3})(?:,([\d.]+))?\)$/i);
  if (!m) return undefined;
  const r = Number(m[1]);
  const g = Number(m[2]);
  const b = Number(m[3]);
  if (r > 255 || g > 255 || b > 255) return undefined;
  if (m[4] !== undefined) {
    const a = Number(m[4]);
    if (Number.isNaN(a) || a < 0 || a > 1) return undefined;
    return `rgba(${r},${g},${b},${a})`;
  }
  return `rgb(${r},${g},${b})`;
}

export function sanitizeColor(input: unknown): string | undefined {
  if (typeof input !== "string") return undefined;
  const t = input.trim();
  if (t.length > 80) return undefined;
  return sanitizeHexColor(t) ?? sanitizeRgbLike(t);
}

const FONT_SIZE_SAFE =
  /^(?:\d+(\.\d+)?(px|rem|em|%))$|^clamp\([^)]{1,320}\)$/;

function sanitizeFontSize(input: unknown): string | undefined {
  if (typeof input !== "string") return undefined;
  const t = input.trim();
  if (t.length > 200) return undefined;
  if (FONT_SIZE_SAFE.test(t)) return t;
  return undefined;
}

const SPACING_SAFE = /^-?\d+(\.\d+)?(px|rem|em)$/;

function sanitizeSpacing(input: unknown): string | undefined {
  if (typeof input !== "string") return undefined;
  const t = input.trim();
  if (!SPACING_SAFE.test(t)) return undefined;
  return t;
}

const LETTER_SAFE = /^-?\d+(\.\d+)?(px|em|rem)$/;

function sanitizeLetterSpacing(input: unknown): string | undefined {
  if (typeof input !== "string") return undefined;
  const t = input.trim();
  if (!LETTER_SAFE.test(t)) return undefined;
  return t;
}

function sanitizeLineHeight(input: unknown): string | undefined {
  if (typeof input === "number" && Number.isFinite(input) && input > 0 && input < 5) {
    return String(input);
  }
  if (typeof input !== "string") return undefined;
  const t = input.trim();
  if (/^[\d.]+$/.test(t) && Number(t) > 0 && Number(t) < 5) return t;
  if (/^\d+(\.\d+)?(px|rem|em|%)$/.test(t)) return t;
  return undefined;
}

const FONT_WEIGHT_SAFE = /^(100|200|300|400|500|600|700|800|900|normal|bold|bolder|lighter)$/;

function sanitizeFontWeight(input: unknown): string | undefined {
  if (typeof input !== "string") return undefined;
  const t = input.trim();
  if (!FONT_WEIGHT_SAFE.test(t)) return undefined;
  return t;
}

function sanitizeOpacity(input: unknown): number | undefined {
  if (typeof input !== "number" || Number.isNaN(input)) return undefined;
  if (input < 0) return 0;
  if (input > 1) return 1;
  return input;
}

function sanitizeGradient(input: unknown): CmsGradientSpec | undefined {
  if (!input || typeof input !== "object") return undefined;
  const o = input as Record<string, unknown>;
  if (o.kind !== "linear") return undefined;
  const angleDeg = typeof o.angleDeg === "number" && Number.isFinite(o.angleDeg) ? ((o.angleDeg % 360) + 360) % 360 : 0;
  const stopsRaw = Array.isArray(o.stops) ? o.stops : [];
  const stops: CmsGradientSpec["stops"] = [];
  for (const s of stopsRaw.slice(0, 12)) {
    if (!s || typeof s !== "object") continue;
    const r = s as Record<string, unknown>;
    const color = sanitizeColor(r.color);
    const pos = typeof r.positionPct === "number" && Number.isFinite(r.positionPct) ? Math.min(100, Math.max(0, r.positionPct)) : 0;
    if (color) stops.push({ color, positionPct: pos });
  }
  if (stops.length < 2) return undefined;
  return { kind: "linear", angleDeg, stops };
}

function sanitizeGlow(input: unknown): CmsGlowSpec | undefined {
  if (!input || typeof input !== "object") return undefined;
  const o = input as Record<string, unknown>;
  const color = sanitizeColor(o.color);
  const blurPx = typeof o.blurPx === "number" && o.blurPx >= 0 && o.blurPx <= 128 ? o.blurPx : undefined;
  if (!color || blurPx === undefined) return undefined;
  const opacity = sanitizeOpacity(o.opacity);
  return { color, blurPx, ...(opacity !== undefined ? { opacity } : {}) };
}

function sanitizeTextShadow(input: unknown): CmsTextShadowSpec | undefined {
  if (!input || typeof input !== "object") return undefined;
  const o = input as Record<string, unknown>;
  const color = sanitizeColor(o.color);
  const nums = [o.offsetXpx, o.offsetYpx, o.blurPx].map((x) =>
    typeof x === "number" && Number.isFinite(x) && Math.abs(x) <= 64 ? x : NaN,
  );
  if (!color || nums.some(Number.isNaN)) return undefined;
  return { offsetXpx: nums[0], offsetYpx: nums[1], blurPx: nums[2], color };
}

function sanitizeTypographyScale(input: unknown): CmsTypographyScaleToken | undefined {
  const allowed: CmsTypographyScaleToken[] = ["xs", "sm", "base", "lg", "xl", "2xl", "hero"];
  return typeof input === "string" && (allowed as string[]).includes(input)
    ? (input as CmsTypographyScaleToken)
    : undefined;
}

function sanitizeStylePartial(input: unknown): Partial<CmsRichTextStyle> | undefined {
  if (!input || typeof input !== "object") return undefined;
  const src = input as Record<string, unknown>;
  const out: Partial<CmsRichTextStyle> = {};
  const c = sanitizeColor(src.color);
  if (c) out.color = c;
  const fs = sanitizeFontSize(src.fontSize);
  if (fs) out.fontSize = fs;
  const fw = sanitizeFontWeight(src.fontWeight);
  if (fw) out.fontWeight = fw;
  if (src.fontStyle === "italic" || src.fontStyle === "normal") out.fontStyle = src.fontStyle;
  if (src.textAlign === "left" || src.textAlign === "center" || src.textAlign === "right" || src.textAlign === "justify") {
    out.textAlign = src.textAlign;
  }
  const lh = sanitizeLineHeight(src.lineHeight);
  if (lh) out.lineHeight = lh;
  const ls = sanitizeLetterSpacing(src.letterSpacing);
  if (ls) out.letterSpacing = ls;
  if (
    src.textTransform === "none" ||
    src.textTransform === "uppercase" ||
    src.textTransform === "lowercase" ||
    src.textTransform === "capitalize"
  ) {
    out.textTransform = src.textTransform;
  }
  if (src.textDecoration === "none" || src.textDecoration === "underline" || src.textDecoration === "line-through") {
    out.textDecoration = src.textDecoration;
  }
  const op = sanitizeOpacity(src.opacity);
  if (op !== undefined) out.opacity = op;
  const mt = sanitizeSpacing(src.marginTop);
  if (mt) out.marginTop = mt;
  const mb = sanitizeSpacing(src.marginBottom);
  if (mb) out.marginBottom = mb;
  const pt = sanitizeSpacing(src.paddingTop);
  if (pt) out.paddingTop = pt;
  const pb = sanitizeSpacing(src.paddingBottom);
  if (pb) out.paddingBottom = pb;
  const g = sanitizeGradient(src.gradient);
  if (g) out.gradient = g;
  const gl = sanitizeGlow(src.glow);
  if (gl) out.glow = gl;
  const ts = sanitizeTextShadow(src.textShadow);
  if (ts) out.textShadow = ts;
  const scale = sanitizeTypographyScale(src.typographyScale);
  if (scale) out.typographyScale = scale;

  return Object.keys(out).length ? out : {};
}

export const CMS_TYPOGRAPHY_SCALE: Record<CmsTypographyScaleToken, Partial<CmsRichTextStyle>> = {
  xs: { fontSize: "0.75rem", lineHeight: "1.45", letterSpacing: "0.01em" },
  sm: { fontSize: "0.8125rem", lineHeight: "1.5", letterSpacing: "0.008em" },
  base: { fontSize: "1rem", lineHeight: "1.55", letterSpacing: "0" },
  lg: { fontSize: "1.125rem", lineHeight: "1.45", letterSpacing: "-0.01em" },
  xl: { fontSize: "1.5rem", lineHeight: "1.2", letterSpacing: "-0.02em" },
  "2xl": { fontSize: "clamp(1.75rem,4vw,2.25rem)", lineHeight: "1.15", letterSpacing: "-0.028em" },
  hero: {
    fontSize: "clamp(2rem,11.5vw,4.5rem)",
    lineHeight: "0.9",
    letterSpacing: "-0.045em",
    fontWeight: "800",
  },
};

export const CMS_RICH_TEXT_PRESETS: Record<CmsTypographyPresetId, Partial<CmsRichTextStyle>> = {
  "premium-heading": {
    fontWeight: "700",
    letterSpacing: "-0.03em",
    lineHeight: "1.1",
    color: "#F5F7FF",
    textShadow: { offsetXpx: 0, offsetYpx: 2, blurPx: 5, color: "rgba(2,7,18,0.95)" },
  },
  "luxury-subtitle": {
    fontWeight: "500",
    letterSpacing: "0.12em",
    lineHeight: "1.4",
    textTransform: "uppercase",
    color: "rgba(245,247,255,0.88)",
    fontSize: "clamp(0.9rem,2.6vw,1.2rem)",
  },
  "industrial-label": {
    fontWeight: "600",
    letterSpacing: "0.2em",
    lineHeight: "1.2",
    textTransform: "uppercase",
    fontSize: "11px",
    color: "rgba(224,242,254,0.95)",
  },
  "muted-text": {
    fontWeight: "400",
    opacity: 0.72,
    color: "rgba(226,232,240,0.85)",
    lineHeight: "1.55",
  },
  "hero-title": {
    fontWeight: "800",
    lineHeight: "0.9",
    letterSpacing: "-0.045em",
    color: "#F5F7FF",
    fontSize: "clamp(2rem,11.5vw,4.5rem)",
    textShadow: { offsetXpx: 0, offsetYpx: 2, blurPx: 6, color: "rgba(2,7,18,0.92)" },
  },
  "cta-text": {
    fontWeight: "600",
    letterSpacing: "0.03em",
    textTransform: "uppercase",
    lineHeight: "1.35",
    color: "#F5F7FF",
    fontSize: "0.875rem",
  },
};

function mergeStyleLayers(...layers: Partial<CmsRichTextStyle>[]): CmsRichTextStyle {
  const out: CmsRichTextStyle = {};
  for (const layer of layers) {
    Object.assign(out, layer);
  }
  return out;
}

/** Terapkan skala tipografi ke style (override fontSize/lineHeight/letterSpacing bila token ada). */
export function expandTypographyScale(style: CmsRichTextStyle): CmsRichTextStyle {
  const token = style.typographyScale;
  if (!token) return style;
  const base = CMS_TYPOGRAPHY_SCALE[token];
  const rest = { ...style };
  delete rest.typographyScale;
  return mergeStyleLayers(base, rest) as CmsRichTextStyle;
}

export function mergePresetIntoStyle(
  preset: CmsTypographyPresetId | undefined,
  style: Partial<CmsRichTextStyle>,
): CmsRichTextStyle {
  const p = preset ? CMS_RICH_TEXT_PRESETS[preset] ?? {} : {};
  return expandTypographyScale(mergeStyleLayers(p, style) as CmsRichTextStyle);
}

export type CmsRichBreakpoint = "desktop" | "tablet" | "mobile";

export function mergeResponsiveRichStyle(
  block: CmsRichTextBlock,
  bp: CmsRichBreakpoint,
): CmsRichTextStyle {
  const basePreset = block.preset;
  const desktop = mergePresetIntoStyle(basePreset, block.style ?? {});
  if (bp === "desktop") return desktop;
  const withTablet = mergeStyleLayers(desktop, block.tablet ?? {});
  if (bp === "tablet") return expandTypographyScale(withTablet);
  return expandTypographyScale(mergeStyleLayers(withTablet, block.mobile ?? {}));
}

export function sanitizeRichTextStyle(input: unknown): CmsRichTextStyle | undefined {
  const p = sanitizeStylePartial(input);
  if (!p || Object.keys(p).length === 0) return undefined;
  return expandTypographyScale(p as CmsRichTextStyle);
}

export function sanitizeRichTextBlock(input: unknown): CmsRichTextBlock | undefined {
  if (!input || typeof input !== "object") return undefined;
  const o = input as Record<string, unknown>;
  const text = typeof o.text === "string" ? o.text.slice(0, 20_000) : "";
  const presetRaw = o.preset;
  const presets: CmsTypographyPresetId[] = [
    "premium-heading",
    "luxury-subtitle",
    "industrial-label",
    "muted-text",
    "hero-title",
    "cta-text",
  ];
  const preset =
    typeof presetRaw === "string" && (presets as string[]).includes(presetRaw)
      ? (presetRaw as CmsTypographyPresetId)
      : undefined;

  const style = sanitizeRichTextStyle(o.style);
  const tablet = sanitizeStylePartial(o.tablet);
  const mobile = sanitizeStylePartial(o.mobile);

  const motionRaw = o.motion;
  let motion: CmsRichTextMotion | undefined;
  if (motionRaw && typeof motionRaw === "object") {
    const m = motionRaw as Record<string, unknown>;
    const presetM = typeof m.preset === "string" ? m.preset : "none";
    const allowedM = ["none", "fade-up", "reveal", "typing", "gradient-shift"];
    motion = {
      preset: (allowedM.includes(presetM) ? presetM : "none") as CmsRichTextMotion["preset"],
      delayMs:
        typeof m.delayMs === "number" && m.delayMs >= 0 && m.delayMs <= 60_000 ? m.delayMs : undefined,
      durationMs:
        typeof m.durationMs === "number" && m.durationMs >= 0 && m.durationMs <= 60_000 ? m.durationMs : undefined,
    };
  }

  const block: CmsRichTextBlock = { text };
  if (preset) block.preset = preset;
  if (style && Object.keys(style).length) block.style = style;
  if (tablet && Object.keys(tablet).length) block.tablet = tablet;
  if (mobile && Object.keys(mobile).length) block.mobile = mobile;
  if (motion) block.motion = motion;
  return block;
}

/** Ekstrak string tampilan dari nilai field CMS. */
export function plainTextFromRichValue(raw: unknown, fallback = ""): string {
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && typeof (raw as CmsRichTextBlock).text === "string") {
    return (raw as CmsRichTextBlock).text;
  }
  return fallback;
}

/** Normalisasi nilai field menjadi blok aman untuk disimpan. */
export function normalizeRichTextValue(raw: unknown, fallbackText: string): CmsRichTextValue {
  if (typeof raw === "string") {
    const t = raw.trim();
    return t.length ? raw : fallbackText;
  }
  const block = sanitizeRichTextBlock(raw);
  if (!block || !block.text.trim()) return fallbackText;
  return block;
}

function gradientToCss(g: CmsGradientSpec): string {
  const stops = g.stops.map((s) => `${s.color} ${s.positionPct}%`).join(", ");
  return `linear-gradient(${g.angleDeg}deg, ${stops})`;
}

/** Konversi ke properti React — hanya key yang diizinkan; gradient memakai background clip. */
export function richStyleToReactCss(style: CmsRichTextStyle): CSSProperties {
  const g = style.gradient;
  const out: CSSProperties = {};

  if (style.color && !g) out.color = style.color;
  if (style.fontSize) out.fontSize = style.fontSize;
  if (style.fontWeight) out.fontWeight = style.fontWeight as CSSProperties["fontWeight"];
  if (style.fontStyle) out.fontStyle = style.fontStyle;
  if (style.textAlign) {
    out.textAlign = style.textAlign;
    /** `text-align` hanya memengaruhi kontainer blok; span default inline sering mengabaikan nilai ini. */
    out.display = "block";
    out.width = "100%";
    out.boxSizing = "border-box";
  }
  if (style.lineHeight) out.lineHeight = style.lineHeight;
  if (style.letterSpacing) out.letterSpacing = style.letterSpacing;
  if (style.textTransform) out.textTransform = style.textTransform;
  if (style.textDecoration) out.textDecoration = style.textDecoration;
  if (style.opacity !== undefined) out.opacity = style.opacity;
  if (style.marginTop) out.marginTop = style.marginTop;
  if (style.marginBottom) out.marginBottom = style.marginBottom;
  if (style.paddingTop) out.paddingTop = style.paddingTop;
  if (style.paddingBottom) out.paddingBottom = style.paddingBottom;

  const shadows: string[] = [];
  if (style.textShadow) {
    const ts = style.textShadow;
    shadows.push(`${ts.offsetXpx}px ${ts.offsetYpx}px ${ts.blurPx}px ${ts.color}`);
  }
  if (style.glow) {
    const gl = style.glow;
    const a = gl.opacity ?? 0.55;
    const col = sanitizeColor(gl.color);
    if (col) {
      shadows.push(`0 0 ${gl.blurPx}px ${withAlpha(col, a)}`);
    }
  }
  if (shadows.length) out.textShadow = shadows.join(", ");

  if (g && g.stops.length >= 2) {
    const bg = gradientToCss(g);
    out.backgroundImage = bg;
    out.WebkitBackgroundClip = "text";
    out.backgroundClip = "text";
    out.WebkitTextFillColor = "transparent";
    out.color = undefined;
  }

  return out;
}

function withAlpha(color: string, a: number): string {
  const rgb = sanitizeRgbLike(color);
  if (rgb?.startsWith("rgba")) return rgb;
  const hex = sanitizeHexColor(color);
  if (hex && hex.length === 7) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r},${g},${b},${a})`;
  }
  return `rgba(255,255,255,${a})`;
}

/** Hook-less: deteksi breakpoint dari lebar (untuk SSR tetap desktop). */
export function breakpointFromWidth(width: number | undefined): CmsRichBreakpoint {
  if (width === undefined) return "desktop";
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}
