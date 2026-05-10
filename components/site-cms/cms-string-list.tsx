"use client";

import type { ComponentType, SVGProps } from "react";
import { useCallback, useState } from "react";

import {
  IconCompressor,
  IconManufacturing,
  IconMessageCircle,
  IconSliders,
} from "@/components/aytipanel/icons";
import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";

type IconComp = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;

/** Urutan sama seperti konten: pabrik → instalasi/refrigerasi → layanan → custom — harus di modul client (boleh dipassing sebagai komponen). */
const TENTANG_VALUES_ICONS: readonly IconComp[] = [
  IconManufacturing,
  IconCompressor,
  IconMessageCircle,
  IconSliders,
];

type Props = {
  items?: string[] | null;
  patchPath: "tentang.values";
  itemClassName: string;
  leadingIconRingClassName?: string;
};

export function CmsStringList({
  items,
  patchPath,
  itemClassName,
  leadingIconRingClassName,
}: Props) {
  const cms = useSiteCmsOptional();
  const edit = Boolean(cms?.eligible && cms.editMode);
  const safeItems = Array.isArray(items) ? items : [];
  const [local, setLocal] = useState<string[]>(() => safeItems);

  const save = useCallback(
    async (next: string[]) => {
      if (!cms) return;
      if (patchPath !== "tentang.values") return;
      await cms.patchDeep({ tentang: { values: next } });
    },
    [cms, patchPath],
  );

  const ring = leadingIconRingClassName ?? "";

  if (!edit) {
    return (
      <>
        {safeItems.map((val, i) => {
          const Icon = TENTANG_VALUES_ICONS[i];
          const row = Boolean(Icon);
          return (
            <li
              key={`${i}-${val}`}
              className={row ? `flex items-start gap-3 ${itemClassName}` : itemClassName}
            >
              {Icon ? (
                <span className={`${ring} mt-0.5 shrink-0`}>
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
              ) : null}
              {row ? <span className="min-w-0 flex-1">{val}</span> : val}
            </li>
          );
        })}
      </>
    );
  }

  return (
    <>
      {local.map((val, i) => {
        const Icon = TENTANG_VALUES_ICONS[i];
        const row = Boolean(Icon);
        return (
          <li key={i} className={row ? `flex items-start gap-3 ${itemClassName}` : itemClassName}>
            {Icon ? (
              <span className={`${ring} mt-0.5 shrink-0`}>
                <Icon className="h-4 w-4" aria-hidden />
              </span>
            ) : null}
            <input
              type="text"
              value={val}
              onChange={(e) => {
                const next = [...local];
                next[i] = e.target.value;
                setLocal(next);
              }}
              onBlur={(e) => {
                const next = [...local];
                next[i] = e.target.value;
                void save(next);
              }}
              className="min-w-0 flex-1 rounded border border-sky-400/25 bg-white/5 px-2 py-1 text-inherit outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35"
            />
          </li>
        );
      })}
    </>
  );
}
