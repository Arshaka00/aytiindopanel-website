import type { SiteContent } from "@/lib/site-content-model";

export function newCmsId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function emptyFaqItem(): SiteContent["faq"]["items"][number] {
  return {
    id: newCmsId("faq"),
    q: "Pertanyaan baru",
    a: "Jawaban singkat untuk pertanyaan ini.",
  };
}

export function emptyPortfolioProject(): SiteContent["portfolio"]["projects"][number] {
  return {
    id: newCmsId("portfolio"),
    name: "Judul proyek",
    location: "Lokasi",
    workType: "Deskripsi pekerjaan",
    technicalSpecs: [
      { label: "Temperatur", value: "Contoh: −18°C s/d −25°C" },
      { label: "Kapasitas penyimpanan", value: "Contoh: 1.000 ton" },
      { label: "Sistem pendingin", value: "Contoh: ±120 TR" },
      { label: "Insulasi Ruangan", value: "Contoh: PU 100 mm" },
    ],
    videoSrc: "/images/gallery/WhatsApp%20Video%202026-05-07%20at%2011.02.55.mp4",
    videoPosterSrc: "/images/layanan/instalasi-sistem-pendingin/1.jpg",
    videoAutoplay: false,
    galleryPhotos: [
      { src: "/images/layanan/instalasi-sistem-pendingin/1.jpg", alt: "Foto galeri 1 (placeholder)" },
      { src: "/images/layanan/instalasi-panel-cold-room/1.jpg", alt: "Foto galeri 2 (placeholder)" },
      { src: "/images/layanan/testing-commissioning/1.jpg", alt: "Foto galeri 3 (placeholder)" },
      { src: "/images/layanan/produksi-panel-pu-eps/1.jpg", alt: "Foto galeri 4 (placeholder)" },
    ],
  };
}

export function emptyFooterLink(): SiteContent["footer"]["quickLinks"][number] {
  return {
    id: newCmsId("nav"),
    label: "Menu",
    href: "#",
  };
}

export function emptyLayananCard(): SiteContent["layanan"]["cards"][number] {
  return {
    id: newCmsId("layanan"),
    folderSlug: "konsultasi-desain-sistem",
    title: "Judul layanan",
    body: ["Deskripsi layanan baris pertama.", "Deskripsi tambahan."],
  };
}

export function emptyIndustry(): SiteContent["customersPartners"]["industries"][number] {
  return {
    id: newCmsId("ind"),
    label: "Industri",
    logoSrc: "",
    logoAlt: "Logo industri",
  };
}

export function emptyPartner(): SiteContent["customersPartners"]["partners"][number] {
  return {
    id: newCmsId("partner"),
    name: "Partner",
    logoSrc: "/images/partners/bluescope.svg",
    logoAlt: "Logo partner",
    width: 180,
    height: 48,
  };
}

export function emptyKeunggulanCard(): SiteContent["keunggulan"]["cards"][number] {
  return {
    id: newCmsId("proc"),
    title: "Judul keunggulan",
    body: "Deskripsi singkat keunggulan operasional.",
    iconKey: "manufacturing",
  };
}
