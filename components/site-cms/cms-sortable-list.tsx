"use client";

import type { DraggableAttributes } from "@dnd-kit/core";
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
import { useCallback } from "react";

import { nestValueAtPath } from "@/lib/cms-nest-patch";
import { newCmsId } from "@/lib/cms-item-factories";

type PatchDeep = (patch: Record<string, unknown>) => Promise<void>;

type Props<T extends { id: string }> = {
  /** Pakai `NoInfer` agar `T` diinfer dari `createItem`, bukan dari bentuk longgar `items`. */
  items: readonly NoInfer<T>[];
  patchPath: string;
  patchDeep: PatchDeep;
  createItem: () => T;
  renderItem: (item: T, index: number) => React.ReactNode;
  addLabel?: string;
  /** Default true — set false untuk pengurutan saja (mis. urutan section beranda). */
  showAdd?: boolean;
};

function DragHandle({
  listeners,
  attributes,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listeners?: any;
  attributes?: DraggableAttributes;
}) {
  return (
    <button
      type="button"
      className="cms-drag-handle mt-0.5 inline-flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg border border-sky-500/35 bg-slate-950/90 text-[10px] font-bold text-sky-200 shadow-sm active:cursor-grabbing md:h-9 md:w-9"
      aria-label="Seret untuk mengurutkan"
      {...attributes}
      {...listeners}
    >
      ⋮⋮
    </button>
  );
}

function SortableRow({
  id,
  children,
}: {
  id: string;
  children: (args: {
    listeners?: Record<string, unknown>;
    attributes: DraggableAttributes;
  }) => React.ReactNode;
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
      className={isDragging ? "opacity-95 shadow-lg ring-2 ring-sky-400/40" : ""}
    >
      {children({ listeners, attributes })}
    </div>
  );
}

export function CmsSortableList<T extends { id: string }>({
  items,
  patchPath,
  patchDeep,
  createItem,
  renderItem,
  addLabel = "Tambah item",
  showAdd = true,
}: Props<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = items.map((i) => i.id);

  const persist = useCallback(
    async (next: T[]) => {
      await patchDeep(nestValueAtPath(patchPath, next));
    },
    [patchDeep, patchPath],
  );

  const onDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = ids.indexOf(String(active.id));
      const newIndex = ids.indexOf(String(over.id));
      if (oldIndex < 0 || newIndex < 0) return;
      const next = arrayMove([...items], oldIndex, newIndex);
      await persist(next);
    },
    [ids, items, persist],
  );

  const onAdd = useCallback(async () => {
    await persist([...items, createItem()]);
  }, [createItem, items, persist]);

  const onRemove = useCallback(
    async (removeId: string) => {
      await persist(items.filter((i) => i.id !== removeId) as T[]);
    },
    [items, persist],
  );

  const onDuplicate = useCallback(
    async (item: T) => {
      const dup = JSON.parse(JSON.stringify(item)) as T;
      dup.id = newCmsId("dup");
      const idx = items.findIndex((i) => i.id === item.id);
      const next = [...items];
      next.splice(idx + 1, 0, dup);
      await persist(next);
    },
    [items, persist],
  );

  return (
    <div className="cms-sortable-root space-y-2">
      {showAdd ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void onAdd()}
            className="rounded-lg border border-emerald-500/40 bg-emerald-950/50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-100 shadow-sm hover:bg-emerald-900/60"
          >
            + {addLabel}
          </button>
        </div>
      ) : null}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => void onDragEnd(e)}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {items.map((item, index) => (
            <SortableRow key={item.id} id={item.id}>
              {({ listeners, attributes }) => (
                <div className="flex gap-2 rounded-lg border border-white/10 bg-slate-950/40 p-2 backdrop-blur-sm md:gap-3">
                  <DragHandle listeners={listeners} attributes={attributes} />
                  <div className="min-w-0 flex-1">{renderItem(item, index)}</div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <button
                      type="button"
                      className="rounded-md border border-white/15 px-2 py-1 text-[10px] font-semibold text-slate-200 hover:bg-white/10"
                      onClick={() => void onDuplicate(item)}
                    >
                      Duplikat
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-red-500/35 px-2 py-1 text-[10px] font-semibold text-red-200 hover:bg-red-950/50"
                      onClick={() => void onRemove(item.id)}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              )}
            </SortableRow>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
