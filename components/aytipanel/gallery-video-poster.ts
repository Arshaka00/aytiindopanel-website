/**
 * Ambil satu frame stabil dari video (bukan frame 0 yang sering hitam) untuk poster/thumbnail.
 * Waktu seek: ~12% durasi, dibatasi antara 0,55s dan 2,5s.
 */

export async function captureStableVideoPosterDataUrl(
  file: File,
  options?: { maxWidth?: number; jpegQuality?: number },
): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    return await captureStableVideoPosterFromBlobUrl(url, options);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function captureStableVideoPosterFromBlobUrl(
  blobUrl: string,
  options?: { maxWidth?: number; jpegQuality?: number },
): Promise<string> {
  const maxW = options?.maxWidth ?? 960;
  const quality = options?.jpegQuality ?? 0.82;

  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "true");
  video.preload = "auto";
  video.src = blobUrl;

  await new Promise<void>((resolve, reject) => {
    const done = () => resolve();
    const fail = () => reject(new Error("Gagal memuat video untuk thumbnail."));
    video.addEventListener("loadedmetadata", done, { once: true });
    video.addEventListener("error", fail, { once: true });
  });

  const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
  const seekSeconds =
    duration > 0
      ? Math.min(Math.max(duration * 0.12, 0.55), Math.min(2.5, Math.max(duration - 0.08, 0.55)))
      : 0.25;

  video.currentTime = seekSeconds;

  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error("Timeout saat mengambil frame video.")), 12_000);
    const ok = () => {
      clearTimeout(timeout);
      resolve();
    };
    const bad = () => {
      clearTimeout(timeout);
      reject(new Error("Gagal seek frame video."));
    };
    video.addEventListener("seeked", ok, { once: true });
    video.addEventListener("error", bad, { once: true });
  });

  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) {
    throw new Error("Ukuran frame video tidak tersedia.");
  }

  const scale = vw > maxW ? maxW / vw : 1;
  const cw = Math.max(1, Math.round(vw * scale));
  const ch = Math.max(1, Math.round(vh * scale));

  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak tersedia.");
  ctx.drawImage(video, 0, 0, cw, ch);

  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  if (dataUrl.length > 1_800_000) {
    dataUrl = canvas.toDataURL("image/jpeg", Math.min(0.65, quality));
  }
  return dataUrl;
}
