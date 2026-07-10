"use client";

// The animated array. Each cell is a framer-motion element keyed by a stable id,
// so inserts/deletes/swaps slide into place via layout animation rather than
// snapping. Highlight state recolors borders/glow; pointers float above slots.

import { AnimatePresence, motion } from "framer-motion";
import { FitStage } from "@/components/visualizer/FitStage";
import { Icon } from "@/components/ui/Icon";
import { useVisualizerStore } from "@/lib/visualizerStore";
import type { HighlightKind } from "@/types/visualization";

const CELL = 64; // px, cell width
const GAP = 12; // px, gap between cells

// Highlight -> tailwind classes for border, text, glow.
const STYLES: Record<HighlightKind, string> = {
  active: "border-coral text-coral shadow-[0_0_18px_rgba(255,95,74,0.45)]",
  compare: "border-amber text-amber shadow-[0_0_18px_rgba(245,166,35,0.4)]",
  swap: "border-coral text-coral shadow-[0_0_22px_rgba(255,95,74,0.6)] scale-105",
  visited: "border-outline-variant text-on-surface-variant/60",
  target: "border-mint text-mint",
  found: "border-mint text-mint animate-cell-pulse",
  remove: "border-error text-error shadow-[0_0_18px_rgba(255,95,74,0.5)]",
  insert: "border-mint text-mint shadow-[0_0_20px_rgba(52,201,138,0.5)]",
};

const POINTER_DEFAULT = "#FF5F4A";

export function VisualizerCanvas() {
  const step = useVisualizerStore((s) => s.currentStep());
  const baseArray = useVisualizerStore((s) => s.baseArray);

  // Before any program runs, show the editable base array in a neutral state.
  const cells = step ? step.array : baseArray;
  const highlights = step?.highlights ?? {};
  const pointers = step?.pointers ?? [];

  const totalWidth = cells.length * CELL + Math.max(0, cells.length - 1) * GAP;

  return (
    <FitStage>
      <div className="flex flex-col items-center justify-center px-4 py-6">
      {/* Index ruler + cells */}
      <div className="relative" style={{ minHeight: 160 }}>
        {/* Pointers (rendered above the row) */}
        <div className="relative mx-auto" style={{ width: totalWidth }}>
          <div className="relative h-8">
            <AnimatePresence>
              {pointers.map((p) => {
                const left = p.index * (CELL + GAP) + CELL / 2;
                return (
                  <motion.div
                    key={p.label}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0, left }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ type: "spring", stiffness: 500, damping: 32 }}
                    className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
                    style={{ color: p.color ?? POINTER_DEFAULT }}
                  >
                    <span className="font-label-caps text-[10px] font-bold uppercase tracking-wider">
                      {p.label}
                    </span>
                    <Icon name="arrow_drop_down" className="-mt-1 text-[20px]" />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Cells */}
          <div className="flex" style={{ gap: GAP }}>
            <AnimatePresence mode="popLayout">
              {cells.map((cell, i) => {
                const hl = highlights[cell.id];
                const style = hl ? STYLES[hl] : "border-outline-variant text-on-surface";
                return (
                  <motion.div
                    key={cell.id}
                    layout
                    initial={{ opacity: 0, scale: 0.6, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.4, y: 24 }}
                    transition={{ type: "spring", stiffness: 420, damping: 30 }}
                    className="flex flex-col items-center"
                    style={{ width: CELL }}
                  >
                    <div
                      className={`flex items-center justify-center border-2 bg-surface-container/80 font-mono text-lg font-bold backdrop-blur-sm transition-colors duration-300 ${style}`}
                      style={{ width: CELL, height: CELL, borderRadius: 8 }}
                    >
                      {cell.value}
                    </div>
                    {/* Index label */}
                    <span className="mt-1.5 font-mono text-[11px] text-on-surface-variant/60">{i}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Memory-contiguity caption */}
      <p className="mt-lg max-w-md text-center font-body-sm text-body-sm text-on-surface-variant/60">
        Elements live in one contiguous block of memory — index access is O(1),
        but insert/delete must shift their neighbours.
      </p>
      </div>
    </FitStage>
  );
}
