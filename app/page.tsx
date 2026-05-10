import type { Metadata } from "next";

import { AytiIndoPanelLanding } from "@/components/aytipanel/landing";
import { getSiteContent } from "@/lib/site-content";
import { resolveSiteMetadataForPage } from "@/lib/site-seo-resolve";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return resolveSiteMetadataForPage("home", content, "/");
}

export default function Home() {
  return <AytiIndoPanelLanding />;
}
