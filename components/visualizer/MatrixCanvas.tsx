"use client";

// Renders the current matrix frame: one or more named grids side by side
// (multiplication shows A, B and C). Cells recolor by highlight; framer-motion
// fades value changes.

import { motion } from "framer-motion";
import { useMatrixStore } from "@/lib/matrixStore";
import type { HighlightKind, MatrixGrid } from "@/types/visualization";

const STYLES: Record<HighlightKind, string> = {
  active: "border-primary/60 text-on-surface",
  compare: "border-amber text-amber shadow-[0_0_14px_rgba(245,166,35,0.4)]",
  swap: "border-coral text-coral shadow-[0_0_14px_rgba(255,95,74,0.5)]",
  visited: "border-outline-variant text-on-surface-variant/40",
  target: "border-amber text-amber",
  found: "border-mint text-mint shadow-[0_0_14px_rgba(52,201,138,0.4)]",
  remove: "border-error text-error",
  insert: "border-mint text-mint shadow-[0_0_16px_rgba(52,201,138,0.5)]",
};

function Grid({ grid }: { grid: MatrixGrid }) {
  const cols = grid.cells[0]?.length ?? 0;
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="font-label-caps text-[10px] text-on-surface-variant/70">{grid.label}</span>
      <div
        className="grid gap-1 rounded-lg border border-outline-variant/50 bg-surface-container/40 p-2 backdrop-blur-sm"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {grid.cells.flatMap((row) =>
          row.map((cell) => {
            const hl = grid.highlights[cell.id];
            const style = hl ? STYLES[hl] : "border-outline-variant/60 text-on-surface";
            return (
              <motion.div
                key={cell.id}
                layout
                className={`flex h-10 w-10 items-center justify-center border-2 bg-surface-container/70 font-mono text-sm font-bold transition-colors duration-200 ${style}`}
                style={{ borderRadius: 6 }}
              >
                <motion.span key={cell.value} initial={{ opacity: 0.3, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                  {cell.value}
                </motion.span>
              </motion.div>
            );
          }),
        )}
      </div>
    </div>
  );
}

export function MatrixCanvas() {
  const step = useMatrixStore((s) => s.currentStep());
  const a = useMatrixStore((s) => s.a);

  const grids: MatrixGrid[] = step
    ? step.grids
    : [{ label: "Matrix", cells: a, highlights: {} }];

  return (
    <div className="flex w-full flex-col items-center justify-center gap-lg px-lg">
      <div className="flex flex-wrap items-start justify-center gap-xl">
        {grids.map((g, i) => (
          <Grid key={g.label + i} grid={g} />
        ))}
      </div>
      <p className="max-w-md text-center font-body-sm text-body-sm text-on-surface-variant/60">
        A matrix is an array of arrays — laid out row-major in one contiguous block of memory.
      </p>
    </div>
  );
}
