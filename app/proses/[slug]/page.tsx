import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BackButton } from "@/components/common/BackButton";
import { InternalDetailNavLink } from "@/components/common/internal-detail-nav-link";
import {
  getProsesKerjaStepBySlug,
  getProsesKerjaStepContext,
  PROSES_KERJA_STEPS,
  type ProsesKerjaSlug,
} from "@/components/aytipanel/proses-kerja-data";
import { ScrollRevealSection } from "@/components/aytipanel/scroll-reveal-section";
import { SiteFooter } from "@/components/aytipanel/site-footer";
import { getSiteContent } from "@/lib/site-content";
import { resolveSiteMetadataForPage } from "@/lib/site-seo-resolve";

const prosesEyebrow =
  "text-xs font-semibold uppercase tracking-[0.2em] text-muted md:text-[11px] md:tracking-[0.22em]";
const prosesBody =
  "text-[0.9375rem] font-normal leading-[1.56] text-muted md:text-base md:leading-[1.68]";

type Props = {
  params: Promise<{ slug: string }>;
};

const prosesSectionFullBleedRule = "block h-px w-full shrink-0 bg-border";

const prosesSectionHeadingDivider =
  "block h-px w-full max-w-[min(18rem,calc(100%-1rem))] shrink-0 rounded-full bg-gradient-to-r from-transparent via-border to-transparent dark:via-white/22 md:max-w-[min(22rem,calc(100%-1rem))]";

export function generateStaticParams() {
  return PROSES_KERJA_STEPS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const step = getProsesKerjaStepBySlug(slug);
  const content = await getSiteContent();
  const brand = content.siteSettings.siteName.trim() || "PT AYTI INDO PANEL";
  const base = resolveSiteMetadataForPage("process", content, `/proses/${slug}`);
  if (!step) {
    return { ...base, title: `Tahapan tidak ditemukan | ${brand}` };
  }
  const { description } = step.page;
  const desc = description.length > 160 ? `${description.slice(0, 157)}…` : description;
  return {
    ...base,
    title: `${step.title} — Alur kerja | ${brand}`,
    description: desc,
    openGraph: {
      ...base.openGraph,
      title: `${step.title} — Alur kerja`,
      description: desc,
    },
    twitter: {
      ...base.twitter,
      title: `${step.title} — Alur kerja`,
      description: desc,
    },
  };
}

export default async function ProsesKerjaStepPage({ params }: Props) {
  const { slug } = await params;
  const ctx = getProsesKerjaStepContext(slug as ProsesKerjaSlug);
  if (!ctx) {
    notFound();
  }

  const siteContent = await getSiteContent();

  const { step, index, prev, next } = ctx;
  const { title, page } = step;
  const stepLabel = `Langkah ${index + 1} dari ${PROSES_KERJA_STEPS.length}`;

  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <main className="flex-1">
        <article className="w-full border-b border-border px-4 py-6 sm:px-5 sm:py-7 md:px-6 md:py-12 lg:py-14">
          <div className="mx-auto w-full max-w-3xl">
            <header className="text-center">
              <p className={prosesEyebrow}>
                Alur kerja · {stepLabel}
              </p>
              <h1 className="mt-1.5 text-balance text-[1.5rem] font-semibold leading-[1.25] tracking-tight text-foreground sm:mt-2 sm:text-[1.875rem] sm:leading-[1.22] md:mt-2.5 md:text-[2.125rem]">
                {title}
              </h1>
              <div className="mt-1.5 flex justify-center sm:mt-2 md:mt-2.5">
                <span
                  className="block h-px w-full max-w-[min(26rem,calc(100%-0.75rem))] shrink-0 rounded-full bg-gradient-to-r from-transparent via-border to-transparent dark:via-white/22 md:max-w-[min(30rem,calc(100%-1rem))]"
                  aria-hidden
                />
              </div>
              <p className={`${prosesBody} mt-2 max-w-2xl text-pretty text-start tracking-[-0.01em] sm:mt-2.5 md:mt-3.5`}>
                {page.intro}
              </p>
            </header>

            <div className="mt-4 space-y-4 md:mt-7 md:space-y-5">
              {page.sections.map((section, sectionIndex) => {
                const centerHeadingOnly = sectionIndex < 2;
                return (
                  // Stagger ringan antar sub-section (delay 70ms × index, dipotong di 280ms).
                  <ScrollRevealSection
                    key={section.title}
                    variant="card"
                    delay={Math.min(sectionIndex * 70, 280)}
                  >
                    <section
                      className={centerHeadingOnly ? "space-y-1.5 md:space-y-2" : "space-y-0.5 md:space-y-1.5"}
                    >
                      {centerHeadingOnly ? (
                        <span className={prosesSectionFullBleedRule} aria-hidden />
                      ) : null}
                      <h2
                        className={`text-[0.9375rem] font-semibold leading-[1.45] tracking-tight text-foreground md:text-lg md:leading-snug ${centerHeadingOnly ? "text-center text-balance" : ""}`}
                      >
                        {section.title}
                      </h2>
                      {centerHeadingOnly ? (
                        <div className="flex justify-center">
                          <span className={prosesSectionHeadingDivider} aria-hidden />
                        </div>
                      ) : null}
                      <p className={`${prosesBody} ${centerHeadingOnly ? "text-start" : ""}`}>
                        {section.body}
                      </p>
                    </section>
                  </ScrollRevealSection>
                );
              })}
            </div>

            <nav
              className="mt-4 flex min-h-10 items-center justify-between gap-x-3 gap-y-1 border-t border-border pt-4 text-[0.9375rem] font-semibold leading-[1.45] text-foreground sm:mt-5 sm:gap-x-5 sm:gap-y-2 sm:pt-5 md:mt-8 md:min-h-[3rem] md:pt-6 md:text-sm md:leading-snug"
              aria-label="Navigasi tahapan alur kerja"
            >
              {prev ? (
                <InternalDetailNavLink
                  href={`/proses/${prev.slug}`}
                  className="min-w-0 max-w-[45%] text-pretty text-accent underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:max-w-none"
                >
                  ← {prev.title}
                </InternalDetailNavLink>
              ) : (
                <span className="invisible w-0 shrink-0 text-muted/60" aria-hidden>
                  {" "}
                </span>
              )}
              {next ? (
                <InternalDetailNavLink
                  href={`/proses/${next.slug}`}
                  className="min-w-0 max-w-[45%] text-pretty text-right text-accent underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:max-w-none"
                >
                  {next.title} →
                </InternalDetailNavLink>
              ) : (
                <BackButton
                  label="Kembali ke alur kerja"
                  icon={null}
                  destination="previous"
                  forceNavigateHref="/#beranda"
                  className="max-w-[45%] touch-manipulation text-pretty text-right text-[0.9375rem] font-semibold leading-[1.45] text-accent underline-offset-4 transition-colors [-webkit-tap-highlight-color:transparent] hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:max-w-none md:text-sm md:leading-snug ml-auto inline-flex min-h-10 min-w-0 items-center justify-end gap-1 border-0 bg-transparent p-0 shadow-none opacity-100"
                />
              )}
            </nav>
          </div>
        </article>
      </main>
      <SiteFooter
        hideFooterPromoCta
        footerSeoText={siteContent.siteSettings.seoContent.footerSeoText}
      />
    </div>
  );
}
