"use client";

// The glass machine. Three panes make the invisible visible for first-time
// programmers: MEMORY (labeled variable boxes with type badges — values
// overwritten with a flash), the CONSOLE (output accumulating line by line),
// and, on the complexity pages, STEP TILES (every unit of work drops a tile,
// so cost is something you watch pile up). The program itself lives in the
// pseudocode panel on the right, with the program counter highlighting the
// running line.

import { AnimatePresence, motion } from "framer-motion";
import { FitStage } from "@/components/visualizer/FitStage";
import { useFoundationsStore } from "@/lib/foundationsStore";
import type { FoundVar, SQCellState } from "@/types/visualization";

const BOX_STYLES: Record<SQCellState, string> = {
  idle: "border-outline-variant",
  active: "border-coral shadow-[0_0_16px_rgba(255,95,74,0.45)]",
  visited: "border-outline-variant opacity-60",
  new: "border-mint shadow-[0_0_18px_rgba(52,201,138,0.5)]",
  removing: "border-error shadow-[0_0_16px_rgba(255,95,74,0.5)]",
  target: "border-amber shadow-[0_0_16px_rgba(245,166,35,0.4)]",
  found: "border-mint animate-cell-pulse",
};

const TYPE_BADGE: Record<FoundVar["type"], { label: string; cls: string }> = {
  number: { label: "number", cls: "border-amber/50 bg-amber/10 text-amber" },
  string: { label: "string", cls: "border-tertiary/50 bg-tertiary/10 text-tertiary" },
  boolean: { label: "boolean", cls: "border-mint/50 bg-mint/10 text-mint" },
};

function VarBox({ v }: { v: FoundVar }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.6, y: -14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className={`flex w-[128px] flex-col items-center rounded-lg border-2 bg-surface-container/85 px-2 pb-2 pt-1.5 font-mono backdrop-blur-sm transition-colors duration-300 ${BOX_STYLES[v.state]}`}
    >
      <span className="mb-1 text-[11px] font-bold tracking-wide text-on-surface-variant/80">{v.name}</span>
      <motion.span
        key={v.value}
        initial={{ scale: 1.5, opacity: 0.3 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`text-[17px] font-bold ${v.state === "removing" ? "text-error" : v.state === "new" ? "text-mint" : "text-on-surface"}`}
      >
        {v.value}
      </motion.span>
      <span className={`mt-1.5 rounded-full border px-2 py-px text-[8px] uppercase tracking-wider ${TYPE_BADGE[v.type].cls}`}>
        {TYPE_BADGE[v.type].label}
      </span>
    </motion.div>
  );
}

export function FoundationsCanvas() {
  const step = useFoundationsStore((s) => s.currentStep());

  const vars = step?.vars ?? [];
  const consoleLines = step?.consoleLines ?? [];
  const counters = step?.counters;
  const message = step?.message;

  return (
    <FitStage>
      <div className="flex w-[600px] max-w-full flex-col gap-4 px-2">
        {/* MEMORY */}
        <div className="rounded-xl border border-outline-variant/70 bg-surface-container-low/50 p-4 backdrop-blur-sm">
          <p className="mb-3 font-label-caps text-[10px] tracking-widest text-on-surface-variant/60">
            MEMORY — every variable is a labeled box
          </p>
          <div className="flex min-h-[86px] flex-wrap items-start gap-3">
            <AnimatePresence>
              {vars.map((v) => (
                <VarBox key={v.name} v={v} />
              ))}
            </AnimatePresence>
            {vars.length === 0 && (
              <span className="self-center font-mono text-[11px] text-on-surface-variant/40">
                (empty — no variables created yet)
              </span>
            )}
          </div>
        </div>

        {/* STEP TILES (complexity pages) */}
        {counters && counters.length > 0 && (
          <div className="rounded-xl border border-outline-variant/70 bg-surface-container-low/50 p-4 backdrop-blur-sm">
            <p className="mb-3 font-label-caps text-[10px] tracking-widest text-on-surface-variant/60">
              WORK DONE — one tile per step
            </p>
            <div className="flex flex-col gap-2.5">
              {counters.map((c) => (
                <div key={c.label} className="flex items-start gap-3">
                  <span className={`w-24 shrink-0 pt-0.5 text-right font-mono text-[11px] ${c.active ? "font-bold text-on-surface" : "text-on-surface-variant/60"}`}>
                    {c.label}
                  </span>
                  <div className="flex max-w-[380px] flex-wrap content-start gap-[3px]">
                    {Array.from({ length: Math.min(c.steps, 256) }, (_, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25, delay: Math.min(i * 0.012, 0.5) }}
                        className="inline-block rounded-[2px]"
                        style={{
                          width: c.steps > 64 ? 7 : 11,
                          height: c.steps > 64 ? 7 : 11,
                          backgroundColor: c.color,
                          opacity: 0.85,
                        }}
                      />
                    ))}
                  </div>
                  <span className="shrink-0 self-center font-mono text-[11px] text-on-surface-variant/70">
                    {c.steps}
                    {c.note ? ` · ${c.note}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONSOLE */}
        <div className="rounded-xl border border-outline-variant/70 bg-surface-container-lowest/80 p-4 backdrop-blur-sm">
          <p className="mb-2 font-label-caps text-[10px] tracking-widest text-on-surface-variant/60">
            CONSOLE — what the program says back
          </p>
          <div className="min-h-[64px] font-mono text-[13px] leading-[1.8]">
            {consoleLines.map((l, i) => (
              <motion.div
                key={`${i}-${l}`}
                initial={i === consoleLines.length - 1 ? { opacity: 0, x: -8 } : false}
                animate={{ opacity: 1, x: 0 }}
                className={i === consoleLines.length - 1 ? "text-mint" : "text-on-surface-variant/70"}
              >
                <span className="mr-2 select-none text-on-surface-variant/30">&gt;</span>
                {l}
              </motion.div>
            ))}
            {consoleLines.length === 0 && (
              <span className="text-on-surface-variant/40">
                <span className="mr-2">&gt;</span>
                <span className="animate-pulse">▍</span> nothing printed yet
              </span>
            )}
          </div>
        </div>

        {/* Message badge */}
        <AnimatePresence>
          {message && (
            <motion.div
              key={message.text}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`flex items-center self-center rounded-full border px-4 py-1.5 font-label-caps text-[11px] tracking-wider backdrop-blur-sm ${
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
