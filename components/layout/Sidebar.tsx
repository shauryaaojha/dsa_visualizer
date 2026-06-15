"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { ARRAY_OPERATIONS, useVisualizerStore } from "@/lib/visualizerStore";
import { QuickOpTabs } from "@/components/layout/QuickOpTabs";

export function Sidebar() {
  const baseArray = useVisualizerStore((s) => s.baseArray);
  const operation = useVisualizerStore((s) => s.operation);
  const storeParams = useVisualizerStore((s) => s.params);
  const setBaseArray = useVisualizerStore((s) => s.setBaseArray);
  const setParams = useVisualizerStore((s) => s.setParams);
  const randomize = useVisualizerStore((s) => s.randomize);
  const run = useVisualizerStore((s) => s.run);

  const [arrayText, setArrayText] = useState(baseArray.map((c) => c.value).join(", "));
  const editingRef = useRef(false);

  useEffect(() => {
    if (!editingRef.current) setArrayText(baseArray.map((c) => c.value).join(", "));
  }, [baseArray]);

  const index = storeParams.index;
  const value = storeParams.value;

  const meta = useMemo(
    () => ARRAY_OPERATIONS.find((o) => o.id === operation) ?? ARRAY_OPERATIONS[0],
    [operation],
  );

  function commitArray(text: string) {
    const values = text
      .split(/[\s,]+/)
      .map((t) => parseInt(t, 10))
      .filter((n) => !Number.isNaN(n))
      .slice(0, 16);
    if (values.length) setBaseArray(values);
  }

  function handleRun() {
    commitArray(arrayText);
    run(operation, { index, value });
  }

  return (
    <aside className="z-40 flex h-full w-72 shrink-0 flex-col border-r border-outline-variant bg-surface-container-low/95 backdrop-blur-xl overflow-y-auto scroll-thin md:bg-surface-container-low/80">
      <div className="p-md flex flex-col gap-md flex-1">
        <div className="flex items-center gap-2 border-b border-outline-variant pb-md">
          <Icon name="experiment" className="text-[16px] text-primary" />
          <h2 className="font-label-caps text-label-caps text-primary">Experiment</h2>
        </div>

        {/* Array editor */}
        <div>
          <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">ARRAY</label>
          <div className="flex gap-1.5">
            <input
              value={arrayText}
              onFocus={() => (editingRef.current = true)}
              onChange={(e) => setArrayText(e.target.value)}
              onBlur={(e) => {
                editingRef.current = false;
                commitArray(e.target.value);
              }}
              spellCheck={false}
              className="min-w-0 flex-1 border border-outline-variant bg-surface-container-lowest px-2 py-1.5 font-mono text-body-sm text-on-surface outline-none focus:border-primary"
              placeholder="8, 3, 17, 5"
            />
            <button
              onClick={() => randomize(8)}
              title="Randomize"
              className="shrink-0 border border-outline-variant bg-surface-container px-2 text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
            >
              <Icon name="shuffle" className="text-[18px]" />
            </button>
          </div>
        </div>

        <QuickOpTabs />

        {/* Params */}
        {(meta.params.includes("index") || meta.params.includes("value")) && (
          <div className="flex gap-2">
            {meta.params.includes("index") && (
              <div className="flex-1">
                <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">INDEX</label>
                <input
                  type="number"
                  value={index}
                  onChange={(e) => setParams({ index: parseInt(e.target.value, 10) || 0 })}
                  className="w-full border border-outline-variant bg-surface-container-lowest px-2 py-1.5 font-mono text-body-sm text-on-surface outline-none focus:border-primary"
                />
              </div>
            )}
            {meta.params.includes("value") && (
              <div className="flex-1">
                <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">VALUE</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setParams({ value: parseInt(e.target.value, 10) || 0 })}
                  className="w-full border border-outline-variant bg-surface-container-lowest px-2 py-1.5 font-mono text-body-sm text-on-surface outline-none focus:border-primary"
                />
              </div>
            )}
          </div>
        )}

        <p className="font-body-sm text-[11px] text-on-surface-variant/70">{meta.hint}</p>

        <button
          onClick={handleRun}
          className="flex w-full items-center justify-center gap-2 bg-primary-container py-2.5 font-label-caps text-label-caps text-surface transition-transform hover:bg-opacity-90 active:scale-[0.98]"
        >
          <Icon name="play_circle" className="text-[18px]" />
          Re-run
        </button>
      </div>
    </aside>
  );
}
