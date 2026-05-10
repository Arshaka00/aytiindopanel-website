import { Fragment, type ReactNode } from "react";

import { CustomersPartnersSectionClient } from "@/components/aytipanel/customers-partners-section-client";
import { KeunggulanOperationalSection } from "@/components/aytipanel/keunggulan-operational-section";
import { LayananRingkasSection } from "@/components/aytipanel/layanan-ringkas-section";
import { ScrollRevealSection } from "@/components/aytipanel/scroll-reveal-section";
import { PortfolioSection } from "@/components/aytipanel/section-middle";
import { SectionProducts } from "@/components/aytipanel/section-products";
import {
  FaqSection,
  KontakSection,
  TentangSection,
} from "@/components/aytipanel/section-bottom";
import { SectionTop } from "@/components/aytipanel/section-top";
import { ServiceMaintenanceSection } from "@/components/aytipanel/service-maintenance-section";
import { DEFAULT_HOME_LAYOUT } from "@/lib/home-layout-defaults";
import type { SiteContent } from "@/lib/site-content-model";

type Props = {
  content: SiteContent;
  /** Digit WhatsApp utama untuk tautan wa.me di blok kontak. */
  waPhoneDigits: string;
};

/**
 * Merender section beranda mengikuti `homeLayout` (urutan + visibilitas).
 * Id section selaras dengan anchor navigasi / CMS.
 *
 * Setiap section (kecuali `beranda` / hero — selalu di atas-fold dan punya animasi
 * masuk sendiri) dibungkus `ScrollRevealSection` agar saat scroll mendekati viewport
 * fade-in halus + translateY ringan secara satu kali (premium, cinematic, GPU-friendly).
 */
export function HomeMainSections({ content, waPhoneDigits }: Props) {
  const layout = content.homeLayout ?? DEFAULT_HOME_LAYOUT;
  const hidden = new Set(layout.hiddenSections ?? []);
  const order = layout.sectionOrder?.length ? layout.sectionOrder : DEFAULT_HOME_LAYOUT.sectionOrder;

  const sections: Record<string, ReactNode> = {
    beranda: (
      <SectionTop
        hero={content.hero}
        disableVideoBackground={content.siteSettings.performanceMode.disableVideoBackground}
      />
    ),
    tentang: (
      <ScrollRevealSection>
        <TentangSection tentang={content.tentang} />
      </ScrollRevealSection>
    ),
    layanan: (
      <ScrollRevealSection>
        <LayananRingkasSection layanan={content.layanan} />
      </ScrollRevealSection>
    ),
    produk: (
      <ScrollRevealSection>
        <SectionProducts produk={content.produk} />
      </ScrollRevealSection>
    ),
    "service-maintenance": (
      <ScrollRevealSection>
        <ServiceMaintenanceSection maintenance={content.serviceMaintenance} />
      </ScrollRevealSection>
    ),
    proyek: (
      <ScrollRevealSection>
        <PortfolioSection portfolio={content.portfolio} />
      </ScrollRevealSection>
    ),
    "customers-partners": (
      <ScrollRevealSection>
        <CustomersPartnersSectionClient data={content.customersPartners} />
      </ScrollRevealSection>
    ),
    keunggulan: (
      <ScrollRevealSection>
        <KeunggulanOperationalSection keunggulan={content.keunggulan} />
      </ScrollRevealSection>
    ),
    faq: (
      <ScrollRevealSection>
        <FaqSection faq={content.faq} />
      </ScrollRevealSection>
    ),
    kontak: (
      <ScrollRevealSection>
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
