/** Membangun URL pembagian web standar untuk promosi URL situs produksi. */

export function shareUrlFacebook(pageUrl: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
}

export function shareUrlX(pageUrl: string, title: string): string {
  const t = title.trim() || "Kunjungi website kami";
  return `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(t)}`;
}

export function shareUrlLinkedIn(pageUrl: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
}

export function shareUrlWhatsApp(pageUrl: string, title: string): string {
  const text = `${title.trim() || "Website kami"}\n${pageUrl}`.trim();
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function shareUrlTelegram(pageUrl: string, title: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(title.trim() || "")}`;
}

export function shareUrlEmail(pageUrl: string, title: string): string {
  const subject = encodeURIComponent(title.trim() || "Kunjungi website kami");
  const body = encodeURIComponent(`${title.trim() ? `${title.trim()}\n\n` : ""}${pageUrl}`);
  return `mailto:?subject=${subject}&body=${body}`;
}

export function shareUrlReddit(pageUrl: string, title: string): string {
  return `https://www.reddit.com/submit?url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(title.trim() || "Website")}`;
}

export function promoCaptionForStories(siteName: string, pageUrl: string): string {
  return `${siteName.trim() || "Website kami"}\n${pageUrl}\n\nKunjungi tautan di atas untuk informasi lebih lanjut.`.trim();
}
