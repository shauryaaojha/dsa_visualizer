"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { LL_OPERATIONS, useLinkedListStore } from "@/lib/linkedListStore";
import type { LLKind, LLOperationId } from "@/types/visualization";

// Quick-tab → route subpath (under /topics/linked-list/<kind>-linked-list).
const TABS: { id: LLOperationId; label: string; icon: string; subpath: string }[] = [
  { id: "traverse", label: "Traverse", icon: "linear_scale", subpath: "traversal" },
  { id: "insertBegin", label: "Ins Begin", icon: "first_page", subpath: "insertion/insert-begin" },
  { id: "insertEnd", label: "Ins End", icon: "last_page", subpath: "insertion/insert-end" },
  { id: "insertPosition", label: "Ins Pos", icon: "add_box", subpath: "insertion/insert-position" },
  { id: "deleteBegin", label: "Del Begin", icon: "first_page", subpath: "deletion/delete-begin" },
  { id: "deleteEnd", label: "Del End", icon: "last_page", subpath: "deletion/delete-end" },
  { id: "deletePosition", label: "Del Pos", icon: "delete", subpath: "deletion/delete-position" },
];

const KIND_LABEL: Record<LLKind, string> = {
  singly: "Singly Linked List",
  doubly: "Doubly Linked List",
  circular: "Circular Linked List",
};

export function LinkedListSidebar() {
  const router = useRouter();
  const kind = useLinkedListStore((s) => s.kind);
  const operation = useLinkedListStore((s) => s.operation);
  const values = useLinkedListStore((s) => s.values);
  const params = useLinkedListStore((s) => s.params);
  const setValues = useLinkedListStore((s) => s.setValues);
  const setParams = useLinkedListStore((s) => s.setParams);
  const randomize = useLinkedListStore((s) => s.randomize);
  const run = useLinkedListStore((s) => s.run);

  const isJosephus = operation === "josephus";
  const isPolynomial = operation === "polynomial";
  const isApp = isJosephus || isPolynomial;

  const meta = LL_OPERATIONS.find((o) => o.id === operation);
  const listLabel = isJosephus ? "PEOPLE" : isPolynomial ? "COEFFICIENTS (c₀ c₁ …)" : "LIST";

  const [text, setText] = useState(values.join(", "));
  const editingRef = useRef(false);
  useEffect(() => {
    if (!editingRef.current) setText(values.join(", "));
  }, [values]);

  function commit(t: string) {
    const nums = t
      .split(/[\s,]+/)
      .map((x) => parseInt(x, 10))
      .filter((x) => !Number.isNaN(x))
      .slice(0, 12);
    if (nums.length) setValues(nums);
  }

  function handleRun() {
    commit(text);
    run(operation, params);
  }

  return (
    <aside className="z-40 flex h-full w-72 shrink-0 flex-col border-r border-outline-variant bg-surface-container-low/95 backdrop-blur-xl overflow-y-auto scroll-thin md:bg-surface-container-low/80">
      <div className="flex flex-1 flex-col gap-md p-md">
        <div className="flex items-center gap-2 border-b border-outline-variant pb-md">
          <Icon name="link" className="text-[16px] text-primary" />
          <h2 className="font-label-caps text-label-caps text-primary">
            {isApp ? (isJosephus ? "Josephus" : "Polynomial") : KIND_LABEL[kind]}
          </h2>
        </div>

        {/* List editor */}
        <div>
          <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">{listLabel}</label>
          <div className="flex gap-1.5">
            <input
              value={text}
              onFocus={() => (editingRef.current = true)}
              onChange={(e) => setText(e.target.value)}
              onBlur={(e) => {
                editingRef.current = false;
                commit(e.target.value);
              }}
              spellCheck={false}
              className="min-w-0 flex-1 border border-outline-variant bg-surface-container-lowest px-2 py-1.5 font-mono text-body-sm text-on-surface outline-none focus:border-primary"
              placeholder="10, 20, 30"
            />
            <button
              onClick={() => randomize(5)}
              title="Randomize"
              className="shrink-0 border border-outline-variant bg-surface-container px-2 text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
            >
              <Icon name="shuffle" className="text-[18px]" />
            </button>
          </div>
        </div>

        {/* Quick op tabs (list ops only) */}
        {!isApp && (
          <div>
            <label className="mb-1.5 block font-label-caps text-[10px] text-on-surface-variant">OPERATIONS</label>
            <div className="grid grid-cols-3 gap-1">
              {TABS.map((t) => {
                const selected = t.id === operation;
                const href = `/topics/linked-list/${kind}-linked-list/${t.subpath}`;
                return (
                  <button
                    key={t.id}
                    onClick={() => router.push(href)}
                    title={t.label}
                    className={`flex flex-col items-center gap-0.5 border px-1 py-1.5 transition-colors ${
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-outline-variant text-on-surface-variant hover:border-primary/60 hover:text-on-surface"
                    }`}
                  >
                    <Icon name={t.icon} className="text-[16px]" />
                    <span className="text-center font-label-caps text-[8px] leading-tight">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Params */}
        {(isJosephus || meta?.params.includes("index") || meta?.params.includes("value")) && (
          <div className="flex gap-2">
            {meta?.params.includes("index") && (
              <div className="flex-1">
                <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">POSITION</label>
                <input
                  type="number"
                  value={params.index}
                  onChange={(e) => setParams({ index: parseInt(e.target.value, 10) || 0 })}
                  className="w-full border border-outline-variant bg-surface-container-lowest px-2 py-1.5 font-mono text-body-sm text-on-surface outline-none focus:border-primary"
                />
              </div>
            )}
            {(isJosephus || meta?.params.includes("value")) && (
              <div className="flex-1">
                <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">
                  {isJosephus ? "STEP (k)" : "VALUE"}
                </label>
                <input
                  type="number"
                  value={params.value}
                  onChange={(e) => setParams({ value: parseInt(e.target.value, 10) || 0 })}
                  className="w-full border border-outline-variant bg-surface-container-lowest px-2 py-1.5 font-mono text-body-sm text-on-surface outline-none focus:border-primary"
                />
              </div>
            )}
          </div>
        )}

        {meta && <p className="font-body-sm text-[11px] text-on-surface-variant/70">{meta.hint}</p>}

        <button
          onClick={handleRun}
          className="flex w-full items-center justify-center gap-2 bg-primary-container py-2.5 font-label-caps text-label-caps text-surface transition-transform hover:bg-opacity-90 active:scale-[0.98]"
        >
          <Icon name="play_circle" className="text-[18px]" /> Re-run
        </button>
      </div>
    </aside>
  );
}
