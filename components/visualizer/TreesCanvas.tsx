"use client";

// The animated tree (binary tree / BST / AVL / heap / trie). The engine hands
// each frame a grid layout (x = in-order or heap position, y = depth); this
// canvas scales it to pixels. Nodes keep stable ids, so inserts, deletes and
// AVL rotations all render as circles GLIDING to their new positions — the
// structure change is literally watchable.
//
// Extras per frame: badges under nodes (balance factors, heap indices,
// disc/low), cursor tags above nodes ("succ", "curr"), end-of-word rings
// (trie), an output strip (visit order / sorted array) and an aux strip
// (call stack / queue / backing array).

import { AnimatePresence, motion } from "framer-motion";
import { FitStage } from "@/components/visualizer/FitStage";
import { useTreesStore } from "@/lib/treesStore";
import type { SQCellState, TokenChip } from "@/types/visualization";

const NODE_R = 23;
const GAP_X = 62;
const GAP_Y = 84;
const PAD_X = 46;
const TOP_PAD = 34;

const RING: Record<SQCellState, string> = {
  idle: "border-outline-variant",
  active: "border-coral shadow-[0_0_16px_rgba(255,95,74,0.45)]",
  visited: "border-outline-variant opacity-45",
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

const EDGE_COLOR: Record<string, string> = {
  idle: "#7a8087",
  active: "#FF5F4A",
  new: "#34C98A",
  removing: "#ff5f4a",
};

const CHIP: Record<TokenChip["state"], string> = {
  pending: "border-outline-variant/50 text-on-surface-variant/45",
  active: "border-coral text-coral shadow-[0_0_10px_rgba(255,95,74,0.4)]",
  done: "border-outline-variant/50 text-on-surface-variant/70",
  matched: "border-mint text-mint",
  error: "border-error text-error",
};

const SPRING = { type: "spring", stiffness: 170, damping: 26 } as const;
const TWEEN = { type: "tween", duration: 0.55, ease: "easeInOut" } as const;

function Strip({ label, chips }: { label: string; chips: TokenChip[] }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-right font-label-caps text-[9px] uppercase tracking-wider text-on-surface-variant/60">{label}</span>
      <div className="flex flex-wrap gap-1">
        {chips.map((t, i) => (
          <span key={i} className={`flex h-6 min-w-6 items-center justify-center border px-1.5 font-mono text-[11px] transition-colors duration-300 ${CHIP[t.state]}`}>
            {t.text}
          </span>
        ))}
        {chips.length === 0 && <span className="font-mono text-[11px] text-on-surface-variant/40">—</span>}
      </div>
    </div>
  );
}

export function TreesCanvas() {
  const step = useTreesStore((s) => s.currentStep());

  const nodes = step?.nodes ?? [];
  const edges = step?.edges ?? [];
  const gridW = step?.gridW ?? 1;
  const gridH = step?.gridH ?? 1;
  const message = step?.message;

  const stripsH = (step?.output ? 30 : 0) + (step?.aux ? 30 : 0) + (step?.output || step?.aux ? 14 : 0);
  const treeW = PAD_X * 2 + gridW * GAP_X;
  const treeH = TOP_PAD + gridH * GAP_Y + NODE_R * 2 + 46;
  const contentW = Math.max(treeW, 420);
  const contentH = stripsH + treeH + 44;
  const xOff = (contentW - treeW) / 2;

  const px = (x: number) => xOff + PAD_X + x * GAP_X;
  const py = (y: number) => stripsH + TOP_PAD + y * GAP_Y;

  const pos = new Map(nodes.map((n) => [n.id, { x: px(n.x), y: py(n.y) }]));

  return (
    <FitStage>
        <div className="relative" style={{ width: contentW, height: contentH }}>
          {/* Strips */}
          {(step?.output || step?.aux) && (
            <div className="absolute left-0 right-0 top-0 flex flex-col gap-1.5">
              {step?.aux && <Strip label={step.aux.label} chips={step.aux.chips} />}
              {step?.output && <Strip label={step.output.label} chips={step.output.chips} />}
            </div>
          )}

          {/* Edges */}
          <svg className="absolute inset-0 overflow-visible" width={contentW} height={contentH}>
            <AnimatePresence>
              {edges.map((e) => {
                const a = pos.get(e.from);
                const b = pos.get(e.to);
                if (!a || !b) return null;
                return (
                  <motion.line
                    key={`${e.from}>${e.to}`}
                    initial={{ opacity: 0, x1: a.x, y1: a.y, x2: b.x, y2: b.y }}
                    animate={{ opacity: e.state === "removing" ? 0.35 : 0.8, x1: a.x, y1: a.y, x2: b.x, y2: b.y }}
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    transition={TWEEN}
                    stroke={EDGE_COLOR[e.state] ?? "#7a8087"}
                    strokeWidth={e.state === "idle" ? 1.5 : 2.4}
                    strokeDasharray={e.state === "removing" ? "4 4" : undefined}
                  />
                );
              })}
            </AnimatePresence>
          </svg>

          {/* Nodes */}
          <AnimatePresence>
            {nodes.map((n) => {
              const p = pos.get(n.id)!;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, scale: 0.4, left: p.x - NODE_R, top: p.y - NODE_R }}
                  animate={{ opacity: 1, scale: 1, left: p.x - NODE_R, top: p.y - NODE_R }}
                  exit={{ opacity: 0, scale: 0.4, y: 24, transition: { duration: 0.4 } }}
                  transition={SPRING}
                  className="absolute flex flex-col items-center"
                  style={{ width: NODE_R * 2 }}
                >
                  {/* cursor tag */}
                  <AnimatePresence>
                    {n.tag && (
                      <motion.span
                        key={n.tag}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute -top-5 font-label-caps text-[9px] font-bold uppercase tracking-wider text-coral"
                      >
                        {n.tag}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <div
                    className={`relative flex items-center justify-center rounded-full border-2 bg-surface-container/90 font-mono font-bold backdrop-blur-sm transition-colors duration-300 ${RING[n.state]} ${TEXT[n.state]}`}
                    style={{ width: NODE_R * 2, height: NODE_R * 2 }}
                  >
                    {/* trie end-of-word double ring */}
                    {n.ring && <span className="pointer-events-none absolute inset-[3px] rounded-full border border-mint/70" />}
                    <span className={n.label.length > 3 ? "text-[11px]" : "text-[14px]"}>{n.label}</span>
                  </div>
                  {n.badge && (
                    <motion.span
                      key={n.badge}
                      initial={{ scale: 1.3, opacity: 0.4 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`mt-0.5 whitespace-nowrap font-mono text-[9px] ${n.badge.includes("+2") || n.badge.includes("−2") || n.badge.includes("-2") ? "font-bold text-error" : "text-on-surface-variant/60"}`}
                    >
                      {n.badge}
                    </motion.span>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Verdict badge */}
          <AnimatePresence>
            {message && (
              <motion.div
                key={message.text}
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`absolute left-1/2 flex max-w-full -translate-x-1/2 items-center rounded-full border px-4 py-1.5 font-label-caps text-[11px] tracking-wider backdrop-blur-sm ${
                  message.tone === "error"
                    ? "border-error/60 bg-error/10 text-error"
                    : message.tone === "ok"
                      ? "border-mint/60 bg-mint/10 text-mint"
                      : "border-outline-variant bg-surface-container/80 text-on-surface-variant"
                }`}
                style={{ top: contentH - 34 }}
              >
                <span className="truncate">{message.text}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
    </FitStage>
  );
}
