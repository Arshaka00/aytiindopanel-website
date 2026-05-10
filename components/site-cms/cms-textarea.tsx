"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";

type Props = {
  path: string;
  text: string;
  className?: string;
  rows?: number;
};

export function CmsTextarea({ path, text, className, rows = 4 }: Props) {
  const cms = useSiteCmsOptional();
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const dirty = useRef(false);
  const edit = Boolean(cms?.eligible && cms.editMode);

  useLayoutEffect(() => {
    const el = taRef.current;
    if (!el || !edit) return;
    if (!dirty.current && el.value !== text) el.value = text;
  }, [text, edit]);

  const commit = useCallback(async () => {
    if (!cms) return;
    const el = taRef.current;
    const next = el?.value ?? "";
    if (next.trim() === text.trim()) {
      dirty.current = false;
      return;
    }
    try {
      await cms.patchContent(path, next);
    } catch (e) {
      console.error(e);
      if (el) el.value = text;
    } finally {
      dirty.current = false;
    }
  }, [cms, path, text]);

  if (!cms?.eligible || !edit) {
    return (
      <span className={className}>
        {text.split("\n").map((line, i) => (
          <span key={i}>
            {i > 0 ? <br /> : null}
            {line}
          </span>
        ))}
      </span>
    );
  }

  return (
    <textarea
      ref={taRef}
      defaultValue={text}
      rows={rows}
      onChange={() => {
        dirty.current = true;
      }}
      onBlur={() => void commit()}
      className={`${className ?? ""} w-full rounded-lg border border-sky-400/35 bg-white/5 px-2 py-1.5 text-inherit outline-none ring-sky-400/30 focus-visible:ring-2`}
    />
  );
}
