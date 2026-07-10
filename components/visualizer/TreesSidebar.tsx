"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { TREE_OPERATIONS, useTreesStore } from "@/lib/treesStore";
import type { TreesOperationId } from "@/types/visualization";

// Quick-tab → route subpath (under /topics/trees), grouped per tree family.
type Tab = { id: TreesOperationId; label: string; icon: string; subpath: string };

const TABS: Record<string, Tab[]> = {
  bt: [
    { id: "btInorder", label: "In-order", icon: "swap_horiz", subpath: "binary-tree/traversal/inorder" },
    { id: "btPreorder", label: "Pre-order", icon: "first_page", subpath: "binary-tree/traversal/preorder" },
    { id: "btPostorder", label: "Post-order", icon: "last_page", subpath: "binary-tree/traversal/postorder" },
    { id: "btLevelOrder", label: "Level", icon: "reorder", subpath: "binary-tree/traversal/level-order" },
    { id: "btInsert", label: "Insert", icon: "add_box", subpath: "binary-tree/insertion" },
    { id: "btDelete", label: "Delete", icon: "delete", subpath: "binary-tree/deletion" },
  ],
  bst: [
    { id: "bstTraversal", label: "Traverse", icon: "swap_horiz", subpath: "binary-search-tree/traversal" },
    { id: "bstSearch", label: "Search", icon: "search", subpath: "binary-search-tree/search" },
    { id: "bstInsert", label: "Insert", icon: "add_box", subpath: "binary-search-tree/insertion" },
    { id: "bstDelete", label: "Delete", icon: "delete", subpath: "binary-search-tree/deletion" },
  ],
  avl: [
    { id: "avlInsert", label: "Insert", icon: "add_box", subpath: "avl-tree/insertion" },
    { id: "avlDelete", label: "Delete", icon: "delete", subpath: "avl-tree/deletion" },
    { id: "avlRotLL", label: "LL Rot", icon: "rotate_right", subpath: "avl-tree/rotations/ll-rotation" },
    { id: "avlRotRR", label: "RR Rot", icon: "rotate_left", subpath: "avl-tree/rotations/rr-rotation" },
    { id: "avlRotLR", label: "LR Rot", icon: "sync", subpath: "avl-tree/rotations/lr-rotation" },
    { id: "avlRotRL", label: "RL Rot", icon: "sync", subpath: "avl-tree/rotations/rl-rotation" },
  ],
  heap: [
    { id: "heapInsert", label: "Insert", icon: "add_box", subpath: "heaps/insert" },
    { id: "heapDelete", label: "Delete", icon: "remove", subpath: "heaps/delete" },
    { id: "heapify", label: "Heapify", icon: "construction", subpath: "heaps/heapify" },
    { id: "heapSort", label: "Heap Sort", icon: "sort", subpath: "heaps/heap-sort" },
  ],
  trie: [
    { id: "trieInsert", label: "Insert", icon: "add_box", subpath: "trie/insert" },
    { id: "trieSearch", label: "Search", icon: "search", subpath: "trie/search" },
    { id: "trieDelete", label: "Delete", icon: "delete", subpath: "trie/delete" },
  ],
};

function groupOf(op: TreesOperationId): keyof typeof TABS {
  if (op.startsWith("bst")) return "bst";
  if (op.startsWith("avl")) return "avl";
  if (op.startsWith("heap")) return "heap";
  if (op.startsWith("trie")) return "trie";
  return "bt";
}

const GROUP_LABEL: Record<string, string> = {
  bt: "Binary Tree",
  bst: "Binary Search Tree",
  avl: "AVL Tree",
  heap: "Heap",
  trie: "Trie",
};

export function TreesSidebar() {
  const router = useRouter();
  const operation = useTreesStore((s) => s.operation);
  const values = useTreesStore((s) => s.values);
  const params = useTreesStore((s) => s.params);
  const setValues = useTreesStore((s) => s.setValues);
  const setParams = useTreesStore((s) => s.setParams);
  const randomize = useTreesStore((s) => s.randomize);
  const run = useTreesStore((s) => s.run);

  const group = groupOf(operation);
  const isTrie = group === "trie";
  const isRotDemo = operation.startsWith("avlRot");
  const meta = TREE_OPERATIONS.find((o) => o.id === operation);

  const [text, setText] = useState(values.join(", "));
  const editingRef = useRef(false);
  useEffect(() => {
    if (!editingRef.current) setText(values.join(", "));
  }, [values]);

  const [wordsText, setWordsText] = useState((params.words.length ? params.words : ["cat", "car", "card", "dog"]).join(", "));

  function commit(t: string) {
    const nums = t
      .split(/[\s,]+/)
      .map((x) => parseInt(x, 10))
      .filter((x) => !Number.isNaN(x))
      .slice(0, 15);
    if (nums.length) setValues(nums);
  }

  function handleRun() {
    if (isTrie) {
      const words = wordsText
        .split(/[\s,]+/)
        .map((w) => w.toLowerCase().replace(/[^a-z]/g, ""))
        .filter(Boolean)
        .slice(0, 8);
      setParams({ words });
      run(operation, { words });
      return;
    }
    if (!isRotDemo) commit(text);
    run(operation, params);
  }

  return (
    <aside className="z-40 flex h-full w-72 shrink-0 flex-col border-r border-outline-variant bg-surface-container-low/95 backdrop-blur-xl overflow-y-auto scroll-thin md:bg-surface-container-low/80">
      <div className="flex flex-1 flex-col gap-md p-md">
        <div className="flex items-center gap-2 border-b border-outline-variant pb-md">
          <Icon name="account_tree" className="text-[16px] text-primary" />
          <h2 className="font-label-caps text-label-caps text-primary">{GROUP_LABEL[group]}</h2>
        </div>

        {/* Data editor */}
        {isTrie ? (
          <div>
            <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">WORDS IN THE TRIE</label>
            <input
              value={wordsText}
              onChange={(e) => setWordsText(e.target.value)}
              spellCheck={false}
              className="w-full border border-outline-variant bg-surface-container-lowest px-2 py-1.5 font-mono text-body-sm text-on-surface outline-none focus:border-primary"
              placeholder="cat, car, card, dog"
            />
          </div>
        ) : isRotDemo ? (
          <p className="font-body-sm text-[11px] text-on-surface-variant/70">
            This page uses a fixed minimal tree so the rotation case is unmistakable. Try the AVL Insert page for rotations on bigger trees.
          </p>
        ) : (
          <div>
            <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">
              {group === "heap" ? "ARRAY (HEAP CONTENTS)" : group === "bt" ? "VALUES (LEVEL ORDER)" : "VALUES (INSERT ORDER)"}
            </label>
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
                placeholder="50, 30, 70, 20"
              />
              <button
                onClick={() => randomize(7)}
                title="Randomize"
                className="shrink-0 border border-outline-variant bg-surface-container px-2 text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
              >
                <Icon name="shuffle" className="text-[18px]" />
              </button>
            </div>
          </div>
        )}

        {/* Quick op tabs */}
        <div>
          <label className="mb-1.5 block font-label-caps text-[10px] text-on-surface-variant">OPERATIONS</label>
          <div className="grid grid-cols-3 gap-1">
            {TABS[group].map((t) => {
              const selected = t.id === operation;
              return (
                <button
                  key={t.id}
                  onClick={() => router.push(`/topics/trees/${t.subpath}`)}
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

        {/* Params */}
        {meta?.params.includes("value") && !isRotDemo && (
          <div>
            <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">VALUE</label>
            <input
              type="number"
              value={params.value}
              onChange={(e) => setParams({ value: parseInt(e.target.value, 10) || 0 })}
              className="w-full border border-outline-variant bg-surface-container-lowest px-2 py-1.5 font-mono text-body-sm text-on-surface outline-none focus:border-primary"
            />
          </div>
        )}
        {meta?.params.includes("text") && (
          <div>
            <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">WORD</label>
            <input
              value={params.text}
              onChange={(e) => setParams({ text: e.target.value })}
              spellCheck={false}
              className="w-full border border-outline-variant bg-surface-container-lowest px-2 py-1.5 font-mono text-body-sm text-on-surface outline-none focus:border-primary"
              placeholder="cart"
            />
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
