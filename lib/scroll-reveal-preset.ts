/**
 * Preset scroll-reveal per section — dipilih deterministik dari `sectionKey`
 * (bukan Math.random) agar SSR/hidrasi konsisten dan tetap terasa “acak” antar section.
 */
export const SCROLL_REVEAL_PRESETS = [
  "fade-up",
  "fade-up-deep",
  "fade-left",
  "fade-right",
  "fade-scale",
  "fade-down",
] as const;

export type ScrollRevealPresetId = (typeof SCROLL_REVEAL_PRESETS)[number];

function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  return h >>> 0;
}

export function pickScrollRevealPreset(sectionId: string): ScrollRevealPresetId {
  const key = sectionId.trim();
  if (!key) return "fade-up";
  const idx = hashString(key) % SCROLL_REVEAL_PRESETS.length;
  return SCROLL_REVEAL_PRESETS[idx];
}
