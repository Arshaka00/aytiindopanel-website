/** Perbaikan typo/drift umum dalam copy situs — hanya pola yang konservatif. */
const TYPO_SEQUENCE_REPLACEMENTS: readonly [pattern: RegExp, replacement: string][] = [
  [/\bpolyuretane\b/gi, "polyurethane"],
  [/instalasi system refrigerasi/gi, "instalasi sistem refrigerasi"],
];

/** Hilangkan spasi sebelum tanda baca [. , ; : ! ? ] dan sebelum bracket penutup. */
function stripSpaceBeforePunctuation(text: string): string {
  return text.replace(/\s+([.,!?;:])/g, "$1").replace(/\s+([\]}])/g, "$1");
}

/** Runtuhkan pemisahan baris/whitespace berlebihan. */
export function collapseWhitespaceLines(text: string): string {
  return text.trim().replace(/[ \t]{2,}/g, " ").replace(/\r\n/g, "\n");
}

/** Meta description SERP klasik ±160 karakter dengan elipsis tanpa putus kata tengah secara kasar. */
export function clampMetaDescription(input: string, maxLen = 160): string {
  const s = collapseWhitespaceLines(stripSpaceBeforePunctuation(input));
  if (s.length <= maxLen) return s;
  const slice = s.slice(0, maxLen - 1);
  const lastSpace = slice.lastIndexOf(" ");
  const base = lastSpace > 48 ? slice.slice(0, lastSpace) : slice.trimEnd();
  return `${base.trimEnd()}…`;
}

/** Terapkan perbaikan typo aman dan whitespace/punctuation mikro untuk string panjang (CMS/import). */
export function applyKnownTypoSanitize(text: string): string {
  let out = text;
  for (const [pattern, replacement] of TYPO_SEQUENCE_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  out = collapseWhitespaceLines(out);
  out = stripSpaceBeforePunctuation(out);
  return out;
}
