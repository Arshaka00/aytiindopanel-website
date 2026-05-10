import type { Metadata } from "next";
import Link from "next/link";

import { getSiteContent } from "@/lib/site-content";
import { resolveSiteMetadataForPage } from "@/lib/site-seo-resolve";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return resolveSiteMetadataForPage("about", content, "/tentang");
}

/** Ringkasan SEO-dedicated; detail penuh tetap di section beranda #tentang. */
export default async function TentangPage() {
  const content = await getSiteContent();
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Perusahaan
      </p>
      <h1 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
        {content.tentang.heading}
      </h1>
      <p className="mt-4 text-pretty text-muted-foreground">{content.tentang.lead}</p>
      <Link
        href="/#tentang"
        className="mt-10 inline-flex rounded-xl border border-border bg-muted-bg/60 px-5 py-3 text-sm font-semibold text-accent transition hover:bg-muted-bg"
      >
        Baca selengkapnya di beranda →
      </Link>
    </main>
  );
}
