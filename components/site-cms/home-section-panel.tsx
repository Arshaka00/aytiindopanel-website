"use client";

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCallback, useEffect, useMemo, useState } from "react";

import { DEFAULT_HOME_LAYOUT } from "@/lib/home-layout-defaults";
import { nestValueAtPath } from "@/lib/cms-nest-patch";
import type { SiteContent } from "@/lib/site-content-model";
import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";

const SECTION_LABELS: Record<string, string> = {
  beranda: "Hero",
  tentang: "Tentang",
  layanan: "Layanan",
  produk: "Produk",
  "service-maintenance": "Service & maintenance",
  proyek: "Gallery proyek",
  "customers-partners": "Partner & industri",
  keunggulan: "Keunggulan",
  faq: "FAQ",
  kontak: "Kontak",
};

function SectionRow({
  id,
  label,
  hidden,
  onToggleHidden,
}: {
  id: string;
  label: string;
  hidden: boolean;
  onToggleHidden: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-2 rounded-lg border border-white/10 bg-slate-950/40 p-2 ${
        isDragging ? "opacity-95 shadow-lg ring-2 ring-sky-400/40" : ""
      }`}
    >
      <button
        type="button"
        className="mt-0.5 inline-flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg border border-sky-500/35 bg-slate-950/90 text-[10px] font-bold text-sky-200"
        aria-label="Seret untuk mengurutkan"
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <span className="truncate text-sm text-slate-100">{label}</span>
        <label className="flex shrink-0 items-center gap-1.5 text-[10px] text-slate-400">
          <input
            type="checkbox"
            checked={hidden}
            onChange={() => onToggleHidden(id)}
            className="rounded border-white/30"
          />
          Sembunyi
        </label>
      </div>
    </div>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
};

export function HomeSectionPanel({ open, onClose }: Props) {
  const cms = useSiteCmsOptional();
  const [content, setContent] = useState<SiteContent | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (!open) return;
    void (async () => {
      try {
        const r = await fetch("/api/site-content");
        const j = (await r.json().catch(() => ({}))) as { content?: SiteContent };
        setContent(j.content ?? null);
      } catch {
        setContent(null);
      }
    })();
  }, [open]);

  const layout = content?.homeLayout ?? DEFAULT_HOME_LAYOUT;
  const order = useMemo(
    () =>
      layout.sectionOrder?.length ? [...layout.sectionOrder] : [...DEFAULT_HOME_LAYOUT.sectionOrder],
    [layout.sectionOrder],
  );
  const hidden = useMemo(() => new Set(layout.hiddenSections ?? []), [layout.hiddenSections]);

  const persistLayout = useCallback(
    async (next: Partial<NonNullable<SiteContent["homeLayout"]>>) => {
      if (!cms) return;
      await cms.patchDeep(
        nestValueAtPath("homeLayout", {
          sectionOrder: layout.sectionOrder ?? DEFAULT_HOME_LAYOUT.sectionOrder,
          hiddenSections: layout.hiddenSections ?? [],
          ...next,
        }),
      );
    },
    [cms, layout],
  );

  const onDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = order.indexOf(String(active.id));
      const newIndex = order.indexOf(String(over.id));
      if (oldIndex < 0 || newIndex < 0) return;
      const nextOrder = arrayMove(order, oldIndex, newIndex);
      await persistLayout({ sectionOrder: nextOrder });
    },
    [order, persistLayout],
  );

  const toggleHidden = (sectionId: string) => {
    const next = new Set(hidden);
    if (next.has(sectionId)) next.delete(sectionId);
    else next.add(sectionId);
    void persistLayout({ hiddenSections: [...next] });
  };

  if (!open || !cms) return null;

  return (
    <div
      className="fixed inset-0 z-[60300] flex items-center justify-center bg-black/55 p-3 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="home-panel-title"
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 id="home-panel-title" className="text-sm font-semibold text-white">
              Section beranda
            </h2>
            <p className="text-[11px] text-slate-400">Seret ⋮⋮ untuk mengurutkan.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 px-2 py-1 text-xs text-slate-200"
          >
            Tutup
          </button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => void onDragEnd(e)}>
          <SortableContext items={order} strategy={verticalListSortingStrategy}>
            <ul className="mt-4 space-y-2">
              {order.map((sid) => (
                <li key={sid}>
                  <SectionRow
                    id={sid}
                    label={SECTION_LABELS[sid] ?? sid}
                    hidden={hidden.has(sid)}
                    onToggleHidden={toggleHidden}
                  />
                </li>
              ))}
            </ul>
          </SortableContext>
        </DndContext>

        <p className="mt-3 text-[10px] leading-snug text-slate-500">
          Menyimpan ke konten situs. Toast &quot;Tersimpan&quot; mengonfirmasi.
        </p>
      </div>
    </div>
  );
}
