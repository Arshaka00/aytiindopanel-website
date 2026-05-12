/** Estimasi membaca untuk teks Indonesia (~200 kata/menit). */
const WPM = 200;

export function roughWordCountFromMarkdown(md: string): number {
  const plain = md
    .replace(/\*\*/g, " ")
    .replace(/#{2,3}\s+/gm, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  return countWords(plain);
}

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function estimateReadingMinutesFromMarkdown(
  bodyMarkdown: string,
  faq: { question: string; answerMarkdown: string }[],
): number {
  let total = countWords(bodyMarkdown);
  for (const item of faq) {
    total += countWords(item.question);
    total += countWords(item.answerMarkdown);
  }
  const minutes = Math.max(1, Math.ceil(total / WPM));
  return minutes;
}
