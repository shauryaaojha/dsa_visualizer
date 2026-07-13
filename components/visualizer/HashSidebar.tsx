"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { HASH_OPERATIONS, useHashStore } from "@/lib/hashStore";
import type { HashOperationId } from "@/types/visualization";

// Quick-tab → route subpath (under /topics/hashing), grouped by category.
const FUNC_TABS: { id: HashOperationId; label: string; icon: string; subpath: string }[] = [
  { id: "divisionMethod", label: "Division", icon: "percent", subpath: "hash-functions/division-method" },
  { id: "multiplicationMethod", label: "Multiply", icon: "close", subpath: "hash-functions/multiplication-method" },
  { id: "foldingMethod", label: "Folding", icon: "content_cut", subpath: "hash-functions/folding-method" },
  { id: "stringHashing", label: "String", icon: "abc", subpath: "hash-functions/string-hashing" },
];

const TABLE_TABS: { id: HashOperationId; label: string; icon: string; subpath: string }[] = [
  { id: "htInsert", label: "Insert", icon: "add_box", subpath: "hash-table/insert" },
  { id: "htSearch", label: "Search", icon: "search", subpath: "hash-table/search" },
  { id: "htDelete", label: "Delete", icon: "delete", subpath: "hash-table/delete" },
  { id: "loadFactor", label: "Load Factor", icon: "speed", subpath: "hash-table/load-factor-rehashing" },
];

const COLLISION_TABS: { id: HashOperationId; label: string; icon: string; subpath: string }[] = [
  { id: "chaining", label: "Chaining", icon: "link", subpath: "collision-resolution/separate-chaining" },
  { id: "linearProbing", label: "Linear", icon: "arrow_forward", subpath: "collision-resolution/linear-probing" },
  { id: "quadraticProbing", label: "Quadratic", icon: "moving", subpath: "collision-resolution/quadratic-probing" },
  { id: "doubleHashing", label: "Double", icon: "tag", subpath: "collision-resolution/double-hashing" },
];

const FUNC_IDS = FUNC_TABS.map((t) => t.id);
const TABLE_IDS = TABLE_TABS.map((t) => t.id);

export function HashSidebar() {
  const router = useRouter();
  const operation = useHashStore((s) => s.operation);
  const values = useHashStore((s) => s.values);
  const params = useHashStore((s) => s.params);
  const setValues = useHashStore((s) => s.setValues);
  const setParams = useHashStore((s) => s.setParams);
  const randomize = useHashStore((s) => s.randomize);
  const run = useHashStore((s) => s.run);

  const meta = HASH_OPERATIONS.find((o) => o.id === operation);
  const tabs = FUNC_IDS.includes(operation) ? FUNC_TABS : TABLE_IDS.includes(operation) ? TABLE_TABS : COLLISION_TABS;
  const heading = FUNC_IDS.includes(operation)
    ? "Hashing · Functions"
    : TABLE_IDS.includes(operation)
      ? "Hashing · Table Ops"
      : "Hashing · Collisions";

  const usesKeys = meta?.params.includes("keys") ?? false;
  const usesKey = meta?.params.includes("key") ?? false;
  const usesText = meta?.params.includes("text") ?? false;

  const [text, setText] = useState(values.join(", "));
  const editingRef = useRef(false);
  useEffect(() => {
    if (!editingRef.current) setText(values.join(", "));
  }, [values]);

  function commit(t: string) {
    const nums = t
      .split(/[\s,]+/)
      .map((x) => parseInt(x, 10))
      .filter((x) => !Number.isNaN(x) && x >= 0)
      .slice(0, 8);
    if (nums.length) setValues(nums);
  }

  function handleRun() {
    if (usesKeys) commit(text);
    run(operation, params);
  }

  return (
    <aside className="z-40 flex h-full w-72 shrink-0 flex-col border-r border-outline-variant bg-surface-container-low/95 backdrop-blur-xl overflow-y-auto scroll-thin md:bg-surface-container-low/80">
      <div className="flex flex-1 flex-col gap-md p-md">
        <div className="flex items-center gap-2 border-b border-outline-variant pb-md">
          <Icon name="tag" className="text-[16px] text-primary" />
          <h2 className="font-label-caps text-label-caps text-primary">{heading}</h2>
        </div>

        {/* Keys to hash / pre-load (manual input) */}
        {usesKeys && (
          <div>
            <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">KEYS (COMMA-SEPARATED)</label>
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
                placeholder="15, 11, 27, 8"
              />
              <button
                onClick={() => randomize(operation === "foldingMethod" ? 3 : 5)}
                title="Randomize"
                className="shrink-0 border border-outline-variant bg-surface-container px-2 text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
              >
                <Icon name="shuffle" className="text-[18px]" />
              </button>
            </div>
          </div>
        )}

        {/* Text input (string hashing) */}
        {usesText && (
          <div>
            <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">STRING (MAX 10 CHARS)</label>
            <input
              value={params.text}
              onChange={(e) => setParams({ text: e.target.value.slice(0, 10) })}
              spellCheck={false}
              maxLength={10}
              className="w-full border border-outline-variant bg-surface-container-lowest px-2 py-1.5 font-mono text-body-sm text-on-surface outline-none focus:border-primary"
              placeholder="hello"
            />
          </div>
        )}

        {/* Quick op tabs */}
        <div>
          <label className="mb-1.5 block font-label-caps text-[10px] text-on-surface-variant">OPERATIONS</label>
          <div className="grid grid-cols-2 gap-1">
            {tabs.map((t) => {
              const selected = t.id === operation;
              return (
                <button
                  key={t.id}
                  onClick={() => router.push(`/topics/hashing/${t.subpath}`)}
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

        {/* Numeric params */}
        <div className="flex gap-2">
          {usesKey && (
            <div className="flex-1">
              <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">KEY</label>
              <input
                type="number"
                min={0}
                value={params.key}
                onChange={(e) => setParams({ key: Math.abs(parseInt(e.target.value, 10) || 0) })}
                className="w-full border border-outline-variant bg-surface-container-lowest px-2 py-1.5 font-mono text-body-sm text-on-surface outline-none focus:border-primary"
              />
            </div>
          )}
          <div className="flex-1">
            <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">TABLE SIZE m</label>
            <input
              type="number"
              min={3}
              max={13}
              value={params.m}
              onChange={(e) => setParams({ m: parseInt(e.target.value, 10) || 7 })}
              className="w-full border border-outline-variant bg-surface-container-lowest px-2 py-1.5 font-mono text-body-sm text-on-surface outline-none focus:border-primary"
            />
          </div>
        </div>

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
