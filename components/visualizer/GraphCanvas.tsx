"use client";

// The animated graph. Nodes sit at hand-placed preset coordinates (chosen per
// algorithm for clarity); edges are lines with weight chips, arrowheads when
// directed. Beside the graph lives the algorithm's DATA — a table (distance
// tables, adjacency matrix, key tables) whose cells flash as they change —
// and below it a strip (BFS queue, DFS stack, Kruskal's sorted edges,
// Kosaraju's finish order). Node `group` colors paint connected components
// (union-find merges and SCCs repaint live).

import { AnimatePresence, motion } from "framer-motion";
import { FitStage } from "@/components/visualizer/FitStage";
import { useGraphStore } from "@/lib/graphStore";
import type { GraphTableCell, SQCellState, TokenChip } from "@/types/visualization";

const W = 470;
const H = 350;
const R = 20;

const GROUP_COLORS = ["#34C98A", "#F5A623", "#FF5F4A", "#8ab4ff", "#c792ea", "#64d8cb", "#f78fb3", "#ffd166"];

const NODE_RING: Record<SQCellState, string> = {
  idle: "border-outline-variant",
  active: "border-coral shadow-[0_0_18px_rgba(255,95,74,0.5)]",
  visited: "border-mint/70",
  new: "border-mint shadow-[0_0_18px_rgba(52,201,138,0.5)]",
  removing: "border-error shadow-[0_0_16px_rgba(255,95,74,0.5)]",
  target: "border-amber shadow-[0_0_14px_rgba(245,166,35,0.45)]",
  found: "border-mint animate-cell-pulse",
};

const NODE_TEXT: Record<SQCellState, string> = {
  idle: "text-on-surface",
  active: "text-coral",
  visited: "text-mint/90",
  new: "text-mint",
  removing: "text-error",
  target: "text-amber",
  found: "text-mint",
};

const EDGE_STYLE: Record<string, { color: string; width: number; dash?: string; opacity: number }> = {
  idle: { color: "#7a8087", width: 1.5, opacity: 0.55 },
  active: { color: "#FF5F4A", width: 2.6, opacity: 1 },
  tree: { color: "#34C98A", width: 3, opacity: 1 },
  rejected: { color: "#ff4a4a", width: 2.4, dash: "5 4", opacity: 0.9 },
  special: { color: "#F5A623", width: 2, dash: "4 4", opacity: 0.9 },
};

const CHIP: Record<TokenChip["state"], string> = {
  pending: "border-outline-variant/50 text-on-surface-variant/45",
  active: "border-coral text-coral shadow-[0_0_10px_rgba(255,95,74,0.4)]",
  done: "border-outline-variant/50 text-on-surface-variant/70",
  matched: "border-mint text-mint",
  error: "border-error text-error line-through",
};

const CELL: Record<NonNullable<GraphTableCell["state"]>, string> = {
  idle: "text-on-surface-variant/75",
  changed: "bg-mint/15 font-bold text-mint",
  final: "font-bold text-mint/90",
  head: "text-amber",
};

const SPRING = { type: "spring", stiffness: 170, damping: 26 } as const;

export function GraphCanvas() {
  const step = useGraphStore((s) => s.currentStep());

  const nodes = step?.nodes ?? [];
  const edges = step?.edges ?? [];
  const table = step?.table;
  const strip = step?.strip;
  const message = step?.message;

  const px = (x: number) => 26 + (x / 100) * (W - 52);
  const py = (y: number) => 24 + (y / 100) * (H - 48);
  const pos = new Map(nodes.map((n) => [n.id, { x: px(n.x), y: py(n.y) }]));

  return (
    <FitStage>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-start justify-center gap-6">
            {/* Graph area */}
            <div className="relative shrink-0" style={{ width: W, height: H }}>
              <svg className="absolute inset-0 overflow-visible" width={W} height={H}>
                <defs>
                  {Object.entries(EDGE_STYLE).map(([k, s]) => (
                    <marker key={k} id={`g-arrow-${k}`} markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
                      <path d="M0,0 L7,3 L0,6 Z" fill={s.color} />
                    </marker>
                  ))}
                </defs>
                {edges.map((e) => {
                  const a = pos.get(e.from);
                  const b = pos.get(e.to);
                  if (!a || !b) return null;
                  const dx = b.x - a.x;
                  const dy = b.y - a.y;
                  const len = Math.hypot(dx, dy) || 1;
                  const trim = e.directed ? R + 6 : R;
                  const x1 = a.x + (dx / len) * R;
                  const y1 = a.y + (dy / len) * R;
                  const x2 = b.x - (dx / len) * trim;
                  const y2 = b.y - (dy / len) * trim;
                  const st = EDGE_STYLE[e.state] ?? EDGE_STYLE.idle;
                  const mx = (x1 + x2) / 2;
                  const my = (y1 + y2) / 2;
                  return (
                    <g key={e.id}>
                      <motion.line
                        animate={{ x1, y1, x2, y2, stroke: st.color, strokeWidth: st.width, opacity: st.opacity }}
                        transition={{ type: "tween", duration: 0.45 }}
                        initial={false}
                        strokeDasharray={st.dash}
                        markerEnd={e.directed ? `url(#g-arrow-${e.state})` : undefined}
                      />
                      {e.weight !== undefined && (
                        <>
                          <circle cx={mx} cy={my} r={10} className="fill-surface-container" opacity={0.92} />
                          <text x={mx} y={my + 3.5} textAnchor="middle" fontSize={10.5} fontFamily="monospace" fill={st.color === "#7a8087" ? "#a8afb8" : st.color}>
                            {e.weight}
                          </text>
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>

              {nodes.map((n) => {
                const p = pos.get(n.id)!;
                const gc = n.group !== undefined ? GROUP_COLORS[n.group % GROUP_COLORS.length] : undefined;
                return (
                  <motion.div
                    key={n.id}
                    animate={{ left: p.x - R, top: p.y - R }}
                    transition={SPRING}
                    initial={false}
                    className="absolute flex flex-col items-center"
                    style={{ width: R * 2 }}
                  >
                    <div
                      className={`relative flex items-center justify-center rounded-full border-2 bg-surface-container/90 font-mono text-[13px] font-bold backdrop-blur-sm transition-all duration-300 ${gc ? "" : NODE_RING[n.state]} ${gc ? "" : NODE_TEXT[n.state]}`}
                      style={{
                        width: R * 2,
                        height: R * 2,
                        ...(gc
                          ? { borderColor: gc, color: gc, boxShadow: n.state === "active" ? `0 0 16px ${gc}88` : undefined, backgroundColor: `${gc}1a` }
                          : {}),
                      }}
                    >
                      {/* articulation-point ring */}
                      {n.ring && <span className="pointer-events-none absolute -inset-[5px] rounded-full border-2 border-error/80" />}
                      {n.label}
                    </div>
                    {n.badge && (
                      <motion.span
                        key={n.badge}
                        initial={{ scale: 1.35, opacity: 0.4 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mt-0.5 whitespace-nowrap rounded bg-surface-container/80 px-1 font-mono text-[9.5px] text-amber"
                      >
                        {n.badge}
                      </motion.span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Data table */}
            {table && (
              <div className="shrink-0 rounded-lg border border-outline-variant bg-surface-container-low/70 p-3 backdrop-blur-sm">
                <div className="mb-2 font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant/70">{table.title}</div>
                <table className="font-mono text-[12px]">
                  <thead>
                    <tr>
                      <th className="pr-2" />
                      {table.columns.map((c) => (
                        <th key={c} className="min-w-[34px] px-1.5 pb-1 text-center font-normal text-on-surface-variant/50">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((r) => (
                      <tr key={r.label}>
                        <td className="pr-2 text-right text-on-surface-variant/50">{r.label}</td>
                        {r.cells.map((c, i) => (
                          <td key={i} className="px-0.5 py-0.5">
                            <motion.div
                              key={c.text}
                              initial={{ scale: 1.25, opacity: 0.4 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className={`min-w-[34px] rounded px-1.5 py-0.5 text-center transition-colors duration-300 ${CELL[c.state ?? "idle"]}`}
                            >
                              {c.text}
                            </motion.div>
                          </td>
                        ))}
                        {r.cells.length === 0 && <td className="px-1.5 text-on-surface-variant/30">—</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Strip */}
          {strip && (
            <div className="flex items-center gap-2 self-center">
              <span className="shrink-0 font-label-caps text-[9px] uppercase tracking-wider text-on-surface-variant/60">{strip.label}</span>
              <div className="flex max-w-[560px] flex-wrap gap-1">
                {strip.chips.map((t, i) => (
                  <span key={i} className={`flex h-6 items-center justify-center border px-1.5 font-mono text-[11px] transition-colors duration-300 ${CHIP[t.state]}`}>
                    {t.text}
                  </span>
                ))}
                {strip.chips.length === 0 && <span className="font-mono text-[11px] text-on-surface-variant/40">—</span>}
              </div>
            </div>
          )}

          {/* Verdict badge */}
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
