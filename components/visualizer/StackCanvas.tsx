"use client";

// The animated stack. A vertical well, open at the top — values can only
// enter and leave through the opening (that IS the stack). A TOP pointer box
// sits to the right: array mode stores the top *index*, list mode stores the
// top node's *address*; either way it is rewired live, in sync with the
// pseudocode, exactly like the linked-list HEAD box.
//
// Array mode draws the fixed-capacity well with index labels; a pop leaves
// the old value dimmed in its slot (arrays don't erase — the next push
// overwrites). List mode draws linked nodes [data|next] with downward arrows
// to NULL. Applications add an input token strip, an output strip, side
// notes on cells (recursion frames) and a verdict badge.

import { AnimatePresence, motion } from "framer-motion";
import { FitStage } from "@/components/visualizer/FitStage";
import { useStackStore } from "@/lib/stackStore";
import type { SQCellState, StackCell, TokenChip } from "@/types/visualization";

const CELL_H = 46;
const VGAP = 10;
const SH = CELL_H + VGAP;
const FLOAT_LIFT = 64; // floating cells hover above the opening
const TOP_BOX_W = 64;
const TOP_BOX_H = 46;

const C_PTR = "#34C98A"; // mint — pointer boxes and freshly rewired links
const C_LINK = "#7a8087";

const STYLES: Record<SQCellState, string> = {
  idle: "border-outline-variant",
  active: "border-coral shadow-[0_0_16px_rgba(255,95,74,0.45)]",
  visited: "border-outline-variant opacity-40",
  new: "border-mint shadow-[0_0_18px_rgba(52,201,138,0.5)]",
  removing: "border-error shadow-[0_0_16px_rgba(255,95,74,0.5)]",
  target: "border-amber shadow-[0_0_16px_rgba(245,166,35,0.4)]",
  found: "border-mint animate-cell-pulse",
};

const TEXT: Record<SQCellState, string> = {
  idle: "text-on-surface",
  active: "text-coral",
  visited: "text-on-surface-variant/50",
  new: "text-mint",
  removing: "text-error",
  target: "text-amber",
  found: "text-mint",
};

const CHIP: Record<TokenChip["state"], string> = {
  pending: "border-outline-variant/50 text-on-surface-variant/45",
  active: "border-coral text-coral shadow-[0_0_10px_rgba(255,95,74,0.4)]",
  done: "border-outline-variant/50 text-on-surface-variant/70",
  matched: "border-mint text-mint",
  error: "border-error text-error",
};

const NODE_SPRING = { type: "spring", stiffness: 170, damping: 26 } as const;
const LINK_TWEEN = { type: "tween", duration: 0.55, ease: "easeInOut" } as const;

function PtrValue({ text }: { text: string }) {
  return (
    <motion.span
      key={text}
      initial={{ scale: 1.5, opacity: 0.3 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="font-mono text-[13px] font-bold text-mint"
    >
      {text}
    </motion.span>
  );
}

function Strip({ label, chips }: { label: string; chips: TokenChip[] }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 text-right font-label-caps text-[9px] uppercase tracking-wider text-on-surface-variant/60">{label}</span>
      <div className="flex flex-wrap gap-1">
        {chips.map((t, i) => (
          <span
            key={i}
            className={`flex h-6 min-w-6 items-center justify-center border px-1 font-mono text-[12px] transition-colors duration-300 ${CHIP[t.state]}`}
          >
            {t.text}
          </span>
        ))}
        {chips.length === 0 && <span className="font-mono text-[11px] text-on-surface-variant/40">—</span>}
      </div>
    </div>
  );
}

export function StackCanvas() {
  const step = useStackStore((s) => s.currentStep());

  const cells: StackCell[] = step?.cells ?? [];
  const rewired = step?.rewired ?? [];
  const mode = step?.mode ?? "array";
  const isList = mode === "list";
  const capacity = step?.capacity;
  const isApp = !isList && !capacity;

  const CELL_W = isList ? 116 : 110;
  const DATA_W = 64; // list mode data compartment
  const LEFT_PAD = isApp ? 190 : 84; // room for notes (apps) or index labels
  const wellSlots = capacity ?? Math.max(cells.length + 1, 5);

  const stripsH = step?.tokens ? (step.output ? 76 : 44) : 0;
  const wellTop = stripsH + FLOAT_LIFT + 26;
  const baseY = wellTop + wellSlots * SH + 4; // the floor line
  const cellX = LEFT_PAD;
  const topBoxX = cellX + CELL_W + 96;

  const contentW = topBoxX + TOP_BOX_W + 30;
  const contentH = baseY + 74;

  // y of the cell occupying stack index i (0 = bottom).
  const slotY = (i: number) => baseY - (i + 1) * SH + VGAP;
  const cellY = (c: StackCell, i: number) => (c.floating ? wellTop - FLOAT_LIFT : slotY(i));

  const topIdx = step?.top ?? -1;
  const listTopIdx = step?.topId ? cells.findIndex((c) => c.id === step.topId) : -1;
  const idIndex = new Map(cells.map((c, i) => [c.id, i]));
  const idAddr = new Map(cells.map((c) => [c.id, c.addr]));

  const topLabel = isList
    ? step?.topId
      ? `@${idAddr.get(step.topId) ?? "?"}`
      : "NULL"
    : String(topIdx);
  const topRewired = rewired.includes("TOP");

  // TOP arrow target: the top cell (or the floor when empty).
  const tgtIdx = isList ? listTopIdx : topIdx;
  const tgtCell = tgtIdx >= 0 ? cells[tgtIdx] : undefined;
  const tgtY = tgtCell ? cellY(tgtCell, tgtIdx) + CELL_H / 2 : baseY - 6;
  const topBoxY = wellTop + (wellSlots * SH) / 2 - TOP_BOX_H / 2;
  const topArrowD = `M ${topBoxX} ${topBoxY + TOP_BOX_H / 2} C ${topBoxX - 46} ${topBoxY + TOP_BOX_H / 2}, ${cellX + CELL_W + 52} ${tgtY}, ${cellX + CELL_W + 8} ${tgtY}`;

  // List-mode next links: each cell's next points DOWNWARD toward NULL.
  interface Edge {
    key: string;
    d: string;
    lit: boolean;
    dim: boolean;
  }
  const edges: Edge[] = [];
  if (isList) {
    cells.forEach((c, i) => {
      const y1 = cellY(c, i) + CELL_H;
      const x1 = cellX + DATA_W + (CELL_W - DATA_W) / 2; // below the next-compartment
      if (!c.next) {
        if (!c.floating && i === 0) {
          edges.push({ key: `${c.id}->NULL`, d: `M ${x1} ${y1} C ${x1} ${y1 + 14}, ${x1} ${y1 + 16}, ${x1} ${baseY + 20}`, lit: rewired.includes(c.id), dim: c.state === "removing" });
        }
        return;
      }
      const j = idIndex.get(c.next);
      if (j === undefined) return;
      const t = cells[j];
      const x2 = cellX + CELL_W / 2;
      const y2 = cellY(t, j) - 2;
      edges.push({
        key: `${c.id}->${c.next}`,
        d: `M ${x1} ${y1} C ${x1} ${y1 + 26}, ${x2} ${y2 - 26}, ${x2} ${y2}`,
        lit: rewired.includes(c.id),
        dim: c.state === "removing" && !rewired.includes(c.id),
      });
    });
  }

  const message = step?.message;

  return (
    <FitStage>
      <div className="relative" style={{ width: contentW, height: contentH }}>
          {/* Token strips (applications) */}
          {step?.tokens && (
            <div className="absolute left-0 right-0 flex flex-col gap-2" style={{ top: 0 }}>
              <Strip label="input" chips={step.tokens} />
              {step.output && <Strip label="output" chips={step.output} />}
            </div>
          )}

          {/* Wiring */}
          <svg className="absolute inset-0 overflow-visible" width={contentW} height={contentH}>
            <defs>
              <marker id="st-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
                <path d="M0,0 L7,3 L0,6 Z" fill={C_LINK} />
              </marker>
              <marker id="st-arrow-mint" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
                <path d="M0,0 L7,3 L0,6 Z" fill={C_PTR} />
              </marker>
            </defs>

            {/* The well (array mode): left wall, right wall, floor — open at the top */}
            {!isApp && !isList && (
              <path
                d={`M ${cellX - 10} ${wellTop - 6} L ${cellX - 10} ${baseY} L ${cellX + CELL_W + 10} ${baseY} L ${cellX + CELL_W + 10} ${wellTop - 6}`}
                fill="none"
                stroke="#7a8087"
                strokeWidth={2}
                opacity={0.55}
              />
            )}
            {/* Floor only (apps + list mode) */}
            {(isApp || isList) && (
              <line x1={cellX - 14} y1={baseY} x2={cellX + CELL_W + 14} y2={baseY} stroke="#7a8087" strokeWidth={2} opacity={0.45} />
            )}

            {/* Empty slot outlines (array mode with fixed capacity) */}
            {!isApp && !isList &&
              Array.from({ length: wellSlots }, (_, i) => i).map((i) =>
                i < cells.length ? null : (
                  <rect
                    key={`slot-${i}`}
                    x={cellX}
                    y={slotY(i)}
                    width={CELL_W}
                    height={CELL_H}
                    fill="none"
                    stroke="#7a8087"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    opacity={0.25}
                    rx={8}
                  />
                ),
              )}

            {/* TOP pointer arrow */}
            <motion.path
              key="top-arrow"
              animate={{ d: topArrowD }}
              transition={LINK_TWEEN}
              initial={false}
              fill="none"
              stroke={C_PTR}
              strokeWidth={topRewired ? 2.4 : 1.6}
              markerEnd="url(#st-arrow-mint)"
            />

            {/* List-mode next links */}
            <AnimatePresence>
              {edges.map((e) => (
                <motion.path
                  key={e.key}
                  initial={e.lit ? { d: e.d, pathLength: 0, opacity: 0 } : { d: e.d, opacity: 0 }}
                  animate={{ d: e.d, pathLength: 1, opacity: e.dim ? 0.3 : 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.3 } }}
                  transition={LINK_TWEEN}
                  fill="none"
                  stroke={e.lit ? C_PTR : C_LINK}
                  strokeWidth={e.lit ? 2.4 : 1.6}
                  markerEnd={e.lit ? "url(#st-arrow-mint)" : "url(#st-arrow)"}
                />
              ))}
            </AnimatePresence>
          </svg>

          {/* Index labels (array mode) */}
          {!isApp && !isList &&
            Array.from({ length: wellSlots }, (_, i) => i).map((i) => (
              <span
                key={`idx-${i}`}
                className={`absolute text-right font-mono text-[10px] ${i === topIdx ? "font-bold text-mint" : "text-on-surface-variant/40"}`}
                style={{ left: cellX - 46, top: slotY(i) + CELL_H / 2 - 7, width: 26 }}
              >
                {i}
              </span>
            ))}

          {/* NULL label (list mode) */}
          {isList && (
            <span className="absolute font-mono text-[12px] text-on-surface-variant/50" style={{ left: cellX + CELL_W / 2 - 16, top: baseY + 22 }}>
              NULL
            </span>
          )}

          {/* "open at the top" hint */}
          {!isApp && !isList && (
            <span className="absolute font-label-caps text-[9px] uppercase tracking-widest text-on-surface-variant/35" style={{ left: cellX, top: wellTop - 22, width: CELL_W, textAlign: "center" }}>
              ↓ in / out ↑
            </span>
          )}

          {/* Cells */}
          <AnimatePresence>
            {cells.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, scale: 0.6, left: cellX, top: cellY(c, i) - 18 }}
                animate={{ opacity: 1, scale: 1, left: cellX, top: cellY(c, i) }}
                exit={{ opacity: 0, scale: 0.5, y: -30, transition: { duration: 0.45 } }}
                transition={NODE_SPRING}
                className="absolute"
                style={{ width: CELL_W }}
              >
                <div className={`flex h-[46px] w-full items-stretch overflow-hidden rounded-lg border-2 bg-surface-container/85 font-mono backdrop-blur-sm transition-colors duration-300 ${STYLES[c.state]}`}>
                  <div className={`flex flex-1 items-center justify-center font-bold ${TEXT[c.state]}`}>
                    <span className={c.label.length > 4 ? "text-[12px]" : "text-base"}>{c.label}</span>
                  </div>
                  {isList && (
                    <div className="flex w-[46px] flex-col items-center justify-center border-l border-outline-variant/60 bg-surface-container-lowest/60 text-on-surface-variant/70">
                      <span className="text-[8px] uppercase opacity-60">next</span>
                      <motion.span
                        key={c.next ? `@${idAddr.get(c.next)}` : "NULL"}
                        initial={{ scale: 1.5, opacity: 0.3 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`text-[10px] ${rewired.includes(c.id) ? "font-bold text-mint" : ""}`}
                      >
                        {c.next ? `@${idAddr.get(c.next) ?? "?"}` : "NULL"}
                      </motion.span>
                    </div>
                  )}
                </div>
                {isList && <span className="mt-0.5 block text-center font-mono text-[9px] text-on-surface-variant/45">@{c.addr}</span>}
                {/* Side note (recursion frames, computed terms) */}
                {c.note && (
                  <motion.span
                    key={c.note}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute right-full top-1/2 -translate-y-1/2 whitespace-nowrap pr-2 font-mono text-[10px] text-amber/90"
                  >
                    {c.note} ⟶
                  </motion.span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* TOP pointer box */}
          <div className="absolute flex flex-col items-center" style={{ left: topBoxX, top: topBoxY, width: TOP_BOX_W }}>
            <div
              className={`flex h-[46px] w-full flex-col items-center justify-center gap-0.5 rounded-lg border-2 bg-surface-container/85 font-mono backdrop-blur-sm transition-shadow duration-300 ${
                topRewired ? "border-mint shadow-[0_0_18px_rgba(52,201,138,0.55)]" : "border-mint/60"
              }`}
            >
              <span className="text-[8px] uppercase tracking-wider text-mint/80">top</span>
              <PtrValue text={topLabel} />
            </div>
            <span className="mt-1 font-mono text-[10px] text-on-surface-variant/45">{isList ? "pointer" : "index"}</span>
          </div>

          {/* Verdict / result badge */}
          <AnimatePresence>
            {message && (
              <motion.div
                key={message.text}
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`absolute left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border px-4 py-1.5 font-label-caps text-[11px] tracking-wider backdrop-blur-sm ${
                  message.tone === "error"
                    ? "border-error/60 bg-error/10 text-error"
                    : message.tone === "ok"
                      ? "border-mint/60 bg-mint/10 text-mint"
                      : "border-outline-variant bg-surface-container/80 text-on-surface-variant"
                }`}
                style={{ top: baseY + 34 }}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
    </FitStage>
  );
}
