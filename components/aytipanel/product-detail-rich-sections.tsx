"use client";

import type { ComponentType, ReactNode } from "react";
import type { SVGProps } from "react";

import type { RichProductDetail } from "@/components/aytipanel/product-detail-rich-data";
import { SiteCopyrightImagePreview } from "@/components/aytipanel/site-copyright-image-preview";
import { CmsImage } from "@/components/site-cms/cms-image";
import { CmsText } from "@/components/site-cms/cms-text";
import {
  IconColdChain,
  IconCompressor,
  IconDistribution,
  IconManufacturing,
  IconProcessComplete,
  IconProcessSurvey,
  IconSnowflake,
  IconThermostat,
} from "@/components/aytipanel/icons";

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;

const sectionTitle =
  "text-lg font-semibold leading-snug tracking-tight text-foreground md:text-xl md:leading-snug";

const sectionDivider = "border-t border-border pt-8 md:pt-9";

/** Kotak ikon section ≈ 55% tinggi baris judul (text-lg/md:text-xl), rasio 1:1 */
const sectionIconOuter =
  "flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-accent/18 bg-accent-soft text-accent shadow-[0_1px_2px_rgba(15,23,42,0.05)] md:size-11 md:rounded-[11px] dark:border-accent/28 dark:shadow-[0_1px_2px_rgba(0,0,0,0.2)]";

/** Varian pendingin: aksen biru es, konsisten dengan tema Refrigeration System */
const sectionIconOuterRefrigeration =
  "flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-sky-500/28 bg-sky-500/[0.09] text-sky-700 shadow-[0_1px_2px_rgba(14,165,233,0.12)] md:size-11 md:rounded-[11px] dark:border-sky-400/35 dark:bg-sky-400/[0.12] dark:text-sky-300 dark:shadow-[0_1px_2px_rgba(0,0,0,0.25)]";

const sectionIconInner =
  "[&>svg]:block [&>svg]:size-[1.125rem] md:[&>svg]:size-[1.3125rem]";

/** Ikon baris daftar: lebih kecil dari section, tetap legibel di layar kecil */
const listIconOuter =
  "flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background text-accent md:size-9 dark:border-border dark:bg-card/90";

const listIconOuterRefrigeration =
  "flex size-8 shrink-0 items-center justify-center rounded-lg border border-sky-500/22 bg-sky-500/[0.06] text-sky-700 md:size-9 dark:border-sky-400/28 dark:bg-sky-950/40 dark:text-sky-300";

const listIconInner = "[&>svg]:block [&>svg]:size-4 md:[&>svg]:size-[1.125rem]";

/** Selaras dengan kotak ikon + gap flex — mobile & desktop */
const bodyIndent = "pl-[calc(2.5rem+0.75rem)] md:pl-[calc(2.75rem+1rem)]";

type SpecGroup = { headingLine: string; bullets: readonly string[] };

function splitSpecsIntoGroups(specs: readonly string[]): SpecGroup[] {
  const groups: SpecGroup[] = [];
  for (const line of specs) {
    if (/^\d+\./.test(line)) {
      groups.push({ headingLine: line, bullets: [] });
    } else if (groups.length > 0) {
      const last = groups[groups.length - 1];
      groups[groups.length - 1] = {
        headingLine: last.headingLine,
        bullets: [...last.bullets, line],
      };
    }
  }
  return groups;
}

function parseNumberedHeading(line: string): { num: string; label: string } | null {
  const m = line.match(/^(\d+)\.\s*(.+)$/);
  if (!m) return null;
  return { num: m[1], label: m[2] };
}

const REFRIG_SPEC_GROUP_ICONS: readonly IconComponent[] = [
  IconManufacturing,
  IconCompressor,
  IconColdChain,
  IconSnowflake,
  IconThermostat,
];

function RefrigerationSpecGroups({ specs }: { specs: readonly string[] }) {
  const groups = splitSpecsIntoGroups(specs);

  return (
    <div className={`mt-4 space-y-4 md:space-y-5 ${bodyIndent}`}>
      {groups.map((g, i) => {
        const parsed = parseNumberedHeading(g.headingLine);
        const IconCmp = REFRIG_SPEC_GROUP_ICONS[i] ?? IconSnowflake;
        return (
          <div
            key={`${g.headingLine}-${i}`}
            className="rounded-2xl border border-sky-500/18 bg-gradient-to-br from-sky-500/[0.07] via-background/80 to-accent-soft/35 p-4 shadow-sm ring-1 ring-border/55 dark:from-sky-400/[0.09] dark:via-card/90 dark:to-accent-soft/25 md:p-5"
          >
            <div className="flex gap-3 md:gap-4">
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-sky-500/22 bg-background/90 text-sky-700 shadow-sm dark:border-sky-400/25 dark:bg-card dark:text-sky-400 md:size-11"
                aria-hidden
              >
                <IconCmp className="size-[1.125rem] md:size-[1.3125rem]" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                {parsed ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex h-7 min-w-[1.75rem] items-center justify-center rounded-md bg-sky-600 px-2 text-xs font-bold tabular-nums text-white dark:bg-sky-500">
                      {parsed.num}
                    </span>
                    <h3 className="text-base font-semibold leading-snug text-foreground md:text-[1.0625rem]">
                      {parsed.label}
                    </h3>
                  </div>
                ) : (
                  <h3 className="text-base font-semibold leading-snug text-foreground md:text-[1.0625rem]">
                    {g.headingLine}
                  </h3>
                )}
                <ul className="mt-3 list-none space-y-2 text-sm leading-relaxed text-muted md:text-base md:leading-relaxed">
                  {g.bullets.map((b) => (
                    <li key={b} className="flex gap-2.5">
                      <span
                        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sky-500 dark:bg-sky-400"
                        aria-hidden
                      />
                      <span className="min-w-0">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SectionHeading({
  id,
  icon,
  children,
  iconBoxClassName,
}: {
  id: string;
  icon: ReactNode;
  children: ReactNode;
  iconBoxClassName?: string;
}) {
  return (
    <div className="flex items-center gap-3 md:gap-4">
      <span className={iconBoxClassName ?? sectionIconOuter} aria-hidden>
        <span className={sectionIconInner}>{icon}</span>
      </span>
      <h2 id={id} className={`${sectionTitle} min-w-0`}>
        {children}
      </h2>
    </div>
  );
}

export function ProductDetailRichSections({
  detail,
  cmsSlug,
}: {
  detail: RichProductDetail;
  /** Jika diisi, blok teks memakai `CmsText` untuk override JSON. */
  cmsSlug?: string;
}) {
  const isRefrigeration = detail.sectionsVariant === "refrigeration";
  const sectionIconBox = isRefrigeration ? sectionIconOuterRefrigeration : sectionIconOuter;
  const rowIconOuter = isRefrigeration ? listIconOuterRefrigeration : listIconOuter;

  const whySectionSurface = isRefrigeration
    ? "rounded-2xl border border-sky-500/18 bg-gradient-to-br from-sky-500/[0.06] via-muted-bg/80 to-muted-bg/55 px-4 py-5 shadow-sm ring-1 ring-border/50 dark:from-sky-400/[0.07] dark:via-muted-bg-strong/40 dark:to-muted-bg-strong/25 md:px-6 md:py-6"
    : "rounded-2xl border border-border bg-muted-bg/55 px-4 py-5 md:px-6 md:py-6 dark:bg-muted-bg-strong/30";

  return (
    <div className="mt-8 space-y-8 md:mt-9 md:space-y-9">
      <section aria-labelledby="deskripsi-produk-heading">
        <SectionHeading
          id="deskripsi-produk-heading"
          iconBoxClassName={sectionIconBox}
          icon={
            isRefrigeration ? <IconSnowflake aria-hidden /> : <IconProcessSurvey aria-hidden />
          }
        >
          {cmsSlug ? (
            <CmsText
              path={`productRichOverrides.${cmsSlug}.descriptionHeading`}
              text={detail.descriptionHeading}
              as="span"
              className="inline"
            />
          ) : (
            detail.descriptionHeading
          )}
        </SectionHeading>
        <div
          className={`mt-3 space-y-3 text-base leading-relaxed text-muted md:text-[1.0625rem] md:leading-relaxed ${bodyIndent}`}
        >
          {detail.paragraphs.map((p, i) => (
            <p key={i}>
              {cmsSlug ? (
                <CmsText
                  path={`productRichOverrides.${cmsSlug}.paragraphs.${i}`}
                  text={p}
                  as="span"
                  className="inline"
                />
              ) : (
                p
              )}
            </p>
          ))}
        </div>
      </section>

      <section className={sectionDivider} aria-labelledby="keunggulan-heading">
        <SectionHeading
          id="keunggulan-heading"
          iconBoxClassName={sectionIconBox}
          icon={
            isRefrigeration ? <IconSnowflake aria-hidden /> : <IconProcessComplete aria-hidden />
          }
        >
          {cmsSlug ? (
            <CmsText
              path={`productRichOverrides.${cmsSlug}.advantagesHeading`}
              text={detail.advantagesHeading}
              as="span"
              className="inline"
            />
          ) : (
            detail.advantagesHeading
          )}
        </SectionHeading>
        <ul className={`mt-4 list-none divide-y divide-border ${bodyIndent}`} role="list">
          {detail.advantages.map((item, ai) => (
            <li key={`${item.title}-${ai}`} className="flex gap-3 py-4 first:pt-0 last:pb-0">
              <span className={`${rowIconOuter} mt-0.5`} aria-hidden>
                <span className={listIconInner}>
                  {isRefrigeration ? (
                    <IconSnowflake aria-hidden />
                  ) : (
                    <IconProcessComplete aria-hidden />
                  )}
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-snug text-foreground">
                  {cmsSlug ? (
                    <CmsText
                      path={`productRichOverrides.${cmsSlug}.advantages.${ai}.title`}
                      text={item.title}
                      as="span"
                      className="inline"
                    />
                  ) : (
                    item.title
                  )}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted md:text-base md:leading-relaxed">
                  {cmsSlug ? (
                    <CmsText
                      path={`productRichOverrides.${cmsSlug}.advantages.${ai}.description`}
                      text={item.description}
                      as="span"
                      className="inline"
                    />
                  ) : (
                    item.description
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={sectionDivider} aria-labelledby="spesifikasi-heading">
        <SectionHeading
          id="spesifikasi-heading"
          iconBoxClassName={sectionIconBox}
          icon={
            isRefrigeration ? <IconCompressor aria-hidden /> : <IconManufacturing aria-hidden />
          }
        >
          {cmsSlug ? (
            <CmsText
              path={`productRichOverrides.${cmsSlug}.specsHeading`}
              text={detail.specsHeading}
              as="span"
              className="inline"
            />
          ) : (
            detail.specsHeading
          )}
        </SectionHeading>
        {isRefrigeration ? (
          <RefrigerationSpecGroups specs={detail.specs} />
        ) : (
          <ul
            className={`mt-3 list-none space-y-2.5 text-sm leading-relaxed text-muted md:text-base md:leading-relaxed ${bodyIndent}`}
            role="list"
          >
            {detail.specs.map((line, specIndex) => (
              <li key={`spec-${specIndex}`} className="flex items-start gap-3">
                <span className={`${listIconOuter} mt-px`} aria-hidden>
                  <span className={listIconInner}>
                    <IconProcessSurvey aria-hidden />
                  </span>
                </span>
                <span
                  className={`min-w-0 pt-0.5 leading-relaxed ${/^\d+\./.test(line) ? "font-semibold text-foreground" : ""}`}
                >
                  {cmsSlug ? (
                    <CmsText
                      path={`productRichOverrides.${cmsSlug}.specs.${specIndex}`}
                      text={line}
                      as="span"
                      className="inline"
                    />
                  ) : (
                    line
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={sectionDivider} aria-labelledby="aplikasi-heading">
        <SectionHeading
          id="aplikasi-heading"
          iconBoxClassName={sectionIconBox}
          icon={<IconColdChain aria-hidden />}
        >
          {cmsSlug ? (
            <CmsText
              path={`productRichOverrides.${cmsSlug}.applicationsHeading`}
              text={detail.applicationsHeading}
              as="span"
              className="inline"
            />
          ) : (
            detail.applicationsHeading
          )}
        </SectionHeading>
        <ul
          className={`mt-3 list-none space-y-2.5 text-sm leading-relaxed text-muted md:text-base md:leading-relaxed ${bodyIndent}`}
          role="list"
        >
          {detail.applications.map((line, li) => (
            <li key={`${line}-${li}`} className="flex items-start gap-3">
              <span className={`${rowIconOuter} mt-px`} aria-hidden>
                <span className={listIconInner}>
                  <IconColdChain aria-hidden />
                </span>
              </span>
              <span className="min-w-0 pt-0.5 leading-relaxed">
                {cmsSlug ? (
                  <CmsText
                    path={`productRichOverrides.${cmsSlug}.applications.${li}`}
                    text={line}
                    as="span"
                    className="inline"
                  />
                ) : (
                  line
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {detail.gallery && detail.gallery.length > 0 ? (
        <section className={sectionDivider} aria-labelledby="gallery-heading">
          <h2 id="gallery-heading" className={sectionTitle}>
            Galeri
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3">
            {detail.gallery.map((g, gi) => (
              <div
                key={`${g.src}-${gi}`}
                className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted-bg"
              >
                {cmsSlug ? (
                  <CmsImage
                    srcPath={`productRichOverrides.${cmsSlug}.gallery.${gi}.src`}
                    src={g.src}
                    alt={g.alt ?? "Galeri produk"}
                    fill
                    uploadScope="produk"
                    uploadSegment={`${cmsSlug}-gallery-${gi}`}
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                ) : (
                  <SiteCopyrightImagePreview
                    src={g.src}
                    alt={g.alt ?? "Galeri produk"}
                    fill
                    buttonClassName="h-full w-full"
                    imageClassName="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {detail.whyHeading && detail.whyBody ? (
        <section className={sectionDivider} aria-labelledby="why-heading">
          <div className={whySectionSurface}>
            <SectionHeading
              id="why-heading"
              iconBoxClassName={sectionIconBox}
              icon={
                isRefrigeration ? (
                  <IconSnowflake aria-hidden />
                ) : (
                  <IconDistribution aria-hidden />
                )
              }
            >
              {cmsSlug && detail.whyHeading ? (
                <CmsText
                  path={`productRichOverrides.${cmsSlug}.whyHeading`}
                  text={detail.whyHeading}
                  as="span"
                  className="inline"
                />
              ) : (
                detail.whyHeading
              )}
            </SectionHeading>
            <p
              className={`mt-3 text-base leading-relaxed text-muted md:mt-4 md:text-[1.0625rem] md:leading-relaxed ${bodyIndent}`}
            >
              {cmsSlug && detail.whyBody ? (
                <CmsText
                  path={`productRichOverrides.${cmsSlug}.whyBody`}
                  text={detail.whyBody}
                  as="span"
                  className="inline"
                />
              ) : (
                detail.whyBody
              )}
            </p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
