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
    videoSrc: "/images/gallery/WhatsApp%20Video%202026-05-07%20at%2011.02.55.mp4",
    videoPosterSrc: "/images/layanan/instalasi-sistem-pendingin/1.jpg",
    videoAutoplay: false,
    galleryPhotos: [],
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
