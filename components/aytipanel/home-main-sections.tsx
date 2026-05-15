import dynamic from "next/dynamic";
import { Fragment, type ReactNode } from "react";

import { ScrollRevealSection } from "@/components/aytipanel/scroll-reveal-section";
import { SectionTop } from "@/components/aytipanel/section-top";
import { DEFAULT_HOME_LAYOUT } from "@/lib/home-layout-defaults";
import type { SiteContent } from "@/lib/site-content-model";

const TentangSection = dynamic(() =>
  import("@/components/aytipanel/tentang-section").then((m) => m.TentangSection),
);

const LayananRingkasSection = dynamic(() =>
  import("@/components/aytipanel/layanan-ringkas-section").then((m) => m.LayananRingkasSection),
);

const SectionProducts = dynamic(() =>
  import("@/components/aytipanel/section-products").then((m) => m.SectionProducts),
);

const ServiceMaintenanceSection = dynamic(() =>
  import("@/components/aytipanel/service-maintenance-section").then((m) => m.ServiceMaintenanceSection),
);

const PortfolioSection = dynamic(() =>
  import("@/components/aytipanel/section-middle").then((m) => m.PortfolioSection),
);

const CustomersPartnersSectionClient = dynamic(() =>
  import("@/components/aytipanel/customers-partners-section-client").then(
    (m) => m.CustomersPartnersSectionClient,
  ),
);

const KeunggulanOperationalSection = dynamic(() =>
  import("@/components/aytipanel/keunggulan-operational-section").then((m) => m.KeunggulanOperationalSection),
);

const FaqSection = dynamic(() =>
  import("@/components/aytipanel/section-bottom").then((m) => m.FaqSection),
);

const KontakSection = dynamic(() =>
  import("@/components/aytipanel/section-bottom").then((m) => m.KontakSection),
);

type Props = {
  content: SiteContent;
  /** Digit WhatsApp utama untuk tautan wa.me di blok kontak. */
  waPhoneDigits: string;
  /** SSR: tebakan mobile dari User-Agent untuk hydrasi hero. */
  initialViewportIsMobile?: boolean;
};

/**
 * Merender section beranda mengikuti `homeLayout` (urutan + visibilitas).
 * Id section selaras dengan anchor navigasi / CMS.
 *
 * Setiap section (termasuk `beranda` / hero dengan `initialRevealed` + backdrop cinematic)
 * dibungkus `ScrollRevealSection` dengan `sectionKey` — preset reveal bervariasi per section
 * (deterministik), durasi/easing cinematic di globals, plus pulse ringan saat navigasi hash
 * (`LandingSectionHashFlash`).
 *
 * Section di bawah hero dimuat lewat `dynamic()` agar chunk JS client terpecah
 * (SSR tetap aktif — HTML & SEO tidak dikorbankan).
 */
export function HomeMainSections({
  content,
  waPhoneDigits,
  initialViewportIsMobile,
}: Props) {
  const layout = content.homeLayout ?? DEFAULT_HOME_LAYOUT;
  const hidden = new Set(layout.hiddenSections ?? []);
  const order = layout.sectionOrder?.length ? layout.sectionOrder : DEFAULT_HOME_LAYOUT.sectionOrder;

  const sections: Record<string, ReactNode> = {
    beranda: (
      <ScrollRevealSection sectionKey="beranda" initialRevealed>
        <SectionTop
          hero={content.hero}
          disableVideoBackground={content.siteSettings.performanceMode.disableVideoBackground}
          initialViewportIsMobile={initialViewportIsMobile}
        />
      </ScrollRevealSection>
    ),
    tentang: (
      <ScrollRevealSection sectionKey="tentang">
        <TentangSection tentang={content.tentang} />
      </ScrollRevealSection>
    ),
    layanan: (
      <ScrollRevealSection sectionKey="layanan">
        <LayananRingkasSection layanan={content.layanan} />
      </ScrollRevealSection>
    ),
    produk: (
      <ScrollRevealSection
        sectionKey="produk"
        id="produk"
        className="scroll-mt-[var(--section-nav-pass)]"
      >
        <SectionProducts produk={content.produk} />
      </ScrollRevealSection>
    ),
    "service-maintenance": (
      <ScrollRevealSection sectionKey="service-maintenance">
        <ServiceMaintenanceSection maintenance={content.serviceMaintenance} />
      </ScrollRevealSection>
    ),
    proyek: (
      <ScrollRevealSection sectionKey="proyek">
        <PortfolioSection portfolio={content.portfolio} />
      </ScrollRevealSection>
    ),
    "customers-partners": (
      <ScrollRevealSection sectionKey="customers-partners">
        <CustomersPartnersSectionClient data={content.customersPartners} />
      </ScrollRevealSection>
    ),
    keunggulan: (
      <ScrollRevealSection sectionKey="keunggulan">
        <KeunggulanOperationalSection keunggulan={content.keunggulan} />
      </ScrollRevealSection>
    ),
    faq: (
      <ScrollRevealSection sectionKey="faq">
        <FaqSection faq={content.faq} />
      </ScrollRevealSection>
    ),
    kontak: (
      <ScrollRevealSection sectionKey="kontak">
        <KontakSection
          kontak={content.kontak}
          social={content.footer.social}
          siteSettings={content.siteSettings}
          waPhoneDigits={waPhoneDigits}
        />
      </ScrollRevealSection>
    ),
  };

  return (
    <>
      {order.map((id) => {
        if (hidden.has(id)) return null;
        const node = sections[id];
        if (!node) return null;
        return <Fragment key={id}>{node}</Fragment>;
      })}
    </>
  );
}
