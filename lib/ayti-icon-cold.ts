/** Kelas utilitas `ayti-icon-cold` — aksen dingin ringan; lihat `app/globals.css`. */
export const AYTI_ICON_COLD_CLASS = "ayti-icon-cold";

/** Kelas utilitas `ayti-cta-cold` — pinggiran dingin pada tombol/tautan CTA (bukan mengganti shadow/isian). */
export const AYTI_CTA_COLD_CLASS = "ayti-cta-cold";

/** Kartu / panel — rim dingin inset (tidak mengganti `--shadow-card`). */
export const AYTI_CARD_COLD_CLASS = "ayti-card-cold";

/** Foto / video — tepi media halus (wrapper gambar/video). */
export const AYTI_MEDIA_COLD_CLASS = "ayti-media-cold";

/** Judul / teks tajuk — kilau dingin ringan (`drop-shadow` tipis; lihat `app/globals.css`). */
export const AYTI_TITLE_COLD_CLASS = "ayti-title-cold";

export function mergeAytiIconClass(className?: string): string {
  return className ? `${AYTI_ICON_COLD_CLASS} ${className}` : AYTI_ICON_COLD_CLASS;
}

export function mergeAytiCtaClass(className: string): string {
  return `${AYTI_CTA_COLD_CLASS} ${className}`;
}

export function mergeAytiCardClass(className: string): string {
  return `${AYTI_CARD_COLD_CLASS} ${className}`;
}

export function mergeAytiMediaClass(className?: string): string {
  const c = className?.trim();
  return c ? `${AYTI_MEDIA_COLD_CLASS} ${c}` : AYTI_MEDIA_COLD_CLASS;
}

export function mergeAytiTitleClass(className: string): string {
  return `${AYTI_TITLE_COLD_CLASS} ${className}`;
}
