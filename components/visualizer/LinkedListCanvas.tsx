"use client";

// The animated linked list. Each node is drawn as a textbook two-compartment
// box: [ data | next-addr ] (doubly adds a prev-addr cell on the left). The
// next-cell shows the address of the node it links to (or NULL), reinforced by
// an SVG arrow; circular lists get a curved tail→head back-edge. head/tail/curr/
// prev cursors float, centered, above the node they point at.

import { AnimatePresence, motion } from "framer-motion";
import { useLinkedListStore } from "@/lib/linkedListStore";
import type { LLNode, LLNodeState, LLPointer } from "@/types/visualization";

const DATA_W = 48;
const PTR_W = 40;
const NODE_H = 54;
const GAP = 50; // arrow gutter between nodes
const TOP = 76; // pointer band height
const ADDR_H = 18; // address label under each node
const BACK_EDGE = 54; // space under the row for the circular back-edge
const H_PAD = 40;

const STYLES: Record<LLNodeState, string> = {
  idle: "border-outline-variant",
  active: "border-coral shadow-[0_0_16px_rgba(255,95,74,0.45)]",
  visited: "border-outline-variant opacity-60",
  new: "border-mint shadow-[0_0_18px_rgba(52,201,138,0.5)]",
  removing: "border-error shadow-[0_0_16px_rgba(255,95,74,0.5)]",
  target: "border-amber shadow-[0_0_16px_rgba(245,166,35,0.4)]",
  found: "border-mint animate-cell-pulse",
};

const DATA_TEXT: Record<LLNodeState, string> = {
  idle: "text-on-surface",
  active: "text-coral",
  visited: "text-on-surface-variant/55",
  new: "text-mint",
  removing: "text-error",
  target: "text-amber",
  found: "text-mint",
};

export function LinkedListCanvas() {
  const step = useLinkedListStore((s) => s.currentStep());
  const kind = useLinkedListStore((s) => s.program?.kind ?? s.kind);

  const nodes: LLNode[] = step?.nodes ?? [];
  const pointers: LLPointer[] = step?.pointers ?? [];
  const n = nodes.length;
  const doubly = kind === "doubly";

  const NODE_W = doubly ? PTR_W + DATA_W + PTR_W : DATA_W + PTR_W;
  const SLOT = NODE_W + GAP;

  const xLeft = (i: number) => H_PAD + i * SLOT;
  const cx = (i: number) => xLeft(i) + NODE_W / 2;
  const rowY = TOP;
  const midY = rowY + NODE_H / 2;

  const showNull = kind !== "circular";
  const slots = n + (showNull ? 1 : 0);
  const contentW = H_PAD * 2 + Math.max(1, slots) * SLOT;
  const contentH = TOP + NODE_H + ADDR_H + BACK_EDGE + 12;

  const idIndex = new Map(nodes.map((nd, i) => [nd.id, i]));
  const idAddr = new Map(nodes.map((nd) => [nd.id, nd.addr]));
  const nextAddr = (nd: LLNode) => (nd.next ? idAddr.get(nd.next) ?? "—" : "NULL");
  const prevAddr = (nd: LLNode) => (nd.prev ? idAddr.get(nd.prev) ?? "—" : "NULL");

  // Group cursors by node index so head+curr etc. stack instead of overlapping.
  const pointersByIndex = new Map<number, LLPointer[]>();
  for (const p of pointers) {
    const idx = p.nodeId ? idIndex.get(p.nodeId) : undefined;
    if (idx === undefined) continue;
    if (!pointersByIndex.has(idx)) pointersByIndex.set(idx, []);
    pointersByIndex.get(idx)!.push(p);
  }

  return (
    <div className="scroll-thin h-full w-full overflow-x-auto overflow-y-auto px-2 py-6">
      <div className="flex min-h-full min-w-full items-center justify-center">
      <div className="relative shrink-0" style={{ width: contentW, height: contentH }}>
        {/* Wiring + back-edge */}
        <svg className="absolute inset-0 overflow-visible" width={contentW} height={contentH}>
          <defs>
            <marker id="ll-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
              <path d="M0,0 L7,3 L0,6 Z" fill="#7a8087" />
            </marker>
          </defs>

          {/* next arrows: from the right (next) cell to the following node */}
          {nodes.map((nd, i) => {
            if (i >= n - 1) return null;
            const x1 = xLeft(i) + NODE_W;
            const x2 = xLeft(i + 1);
            return <line key={`next-${nd.id}`} x1={x1} y1={midY} x2={x2 - 2} y2={midY} stroke="#7a8087" strokeWidth={1.6} markerEnd="url(#ll-arrow)" />;
          })}

          {/* arrow to NULL (singly / doubly) */}
          {showNull && n > 0 && (
            <line x1={xLeft(n - 1) + NODE_W} y1={midY} x2={xLeft(n) + 6} y2={midY} stroke="#7a8087" strokeWidth={1.6} markerEnd="url(#ll-arrow)" />
          )}

          {/* circular back-edge: tail → head, arcing below the row */}
          {kind === "circular" && n > 1 && (
            <path
              d={`M ${cx(n - 1)} ${rowY + NODE_H} C ${cx(n - 1)} ${rowY + NODE_H + BACK_EDGE}, ${cx(0)} ${rowY + NODE_H + BACK_EDGE}, ${cx(0)} ${rowY + NODE_H}`}
              fill="none"
              stroke="#f5a623"
              strokeWidth={1.6}
              strokeDasharray="5 4"
              markerEnd="url(#ll-arrow)"
              opacity={0.8}
            />
          )}
        </svg>

        {/* NULL terminator */}
        {showNull && (
          <div
            className="absolute flex items-center justify-center font-mono text-[12px] text-on-surface-variant/50"
            style={{ left: xLeft(n), top: rowY, width: NODE_W, height: NODE_H }}
          >
            NULL
          </div>
        )}

        {/* Nodes */}
        <AnimatePresence>
          {nodes.map((nd, i) => (
            <motion.div
              key={nd.id}
              initial={{ opacity: 0, scale: 0.5, y: -18 }}
              animate={{ opacity: 1, scale: 1, y: 0, left: xLeft(i) }}
              exit={{ opacity: 0, scale: 0.4, y: 22 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="absolute flex flex-col items-center"
              style={{ top: rowY, width: NODE_W }}
            >
              <div className={`flex h-[54px] w-full overflow-hidden rounded-lg border-2 bg-surface-container/85 font-mono backdrop-blur-sm transition-colors duration-300 ${STYLES[nd.state]}`}>
                {doubly && (
                  <div className="flex flex-col items-center justify-center border-r border-outline-variant/60 bg-surface-container-lowest/60 text-on-surface-variant/70" style={{ width: PTR_W }}>
                    <span className="text-[8px] uppercase opacity-60">prev</span>
                    <span className="text-[11px]">{prevAddr(nd)}</span>
                  </div>
                )}
                <div className={`flex items-center justify-center font-bold ${DATA_TEXT[nd.state]}`} style={{ width: DATA_W }}>
                  <span className={nd.label ? "text-[11px] leading-tight" : "text-base"}>{nd.label ?? nd.value}</span>
                </div>
                <div className="flex flex-col items-center justify-center border-l border-outline-variant/60 bg-surface-container-lowest/60 text-on-surface-variant/70" style={{ width: PTR_W }}>
                  <span className="text-[8px] uppercase opacity-60">next</span>
                  <span className="text-[11px]">{nextAddr(nd)}</span>
                </div>
              </div>
              {/* node's own address */}
              <span className="mt-1 font-mono text-[10px] text-on-surface-variant/45">@{nd.addr}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Floating cursors (x:-50% baked into the motion so they stay centered) */}
        {Array.from(pointersByIndex.entries()).map(([idx, ps]) =>
          ps.map((p, k) => (
            <motion.div
              key={`${p.label}-${idx}`}
              initial={{ opacity: 0, y: 6, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%", left: cx(idx) }}
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
              className="absolute flex flex-col items-center"
              style={{ top: rowY - 26 - k * 20, color: p.color }}
            >
              <span className="font-label-caps text-[10px] font-bold uppercase tracking-wider">{p.label}</span>
              <span className="material-symbols-outlined -mt-1 text-[18px]">arrow_drop_down</span>
            </motion.div>
          )),
        )}
      </div>
      </div>
    </div>
  );
}
