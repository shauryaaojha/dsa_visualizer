"use client";

import { motion } from "framer-motion";
import { FitStage } from "@/components/visualizer/FitStage";
import { useTreeStore } from "@/lib/treeStore";
import type { HighlightKind, RTreeNode, TreeNodeState } from "@/types/visualization";

const ROW_H = 110;
const TOP_PAD = 32;
const H_PAD = 56;

// Node box sizing — must match the JSX below
const CELL_W = 28;    // each value chip including gap
const NODE_PAD = 14;  // total horizontal padding + 2px border each side
const EMPTY_W = 40;   // ∅ node width
const CHILD_GAP = 24; // minimum gap between adjacent subtrees
const MIN_NODE_W = 48;

const NODE_STYLES: Record<TreeNodeState, string> = {
  idle:      "border-outline-variant/60 text-on-surface-variant/70",
  dividing:  "border-amber text-amber shadow-[0_0_12px_rgba(245,166,35,0.35)]",
  active:    "border-coral text-coral shadow-[0_0_14px_rgba(255,95,74,0.45)]",
  combining: "border-coral text-coral shadow-[0_0_14px_rgba(255,95,74,0.4)]",
  done:      "border-mint text-mint shadow-[0_0_12px_rgba(52,201,138,0.35)]",
};

const ARR_STYLES: Record<HighlightKind, string> = {
  active:  "border-coral text-coral",
  compare: "border-amber text-amber",
  swap:    "border-coral text-coral",
  visited: "border-outline-variant text-on-surface-variant/50",
  target:  "border-amber text-amber",
  found:   "border-mint text-mint",
  remove:  "border-error text-error",
  insert:  "border-mint text-mint",
};

function renderedNodeW(n: RTreeNode): number {
  if (n.values.length === 0) return EMPTY_W;
  return Math.max(MIN_NODE_W, NODE_PAD + n.values.length * CELL_W);
}

/**
 * Pixel-accurate tree layout.
 *
 * subtreeWidth(node) = max(nodeWidth, sum(childSubtreeWidths) + gaps)
 * place(node, startX):
 *   - node center = startX + subtreeWidth/2
 *   - children packed inside that space, centered
 */
function computeLayout(nodes: RTreeNode[]): { xMap: Map<string, number>; canvasWidth: number } {
  if (nodes.length === 0) return { xMap: new Map(), canvasWidth: 400 };

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const childrenOf = new Map<string, string[]>();
  const roots: string[] = [];

  for (const n of nodes) {
    if (!n.parentId) {
      roots.push(n.id);
    } else {
      if (!childrenOf.has(n.parentId)) childrenOf.set(n.parentId, []);
      childrenOf.get(n.parentId)!.push(n.id);
    }
  }

  // Sort children left → right by lo so left partition always renders left
  Array.from(childrenOf.values()).forEach((kids) => {
    kids.sort((a, b) => (nodeMap.get(a)?.lo ?? 0) - (nodeMap.get(b)?.lo ?? 0));
  });

  // Memoised pixel width of a subtree
  const swCache = new Map<string, number>();
  function subtreeW(id: string): number {
    if (swCache.has(id)) return swCache.get(id)!;
    const n = nodeMap.get(id);
    const nw = n ? renderedNodeW(n) : MIN_NODE_W;
    const kids = childrenOf.get(id) ?? [];
    let w: number;
    if (kids.length === 0) {
      w = nw;
    } else {
      const childSum = kids.reduce((s, k) => s + subtreeW(k), 0)
        + (kids.length - 1) * CHILD_GAP;
      w = Math.max(nw, childSum);
    }
    swCache.set(id, w);
    return w;
  }

  // Place subtree rooted at `id` whose left edge starts at `startX`.
  // Leaves: center = startX + sw/2.
  // Internal: place children first, then parent = midpoint(firstChild, lastChild).
  const xMap = new Map<string, number>();
  function place(id: string, startX: number) {
    const sw = subtreeW(id);
    const kids = childrenOf.get(id) ?? [];

    if (kids.length === 0) {
      xMap.set(id, startX + sw / 2);
      return;
    }

    const childSum = kids.reduce((s, k) => s + subtreeW(k), 0)
      + (kids.length - 1) * CHILD_GAP;
    let cursor = startX + (sw - childSum) / 2;
    for (const k of kids) {
      place(k, cursor);
      cursor += subtreeW(k) + CHILD_GAP;
    }

    // Parent sits exactly over the midpoint of its outermost children
    const parentX =
      ((xMap.get(kids[0]) ?? 0) + (xMap.get(kids[kids.length - 1]) ?? 0)) / 2;
    xMap.set(id, parentX);
  }

  let offset = H_PAD;
  for (const r of roots) {
    place(r, offset);
    offset += subtreeW(r) + CHILD_GAP;
  }

  return { xMap, canvasWidth: offset - CHILD_GAP + H_PAD };
}

export function RecursionTreeCanvas() {
  const step    = useTreeStore((s) => s.currentStep());
  const program = useTreeStore((s) => s.program);
  const values  = useTreeStore((s) => s.values);

  const maxDepth = program?.maxDepth ?? 0;
  const nodes = step ? Object.values(step.nodes) : [];
  const arr   = step ? step.array : values;
  const arrHi = step?.arrayHighlights ?? {};

  const { xMap, canvasWidth } = computeLayout(nodes);
  const canvasH = (maxDepth + 1) * ROW_H + TOP_PAD + 24;

  const cx = (n: RTreeNode) => xMap.get(n.id) ?? canvasWidth / 2;
  const cy = (n: RTreeNode) => TOP_PAD + n.depth * ROW_H + 20;

  return (
    <FitStage>
      <div className="flex flex-col items-center gap-md px-lg py-md">
      {/* Tree */}
      <div className="relative shrink-0" style={{ width: canvasWidth, height: canvasH }}>
        {/* SVG edges */}
        <svg className="absolute inset-0 overflow-visible" width={canvasWidth} height={canvasH}>
          {nodes.map((n) => {
            if (!n.parentId) return null;
            const parent = step?.nodes[n.parentId];
            if (!parent) return null;
            const done = n.state === "done" && parent.state === "done";
            return (
              <line
                key={`edge-${n.id}`}
                x1={cx(parent)}
                y1={cy(parent) + 16}
                x2={cx(n)}
                y2={cy(n) - 16}
                stroke={done ? "#34C98A" : "#5a4136"}
                strokeWidth={1.5}
                strokeOpacity={0.8}
              />
            );
          })}
        </svg>

        {/* Nodes — outer div handles centering, inner motion.div handles animation.
            Keeping them separate prevents Framer Motion's inline transform from
            overriding the Tailwind -translate-x/y-1/2 centering classes. */}
        {nodes.map((n) => (
          <div
            key={n.id}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: cx(n), top: cy(n) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="flex flex-col items-center"
            >
              <div
                className={`flex items-center gap-0.5 rounded-md border-2 bg-surface-container/85 px-1 py-1 backdrop-blur-sm transition-colors ${NODE_STYLES[n.state]}`}
              >
                {n.values.length === 0 ? (
                  <span className="px-1.5 font-mono text-[11px] opacity-60">∅</span>
                ) : (
                  n.values.map((v, i) => (
                    <span
                      key={i}
                      className="flex h-6 min-w-[22px] items-center justify-center rounded bg-surface-container-lowest/70 px-1 font-mono text-[12px] font-bold"
                    >
                      {v}
                    </span>
                  ))
                )}
              </div>
              {n.pivot !== undefined && (
                <span className="mt-0.5 font-label-caps text-[9px] text-amber">
                  pivot {n.pivot}
                </span>
              )}
            </motion.div>
          </div>
        ))}
      </div>

      {/* Working array */}
      <div className="shrink-0">
        <p className="mb-1.5 text-center font-label-caps text-[10px] text-on-surface-variant/60">
          WORKING ARRAY
        </p>
        <div className="flex gap-1.5">
          {arr.map((v, i) => {
            const hl = arrHi[i];
            const style = hl ? ARR_STYLES[hl] : "border-outline-variant text-on-surface";
            return (
              <div
                key={i}
                className={`flex h-10 w-10 items-center justify-center border-2 bg-surface-container/80 font-mono text-sm font-bold transition-colors duration-200 ${style}`}
                style={{ borderRadius: 6 }}
              >
                {v}
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </FitStage>
  );
}
