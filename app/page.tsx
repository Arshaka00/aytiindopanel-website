import type { Metadata } from "next";
import { headers } from "next/headers";

import { AytiIndoPanelLanding } from "@/components/aytipanel/landing";
import { getSiteContent } from "@/lib/site-content";
import { resolvePrimaryWhatsAppDigits } from "@/lib/site-contact";
import { resolveSiteMetadataForPage } from "@/lib/site-seo-resolve";
import { isLikelyMobileViewportFromUserAgent } from "@/lib/viewport-initial-mobile";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return resolveSiteMetadataForPage("home", content, "/");
}

export default async function Home() {
  const content = await getSiteContent();
  const h = await headers();
  const initialViewportIsMobile = isLikelyMobileViewportFromUserAgent(h.get("user-agent"));
  const waDigits = resolvePrimaryWhatsAppDigits(content.siteSettings);

  return (
    <AytiIndoPanelLanding
      content={content}
      waPhoneDigits={waDigits}
      initialViewportIsMobile={initialViewportIsMobile}
    />
  );
}
