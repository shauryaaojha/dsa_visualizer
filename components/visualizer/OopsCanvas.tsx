"use client";

// The OOP memory diagram. Three columns rendered as absolutely-positioned,
// framer-motion-animated boxes inside a FitStage:
//
//   CLASS AREA  — blueprint boxes (name / attributes / methods compartments),
//                 class-level statics, and relation arrows (extends, implements,
//                 composition …).
//   STACK       — a main() caller pill + named reference boxes.
//   HEAP        — objects with per-class field layers and optional vtable strip.
//
// Animated SVG arrows show method calls / field access (green = ok, red +✕ =
// blocked), and an output strip at the top mirrors the program's console.
// Everything is keyed on stable ids so objects animate in and out.

import { AnimatePresence, motion } from "framer-motion";
import { FitStage } from "@/components/visualizer/FitStage";
import { useOopsStore } from "@/lib/oopsStore";
import type {
  OopsAccess,
  OopsCall,
  OopsClassBox,
  OopsHeapObject,
  OopsRef,
  OopsRelation,
  SQCellState,
  TokenChip,
} from "@/types/visualization";

const C_PTR = "#34C98A"; // mint
const C_LINK = "#7a8087";
const C_ERR = "#FF5F4A";

const HEADER_H = 30;
const ROW_H = 24;
const PAD = 8;

const CLASS_X = 0;
const CLASS_W = 216;
const COL_GAP = 40; // gap between class grid columns
const COL_SPACING = 84; // gap between the three memory regions
const REF_W = 150;
const OBJ_W = 216;
const TOP = 54; // below column headers
const V_GAP = 26;

const BORDER: Record<SQCellState, string> = {
  idle: "border-outline-variant",
  active: "border-coral shadow-[0_0_16px_rgba(255,95,74,0.4)]",
  visited: "border-outline-variant opacity-40",
  new: "border-mint shadow-[0_0_18px_rgba(52,201,138,0.5)]",
  removing: "border-error shadow-[0_0_16px_rgba(255,95,74,0.5)]",
  target: "border-amber shadow-[0_0_16px_rgba(245,166,35,0.4)]",
  found: "border-mint animate-cell-pulse",
};

const ROW_BG: Record<SQCellState, string> = {
  idle: "",
  active: "bg-coral/10 text-coral",
  visited: "opacity-40",
  new: "bg-mint/10 text-mint",
  removing: "bg-error/10 text-error line-through",
  target: "bg-amber/10 text-amber",
  found: "bg-mint/15 text-mint",
};

const GLYPH: Record<OopsAccess, string> = { public: "+", private: "−", protected: "#" };
const GLYPH_COLOR: Record<OopsAccess, string> = {
  public: "text-mint",
  private: "text-coral",
  protected: "text-amber",
};

const CHIP: Record<TokenChip["state"], string> = {
  pending: "border-outline-variant/50 text-on-surface-variant/45",
  active: "border-coral text-coral",
  done: "border-outline-variant/50 text-on-surface-variant/80",
  matched: "border-mint text-mint",
  error: "border-error text-error",
};

const SPRING = { type: "spring", stiffness: 180, damping: 26 } as const;
const TWEEN = { type: "tween", duration: 0.5, ease: "easeInOut" } as const;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function classHeight(c: OopsClassBox): number {
  const statics = c.statics?.length ?? 0;
  // Stereotype boxes render a two-line header («interface» + name).
  return HEADER_H + (c.stereotype ? 14 : 0) + (statics + c.members.length) * ROW_H + PAD;
}
function objectHeight(o: OopsHeapObject): number {
  const vt = o.vtable?.length ?? 0;
  return HEADER_H + o.fields.length * ROW_H + (vt ? vt * ROW_H + 16 : 0) + PAD;
}

export function OopsCanvas() {
  const step = useOopsStore((s) => s.currentStep());
  const program = useOopsStore((s) => s.program);

  const classes = step?.classes ?? [];
  const relations = step?.relations ?? [];
  const heap = step?.heap ?? [];
  const refs = step?.refs ?? [];
  const calls = step?.calls ?? [];
  const output = step?.output ?? [];
  const message = step?.message;

  // --- Layout -------------------------------------------------------------
  // Region positions are derived from the WHOLE program (not just the current
  // step): the class area gets as many grid columns as it will ever need, and
  // the stack/heap columns start after it — so nothing ever collides and the
  // columns don't jump around as boxes appear.
  let maxCol = 0;
  let hasStack = false;
  let hasHeap = false;
  for (const st of program?.steps ?? (step ? [step] : [])) {
    for (const c of st.classes) maxCol = Math.max(maxCol, c.x);
    if (st.refs.length > 0 || st.calls.length > 0) hasStack = true;
    if (st.heap.length > 0) hasHeap = true;
  }
  const classAreaW = (maxCol + 1) * CLASS_W + maxCol * COL_GAP;
  const stackX = CLASS_X + classAreaW + COL_SPACING;
  const heapX = (hasStack ? stackX + REF_W : CLASS_X + classAreaW) + COL_SPACING;

  const rects = new Map<string, Rect>();

  // Class column(s): group by grid-x, stack by grid-y with real heights.
  const cols = Array.from(new Set(classes.map((c) => c.x))).sort((a, b) => a - b);
  cols.forEach((cx) => {
    const colClasses = classes.filter((c) => c.x === cx).sort((a, b) => a.y - b.y);
    let y = TOP;
    colClasses.forEach((c) => {
      const h = classHeight(c);
      rects.set(`cls:${c.id}`, { x: CLASS_X + cx * (CLASS_W + COL_GAP), y, w: CLASS_W, h });
      y += h + V_GAP;
    });
  });

  // Stack column: main() pill, then references.
  const MAIN_H = 30;
  rects.set("main", { x: stackX, y: TOP, w: REF_W, h: MAIN_H });
  let ry = TOP + MAIN_H + V_GAP;
  refs.forEach((r) => {
    rects.set(`ref:${r.id}`, { x: stackX, y: ry, w: REF_W, h: 40 });
    ry += 40 + 14;
  });

  // Heap column: objects stacked.
  let hy = TOP;
  heap.forEach((o) => {
    const h = objectHeight(o);
    rects.set(`obj:${o.id}`, { x: heapX, y: hy, w: OBJ_W, h });
    hy += h + V_GAP;
  });

  const maxClassY = Math.max(
    TOP,
    ...classes.map((c) => (rects.get(`cls:${c.id}`)?.y ?? 0) + (rects.get(`cls:${c.id}`)?.h ?? 0)),
  );
  const outH = output.length ? 40 : 0;
  const contentW = (hasHeap ? heapX + OBJ_W : hasStack ? stackX + REF_W : classAreaW) + 8;
  const contentH = outH + Math.max(maxClassY, ry, hy, TOP) + (message ? 56 : 20);

  // Shift everything down when an output strip is present.
  const shift = outH;

  const rectOf = (key: string) => {
    const r = rects.get(key);
    if (!r) return null;
    return { ...r, y: r.y + shift };
  };

  // --- Relation arrows ----------------------------------------------------
  // `angle` is the direction of travel AT the head (deg, SVG y-down): -90 = up,
  // 90 = down, 0 = right, 180 = left. Markers are drawn pointing along +x and
  // rotated by it.
  function relationPath(rel: OopsRelation): { d: string; head: { x: number; y: number }; angle: number } | null {
    const from = rectOf(`cls:${rel.from}`);
    const to = rectOf(`cls:${rel.to}`);
    if (!from || !to) return null;
    const xOverlap = Math.min(from.x + from.w, to.x + to.w) - Math.max(from.x, to.x);
    if (xOverlap > 40) {
      // Stacked in the same grid column → connect top/bottom edges.
      const up = to.y < from.y;
      const fx = from.x + from.w / 2;
      const fy = up ? from.y : from.y + from.h;
      const tx = to.x + to.w / 2;
      const ty = up ? to.y + to.h : to.y;
      const midY = (fy + ty) / 2;
      const d = `M ${fx} ${fy} C ${fx} ${midY}, ${tx} ${midY}, ${tx} ${ty}`;
      return { d, head: { x: tx, y: ty }, angle: up ? -90 : 90 };
    }
    // Different grid columns → connect the facing side edges, so the arrow
    // travels through the column gap instead of through the boxes.
    const right = to.x > from.x;
    const fx = right ? from.x + from.w : from.x;
    const fy = from.y + Math.min(from.h / 2, 40);
    const tx = right ? to.x : to.x + to.w;
    const ty = to.y + Math.min(to.h / 2, 40);
    const midX = (fx + tx) / 2;
    const d = `M ${fx} ${fy} C ${midX} ${fy}, ${midX} ${ty}, ${tx} ${ty}`;
    return { d, head: { x: tx, y: ty }, angle: right ? 0 : 180 };
  }

  // --- Call arrows --------------------------------------------------------
  function callPath(call: OopsCall): { d: string; tx: number; ty: number; color: string } | null {
    const src = call.from === "main" ? rectOf("main") : rectOf(`ref:${call.from}`);
    if (!src) return null;
    const tgt = call.toObjectId ? rectOf(`obj:${call.toObjectId}`) : call.toClassId ? rectOf(`cls:${call.toClassId}`) : null;
    if (!tgt) return null;
    const sx = src.x + src.w / 2;
    const sy = src.y + src.h / 2;
    const goingRight = tgt.x > src.x;
    const tx = goingRight ? tgt.x - 4 : tgt.x + tgt.w + 4;
    const ty = tgt.y + Math.min(tgt.h / 2, 24);
    const sEdgeX = goingRight ? src.x + src.w : src.x;
    const midX = (sEdgeX + tx) / 2;
    const d = `M ${sEdgeX} ${sy} C ${midX} ${sy}, ${midX} ${ty}, ${tx} ${ty}`;
    const color = call.phase === "blocked" ? C_ERR : C_PTR;
    return { d, tx, ty, color };
  }

  const columnLabel = (label: string, x: number, w: number) => (
    <span
      className="absolute font-label-caps text-[9px] uppercase tracking-widest text-on-surface-variant/40"
      style={{ left: x, top: shift + 8, width: w, textAlign: "center" }}
    >
      {label}
    </span>
  );

  return (
    <FitStage>
      <div className="relative" style={{ width: contentW, height: contentH }}>
        {/* Output strip */}
        {output.length > 0 && (
          <div className="absolute left-0 right-0 flex items-center gap-2" style={{ top: 0 }}>
            <span className="w-14 shrink-0 text-right font-label-caps text-[9px] uppercase tracking-wider text-on-surface-variant/60">
              output
            </span>
            <div className="flex flex-wrap gap-1">
              {output.map((t, i) => (
                <span key={i} className={`flex h-6 min-w-6 items-center justify-center border px-1.5 font-mono text-[11px] ${CHIP[t.state]}`}>
                  {t.text}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Column headers */}
        {classes.length > 0 && columnLabel("Class Area", CLASS_X, classAreaW)}
        {(refs.length > 0 || calls.length > 0) && columnLabel("Stack", stackX, REF_W)}
        {heap.length > 0 && columnLabel("Heap", heapX, OBJ_W)}

        {/* SVG wiring: relations + call arrows */}
        <svg className="absolute inset-0 overflow-visible" width={contentW} height={contentH}>
          <defs>
            <marker id="oo-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
              <path d="M0,0 L7,3 L0,6 Z" fill={C_PTR} />
            </marker>
            <marker id="oo-arrow-err" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
              <path d="M0,0 L7,3 L0,6 Z" fill={C_ERR} />
            </marker>
          </defs>

          {/* Relations (inheritance triangles etc.) */}
          <AnimatePresence>
            {relations.map((rel) => {
              const p = relationPath(rel);
              if (!p) return null;
              const dashed = rel.kind === "implements" || rel.kind === "dependency";
              const lit = rel.state === "active" || rel.state === "new";
              const hollow = rel.kind === "extends" || rel.kind === "implements";
              const diamond = rel.kind === "composition" || rel.kind === "aggregation";
              const filled = rel.kind === "composition";
              const open = rel.kind === "association" || rel.kind === "dependency";
              const stroke = lit ? C_PTR : C_LINK;
              // Markers drawn pointing along +x with the tip at the origin,
              // then rotated into the arrow's direction of travel.
              const headTf = `translate(${p.head.x} ${p.head.y}) rotate(${p.angle})`;
              const horizontal = p.angle === 0 || p.angle === 180;
              return (
                <g key={rel.id}>
                  <motion.path
                    initial={{ opacity: 0 }}
                    animate={{ d: p.d, opacity: rel.state === "removing" ? 0.3 : 1 }}
                    exit={{ opacity: 0 }}
                    transition={TWEEN}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={lit ? 2.2 : 1.5}
                    strokeDasharray={dashed ? "5 4" : undefined}
                  />
                  {/* End marker at parent/target */}
                  {hollow && (
                    <g transform={headTf}>
                      <polygon points="0,0 -12,-6.5 -12,6.5" fill="var(--surface, #14110f)" stroke={stroke} strokeWidth={1.5} />
                    </g>
                  )}
                  {diamond && (
                    <g transform={headTf}>
                      <polygon points="0,0 -9,-6 -18,0 -9,6" fill={filled ? C_LINK : "var(--surface, #14110f)"} stroke={C_LINK} strokeWidth={1.5} />
                    </g>
                  )}
                  {open && (
                    <g transform={headTf}>
                      <path d="M -8,-5 L 0,0 L -8,5" fill="none" stroke={stroke} strokeWidth={1.5} />
                    </g>
                  )}
                  {rel.label && (
                    <text
                      x={horizontal ? p.head.x + (p.angle === 0 ? -24 : 24) : p.head.x + 10}
                      y={horizontal ? p.head.y - 8 : p.head.y + (p.angle === -90 ? 14 : -8)}
                      textAnchor={horizontal && p.angle === 0 ? "end" : "start"}
                      className="fill-on-surface-variant/70"
                      fontSize={9}
                      fontFamily="monospace"
                    >
                      {rel.label}
                    </text>
                  )}
                </g>
              );
            })}
          </AnimatePresence>

          {/* Call / access arrows */}
          <AnimatePresence>
            {calls.map((call) => {
              const p = callPath(call);
              if (!p) return null;
              return (
                <motion.path
                  key={call.id}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ d: p.d, pathLength: 1, opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.25 } }}
                  transition={TWEEN}
                  fill="none"
                  stroke={p.color}
                  strokeWidth={2.4}
                  markerEnd={call.phase === "blocked" ? "url(#oo-arrow-err)" : "url(#oo-arrow)"}
                />
              );
            })}
          </AnimatePresence>
        </svg>

        {/* Blocked ✕ + result chips on call targets */}
        {calls.map((call) => {
          const p = callPath(call);
          if (!p) return null;
          if (call.phase === "blocked") {
            return (
              <div key={`x-${call.id}`} className="absolute z-10 flex items-center gap-1" style={{ left: p.tx - 8, top: p.ty - 26 }}>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-error text-[12px] font-bold text-surface">✕</span>
                {call.note && <span className="whitespace-nowrap font-mono text-[10px] text-error">{call.note}</span>}
              </div>
            );
          }
          if (call.phase === "returned" && call.result) {
            return (
              <motion.span
                key={`res-${call.id}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute z-10 whitespace-nowrap rounded-full border border-mint/60 bg-mint/20 px-2 py-0.5 font-mono text-[10px] text-mint backdrop-blur-sm"
                style={{ left: p.tx - 6, top: p.ty - 26 }}
              >
                ⟶ {call.result}
              </motion.span>
            );
          }
          return null;
        })}

        {/* Class boxes */}
        <AnimatePresence>
          {classes.map((c) => {
            const r = rectOf(`cls:${c.id}`)!;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, scale: 0.9, left: r.x, top: r.y }}
                animate={{ opacity: 1, scale: 1, left: r.x, top: r.y }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={SPRING}
                className={`absolute overflow-hidden rounded-lg border-2 bg-surface-container/85 backdrop-blur-sm transition-colors duration-300 ${BORDER[c.state]}`}
                style={{ width: r.w }}
              >
                <div className="flex flex-col items-center border-b border-outline-variant/60 bg-surface-container-lowest/60 py-1">
                  {c.stereotype && (
                    <span className="font-mono text-[9px] uppercase tracking-wider text-on-surface-variant/60">
                      «{c.stereotype}»
                    </span>
                  )}
                  <span className={`font-code-snippet text-[13px] font-bold ${c.stereotype === "abstract" || c.stereotype === "interface" ? "italic" : ""} text-on-surface`}>
                    {c.name}
                  </span>
                </div>
                {/* Statics live in the class box */}
                {c.statics?.map((s) => (
                  <div key={s.name} className={`flex items-center justify-between gap-1 border-b border-outline-variant/30 px-2 font-mono text-[11px] ${ROW_BG[s.state]}`} style={{ height: ROW_H }}>
                    <span className="underline decoration-dotted">{s.name}</span>
                    <motion.span key={s.value} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="font-bold">
                      {s.value}
                    </motion.span>
                  </div>
                ))}
                {c.members.map((m) => (
                  <div key={m.id} className={`flex items-center gap-1.5 px-2 font-mono text-[11px] ${ROW_BG[m.state]}`} style={{ height: ROW_H }}>
                    <span className={`font-bold ${GLYPH_COLOR[m.access]}`}>{GLYPH[m.access]}</span>
                    <span className={`${m.isAbstract ? "italic" : ""} ${m.isStatic ? "underline" : ""} truncate`}>{m.name}</span>
                    {m.isFinal && <span className="text-[9px] text-on-surface-variant/50">🔒</span>}
                    {m.note && <span className="ml-auto text-[8px] text-on-surface-variant/45">{m.note}</span>}
                  </div>
                ))}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* main() pill + references (stack) */}
        {(refs.length > 0 || calls.length > 0) && (
          <div
            className="absolute flex items-center justify-center rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest/50 font-mono text-[11px] text-on-surface-variant"
            style={{ left: rectOf("main")!.x, top: rectOf("main")!.y, width: REF_W, height: 30 }}
          >
            main()
          </div>
        )}
        <AnimatePresence>
          {refs.map((ref) => {
            const r = rectOf(`ref:${ref.id}`)!;
            const target = heap.find((o) => o.id === ref.targetId);
            return (
              <motion.div
                key={ref.id}
                initial={{ opacity: 0, x: -12, left: r.x, top: r.y }}
                animate={{ opacity: 1, x: 0, left: r.x, top: r.y }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={SPRING}
                className={`absolute flex flex-col justify-center rounded-lg border-2 bg-surface-container/85 px-2 py-1 font-mono backdrop-blur-sm transition-colors duration-300 ${BORDER[ref.state]}`}
                style={{ width: r.w, height: 40 }}
              >
                <span className="text-[9px] text-on-surface-variant/60">{ref.declaredType}</span>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-on-surface">{ref.name}</span>
                  <motion.span key={ref.targetId ?? "null"} initial={{ scale: 1.4, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} className={`text-[11px] ${ref.targetId ? "text-mint" : "text-on-surface-variant/50"}`}>
                    {target ? `@${target.addr}` : "null"}
                  </motion.span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Heap objects */}
        <AnimatePresence>
          {heap.map((o) => {
            const r = rectOf(`obj:${o.id}`)!;
            return (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, scale: 0.7, x: 24, left: r.x, top: r.y }}
                animate={{ opacity: 1, scale: 1, x: o.floating ? 20 : 0, left: r.x, top: r.y }}
                exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.4 } }}
                transition={SPRING}
                className={`absolute overflow-hidden rounded-lg border-2 bg-surface-container/85 backdrop-blur-sm transition-colors duration-300 ${BORDER[o.state]}`}
                style={{ width: r.w }}
              >
                <div className="flex items-center justify-between border-b border-outline-variant/60 bg-surface-container-lowest/60 px-2 py-1">
                  <span className="font-code-snippet text-[12px] font-bold text-on-surface">{o.className}</span>
                  <span className="font-mono text-[10px] text-mint">@{o.addr}</span>
                </div>
                {o.fields.map((f) => (
                  <div key={f.id} className={`flex items-center justify-between gap-1 px-2 font-mono text-[11px] ${ROW_BG[f.state]}`} style={{ height: ROW_H }}>
                    <span className="flex items-center gap-1 truncate">
                      <span className={`text-[9px] ${GLYPH_COLOR[f.access]}`}>{GLYPH[f.access]}</span>
                      {f.name}
                    </span>
                    <motion.span key={f.value} initial={{ scale: 1.4, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} className="font-bold">
                      {f.value}
                    </motion.span>
                  </div>
                ))}
                {o.vtable && o.vtable.length > 0 && (
                  <div className="border-t border-dashed border-outline-variant/50 bg-surface-container-lowest/40">
                    <p className="px-2 pt-1 font-label-caps text-[8px] uppercase tracking-wider text-on-surface-variant/50">vtable</p>
                    {o.vtable.map((v) => (
                      <div key={v.method} className={`flex items-center justify-between gap-1 px-2 font-mono text-[10px] ${ROW_BG[v.state]}`} style={{ height: ROW_H }}>
                        <span>{v.method}</span>
                        <span className="text-on-surface-variant/70">→ {v.impl}</span>
                      </div>
                    ))}
                  </div>
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
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border px-4 py-1.5 font-label-caps text-[11px] tracking-wider backdrop-blur-sm ${
                message.tone === "error"
                  ? "border-error/60 bg-error/10 text-error"
                  : message.tone === "ok"
                    ? "border-mint/60 bg-mint/10 text-mint"
                    : "border-outline-variant bg-surface-container/80 text-on-surface-variant"
              }`}
              style={{ top: contentH - 34 }}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FitStage>
  );
}
