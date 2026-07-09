"use client";

// The animated linked list. Each node is drawn as a textbook two-compartment
// box: [ data | next-addr ] (doubly adds a prev-addr cell on the left). A HEAD
// pointer box sits to the left of the row holding the head node's address —
// it is rewired live during insert/delete, just like the pseudocode says.
//
// Arrows are drawn from the *actual* per-frame pointer state (node.next), not
// from array adjacency, so the engine can show links breaking and re-forming:
// a bypass link arcs under the node it skips, a link to/from a lifted
// ("floating") node curves up to it, and a freshly rewired link draws itself
// in (pathLength 0→1) in mint. Nodes being allocated or freed float above the
// row until they are linked in / after they are unlinked.

import { AnimatePresence, motion } from "framer-motion";
import { useLinkedListStore } from "@/lib/linkedListStore";
import type { LLNode, LLNodeState, LLPointer } from "@/types/visualization";

const DATA_W = 48;
const PTR_W = 40;
const NODE_H = 54;
const GAP = 50; // arrow gutter between nodes
const TOP = 118; // band above the row: floating nodes + cursors
const LIFT = 62; // how far a floating node hovers above the row
const ADDR_H = 18; // address label under each node
const BACK_EDGE = 54; // space under the row for the circular back-edge
const H_PAD = 32;
const HEAD_W = 60; // the HEAD pointer box
const HEAD_GAP = 46;

const C_LINK = "#7a8087";
const C_REWIRED = "#34C98A";
const C_WRAP = "#f5a623";

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

const LINK_SPRING = { type: "tween", duration: 0.55, ease: "easeInOut" } as const;
const NODE_SPRING = { type: "spring", stiffness: 170, damping: 26 } as const;

/** Pointer-cell address value that flashes whenever it changes. */
function AddrValue({ text, lit }: { text: string; lit: boolean }) {
  return (
    <motion.span
      key={text}
      initial={{ scale: 1.55, opacity: 0.3 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`text-[11px] ${lit ? "font-bold text-mint" : ""}`}
    >
      {text}
    </motion.span>
  );
}

export function LinkedListCanvas() {
  const step = useLinkedListStore((s) => s.currentStep());
  const kind = useLinkedListStore((s) => s.program?.kind ?? s.kind);

  const nodes: LLNode[] = step?.nodes ?? [];
  const pointers: LLPointer[] = step?.pointers ?? [];
  const rewired: string[] = step?.rewired ?? [];
  const headId = step?.headId ?? null;
  const n = nodes.length;
  const doubly = kind === "doubly";

  const NODE_W = doubly ? PTR_W + DATA_W + PTR_W : DATA_W + PTR_W;
  const SLOT = NODE_W + GAP;
  const ROW_X = H_PAD + HEAD_W + HEAD_GAP; // nodes start right of the HEAD box

  const xLeft = (i: number) => ROW_X + i * SLOT;
  const nodeTop = (i: number) => (nodes[i]?.floating ? TOP - LIFT : TOP);
  const yMid = (i: number) => nodeTop(i) + NODE_H / 2;
  const cx = (i: number) => xLeft(i) + NODE_W / 2;
  const rowY = TOP;
  const rowMid = rowY + NODE_H / 2;

  const showNull = kind !== "circular";
  const slots = n + (showNull ? 1 : 0);
  const contentW = ROW_X + Math.max(1, slots) * SLOT + H_PAD;
  const contentH = TOP + NODE_H + ADDR_H + BACK_EDGE + 12;

  const idIndex = new Map(nodes.map((nd, i) => [nd.id, i]));
  const idAddr = new Map(nodes.map((nd) => [nd.id, nd.addr]));
  const nextAddr = (nd: LLNode) => (nd.next ? `@${idAddr.get(nd.next) ?? "?"}` : "NULL");
  const prevAddr = (nd: LLNode) => (nd.prev ? `@${idAddr.get(nd.prev) ?? "?"}` : "NULL");

  const headIdx = headId ? idIndex.get(headId) : undefined;
  const headAddr = headIdx !== undefined ? `@${nodes[headIdx].addr}` : "NULL";
  const headRewired = rewired.includes("HEAD");

  // Group cursors by node index so tail+curr etc. stack instead of overlapping.
  const pointersByIndex = new Map<number, LLPointer[]>();
  for (const p of pointers) {
    const idx = p.nodeId ? idIndex.get(p.nodeId) : undefined;
    if (idx === undefined) continue;
    if (!pointersByIndex.has(idx)) pointersByIndex.set(idx, []);
    pointersByIndex.get(idx)!.push(p);
  }

  // Smooth cubic between two link endpoints. `dip` arcs the wire under the row
  // (bypass links / the circular wrap) so it visibly routes AROUND nodes.
  const wire = (x1: number, y1: number, x2: number, y2: number, dip = 0) =>
    dip > 0
      ? `M ${x1} ${y1} C ${x1 + 26} ${y1 + dip}, ${x2 - 26} ${y2 + dip}, ${x2} ${y2}`
      : `M ${x1} ${y1} C ${x1 + GAP * 0.55} ${y1}, ${x2 - GAP * 0.55} ${y2}, ${x2} ${y2}`;

  interface Edge {
    key: string;
    d: string;
    color: string;
    width: number;
    dash?: string;
    marker: string;
    lit: boolean; // just rewired → draw itself in
    dim: boolean;
  }
  const edges: Edge[] = [];

  // HEAD box → head node.
  if (headIdx !== undefined) {
    const hx = H_PAD + HEAD_W;
    const straight = headIdx === 0 && !nodes[0].floating;
    edges.push({
      key: `HEAD->${headId}`,
      d: straight
        ? wire(hx, rowMid, xLeft(0), rowMid)
        : wire(hx, rowMid, xLeft(headIdx), yMid(headIdx), nodes[headIdx].floating ? 0 : NODE_H / 2 + 26),
      color: headRewired ? C_REWIRED : "#34C98A",
      width: headRewired ? 2.4 : 1.6,
      marker: "url(#ll-arrow-mint)",
      lit: headRewired,
      dim: false,
    });
  }

  // node.next → wherever it actually points this frame.
  nodes.forEach((nd, i) => {
    const lit = rewired.includes(nd.id);
    const dim = nd.state === "removing" && !lit;

    if (!nd.next) {
      // In-row node with next = NULL → arrow to the NULL terminator slot.
      if (showNull && !nd.floating) {
        edges.push({
          key: `${nd.id}->NULL`,
          d: i === n - 1 ? wire(xLeft(i) + NODE_W, rowMid, xLeft(n) + 6, rowMid) : wire(xLeft(i) + NODE_W, yMid(i), xLeft(n) + 6, rowMid, NODE_H / 2 + 30),
          color: lit ? C_REWIRED : C_LINK,
          width: lit ? 2.4 : 1.6,
          marker: lit ? "url(#ll-arrow-mint)" : "url(#ll-arrow)",
          lit,
          dim,
        });
      }
      return;
    }

    const j = idIndex.get(nd.next);
    if (j === undefined || j === i) return;

    if (j < i) {
      // Wrap-around (circular tail → head): dashed arc under the whole row.
      edges.push({
        key: `${nd.id}->${nd.next}`,
        d: `M ${cx(i)} ${nodeTop(i) + NODE_H} C ${cx(i)} ${rowY + NODE_H + BACK_EDGE}, ${cx(j)} ${rowY + NODE_H + BACK_EDGE}, ${cx(j)} ${nodeTop(j) + NODE_H}`,
        color: lit ? C_REWIRED : C_WRAP,
        width: lit ? 2.4 : 1.6,
        dash: "5 4",
        marker: lit ? "url(#ll-arrow-mint)" : "url(#ll-arrow-amber)",
        lit,
        dim,
      });
      return;
    }

    // Forward link: straight neighbour link, curve to/from a floating node,
    // or a bypass arc under the node(s) being skipped.
    const bypass = !nd.floating && !nodes[j].floating && j > i + 1;
    edges.push({
      key: `${nd.id}->${nd.next}`,
      d: wire(xLeft(i) + NODE_W, yMid(i), xLeft(j), yMid(j), bypass ? NODE_H / 2 + 30 : 0),
      color: lit ? C_REWIRED : C_LINK,
      width: lit ? 2.4 : 1.6,
      marker: lit ? "url(#ll-arrow-mint)" : "url(#ll-arrow)",
      lit,
      dim,
    });
  });

  return (
    <div className="scroll-thin h-full w-full overflow-x-auto overflow-y-auto px-2 py-6">
      <div className="flex min-h-full min-w-full items-center justify-center">
      <div className="relative shrink-0" style={{ width: contentW, height: contentH }}>
        {/* Wiring */}
        <svg className="absolute inset-0 overflow-visible" width={contentW} height={contentH}>
          <defs>
            <marker id="ll-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
              <path d="M0,0 L7,3 L0,6 Z" fill={C_LINK} />
            </marker>
            <marker id="ll-arrow-mint" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
              <path d="M0,0 L7,3 L0,6 Z" fill={C_REWIRED} />
            </marker>
            <marker id="ll-arrow-amber" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
              <path d="M0,0 L7,3 L0,6 Z" fill={C_WRAP} />
            </marker>
          </defs>
          <AnimatePresence>
            {edges.map((e) => (
              <motion.path
                key={e.key}
                initial={e.lit ? { d: e.d, pathLength: 0, opacity: 0 } : { d: e.d, opacity: 0 }}
                animate={{ d: e.d, pathLength: 1, opacity: e.dim ? 0.3 : 1 }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                transition={LINK_SPRING}
                fill="none"
                stroke={e.color}
                strokeWidth={e.width}
                strokeDasharray={e.dash}
                markerEnd={e.marker}
              />
            ))}
          </AnimatePresence>
        </svg>

        {/* HEAD pointer box */}
        <div className="absolute flex flex-col items-center" style={{ left: H_PAD, top: rowY, width: HEAD_W }}>
          <div
            className={`flex h-[54px] w-full flex-col items-center justify-center gap-0.5 rounded-lg border-2 bg-surface-container/85 font-mono backdrop-blur-sm transition-shadow duration-300 ${
              headRewired ? "border-mint shadow-[0_0_18px_rgba(52,201,138,0.55)]" : "border-mint/60"
            }`}
          >
            <span className="text-[8px] uppercase tracking-wider text-mint/80">head</span>
            <AddrValue text={headAddr} lit />
          </div>
          <span className="mt-1 font-mono text-[10px] text-on-surface-variant/45">pointer</span>
        </div>

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
              initial={{ opacity: 0, scale: 0.5, left: xLeft(i), top: nodeTop(i) - 20 }}
              animate={{ opacity: 1, scale: 1, left: xLeft(i), top: nodeTop(i) }}
              exit={{ opacity: 0, scale: 0.4, y: -26, transition: { duration: 0.45 } }}
              transition={NODE_SPRING}
              className="absolute flex flex-col items-center"
              style={{ width: NODE_W }}
            >
              <div className={`flex h-[54px] w-full overflow-hidden rounded-lg border-2 bg-surface-container/85 font-mono backdrop-blur-sm transition-colors duration-300 ${STYLES[nd.state]}`}>
                {doubly && (
                  <div className="flex flex-col items-center justify-center border-r border-outline-variant/60 bg-surface-container-lowest/60 text-on-surface-variant/70" style={{ width: PTR_W }}>
                    <span className="text-[8px] uppercase opacity-60">prev</span>
                    <AddrValue text={prevAddr(nd)} lit={rewired.includes(nd.id)} />
                  </div>
                )}
                <div className={`flex items-center justify-center font-bold ${DATA_TEXT[nd.state]}`} style={{ width: DATA_W }}>
                  <span className={nd.label ? "text-[11px] leading-tight" : "text-base"}>{nd.label ?? nd.value}</span>
                </div>
                <div className="flex flex-col items-center justify-center border-l border-outline-variant/60 bg-surface-container-lowest/60 text-on-surface-variant/70" style={{ width: PTR_W }}>
                  <span className="text-[8px] uppercase opacity-60">next</span>
                  <AddrValue text={nextAddr(nd)} lit={rewired.includes(nd.id)} />
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
              animate={{ opacity: 1, y: 0, x: "-50%", left: cx(idx), top: nodeTop(idx) - 26 - k * 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="absolute flex flex-col items-center"
              style={{ color: p.color }}
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
