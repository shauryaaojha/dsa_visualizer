"use client";

// The animated string: rows of character cells (an array wearing quotes) with
// floating cursors, an optional letter-frequency tally table (anagram-style
// problems) and an output strip. Cells keep stable ids so swaps slide.

import { AnimatePresence, motion } from "framer-motion";
import { FitStage } from "@/components/visualizer/FitStage";
import { useStringStore } from "@/lib/stringStore";
import type { SQCellState, TokenChip } from "@/types/visualization";

const CELL = 44;
const GAP = 8;
const ROW_GAP = 64;
const TOP = 44; // pointer band per row

const STYLES: Record<SQCellState, string> = {
  idle: "border-outline-variant",
  active: "border-coral text-coral shadow-[0_0_14px_rgba(255,95,74,0.45)]",
  visited: "border-outline-variant opacity-45",
  new: "border-mint text-mint shadow-[0_0_14px_rgba(52,201,138,0.5)]",
  removing: "border-error text-error shadow-[0_0_14px_rgba(255,95,74,0.5)]",
  target: "border-amber text-amber shadow-[0_0_14px_rgba(245,166,35,0.4)]",
  found: "border-mint text-mint animate-cell-pulse",
};

const CHIP: Record<TokenChip["state"], string> = {
  pending: "border-outline-variant/50 text-on-surface-variant/45",
  active: "border-coral text-coral",
  done: "border-outline-variant/50 text-on-surface-variant/70",
  matched: "border-mint text-mint",
  error: "border-error text-error",
};

const SPRING = { type: "spring", stiffness: 240, damping: 24 } as const;

export function StringCanvas() {
  const step = useStringStore((s) => s.currentStep());

  const rows = step?.rows ?? [];
  const pointers = step?.pointers ?? [];
  const freq = step?.freq;
  const output = step?.output;
  const message = step?.message;

  const maxLen = Math.max(1, ...rows.map((r) => r.chars.length));
  const rowsW = 44 + maxLen * (CELL + GAP);
  const rowsH = rows.length * (TOP + CELL + ROW_GAP - 44);
  const contentW = Math.max(rowsW, 380);

  const cellX = (i: number) => 44 + i * (CELL + GAP);
  const rowY = (r: number) => TOP + r * (CELL + ROW_GAP);

  return (
    <FitStage>
      <div className="flex flex-col items-center gap-5 px-2">
        {/* Character rows */}
        <div className="relative" style={{ width: contentW, height: rowsH + 30 }}>
          {rows.map((row, ri) => (
            <div key={ri}>
              {row.label && (
                <span className="absolute font-mono text-[12px] text-on-surface-variant/50" style={{ left: 8, top: rowY(ri) + CELL / 2 - 9 }}>
                  {row.label}
                </span>
              )}
              <AnimatePresence>
                {row.chars.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, scale: 0.6, left: cellX(i), top: rowY(ri) }}
                    animate={{ opacity: 1, scale: 1, left: cellX(i), top: rowY(ri) }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={SPRING}
                    className={`absolute flex items-center justify-center rounded-lg border-2 bg-surface-container/85 font-mono text-[16px] font-bold backdrop-blur-sm transition-colors duration-300 text-on-surface ${STYLES[c.state]}`}
                    style={{ width: CELL, height: CELL }}
                  >
                    {c.ch === " " ? "␣" : c.ch}
                  </motion.div>
                ))}
              </AnimatePresence>
              {/* index ruler */}
              {row.chars.map((_, i) => (
                <span key={`ix-${ri}-${i}`} className="absolute text-center font-mono text-[9px] text-on-surface-variant/35" style={{ left: cellX(i), top: rowY(ri) + CELL + 4, width: CELL }}>
                  {i}
                </span>
              ))}
            </div>
          ))}

          {/* Floating pointers */}
          <AnimatePresence>
            {pointers.map((p) => (
              <motion.div
                key={`${p.label}-${p.row}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0, left: cellX(p.index) + CELL / 2, top: rowY(p.row) - 32 }}
                exit={{ opacity: 0 }}
                transition={SPRING}
                className="absolute flex -translate-x-1/2 flex-col items-center"
                style={{ color: p.color ?? "#FF5F4A" }}
              >
                <span className="font-label-caps text-[10px] font-bold uppercase tracking-wider">{p.label}</span>
                <span className="material-symbols-outlined -mt-1 text-[18px]">arrow_drop_down</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Letter tally table */}
        {freq && freq.length > 0 && (
          <div className="rounded-xl border border-outline-variant/70 bg-surface-container-low/50 px-4 py-3 backdrop-blur-sm">
            <p className="mb-2 text-center font-label-caps text-[9px] tracking-widest text-on-surface-variant/60">LETTER TALLY</p>
            <div className="flex max-w-[520px] flex-wrap justify-center gap-1.5">
              {freq.map((f) => (
                <div
                  key={f.key}
                  className={`flex flex-col items-center rounded border-2 bg-surface-container/70 px-2 py-1 font-mono transition-colors duration-300 ${STYLES[f.state]}`}
                >
                  <span className="text-[13px] font-bold text-on-surface">{f.key}</span>
                  <motion.span key={`${f.a}-${f.b}`} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="text-[10px] text-on-surface-variant/70">
                    {f.b === undefined ? f.a : `${f.a}·${f.b}`}
                  </motion.span>
                </div>
              ))}
            </div>
            {freq.some((f) => f.b !== undefined) && (
              <p className="mt-1.5 text-center font-mono text-[9px] text-on-surface-variant/40">count in s · count in t</p>
            )}
          </div>
        )}

        {/* Output strip */}
        {output && (
          <div className="flex items-center gap-2">
            <span className="font-label-caps text-[9px] uppercase tracking-wider text-on-surface-variant/60">{output.label}</span>
            <div className="flex flex-wrap gap-1">
              {output.chips.map((t, i) => (
                <span key={i} className={`flex h-7 min-w-7 items-center justify-center border px-1.5 font-mono text-[13px] transition-colors duration-300 ${CHIP[t.state]}`}>
                  {t.text}
                </span>
              ))}
              {output.chips.length === 0 && <span className="font-mono text-[11px] text-on-surface-variant/40">(empty)</span>}
            </div>
          </div>
        )}

        {/* Message badge */}
        <AnimatePresence>
          {message && (
            <motion.div
              key={message.text}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`flex items-center rounded-full border px-4 py-1.5 font-label-caps text-[11px] tracking-wider backdrop-blur-sm ${
                message.tone === "error"
                  ? "border-error/60 bg-error/10 text-error"
                  : message.tone === "ok"
                    ? "border-mint/60 bg-mint/10 text-mint"
                    : "border-outline-variant bg-surface-container/80 text-on-surface-variant"
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FitStage>
  );
}
