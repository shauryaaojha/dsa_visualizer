"use client";

// The hashing canvas. Three layouts share one frame shape (HashProgram.mode):
//
//   calc / open — a horizontal row of m cells with index labels; open mode adds
//                 numbered probe badges above the probed cells.
//   chaining    — a vertical column of m index slots, each owning a chain of
//                 entry boxes drawn to the right, ending in ∅.
//
// Above the table: the incoming-key chip, the worked-arithmetic panel (the
// star of this section — the hash is CALCULATED line by line, never conjured),
// and the load-factor meter. The calc area's height is reserved from the whole
// program so the layout doesn't jump between steps.

import { AnimatePresence, motion } from "framer-motion";
import { FitStage } from "@/components/visualizer/FitStage";
import { useHashStore } from "@/lib/hashStore";
import type { HashEntryVis, HashProbe, SQCellState } from "@/types/visualization";

const BORDER: Record<SQCellState, string> = {
  idle: "border-outline-variant",
  active: "border-coral shadow-[0_0_14px_rgba(255,95,74,0.35)]",
  visited: "border-outline-variant opacity-45",
  new: "border-mint shadow-[0_0_16px_rgba(52,201,138,0.5)]",
  removing: "border-error shadow-[0_0_14px_rgba(255,95,74,0.45)]",
  target: "border-amber shadow-[0_0_14px_rgba(245,166,35,0.4)]",
  found: "border-mint animate-cell-pulse",
};

const TEXT: Record<SQCellState, string> = {
  idle: "text-on-surface",
  active: "text-coral",
  visited: "text-on-surface-variant/50",
  new: "text-mint",
  removing: "text-error line-through",
  target: "text-amber",
  found: "text-mint",
};

const PROBE_STYLE: Record<HashProbe["hit"], string> = {
  occupied: "border-error bg-error/15 text-error",
  free: "border-mint bg-mint/15 text-mint",
  match: "border-mint bg-mint/15 text-mint",
  miss: "border-outline-variant text-on-surface-variant",
};

const SPRING = { type: "spring", stiffness: 200, damping: 26 } as const;

function EntryBox({ e, wide }: { e: HashEntryVis; wide?: boolean }) {
  return (
    <motion.div
      layout
      key={e.id}
      initial={{ opacity: 0, scale: 0.7, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={SPRING}
      className={`flex flex-col items-center justify-center rounded border-2 bg-surface-container/85 px-2 backdrop-blur-sm transition-colors duration-300 ${BORDER[e.state]}`}
      style={{ minWidth: wide ? 64 : 48, height: 38 }}
    >
      <span className={`font-mono text-[12px] font-bold ${TEXT[e.state]}`}>{e.key}</span>
      {e.note && <span className="font-mono text-[8px] text-on-surface-variant/60">{e.note}</span>}
    </motion.div>
  );
}

export function HashCanvas() {
  const step = useHashStore((s) => s.currentStep());
  const program = useHashStore((s) => s.program);

  if (!step || !program) return <FitStage>{null}</FitStage>;

  const mode = program.mode;
  const slots = step.slots;

  // Reserve the calc panel's tallest extent across the WHOLE program so the
  // table doesn't shift vertically as lines appear.
  const maxCalcLines = Math.max(0, ...program.steps.map((s) => s.calc?.lines.length ?? 0));
  const hasCalc = maxCalcLines > 0;
  const hasLoad = program.steps.some((s) => s.load);
  const hasIncoming = program.steps.some((s) => s.incoming);

  // Latest probe per slot index wins the badge.
  const probeBySlot = new Map<number, HashProbe>();
  step.probes?.forEach((p) => probeBySlot.set(p.index, p));

  const alpha = step.load ? step.load.n / step.load.m : 0;

  return (
    <FitStage>
      <div className="flex flex-col items-start gap-5 p-2">
        {/* ── Header: incoming chip · calc panel · load meter ─────────────── */}
        {(hasCalc || hasLoad || hasIncoming) && (
          <div className="flex items-start gap-6" style={{ minHeight: hasCalc ? maxCalcLines * 19 + 42 : 44 }}>
            {hasIncoming && (
              <div className="flex w-28 shrink-0 flex-col items-center gap-1 pt-1">
                <span className="font-label-caps text-[9px] uppercase tracking-widest text-on-surface-variant/40">incoming key</span>
                <AnimatePresence mode="popLayout">
                  {step.incoming ? (
                    <motion.span
                      key={step.incoming.key}
                      initial={{ opacity: 0, y: -12, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={SPRING}
                      className="rounded-full border-2 border-coral bg-coral/10 px-3 py-1 font-mono text-[13px] font-bold text-coral"
                    >
                      {step.incoming.key}
                    </motion.span>
                  ) : (
                    <span className="px-3 py-1 font-mono text-[13px] text-on-surface-variant/30">—</span>
                  )}
                </AnimatePresence>
              </div>
            )}

            {hasCalc && (
              <div className="min-w-[300px] rounded-lg border border-outline-variant/70 bg-surface-container/70 px-3 py-2 backdrop-blur-sm">
                <p className="mb-1 font-label-caps text-[9px] uppercase tracking-widest text-on-surface-variant/50">
                  {step.calc ? step.calc.title : "hash calculation"}
                </p>
                {step.calc ? (
                  step.calc.lines.map((l, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`whitespace-pre px-1.5 font-mono text-[12px] leading-[19px] ${
                        l.state === "active"
                          ? "bg-amber/10 text-amber shadow-[inset_2px_0_0_#F5A623]"
                          : "text-on-surface-variant/70"
                      }`}
                    >
                      {l.text}
                    </motion.p>
                  ))
                ) : (
                  <p className="px-1.5 font-mono text-[12px] text-on-surface-variant/30">…</p>
                )}
              </div>
            )}

            {hasLoad && step.load && (
              <div className="w-44 shrink-0 pt-1">
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="font-label-caps text-[9px] uppercase tracking-widest text-on-surface-variant/40">load factor</span>
                  <span className={`font-mono text-[11px] font-bold ${alpha > 0.75 ? "text-error" : "text-mint"}`}>
                    α = {step.load.n}/{step.load.m} = {alpha.toFixed(2)}
                  </span>
                </div>
                <div className="relative h-2.5 overflow-hidden rounded-full border border-outline-variant/60 bg-surface-container-lowest">
                  <motion.div
                    animate={{ width: `${Math.min(alpha, 1) * 100}%` }}
                    transition={{ type: "tween", duration: 0.5 }}
                    className={`h-full ${alpha > 0.75 ? "bg-error/70" : "bg-mint/60"}`}
                  />
                  {/* 0.75 threshold tick */}
                  <div className="absolute top-0 h-full w-px bg-amber" style={{ left: "75%" }} />
                </div>
                <p className="mt-0.5 text-right font-mono text-[8px] text-amber/70">rehash at 0.75</p>
              </div>
            )}
          </div>
        )}

        {/* ── The table ────────────────────────────────────────────────────── */}
        {mode === "chaining" ? (
          <div className="flex flex-col gap-2">
            {slots.map((slot) => (
              <div key={slot.index} className="flex items-center gap-3" style={{ minHeight: 42 }}>
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded border-2 bg-surface-container-lowest/70 font-mono text-[12px] font-bold transition-colors duration-300 ${BORDER[slot.state]} ${slot.state === "idle" ? "text-on-surface-variant/60" : TEXT[slot.state]}`}
                >
                  {slot.index}
                </div>
                <div className="flex items-center gap-1.5">
                  <AnimatePresence mode="popLayout">
                    {slot.entries.map((e) => (
                      <motion.div
                        key={e.id}
                        layout
                        initial={{ opacity: 0, scale: 0.7, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={SPRING}
                        className="flex items-center gap-1.5"
                      >
                        <div
                          className={`flex flex-col items-center justify-center rounded border-2 bg-surface-container/85 px-2 backdrop-blur-sm transition-colors duration-300 ${BORDER[e.state]}`}
                          style={{ minWidth: 64, height: 38 }}
                        >
                          <span className={`font-mono text-[12px] font-bold ${TEXT[e.state]}`}>{e.key}</span>
                          {e.note && <span className="font-mono text-[8px] text-on-surface-variant/60">{e.note}</span>}
                        </div>
                        <span className="font-mono text-[12px] text-on-surface-variant/40">→</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <span className="font-mono text-[13px] text-on-surface-variant/30">∅</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {/* Probe badges (open addressing) */}
            {mode === "open" && (
              <div className="flex gap-1.5" style={{ height: 26 }}>
                {slots.map((slot) => {
                  const p = probeBySlot.get(slot.index);
                  return (
                    <div key={slot.index} className="flex w-14 items-start justify-center">
                      <AnimatePresence>
                        {p && (
                          <motion.span
                            key={`${p.index}-${p.order}`}
                            initial={{ opacity: 0, y: 8, scale: 0.7 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className={`flex h-5 w-5 items-center justify-center rounded-full border font-mono text-[10px] font-bold ${PROBE_STYLE[p.hit]}`}
                            title={`probe i = ${p.order}`}
                          >
                            {p.order}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex gap-1.5">
              {slots.map((slot) => (
                <div
                  key={slot.index}
                  className={`flex h-14 w-14 items-center justify-center rounded border-2 bg-surface-container/80 backdrop-blur-sm transition-colors duration-300 ${BORDER[slot.state]}`}
                >
                  <AnimatePresence mode="popLayout">
                    {slot.entries.map((e) => (
                      <EntryBox key={e.id} e={e} />
                    ))}
                  </AnimatePresence>
                  {slot.entries.length === 0 && (
                    <span className="font-mono text-[12px] text-on-surface-variant/25">—</span>
                  )}
                </div>
              ))}
            </div>

            {/* Index labels */}
            <div className="flex gap-1.5">
              {slots.map((slot) => (
                <span key={slot.index} className="w-14 text-center font-mono text-[10px] text-on-surface-variant/50">
                  {slot.index}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Verdict badge (height reserved so the table never shifts) ───── */}
        <div className="flex h-9 w-full items-center justify-center">
          <AnimatePresence>
            {step.message && (
              <motion.span
                key={step.message.text}
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`flex items-center rounded-full border px-4 py-1.5 font-label-caps text-[11px] tracking-wider backdrop-blur-sm ${
                  step.message.tone === "error"
                    ? "border-error/60 bg-error/10 text-error"
                    : step.message.tone === "ok"
                      ? "border-mint/60 bg-mint/10 text-mint"
                      : "border-outline-variant bg-surface-container/80 text-on-surface-variant"
                }`}
              >
                {step.message.text}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </FitStage>
  );
}
