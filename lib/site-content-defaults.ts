import {
  CONTACT_EMAIL,
  CONTACT_MAP_EMBED_URL,
  CONTACT_PHONE,
  CONTACT_PHONE_TEL,
  CONTACT_WHATSAPP_DISPLAY,
  CONTACT_ADDRESS_LINES,
  SITE_PUBLIC_ORIGIN,
} from "@/components/aytipanel/constants";
import { sanitizeWhatsAppToDigits } from "@/lib/site-contact";
import {
  HERO_ASSET_VERSION,
  HERO_SLIDE_COUNT,
  HERO_IMAGE_FOLDER,
} from "@/components/aytipanel/hero-slider-config";
import { LAYANAN_UTAMA_CARDS, layananPhotosFromFolder } from "@/components/aytipanel/layanan-card-images";
import {
  PRODUCTS_B2B_CATEGORIES,
  SERVICE_MAINTENANCE_CATEGORY,
  type ProductB2BCategoryData,
} from "@/components/aytipanel/products-b2b-data";
import {
  GAMBAR_PRODUK_ACCESSORIES_KANAN,
  GAMBAR_PRODUK_ACCESSORIES_KIRI,
  GAMBAR_PRODUK_SOLUSI_KANAN,
  GAMBAR_PRODUK_SOLUSI_KIRI,
  GAMBAR_PRODUK_UTAMA_KANAN,
  GAMBAR_PRODUK_UTAMA_KIRI,
} from "@/components/aytipanel/gambar-produk-paths";
import type {
  KeunggulanCardIconKey,
  KeunggulanStatIconKey,
  SiteContent,
} from "@/lib/site-content-model";
import type { CmsRichTextValue } from "@/lib/cms-rich-text";
import { DEFAULT_HOME_LAYOUT } from "@/lib/home-layout-defaults";

function heroSlides(): { src: string }[] {
  return Array.from({ length: HERO_SLIDE_COUNT }, (_, i) => ({
    src: `${HERO_IMAGE_FOLDER}/slide-${i + 1}.jpg?v=${HERO_ASSET_VERSION}`,
  }));
}

function cloneCategories(): ProductB2BCategoryData[] {
  return JSON.parse(JSON.stringify(PRODUCTS_B2B_CATEGORIES)) as ProductB2BCategoryData[];
}

function cloneMaintenance(): ProductB2BCategoryData {
  return JSON.parse(JSON.stringify(SERVICE_MAINTENANCE_CATEGORY)) as ProductB2BCategoryData;
}

/** Judul aksen hero dengan gradient default — bisa dioverride visual dari CMS. */
const HERO_HEADING_ACCENT_DEFAULT: CmsRichTextValue = {
  text: "TERINTEGRASI",
  style: {
    fontSize: "clamp(1.7rem,9.2vw,3.8rem)",
    fontWeight: "800",
    lineHeight: "0.9",
    letterSpacing: "-0.045em",
    gradient: {
      kind: "linear",
      angleDeg: 90,
      stops: [
        { color: "#ffffff", positionPct: 0 },
        { color: "#7FE7FF", positionPct: 100 },
      ],
    },
    glow: { color: "#59D8FF", blurPx: 12, opacity: 0.35 },
    textShadow: { offsetXpx: 0, offsetYpx: 0, blurPx: 20, color: "rgba(89,216,255,0.18)" },
  },
};

export function createDefaultSiteContent(): SiteContent {
  const procurementIcons: KeunggulanCardIconKey[] = [
    "manufacturing",
    "rab",
    "clipboard",
    "stopwatch",
    "hardhat",
    "folder",
  ];
  const procurementTitles = [
    "Sistem Terintegrasi",
    "Costum Sesuai Kebutuhan",
    "Material Standar Industri",
    "Timeline Terpantau",
    "Instalasi Standar QA/QC",
    "Dokumentasi Lengkap",
  ];
  const procurementBodies = [
    "Mulai dari produksi panel, sistem refrigerasi, instalasi,  hingga dukungan purna jual dalam satu kordinasi.",
    "Desain dan implementasi sistem menyesuaikan kapasitas dan kebutuhan.",
    "Menggunakan material dan komponen yang disesuaikan dengan kebutuhan..",
    "Progress berbasis milestone dengan reporting rutin ke stakeholder.",
    "Tim lapangan mengikuti SOP ketat dan checklist kualitas hingga commissioning.",
    "Shop drawing, as-built drawing, hingga commissioning report disiapkan sistematis.",
  ];

  const statIcons: KeunggulanStatIconKey[] = ["briefcase", "users", "clock", "shield"];
  const statValues = ["20+", "30+", "5+", "★★★★"];
  const statLabels = ["Proyek diselesaikan", "Klien Retail", "Pengalaman Tim", "Rating kepercayaan"];
  const statMobile: ([string, string] | undefined)[] = [
    undefined,
    ["Klien", "Ritel"],
    ["Pengalaman", "Tim"],
    undefined,
  ];

  return {
    version: 1,
    siteSettings: {
      siteName: "PT AYTI INDO PANEL",
      productionUrls: [
        { id: "prod-primary", label: "Utama", url: SITE_PUBLIC_ORIGIN, isPrimary: true },
      ],
      siteUrl: SITE_PUBLIC_ORIGIN,
      companyAddress: CONTACT_ADDRESS_LINES.join("\n"),
      whatsappNumbers: [
        {
          id: "wa-primary",
          label: "Utama",
          number: sanitizeWhatsAppToDigits(CONTACT_WHATSAPP_DISPLAY) || CONTACT_WHATSAPP_DISPLAY,
          isPrimary: true,
        },
      ],
      emails: [
        {
          id: "email-primary",
          label: "Marketing",
          email: CONTACT_EMAIL.trim(),
          isPrimary: true,
        },
      ],
      mapsUrl: CONTACT_MAP_EMBED_URL,
      officeHours: "Senin–Sabtu · 09.00–17.00 WIB",
      seoContent: {
        metaTitle: "PT AYTI INDO PANEL - sandwich panel & refrigerasi sistem",
        metaDescription:
          "Produksi sandwich panel, instalasi cold room & sistem refrigerasi industri. Mitra teknik PT AYTI INDO PANEL.",
        keywords:
          "sandwich panel, cold storage, refrigerasi industri, panel pendingin, cold room, PT AYTI INDO PANEL",
        footerSeoText: "",
        companyDescription:
          "PT AYTI INDO PANEL adalah mitra produksi sandwich panel, instalasi cold storage, dan sistem refrigerasi untuk industri bersuhu terkontrol.",
        serviceAreas: "Jabodetabek, Jawa Barat, nasional",
        additionalSeoContent: "",
      },
      socialPromotionProfiles: {
        facebookPageUrl: "",
        instagramProfileUrl: "",
        tiktokProfileUrl: "",
        youtubeChannelUrl: "",
        xProfileUrl: "",
      },
      brandAssets: {
        logoLight: "",
        logoDark: "",
        favicon: "",
        appleTouchIcon: "",
        defaultOgImage: "",
      },
      pageSeo: {},
      analytics: {
        googleAnalyticsId: "",
        googleTagManagerId: "",
        metaPixelId: "",
        microsoftClarityId: "",
        googleSiteVerification: "",
      },
      socialLinks: {
        instagram: "",
        linkedin: "",
        youtube: "",
        tiktok: "",
        facebook: "",
      },
      seoControl: {
        allowIndexing: true,
        stagingMode: false,
      },
      imageSeo: {
        defaultAltPrefix: "",
        fallbackOgImage: "",
      },
      localSeo: {
        latitude: "",
        longitude: "",
        areaServed: [],
        openingHours: [],
      },
      performanceMode: {
        lightweightMode: false,
        disableHeavyAnimations: false,
        disableVideoBackground: false,
      },
      redirects: [],
      published: true,
      maintenanceMode: false,
      maintenanceHeadline: "Website Sedang Dalam Pemeliharaan",
      maintenanceSubtext:
        "Kami sedang melakukan peningkatan sistem untuk pengalaman yang lebih baik. Tim kami tetap standby untuk membantu kebutuhan proyek Anda.",
      maintenanceShowWhatsApp: true,
      maintenanceWhatsAppLabel: "Hubungi Tim via WhatsApp",
      maintenanceWhatsAppMessage: `Halo PT AYTI INDO PANEL,
Saya ingin berkonsultasi terkait kebutuhan proyek cold storage saat website maintenance.
Terima kasih.`,
    },
    header: {
      brandName: "PT AYTI INDO PANEL",
      logoAriaLabel: "PT AYTI INDO PANEL — Home",
      navAriaLabel: "Navigasi utama",
      mobileMenuAriaLabel: "Menu utama (mobile)",
      mobileMenuOpenAriaLabel: "Buka menu",
      mobileMenuCloseAriaLabel: "Tutup menu",
      navItems: [
        { id: "nav-home", label: "Home", shortLabel: "Home", href: "/#beranda" },
        { id: "nav-tentang", label: "Tentang kami", shortLabel: "Tentang", href: "/#tentang" },
        { id: "nav-layanan", label: "Layanan", shortLabel: "Layanan", href: "/#layanan" },
        { id: "nav-produk", label: "Produk", shortLabel: "Produk", href: "/#produk" },
        { id: "nav-service", label: "Service", shortLabel: "Service", href: "/#service-maintenance" },
        { id: "nav-proyek", label: "Proyek", shortLabel: "Proyek", href: "/#proyek" },
        { id: "nav-keunggulan", label: "Keunggulan kami", shortLabel: "Keunggulan", href: "/#keunggulan" },
        { id: "nav-kontak", label: "Kontak kami", shortLabel: "Kontak", href: "/#kontak" },
        {
          id: "nav-gallery-proyek",
          label: "Galery proyek",
          shortLabel: "Galery proyek",
          href: "/gallery-project",
        },
        { id: "nav-artikel", label: "Artikel", shortLabel: "Artikel", href: "/artikel" },
      ],
      mobileNavIds: [
        "nav-home",
        "nav-tentang",
        "nav-layanan",
        "nav-produk",
        "nav-proyek",
        "nav-kontak",
        "nav-gallery-proyek",
        "nav-artikel",
      ],
    },
    hero: {
      brandLabel: "PT AYTI INDO PANEL",
      headingLine1: "SOLUSI SISTEM",
      headingMiddle: "PENDINGIN",
      headingLine2: HERO_HEADING_ACCENT_DEFAULT,
      intro: {
        before1: "Kami menghadirkan ",
        bold1: "solusi terintegrasi",
        middle: " untuk menjawab semua kebutuhan Anda dalam membangun ",
        bold2: "ruang pendingin",
        after2: " yang ",
        bold3: "stabil & efisien",
        after3: " untuk jangka panjang.",
      },
      prosesBadge: "Alur kerja yang mudah",
      ctaWhatsApp: {
        label: "Hubungi kami",
        message: `Halo PT AYTI INDO PANEL,
Saya ingin berkonsultasi terkait kebutuhan solusi cold storage dan refrigerasi.
Terima kasih.`,
      },
      ctaSecondary: {
        label: "Lihat produk utama",
        href: "/produk",
      },
      slides: heroSlides(),
      backgroundVideo: null,
    },
    tentang: {
      sectionLabel: "Tentang Kami",
      heading: "Sistem Pendingin Terintegrasi",
      lead:
        "PT AYTI INDO PANEL adalah perusahaan yang bergerak dalam bidang fabrikasi sandwich panel, instalasi cold storage, dan sistem refrigerasi untuk kebutuhan industri bersuhu terkontrol.",
      body: `Didukung pabrik panel milik sendiri, kami mendukung kebutuhan proyek mulai dari produksi panel,
instalasi, refrigeration system, hingga service dan purna jual dengan pendekatan kerja yang lebih
terintegrasi dan terukur.`,
      valuesHeading: "Nilai Kami",
      values: [
        "Pabrik panel milik sendiri",
        "Instalasi & refrigeration system",
        "Service & dukungan purna jual",
        "Costum sesuai kebutuhan",
      ],
      imageSrc: "/images/cold-storage.jpg",
      imageAlt: "Ilustrasi fasilitas pendingin — gambar pengganti sementara",
      figcaptionSr:
        "Foto dummy untuk bagian tentang kami; dapat diganti dengan foto resmi perusahaan atau proyek.",
    },
    layanan: {
      sectionLabel: "Layanan",
      heading: "Layanan terintegrasi",
      lead:
        "Yang mendukung solusi menyeluruh untuk kebutuhan cold storage dan sistem pendingin refrigerasi, mulai dari tahapan perencanaan hingga layanan purna jual.",
      quote:
        "Seluruh proses dikelola oleh satu tim terintegrasi untuk memastikan kualitas teknis yang konsisten, efisiensi pelaksanaan dilapangan, serta ketepatan waktu penyelesaian proyek.",
      cards: LAYANAN_UTAMA_CARDS.map((c) => ({
        id: c.id,
        folderSlug: c.folderSlug,
        title: c.title,
        body: [...c.body],
        photos: layananPhotosFromFolder(c.folderSlug, c.title).photos.map((p) => ({ src: p.src, alt: p.alt })),
      })),
    },
    produk: {
      sectionLabel: "Produk",
      heading: "Produk & solusi terintegrasi",
      lead:
        "Mulai dari sandwich panel, cold storage system, hingga komponen pendukung seperti pintu insulated, dock, dan refrigerasi untuk kebutuhan operasional industri.",
      closingBlurb: "Untuk informasi produk lebih lanjut, hubungi kami.",
      closingCtaLabel: "Hubungi via WhatsApp",
      closingCtaMessage: `Halo PT AYTI INDO PANEL,
Saya ingin berkonsultasi terkait kebutuhan produk cold storage dan refrigerasi.
Terima kasih.`,
      featuredImages: {
        utama: {
          leftSrc: GAMBAR_PRODUK_UTAMA_KIRI,
          rightSrc: GAMBAR_PRODUK_UTAMA_KANAN,
          leftAlt: "Sandwich panel insulated - produk utama",
          rightAlt: "Produk sandwich panel untuk aplikasi industri",
        },
        solusi: {
          leftSrc: GAMBAR_PRODUK_SOLUSI_KIRI,
          rightSrc: GAMBAR_PRODUK_SOLUSI_KANAN,
          leftAlt: "Solusi cold storage dan rantai dingin - produk solusi",
          rightAlt: "Sistem pembekuan dan rantai dingin industri",
        },
        accessories: {
          leftSrc: GAMBAR_PRODUK_ACCESSORIES_KIRI,
          rightSrc: GAMBAR_PRODUK_ACCESSORIES_KANAN,
          leftAlt: "Komponen pendukung cold room - pintu, dock, dan refrigerasi",
          rightAlt: "Unit refrigerasi dan sistem pendingin terintegrasi",
        },
      },
      categories: cloneCategories(),
    },
    serviceMaintenance: cloneMaintenance(),
    portfolio: {
      sectionLabel: "Portfolio / proyek",
      heading: "Dokumentasi proyek representatif",
      lead:
        "Beberapa contoh proyek yang sudah kami kerjakan, dengan implementasi sistem pendingin refrigersi, sandwich panel insulated, hingga area loading  yang dirancang mengikuti kebutuhan operasioanl yang efisien untuk jangka panjang.",
      projectLocationLabel: "Lokasi",
      projectWorkTypeLabel: "Jenis pekerjaan",
      editorAddProjectLabel: "Proyek",
      projects: [
        {
          id: "portfolio-cold-room-regional",
          name: "Cold room distribusi regional",
          location: "Jabodetabek",
          workType: "Panel insulated + instalasi sistem refrigerasi",
          videoSrc: "/images/gallery/WhatsApp%20Video%202026-05-07%20at%2011.02.55.mp4",
          videoPosterSrc: "/images/layanan/instalasi-sistem-pendingin/1.jpg",
          videoAutoplay: false,
          galleryPhotos: [
            {
              src: "/images/layanan/instalasi-sistem-pendingin/2.jpg",
              alt: "Instalasi sistem pendingin — sudut progres",
            },
            {
              src: "/images/layanan/instalasi-panel-cold-room/2.jpg",
              alt: "Instalasi sandwich panel — referensi commissioning",
            },
            {
              src: "/images/layanan/instalasi-panel-cold-room/1.jpg",
              alt: "Referensi panel cold room terkait proyek",
            },
          ],
        },
        {
          id: "portfolio-blast-freezer",
          name: "Fasilitas blast freezer",
          location: "Jawa Barat",
          workType: "Envelope ruang dingin + commissioning unit",
          videoSrc: "/images/gallery/WhatsApp%20Video%202026-05-07%20at%2011.02.55.mp4",
          videoPosterSrc: "/images/layanan/testing-commissioning/1.jpg",
          videoAutoplay: false,
          galleryPhotos: [
            {
              src: "/images/layanan/testing-commissioning/2.jpg",
              alt: "Pengukuran suhu saat commissioning",
            },
            {
              src: "/images/layanan/instalasi-sistem-pendingin/1.jpg",
              alt: "Instalasi sistem pendingin terkait ruang beku",
            },
            {
              src: "/images/layanan/instalasi-panel-cold-room/1.jpg",
              alt: "Panel insulated area ruang dingin",
            },
          ],
        },
        {
          id: "portfolio-chiller-logistik",
          name: "Gudang chiller logistik",
          location: "Nasional",
          workType: "Panel PU + zonasi suhu untuk SLA distribusi",
          videoSrc: "/images/gallery/WhatsApp%20Video%202026-05-07%20at%2011.02.55.mp4",
          videoPosterSrc: "/images/layanan/produksi-panel-pu-eps/1.jpg",
          videoAutoplay: false,
          galleryPhotos: [
            {
              src: "/images/layanan/produksi-panel-pu-eps/2.jpg",
              alt: "Detail fabrikasi panel insulated",
            },
            {
              src: "/images/layanan/instalasi-panel-cold-room/2.jpg",
              alt: "Instalasi envelope cold storage",
            },
            {
              src: "/images/layanan/maintenance-after-sales/1.jpg",
              alt: "Perawatan sistem untuk uptime distribusi",
            },
          ],
        },
        {
          id: "portfolio-lini-fnb",
          name: "Lini produksi F&B",
          location: "Jakarta & sekitarnya",
          workType: "Cold room higienis + pintu industri",
          videoSrc: "/images/gallery/WhatsApp%20Video%202026-05-07%20at%2011.02.55.mp4",
          videoPosterSrc: "/images/layanan/konsultasi-desain-sistem/1.jpg",
          videoAutoplay: false,
          galleryPhotos: [
            {
              src: "/images/layanan/konsultasi-desain-sistem/2.jpg",
              alt: "Koordinasi desain sistem pendingin",
            },
            {
              src: "/images/layanan/instalasi-sistem-pendingin/2.jpg",
              alt: "Pemasangan komponen refrigerasi",
            },
            {
              src: "/images/layanan/instalasi-panel-cold-room/1.jpg",
              alt: "Cold room higienis area produksi",
            },
          ],
        },
      ],
      galleryHint: "Lihat dokumentasi proyek lainnya",
      galleryLinkLabel: "Gallery Project",
    },
    customersPartners: {
      heading: "Our Customer",
      partnerHeading: "Our Partner",
      editorIndustriesLabel: "Industri",
      editorAddIndustryLabel: "Industri",
      editorAddPartnerLabel: "Partner",
      industries: [
        {
          id: "ind-fnb",
          label: "Food & Beverage",
          logoSrc: "/images/trust/industry-fnb.svg",
          logoAlt: "Sektor industri Food & Beverage",
        },
        {
          id: "ind-logistics",
          label: "Cold Chain Logistics",
          logoSrc: "/images/trust/industry-logistics.svg",
          logoAlt: "Sektor industri cold chain logistics",
        },
        {
          id: "ind-retail",
          label: "Retail & Distribution",
          logoSrc: "/images/trust/industry-retail.svg",
          logoAlt: "Sektor industri retail & distribution",
        },
        {
          id: "ind-pharma",
          label: "Pharmaceutical",
          logoSrc: "/images/trust/industry-pharma.svg",
          logoAlt: "Sektor industri farmasi",
        },
      ],
      partners: [
        {
          id: "partner-bluescope",
          name: "BlueScope Steel",
          logoSrc: "/images/partners/bluescope.svg",
          logoAlt: "Logo BlueScope Steel",
          width: 180,
          height: 48,
        },
        {
          id: "partner-bitzer",
          name: "Bitzer",
          logoSrc: "/images/partners/bitzer.svg",
          logoAlt: "Logo Bitzer",
          width: 160,
          height: 48,
        },
        {
          id: "partner-guentner",
          name: "Güntner",
          logoSrc: "/images/partners/guentner.svg",
          logoAlt: "Logo Güntner",
          width: 180,
          height: 48,
        },
        {
          id: "partner-muller",
          name: "Muller",
          logoSrc: "/images/partners/muller.jpg",
          logoAlt: "Logo Mueller Refrigeration",
          width: 286,
          height: 56,
        },
        {
          id: "partner-danfoss",
          name: "Danfoss",
          logoSrc: "/images/partners/danfoss.svg",
          logoAlt: "Logo Danfoss",
          width: 170,
          height: 48,
        },
        {
          id: "partner-copeland",
          name: "Copeland",
          logoSrc: "/images/partners/copeland.png",
          logoAlt: "Logo Copeland",
          width: 370,
          height: 185,
        },
        {
          id: "partner-daikin",
          name: "Daikin",
          logoSrc: "/images/partners/daikin.svg",
          logoAlt: "Logo Daikin",
          width: 160,
          height: 48,
        },
        {
          id: "partner-bock",
          name: "Bock Compressor",
          logoSrc: "/images/partners/bock.svg",
          logoAlt: "Bock Compressor — merek mitra",
          width: 240,
          height: 52,
        },
        {
          id: "partner-invotech",
          name: "Invotech",
          logoSrc: "/images/partners/invotech.svg",
          logoAlt: "Invotech — merek mitra",
          width: 220,
          height: 44,
        },
      ],
    },
    keunggulan: {
      sectionLabel: "Keunggulan kami",
      heading: "Berpengalaman dalam bidangnya",
      lead:
        "Pendekatan kerja terintegrasi untuk mendukung implementasi sistem cold storage dan refrigerasi yang lebih stabil, efisien dan terukur.",
      statsHeading: "Terbukti Di Berbagai Proyek",
      editorHint: "Mode edit: kartu ditumpuk untuk pengurutan. Seret gagang ⋮⋮ untuk mengubah urutan.",
      editorAddCardLabel: "Kartu keunggulan",
      cards: procurementTitles.map((title, i) => ({
        id: `proc-${i}`,
        title,
        body: procurementBodies[i] ?? "",
        iconKey: procurementIcons[i] ?? "manufacturing",
      })),
      stats: statLabels.map((label, i) => ({
        value: statValues[i] ?? "",
        label,
        iconKey: statIcons[i] ?? "briefcase",
        ...(statMobile[i] ? { labelMobileLines: statMobile[i] } : {}),
      })),
    },
    ctaMid: {
      title: "Ada PRD atau BOQ? Kirim ke tim kami",
      subtitle:
        "Balasan via WhatsApp untuk penjadwalan diskusi singkat — tanpa komitmen di awal.",
      buttonLabel: "Chat WhatsApp",
      whatsappMessage: `Halo PT AYTI INDO PANEL,
Saya ingin berkonsultasi terkait kebutuhan solusi cold storage dan refrigerasi.
Terima kasih.`,
    },
    faq: {
      sectionLabel: "FAQ",
      heading: "Pertanyaan yang sering diajukan",
      lead: "Jawaban singkat — detail teknis dan kontrak dibahas di WhatsApp atau rapat proyek.",
      items: [
        {
          id: "faq-waktu-pengerjaan",
          q: "Berapa lama pengerjaan?",
          a: "Tergantung luas dan kompleksitas. Setelah survei dan BOQ jelas, kami ajukan jadwal eksekusi yang bisa diikat di kontrak.",
        },
        {
          id: "faq-custom",
          q: "Bisa custom?",
          a: "Ya — dimensi ruangan, zona suhu, pintu, dan integrasi dengan alur operasi Anda dapat disesuaikan.",
        },
        {
          id: "faq-area",
          q: "Area layanan?",
          a: "Kami melayani nasional. Banyak proyek berada di Jabodetabek; tim siap mobilisasi ke luar kota.",
        },
      ],
      ctaLabel: "Tanya langsung via WhatsApp",
      ctaMessage: `Halo PT AYTI INDO PANEL,
Saya ingin berkonsultasi terkait kebutuhan solusi cold storage dan refrigerasi.
Terima kasih.`,
    },
    kontak: {
      heading: "Kontak Kami",
      badge: "PT AYTI INDO PANEL",
      intro: "",
      waCtaLabel: "",
      waMessage: `Halo PT AYTI INDO PANEL,
Saya ingin berkonsultasi terkait kebutuhan solusi cold storage dan refrigerasi.
Terima kasih.`,
      detailHeading: "Detail kontak",
      phoneLabel: "Telepon",
      whatsappLabel: "WhatsApp",
      emailLabel: "Email",
      addressLabel: "Alamat",
      socialHeading: "Sosial media",
      socialLead: "Ikuti update proyek dan konten teknis kami.",
      operationalLabel: "Jam operasional",
      operationalHours: "Senin–Sabtu · 09.00–17.00 WIB",
      mapTitle: "Peta lokasi kantor",
      phone: CONTACT_PHONE,
      phoneTel: CONTACT_PHONE_TEL,
      whatsappDisplay: CONTACT_WHATSAPP_DISPLAY,
      email: CONTACT_EMAIL,
      addressLines: [...CONTACT_ADDRESS_LINES],
      mapEmbedUrl: CONTACT_MAP_EMBED_URL,
    },
    footer: {
      copyrightLine: "© 2026 PT AYTI INDO PANEL. All rights reserved.",
      social: {
        instagram: "https://www.instagram.com/aytipanel/",
        linkedin: "",
        facebook: "https://www.facebook.com/aytipanel",
        tiktok: "https://www.tiktok.com/@aytipanel",
        youtube: "https://www.youtube.com/@aytipanel",
        x: "https://x.com/aytipanel",
      },
      quickLinks: [
        { id: "nav-beranda", label: "Beranda", href: "#beranda" },
        { id: "nav-tentang", label: "Tentang", href: "#tentang" },
        { id: "nav-layanan", label: "Layanan", href: "#layanan" },
        { id: "nav-produk", label: "Produk", href: "#produk" },
        { id: "nav-kontak", label: "Kontak", href: "#kontak" },
      ],
    },
    galleryPage: {
      loadingText: "Memuat gallery…",
      title: "Gallery Project",
      filterAriaLabel: "Filter kategori",
      listAriaLabel: "Daftar dokumentasi proyek",
      resultPrefix: "Menampilkan",
      resultCategoryText: "proyek pada kategori",
      resultSearchPrefix: "dengan kata kunci",
      searchPlaceholder: "Cari proyek, lokasi, kategori…",
      searchAriaLabel: "Cari di gallery proyek",
      sortAriaLabel: "Urutkan daftar proyek",
      sortDefault: "Urutkan",
      sortLatest: "Terbaru",
      sortOldest: "Terlama",
      sortNameAsc: "A-Z",
      sortNameDesc: "Z-A",
      emptyNoResultPrefix: "Tidak ada project kategori",
      emptyNoResultSearchSuffix: "yang cocok dengan pencarian",
      emptyNoCategoryPrefix: "Tidak ada project pada kategori",
      loadMoreLabel: "Muat lebih banyak",
      addProjectLabel: "Tambah Proyek",
      authTitle: "Verifikasi Password",
      authLead: "Masukkan password admin untuk melanjutkan aksi.",
      authPasswordLabel: "Password",
      authCancelLabel: "Batal",
      authContinueLabel: "Lanjutkan",
      authContinueBusyLabel: "Memverifikasi…",
      authAccessBadge: "Admin Access",
      authCloseAriaLabel: "Tutup autentikasi admin",
      authDeniedError: "Akses ditolak.",
      deleteConfirmTemplate: "Hapus “{name}” dari gallery untuk semua device?",
      deleteFailedError: "Gagal menghapus proyek.",
      toastAddedTitle: "Proyek berhasil ditambahkan",
      toastUpdatedTitle: "Perubahan disimpan",
      toastAddedBodyPrefix:
        "Tersimpan di gallery pada browser ini. Pastikan file gambar sudah berada di ",
      toastAddedBodySuffix: " jika menggunakan path baru.",
      toastUpdatedBody:
        "Data proyek diperbarui untuk gallery di browser ini (termasuk override untuk proyek bawaan situs).",
      toastCloseAriaLabel: "Tutup notifikasi",
      categoryLabels: {
        all: "All",
        coldStorage: "Cold Storage",
        csPortable: "CS Portable",
        abf: "ABF",
        prosesArea: "Proses Area",
        cleanRoom: "Clean Room",
        refrigeration: "Refrigeration",
        maintenance: "Maintenance",
      },
    },
    homeLayout: structuredClone(DEFAULT_HOME_LAYOUT),
  };
}
