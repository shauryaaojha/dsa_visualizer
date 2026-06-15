"use client";

import { Icon } from "@/components/ui/Icon";
import { useMatrixStore } from "@/lib/matrixStore";
import { QuickOpTabs } from "@/components/layout/QuickOpTabs";

/** Control rail for matrix visualizers: dimensions, randomize, run. */
export function MatrixSidebar() {
  const operation = useMatrixStore((s) => s.operation);
  const rows = useMatrixStore((s) => s.rows);
  const cols = useMatrixStore((s) => s.cols);
  const p = useMatrixStore((s) => s.p);
  const setDims = useMatrixStore((s) => s.setDims);
  const randomize = useMatrixStore((s) => s.randomize);
  const run = useMatrixStore((s) => s.run);

  const isMul = operation === "multiplication";
  const clamp = (n: number) => Math.max(1, Math.min(6, n || 1));

  return (
    <aside className="z-40 hidden w-72 shrink-0 flex-col border-r border-outline-variant bg-surface-container-low/80 backdrop-blur-xl md:flex overflow-y-auto scroll-thin">
      <div className="flex flex-1 flex-col gap-md p-md">
        <div className="flex items-center gap-2 border-b border-outline-variant pb-md">
          <Icon name="grid_on" className="text-[16px] text-primary" />
          <h2 className="font-label-caps text-label-caps text-primary">Matrix Setup</h2>
        </div>

        <Stepper label={isMul ? "A ROWS (m)" : "ROWS"} value={rows} onChange={(v) => setDims(clamp(v), cols, p)} />
        <Stepper label={isMul ? "A COLS / B ROWS (n)" : "COLS"} value={cols} onChange={(v) => setDims(rows, clamp(v), p)} />
        {isMul && <Stepper label="B COLS (p)" value={p} onChange={(v) => setDims(rows, cols, clamp(v))} />}

        <button
          onClick={randomize}
          className="flex items-center justify-center gap-2 border border-outline-variant bg-surface-container py-2 font-label-caps text-label-caps text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
        >
          <Icon name="shuffle" className="text-[18px]" /> Randomize
        </button>

        <button
          onClick={run}
          className="flex items-center justify-center gap-2 bg-primary-container py-2.5 font-label-caps text-label-caps text-surface transition-transform hover:bg-opacity-90 active:scale-[0.98]"
        >
          <Icon name="play_circle" className="text-[18px]" /> Run
        </button>

        <p className="font-body-sm text-[11px] text-on-surface-variant/70">
          Matrices are generated randomly at the chosen dimensions. Press Run to animate.
        </p>

        <div className="border-t border-outline-variant pt-md">
          <QuickOpTabs />
        </div>
      </div>
    </aside>
  );
}

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">{label}</label>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(value - 1)}
          className="flex h-8 w-8 items-center justify-center border border-outline-variant text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
        >
          <Icon name="remove" className="text-[16px]" />
        </button>
        <span className="flex-1 text-center font-mono text-body-md text-on-surface">{value}</span>
        <button
          onClick={() => onChange(value + 1)}
          className="flex h-8 w-8 items-center justify-center border border-outline-variant text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
        >
          <Icon name="add" className="text-[16px]" />
        </button>
      </div>
    </div>
  );
}
