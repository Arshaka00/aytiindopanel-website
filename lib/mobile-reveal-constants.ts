/**
 * Konstanta bersama reveal scroll mobile (Layanan, Featured Produk, Service & maintenance).
 * Durasi selaraskan dengan `globals.css` `--layanan-mobile-reveal-duration`.
 * Easing: cinematic / premium B2B — samakan dengan `--ease-premium-out`.
 */
export const MOBILE_VIEWPORT_MQ = "(max-width: 767px)";

/** Root margin IO accordion scroll mobile (`use-viewport-active-card-index`). */
export const MOBILE_SCROLL_ROOT_MARGIN = "-18% 0px -18% 0px";

export const MOBILE_SCROLL_THRESHOLDS = [
  0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9,
  0.95, 1,
];

/** Rasio persilangan minimum sebelum kartu boleh menjadi kandidat aktif. */
export const MOBILE_SCROLL_ACTIVATION_MIN = 0.13;

/** Alias — sama dengan `MOBILE_SCROLL_ACTIVATION_MIN`. */
export const MOBILE_SCROLL_MIN_RATIO = MOBILE_SCROLL_ACTIVATION_MIN;

/** Hysteresis: tetap di kartu sekarang jika rasio masih di atas ini. */
export const MOBILE_SCROLL_RELEASE_RATIO = 0.052;

/** Hysteresis: kartu lain harus mengungguli aktif sekarang minimal sekian rasio. */
export const MOBILE_SCROLL_SWITCH_DELTA = 0.082;

/** Debounce commit indeks aktif setelah IO update. */
export const MOBILE_SCROLL_COMMIT_DEBOUNCE_MS = 220;

/** Tinggi panel: expand — selaras `:root --layanan-mobile-reveal-duration`. */
export const MOBILE_REVEAL_HEIGHT_EXPAND_MS = 580;

/** Tinggi panel: collapse — sedikit lebih lambat agar organic (tutup terasa “berat” halus). */
export const MOBILE_REVEAL_HEIGHT_COLLAPSE_MS = 670;

/** ms — alias utama reveal; samakan dengan HEIGHT_EXPAND untuk konsistensi dokumen */
export const MOBILE_REVEAL_MS = MOBILE_REVEAL_HEIGHT_EXPAND_MS;

export const MOBILE_REVEAL_EASE = "cubic-bezier(0.22, 1, 0.36, 1)" as const;

/** Opacity isi saat expand — ratio dari durasi expand. */
export const MOBILE_INNER_OPACITY_RATIO = 0.74;

/** Opacity saat collapse — lebih cepat dari height agar inactive hilang lebih dulu (organic). */
export const MOBILE_REVEAL_OPACITY_COLLAPSE_MS = 335;

export const MOBILE_CONTENT_STAGGER_MS = 76;

export const MOBILE_ENTER_OFFSET_PX = 6;

export const MOBILE_HINT_CROSSFADE_RATIO = 0.42;
