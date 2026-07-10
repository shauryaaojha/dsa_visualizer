"use client";

// The animated queue. Three layouts share one frame shape:
//
//  row  — horizontal slots with FRONT / REAR pointer boxes whose stored
//         indices are rewired live (mirroring the linked-list HEAD box).
//         The simple queue draws its fixed capacity with dashed empties and
//         marks dequeued slots with ✕ — the "drift" that motivates the ring.
//  ring — the circular queue: N slots on a circle, F/R tags orbiting, the
//         modulo wrap visible as the tags jump past 12 o'clock.
//  heap — the priority queue: the implicit binary tree drawn above its
//         backing array; sift-up/down swaps animate because nodes keep ids.
//
// Cells being enqueued/dequeued float out of the structure while in transit.

import { AnimatePresence, motion } from "framer-motion";
import { FitStage } from "@/components/visualizer/FitStage";
import { useQueueStore } from "@/lib/queueStore";
import type { QueueCell, SQCellState } from "@/types/visualization";

const CELL_W = 64;
const CELL_H = 54;
const GAP = 14;
const FLOAT_LIFT = 62;
const BOX_W = 64;
const BOX_H = 46;

const C_FRONT = "#34C98A"; // mint
const C_REAR = "#F5A623"; // amber

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

const NODE_SPRING = { type: "spring", stiffness: 170, damping: 26 } as const;
const LINK_TWEEN = { type: "tween", duration: 0.55, ease: "easeInOut" } as const;

function PtrBox({
  label,
  value,
  color,
  lit,
  x,
  y,
}: {
  label: string;
  value: string;
  color: string;
  lit: boolean;
  x: number;
  y: number;
}) {
  return (
    <div className="absolute flex flex-col items-center" style={{ left: x, top: y, width: BOX_W }}>
      <div
        className={`flex w-full flex-col items-center justify-center gap-0.5 rounded-lg border-2 bg-surface-container/85 font-mono backdrop-blur-sm transition-shadow duration-300`}
        style={{
          height: BOX_H,
          borderColor: color,
          boxShadow: lit ? `0 0 18px ${color}88` : undefined,
          opacity: lit ? 1 : 0.85,
        }}
      >
        <span className="text-[8px] uppercase tracking-wider" style={{ color }}>
          {label}
        </span>
        <motion.span
          key={value}
          initial={{ scale: 1.5, opacity: 0.3 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-[13px] font-bold"
          style={{ color }}
        >
          {value}
        </motion.span>
      </div>
      <span className="mt-1 font-mono text-[10px] text-on-surface-variant/45">index</span>
    </div>
  );
}

function CellBox({ c, w = CELL_W, showPriority }: { c: QueueCell; w?: number; showPriority?: boolean }) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-lg border-2 bg-surface-container/85 font-mono backdrop-blur-sm transition-colors duration-300 ${STYLES[c.state]}`}
      style={{ width: w, height: CELL_H }}
    >
      <span className={`font-bold ${TEXT[c.state]} ${c.label.length > 3 ? "text-[13px]" : "text-base"}`}>{c.label}</span>
      {showPriority && c.priority !== undefined && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border border-amber/70 bg-surface-container px-1 text-[9px] font-bold text-amber">
          p{c.priority}
        </span>
      )}
    </div>
  );
}

export function QueueCanvas() {
  const step = useQueueStore((s) => s.currentStep());
  const kind = useQueueStore((s) => s.program?.kind ?? s.kind);

  const slots = step?.slots ?? [];
  const layout = step?.layout ?? "row";
  const front = step?.front ?? -1;
  const rear = step?.rear ?? -1;
  const rewired = step?.rewired ?? [];
  const message = step?.message;

  // ---------- ROW ----------
  if (layout === "row") {
    const n = slots.length;
    const H_PAD = 90;
    const rowY = FLOAT_LIFT + 40;
    const SLOT = CELL_W + GAP;
    const xLeft = (i: number) => H_PAD + i * SLOT;
    const contentW = H_PAD * 2 + Math.max(1, n) * SLOT - GAP;
    const ptrY = rowY + CELL_H + 78;
    const contentH = ptrY + BOX_H + 66;
    const showPrio = kind === "pqArray";

    const frontX = H_PAD - 8;
    const rearX = contentW - H_PAD - BOX_W + 8;

    const arrow = (bx: number, idx: number, sway: number) => {
      const x2 = xLeft(idx) + CELL_W / 2;
      const y2 = rowY + CELL_H + 6;
      const x1 = bx + BOX_W / 2;
      const y1 = ptrY - 2;
      return `M ${x1} ${y1} C ${x1 + sway} ${y1 - 40}, ${x2} ${y2 + 36}, ${x2} ${y2}`;
    };

    return (
      <FitStage>
          <div className="relative" style={{ width: contentW, height: contentH }}>
            <svg className="absolute inset-0 overflow-visible" width={contentW} height={contentH}>
              <defs>
                <marker id="q-arrow-mint" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
                  <path d="M0,0 L7,3 L0,6 Z" fill={C_FRONT} />
                </marker>
                <marker id="q-arrow-amber" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
                  <path d="M0,0 L7,3 L0,6 Z" fill={C_REAR} />
                </marker>
              </defs>
              {/* dashed outlines for fixed empty slots */}
              {slots.map((c, i) =>
                c ? null : (
                  <rect key={`slot-${i}`} x={xLeft(i)} y={rowY} width={CELL_W} height={CELL_H} rx={8} fill="none" stroke="#7a8087" strokeWidth={1} strokeDasharray="4 4" opacity={0.25} />
                ),
              )}
              {front >= 0 && front < n && (
                <motion.path animate={{ d: arrow(frontX, front, 30) }} transition={LINK_TWEEN} initial={false} fill="none" stroke={C_FRONT} strokeWidth={rewired.includes("FRONT") ? 2.4 : 1.6} markerEnd="url(#q-arrow-mint)" />
              )}
              {rear >= 0 && rear < n && (
                <motion.path animate={{ d: arrow(rearX, rear, -30) }} transition={LINK_TWEEN} initial={false} fill="none" stroke={C_REAR} strokeWidth={rewired.includes("REAR") ? 2.4 : 1.6} markerEnd="url(#q-arrow-amber)" />
              )}
            </svg>

            {/* wasted-slot marks (simple queue drift) */}
            {kind === "simple" &&
              front > 0 &&
              slots.map((c, i) =>
                !c && i < front ? (
                  <span key={`waste-${i}`} className="absolute flex items-center justify-center font-mono text-[16px] text-error/50" style={{ left: xLeft(i), top: rowY, width: CELL_W, height: CELL_H }}>
                    ✕
                  </span>
                ) : null,
              )}

            {/* index labels */}
            {slots.map((_, i) => (
              <span key={`idx-${i}`} className={`absolute text-center font-mono text-[10px] ${i === front ? "font-bold text-mint" : i === rear ? "font-bold text-amber" : "text-on-surface-variant/40"}`} style={{ left: xLeft(i), top: rowY - 20, width: CELL_W }}>
                {i}
              </span>
            ))}

            {/* direction hints */}
            <span className="absolute font-label-caps text-[9px] uppercase tracking-widest text-on-surface-variant/35" style={{ left: xLeft(0), top: rowY + CELL_H + 10 }}>
              ← out (front)
            </span>
            <span className="absolute font-label-caps text-[9px] uppercase tracking-widest text-on-surface-variant/35" style={{ right: contentW - xLeft(n - 1) - CELL_W, top: rowY + CELL_H + 10 }}>
              in (rear) →
            </span>

            {/* cells */}
            <AnimatePresence>
              {slots.map((c, i) =>
                c ? (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, scale: 0.6, left: xLeft(i), top: rowY - 18 }}
                    animate={{ opacity: 1, scale: 1, left: xLeft(i), top: c.floating ? rowY - FLOAT_LIFT : rowY }}
                    exit={{ opacity: 0, scale: 0.5, y: -30, transition: { duration: 0.45 } }}
                    transition={NODE_SPRING}
                    className="absolute"
                  >
                    <CellBox c={c} showPriority={showPrio} />
                  </motion.div>
                ) : null,
              )}
            </AnimatePresence>

            <PtrBox label="front" value={String(front)} color={C_FRONT} lit={rewired.includes("FRONT")} x={frontX} y={ptrY} />
            <PtrBox label="rear" value={String(rear)} color={C_REAR} lit={rewired.includes("REAR")} x={rearX} y={ptrY} />

            <AnimatePresence>
              {message && (
                <motion.div key={message.text} initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} className={`absolute left-1/2 flex -translate-x-1/2 items-center rounded-full border px-4 py-1.5 font-label-caps text-[11px] tracking-wider backdrop-blur-sm ${message.tone === "error" ? "border-error/60 bg-error/10 text-error" : message.tone === "ok" ? "border-mint/60 bg-mint/10 text-mint" : "border-outline-variant bg-surface-container/80 text-on-surface-variant"}`} style={{ top: ptrY + BOX_H + 24 }}>
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
      </FitStage>
    );
  }

  // ---------- RING ----------
  if (layout === "ring") {
    const N = Math.max(1, slots.length);
    const R = 96 + N * 8;
    const CW = 56;
    const CH = 44;
    const cx0 = R + 150;
    const cy0 = R + 90;
    const contentW = cx0 + R + 150;
    const contentH = cy0 + R + 110;

    const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / N;
    const posX = (i: number, r: number) => cx0 + r * Math.cos(angle(i));
    const posY = (i: number, r: number) => cy0 + r * Math.sin(angle(i));

    return (
      <FitStage>
          <div className="relative" style={{ width: contentW, height: contentH }}>
            {/* ring guide + rotation hint */}
            <svg className="absolute inset-0 overflow-visible" width={contentW} height={contentH}>
              <circle cx={cx0} cy={cy0} r={R} fill="none" stroke="#7a8087" strokeWidth={1} strokeDasharray="3 5" opacity={0.3} />
              {/* wrap direction arrow at 12 o'clock */}
              <path d={`M ${cx0 - 18} ${cy0 - R - 14} A ${R + 14} ${R + 14} 0 0 1 ${cx0 + 18} ${cy0 - R - 14}`} fill="none" stroke="#7a8087" strokeWidth={1.4} opacity={0.5} markerEnd="url(#qr-dir)" />
              <defs>
                <marker id="qr-dir" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#7a8087" opacity={0.6} />
                </marker>
              </defs>
            </svg>
            <span className="absolute font-mono text-[9px] text-on-surface-variant/40" style={{ left: cx0 + 24, top: cy0 - R - 26 }}>
              (i + 1) % {N}
            </span>

            {/* slots */}
            {slots.map((c, i) => {
              const lift = c?.floating ? 34 : 0;
              const x = posX(i, R + lift) - CW / 2;
              const y = posY(i, R + lift) - CH / 2;
              return (
                <div key={`ring-slot-${i}`}>
                  {/* empty slot outline */}
                  {!c && (
                    <div className="absolute rounded-lg border border-dashed border-outline-variant/40" style={{ left: posX(i, R) - CW / 2, top: posY(i, R) - CH / 2, width: CW, height: CH }} />
                  )}
                  {/* index label just inside the ring */}
                  <span className={`absolute font-mono text-[10px] ${i === front ? "font-bold text-mint" : i === rear ? "font-bold text-amber" : "text-on-surface-variant/40"}`} style={{ left: posX(i, R - 42) - 8, top: posY(i, R - 42) - 8, width: 16, textAlign: "center" }}>
                    {i}
                  </span>
                  {c && (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1, left: x, top: y }}
                      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.45 } }}
                      transition={NODE_SPRING}
                      className="absolute"
                    >
                      <CellBox c={c} w={CW} />
                    </motion.div>
                  )}
                </div>
              );
            })}

            {/* F / R orbit tags */}
            {front >= 0 && (
              <motion.div animate={{ left: posX(front, R + 52) - 22, top: posY(front, R + 52) - 10 }} transition={NODE_SPRING} className="absolute flex items-center font-label-caps text-[10px] font-bold tracking-wider" style={{ color: C_FRONT, width: 44, justifyContent: "center" }}>
                FRONT
              </motion.div>
            )}
            {rear >= 0 && (
              <motion.div animate={{ left: posX(rear, R + 76) - 20, top: posY(rear, R + 76) - 10 }} transition={NODE_SPRING} className="absolute flex items-center font-label-caps text-[10px] font-bold tracking-wider" style={{ color: C_REAR, width: 40, justifyContent: "center" }}>
                REAR
              </motion.div>
            )}

            {/* numeric pointer boxes */}
            <PtrBox label="front" value={String(front)} color={C_FRONT} lit={rewired.includes("FRONT")} x={16} y={cy0 - BOX_H - 12} />
            <PtrBox label="rear" value={String(rear)} color={C_REAR} lit={rewired.includes("REAR")} x={16} y={cy0 + 12} />

            <AnimatePresence>
              {message && (
                <motion.div key={message.text} initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} className={`absolute left-1/2 flex -translate-x-1/2 items-center rounded-full border px-4 py-1.5 font-label-caps text-[11px] tracking-wider backdrop-blur-sm ${message.tone === "error" ? "border-error/60 bg-error/10 text-error" : message.tone === "ok" ? "border-mint/60 bg-mint/10 text-mint" : "border-outline-variant bg-surface-container/80 text-on-surface-variant"}`} style={{ top: cy0 + R + 64 }}>
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
      </FitStage>
    );
  }

  // ---------- HEAP ----------
  const cells = slots.filter((c): c is QueueCell => !!c);
  const n = cells.length;
  const depth = (i: number) => Math.floor(Math.log2(i + 1));
  const levels = n > 0 ? depth(n - 1) + 1 : 1;
  const TREE_W = Math.max(360, 2 ** (levels - 1) * 84);
  const LVL_H = 84;
  const NODE_R = 24;
  const H_PAD2 = 60;
  const treeTop = FLOAT_LIFT + 30;
  const nodeX = (i: number) => {
    const d = depth(i);
    const k = i - (2 ** d - 1);
    return H_PAD2 + (TREE_W * (k + 1)) / (2 ** d + 1);
  };
  const nodeY = (i: number, c?: QueueCell) => treeTop + depth(i) * LVL_H - (c?.floating ? FLOAT_LIFT : 0);
  const arrY = treeTop + levels * LVL_H + 30;
  const AW = 46;
  const arrX = (i: number) => H_PAD2 + TREE_W / 2 - (n * (AW + 6)) / 2 + i * (AW + 6);
  const contentW = TREE_W + H_PAD2 * 2;
  const contentH = arrY + CELL_H + 90;

  return (
    <FitStage>
        <div className="relative" style={{ width: contentW, height: contentH }}>
          {/* tree edges */}
          <svg className="absolute inset-0 overflow-visible" width={contentW} height={contentH}>
            {cells.map((c, i) => {
              if (i === 0) return null;
              const p = (i - 1) >> 1;
              return (
                <motion.line
                  key={`edge-${i}`}
                  animate={{ x1: nodeX(p), y1: nodeY(p, cells[p]) + NODE_R, x2: nodeX(i), y2: nodeY(i, c) - NODE_R }}
                  transition={LINK_TWEEN}
                  initial={false}
                  stroke="#7a8087"
                  strokeWidth={1.4}
                  opacity={0.5}
                />
              );
            })}
          </svg>

          {/* tree nodes */}
          <AnimatePresence>
            {cells.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, scale: 0.5, left: nodeX(i) - NODE_R, top: nodeY(i, c) - NODE_R }}
                animate={{ opacity: 1, scale: 1, left: nodeX(i) - NODE_R, top: nodeY(i, c) - NODE_R }}
                exit={{ opacity: 0, scale: 0.4, y: -26, transition: { duration: 0.45 } }}
                transition={NODE_SPRING}
                className={`absolute flex items-center justify-center rounded-full border-2 bg-surface-container/90 font-mono text-[14px] font-bold backdrop-blur-sm transition-colors duration-300 ${STYLES[c.state]} ${TEXT[c.state]}`}
                style={{ width: NODE_R * 2, height: NODE_R * 2 }}
              >
                {c.label}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* backing array */}
          <span className="absolute font-label-caps text-[9px] uppercase tracking-widest text-on-surface-variant/40" style={{ left: arrX(0), top: arrY - 18 }}>
            backing array — children of i at 2i+1, 2i+2
          </span>
          {cells.map((c, i) => (
            <motion.div key={`arr-${c.id}`} animate={{ left: arrX(i), top: arrY }} transition={NODE_SPRING} initial={false} className="absolute">
              <div className={`flex items-center justify-center rounded border font-mono text-[12px] font-bold ${STYLES[c.state]} ${TEXT[c.state]} bg-surface-container/70`} style={{ width: AW, height: 36 }}>
                {c.label}
              </div>
              <span className="mt-0.5 block text-center font-mono text-[9px] text-on-surface-variant/40">{i}</span>
            </motion.div>
          ))}

          <AnimatePresence>
            {message && (
              <motion.div key={message.text} initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} className={`absolute left-1/2 flex -translate-x-1/2 items-center rounded-full border px-4 py-1.5 font-label-caps text-[11px] tracking-wider backdrop-blur-sm ${message.tone === "error" ? "border-error/60 bg-error/10 text-error" : message.tone === "ok" ? "border-mint/60 bg-mint/10 text-mint" : "border-outline-variant bg-surface-container/80 text-on-surface-variant"}`} style={{ top: arrY + CELL_H + 20 }}>
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
    </FitStage>
  );
}
