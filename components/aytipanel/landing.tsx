import dynamic from "next/dynamic";

import { LandingScrollPageVeil } from "@/components/aytipanel/landing-scroll-page-veil";
import { HomeMainSections } from "@/components/aytipanel/home-main-sections";
import { HomeInitialHashScroll } from "@/components/common/home-initial-hash-scroll";
import { LandingSectionHashFlash } from "@/components/common/landing-section-hash-flash";
import { WhatsAppPhoneProvider } from "@/components/common/whatsapp-phone-context";
import { ScrollToSectionOnLoad } from "@/components/common/scroll-to-section-on-load";

import type { SiteContent } from "@/lib/site-content-model";

const SiteFooter = dynamic(() =>
  import("@/components/aytipanel/site-footer").then((m) => m.SiteFooter),
);

type LandingProps = {
  content: SiteContent;
  waPhoneDigits: string;
  initialViewportIsMobile: boolean;
};

export function AytiIndoPanelLanding({
  content,
  waPhoneDigits,
  initialViewportIsMobile,
}: LandingProps) {
  return (
    <WhatsAppPhoneProvider phoneDigits={waPhoneDigits}>
      <div className="relative flex w-full flex-col bg-background text-foreground">
        <LandingScrollPageVeil />
        <main className="min-w-0">
          <HomeInitialHashScroll />
          <LandingSectionHashFlash />
          <ScrollToSectionOnLoad />
          <HomeMainSections
            content={content}
            waPhoneDigits={waPhoneDigits}
            initialViewportIsMobile={initialViewportIsMobile}
          />
        </main>
        <SiteFooter footer={content.footer} />
      </div>
    </WhatsAppPhoneProvider>
  );
}
