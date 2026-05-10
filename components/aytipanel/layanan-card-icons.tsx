import type { ComponentType } from "react";

import {
  IconColdChain,
  IconCompressor,
  IconLogistics,
  IconManufacturing,
  IconPhone,
  IconProcessComplete,
  IconProcessConsult,
  IconProcessInstall,
  IconRetail,
  IconSliders,
  IconSnowflake,
} from "@/components/aytipanel/icons";

type IconComp = ComponentType<{ className?: string }>;

/** Dua ikon per kartu — selaras makna judul / slug folder default. */
const BY_FOLDER: Record<string, readonly [IconComp, IconComp]> = {
  "konsultasi-desain-sistem": [IconProcessConsult, IconSliders],
  "produksi-panel-pu-eps": [IconManufacturing, IconColdChain],
  "instalasi-sistem-pendingin": [IconLogistics, IconRetail],
  "instalasi-panel-cold-room": [IconProcessInstall, IconManufacturing],
  "testing-commissioning": [IconSnowflake, IconCompressor],
  "maintenance-after-sales": [IconProcessComplete, IconPhone],
};

const FALLBACK: readonly [IconComp, IconComp] = [IconColdChain, IconSnowflake];

function pairFromTitle(title: string): readonly [IconComp, IconComp] {
  const t = title.toLowerCase();
  if (t.includes("konsultasi") || t.includes("desain")) return [IconProcessConsult, IconSliders];
  if (t.includes("produksi") && (t.includes("panel") || t.includes("sandwich")))
    return [IconManufacturing, IconColdChain];
  if (t.includes("pintu") || t.includes("loading")) return [IconLogistics, IconRetail];
  if (t.includes("instalasi") && t.includes("sandwich")) return [IconProcessInstall, IconManufacturing];
  if (t.includes("pendingin") || t.includes("commissioning")) return [IconSnowflake, IconCompressor];
  if (t.includes("purna") || t.includes("after sales") || t.includes("maintenance"))
    return [IconProcessComplete, IconPhone];
  return FALLBACK;
}

export function layananIconPairForCard(folderSlug: string, title: string): readonly [IconComp, IconComp] {
  return BY_FOLDER[folderSlug] ?? pairFromTitle(title);
}

export function LayananIconStrip({
  folderSlug,
  title,
  badgeClassName,
  iconClassName = "size-[52%] text-sky-800/95 dark:text-sky-200/95",
}: {
  folderSlug: string;
  title: string;
  badgeClassName: string;
  iconClassName?: string;
}) {
  const [A, B] = layananIconPairForCard(folderSlug, title);
  return (
    <div className="relative z-[3] flex min-w-0 flex-wrap items-center justify-center gap-1.5 md:gap-2">
      <div className={`${badgeClassName} touch-manipulation`} aria-hidden>
        <span className="flex h-full w-full items-center justify-center">
          <A className={iconClassName} />
        </span>
      </div>
      <div className={`${badgeClassName} touch-manipulation`} aria-hidden>
        <span className="flex h-full w-full items-center justify-center">
          <B className={iconClassName} />
        </span>
      </div>
    </div>
  );
}
