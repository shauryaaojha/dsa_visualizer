"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useTreeStore } from "@/lib/treeStore";
import { QuickOpTabs } from "@/components/layout/QuickOpTabs";

/** Control rail for divide & conquer (recursion-tree) visualizers. */
export function TreeSidebar() {
  const values = useTreeStore((s) => s.values);
  const setValues = useTreeStore((s) => s.setValues);
  const randomize = useTreeStore((s) => s.randomize);
  const run = useTreeStore((s) => s.run);

  const [text, setText] = useState(values.join(", "));
  const editingRef = useRef(false);

  useEffect(() => {
    if (!editingRef.current) setText(values.join(", "));
  }, [values]);

  function commit(t: string) {
    const nums = t
      .split(/[\s,]+/)
      .map((x) => parseInt(x, 10))
      .filter((n) => !Number.isNaN(n))
      .slice(0, 12);
    if (nums.length) setValues(nums);
  }

  return (
    <aside className="z-40 hidden w-72 shrink-0 flex-col border-r border-outline-variant bg-surface-container-low/80 backdrop-blur-xl md:flex overflow-y-auto scroll-thin">
      <div className="flex flex-1 flex-col gap-md p-md">
        <div className="flex items-center gap-2 border-b border-outline-variant pb-md">
          <Icon name="account_tree" className="text-[16px] text-primary" />
          <h2 className="font-label-caps text-label-caps text-primary">Divide &amp; Conquer</h2>
        </div>

        <div>
          <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">ARRAY</label>
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
              placeholder="38, 27, 43, 3"
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

        <button
          onClick={() => {
            commit(text);
            run();
          }}
          className="flex items-center justify-center gap-2 bg-primary-container py-2.5 font-label-caps text-label-caps text-surface transition-transform hover:bg-opacity-90 active:scale-[0.98]"
        >
          <Icon name="play_circle" className="text-[18px]" /> Run
        </button>

        <div className="rounded-lg border border-outline-variant/60 bg-surface-container/40 p-sm">
          <p className="mb-1 flex items-center gap-1.5 font-label-caps text-[10px] text-on-surface-variant">
            <Icon name="account_tree" className="text-[14px]" /> How to read it
          </p>
          <p className="font-body-sm text-[11px] leading-relaxed text-on-surface-variant/70">
            The array splits into left &amp; right subarrays down the tree, then
            combines back up. <span className="text-amber">Amber</span> = dividing,{" "}
            <span className="text-coral">coral</span> = working,{" "}
            <span className="text-mint">mint</span> = sorted.
          </p>
        </div>

        <div className="border-t border-outline-variant pt-md">
          <QuickOpTabs />
        </div>
      </div>
    </aside>
  );
}
