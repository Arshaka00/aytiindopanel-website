"use client";

import { Fragment } from "react";
import dynamic from "next/dynamic";

import {
  lightBody,
} from "@/components/aytipanel/light-section-ui";
import { CmsText } from "@/components/site-cms/cms-text";
import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";
import { emptyFaqItem } from "@/lib/cms-item-factories";
import type { SiteContent } from "@/lib/site-content-model";
import { mergeAytiCardClass, mergeAytiTitleClass } from "@/lib/ayti-icon-cold";

const faqCardLight = mergeAytiCardClass(
  "rounded-xl border border-border/75 bg-card px-4 py-3 shadow-[var(--shadow-card)] md:px-[1.125rem] md:py-3.5 lg:py-4 " +
    "transition-[border-color,box-shadow,background-color] duration-[240ms] [transition-timing-function:var(--ease-premium-soft)] " +
    "hover:border-accent/30 hover:shadow-[var(--shadow-card-hover)] " +
    "open:border-accent/40 open:bg-muted-bg/35 dark:open:bg-white/[0.035] " +
    "focus-within:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
    "dark:border-white/[0.08]",
);

function FaqChevron() {
  return (
    <span
      className={
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/65 bg-muted-bg/55 text-muted-foreground " +
        "transition-[transform,background-color,border-color,color] duration-[240ms] [transition-timing-function:var(--ease-premium-soft)] " +
        "group-open:rotate-180 group-open:border-accent/35 group-open:bg-accent/[0.12] group-open:text-accent " +
        "dark:bg-white/[0.04]"
      }
      aria-hidden
    >
      <svg
        className="ayti-icon-cold h-4 w-4 translate-y-px"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  );
}

const SortList = dynamic(
  () => import("@/components/site-cms/cms-sortable-list").then((m) => m.CmsSortableList),
  { ssr: false },
);

export function FaqItemsClient({ faq }: { faq: SiteContent["faq"] }) {
  const cms = useSiteCmsOptional();
  const edit = Boolean(cms?.eligible && cms.editMode);

  const renderDetails = (item: SiteContent["faq"]["items"][number], qi: number) => (
    <details id={item.id} className={`group ${faqCardLight}`}>
      <summary
        className={mergeAytiTitleClass(
          "flex cursor-pointer list-none items-center justify-between gap-3 rounded-[inherit] py-0.5 font-semibold leading-snug text-foreground marker:hidden select-none [&::-webkit-details-marker]:hidden md:text-base",
        )}
      >
        <span className="min-w-0 flex-1 text-left text-[0.9375rem] md:text-base">
          <CmsText path={`faq.items.${qi}.q`} text={item.q} as="span" className="inline text-pretty" />
        </span>
        <FaqChevron />
      </summary>
      <div className={`mt-3 border-t border-border/55 pt-3 lg:mt-3.5 lg:pt-3.5 dark:border-white/[0.07] ${lightBody}`}>
        <CmsText path={`faq.items.${qi}.a`} text={item.a} as="span" className="inline text-pretty" />
      </div>
    </details>
  );

  if (!edit || !cms) {
    return (
      <div className="flex flex-col gap-2 sm:gap-2.5 lg:gap-3">
        {faq.items.map((item, qi) => (
          <Fragment key={item.id}>{renderDetails(item, qi)}</Fragment>
        ))}
      </div>
    );
  }

  return (
    <SortList
      items={faq.items}
      patchPath="faq.items"
      patchDeep={cms.patchDeep}
      createItem={emptyFaqItem}
      addLabel="FAQ"
      renderItem={(item, qi) =>
        renderDetails(item as SiteContent["faq"]["items"][number], qi)
      }
    />
  );
}
