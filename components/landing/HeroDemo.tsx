"use client";

// Self-playing miniature of the app's signature animation: insert-at-head on
// a linked list, with the HEAD pointer box being rewired live and the matching
// pseudocode line lighting up. Loops forever; pure framer-motion, no engine.

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const PSEUDO = ["node = new Node(5)", "node.next = head", "head = node"];

const PHASES: { line: number | null; text: string }[] = [
  { line: null, text: "A linked list — HEAD stores the address of the first node." },
  { line: 1, text: "Allocate a new node. It points at nothing yet." },
  { line: 2, text: "node.next = head — the new link forms." },
  { line: 3, text: "head = node — the HEAD box is overwritten. That's it: O(1)." },
  { line: null, text: "Inserted ✓ — no shifting, just two pointer writes." },
];

// Geometry
const ROW_Y = 106;
const FLOAT_Y = 16;
const NODE_W = 72;
const NODE_H = 44;
const SLOT = 96;
const X0 = 96; // first slot

const spring = { type: "spring", stiffness: 150, damping: 22 } as const;

function Node({
  x,
  y,
  value,
  accent,
  instant,
}: {
  x: number;
  y: number;
  value: number;
  accent?: boolean;
  instant?: boolean;
}) {
  return (
    <motion.div
      initial={false}
      animate={{ left: x, top: y }}
      transition={instant ? { duration: 0 } : spring}
      className={`absolute flex items-stretch overflow-hidden rounded-lg border-2 bg-surface-container/90 font-mono backdrop-blur-sm ${
        accent ? "border-mint shadow-[0_0_18px_rgba(52,201,138,0.45)]" : "border-outline-variant"
      }`}
      style={{ width: NODE_W, height: NODE_H }}
    >
      <span className={`flex flex-1 items-center justify-center text-[15px] font-bold ${accent ? "text-mint" : "text-on-surface"}`}>
        {value}
      </span>
      <span className="flex w-[26px] items-center justify-center border-l border-outline-variant/60 bg-surface-container-lowest/60 text-[10px] text-on-surface-variant/60">
        •
      </span>
    </motion.div>
  );
}

export function HeroDemo() {
  const [phase, setPhase] = useState(0);
  const [instant, setInstant] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (phase >= PHASES.length - 1) {
        setInstant(true);
        setPhase(0);
        setTimeout(() => setInstant(false), 60);
      } else {
        setPhase(phase + 1);
      }
    }, phase === PHASES.length - 1 ? 2600 : 1900);
    return () => clearTimeout(t);
  }, [phase]);

  const gapOpen = phase >= 1; // 10 & 20 slide right, new node hovers over slot 0
  const linked = phase >= 2; // 5 → 10 arrow exists
  const headFlipped = phase >= 3; // HEAD points at 5; 5 drops into the row
  const p = PHASES[phase];

  const x10 = gapOpen ? X0 + SLOT : X0;
  const x20 = gapOpen ? X0 + 2 * SLOT : X0 + SLOT;
  const nullX = gapOpen ? X0 + 3 * SLOT : X0 + 2 * SLOT;
  const n5y = headFlipped ? ROW_Y : FLOAT_Y;

  const mid = ROW_Y + NODE_H / 2;
  const headArrowX2 = headFlipped ? X0 : x10;
  const arrow5d = headFlipped
    ? `M ${X0 + NODE_W} ${mid} C ${X0 + NODE_W + 12} ${mid}, ${x10 - 12} ${mid}, ${x10 - 3} ${mid}`
    : `M ${X0 + NODE_W} ${FLOAT_Y + NODE_H / 2} C ${X0 + NODE_W + 26} ${FLOAT_Y + NODE_H / 2}, ${x10 + 20} ${ROW_Y - 26}, ${x10 + 14} ${ROW_Y - 3}`;

  return (
    <div className="glass-panel relative w-full max-w-[560px] rounded-xl border border-outline-variant/70 p-5">
      {/* Title bar */}
      <div className="mb-3 flex items-center justify-between">
        <span className="font-label-caps text-[10px] tracking-widest text-on-surface-variant/60">
          LINKED LIST · INSERT AT HEAD
        </span>
        <span className="flex items-center gap-1.5 font-label-caps text-[10px] text-mint">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-mint" />
          LIVE
        </span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Canvas */}
        <div className="relative h-[190px] flex-1 overflow-hidden" style={{ minWidth: 300 }}>
          <svg className="absolute inset-0 h-full w-full overflow-visible">
            <defs>
              <marker id="hd-gray" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#7a8087" />
              </marker>
              <marker id="hd-mint" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#34C98A" />
              </marker>
            </defs>
            {/* HEAD → first node */}
            <motion.path
              initial={false}
              animate={{ d: `M 62 ${mid} C 72 ${mid}, ${headArrowX2 - 12} ${mid}, ${headArrowX2 - 3} ${mid}` }}
              transition={instant ? { duration: 0 } : { type: "tween", duration: 0.5 }}
              fill="none"
              stroke="#34C98A"
              strokeWidth={headFlipped ? 2.2 : 1.6}
              markerEnd="url(#hd-mint)"
            />
            {/* 5 → 10 */}
            {linked && (
              <motion.path
                key={`link5-${headFlipped}`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1, d: arrow5d }}
                transition={instant ? { duration: 0 } : { type: "tween", duration: 0.5 }}
                fill="none"
                stroke="#34C98A"
                strokeWidth={2}
                markerEnd="url(#hd-mint)"
              />
            )}
            {/* 10 → 20 */}
            <motion.path
              initial={false}
              animate={{ d: `M ${x10 + NODE_W} ${mid} C ${x10 + NODE_W + 12} ${mid}, ${x20 - 12} ${mid}, ${x20 - 3} ${mid}` }}
              transition={instant ? { duration: 0 } : spring}
              fill="none"
              stroke="#7a8087"
              strokeWidth={1.6}
              markerEnd="url(#hd-gray)"
            />
            {/* 20 → NULL */}
            <motion.path
              initial={false}
              animate={{ d: `M ${x20 + NODE_W} ${mid} C ${x20 + NODE_W + 10} ${mid}, ${nullX - 8} ${mid}, ${nullX - 2} ${mid}` }}
              transition={instant ? { duration: 0 } : spring}
              fill="none"
              stroke="#7a8087"
              strokeWidth={1.6}
              markerEnd="url(#hd-gray)"
            />
          </svg>

          {/* HEAD box */}
          <div
            className={`absolute flex flex-col items-center justify-center gap-0.5 rounded-lg border-2 bg-surface-container/90 font-mono transition-shadow duration-300 ${
              phase === 3 ? "border-mint shadow-[0_0_18px_rgba(52,201,138,0.55)]" : "border-mint/60"
            }`}
            style={{ left: 8, top: ROW_Y, width: 54, height: NODE_H }}
          >
            <span className="text-[8px] uppercase tracking-wider text-mint/80">head</span>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={headFlipped ? "@2F" : "@7A"}
                initial={{ scale: 1.5, opacity: 0.3 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-[12px] font-bold text-mint"
              >
                {headFlipped ? "@2F" : "@7A"}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Nodes */}
          <Node x={x10} y={ROW_Y} value={10} instant={instant} />
          <Node x={x20} y={ROW_Y} value={20} instant={instant} />
          <AnimatePresence>
            {phase >= 1 && (
              <motion.div
                key="node5"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.25 } }}
              >
                <Node x={X0} y={n5y} value={5} accent instant={instant} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* NULL */}
          <motion.span
            initial={false}
            animate={{ left: nullX + 2 }}
            transition={instant ? { duration: 0 } : spring}
            className="absolute font-mono text-[11px] text-on-surface-variant/50"
            style={{ top: mid - 8 }}
          >
            NULL
          </motion.span>

          {/* Narration */}
          <AnimatePresence mode="wait">
            <motion.p
              key={phase}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-0 left-0 right-0 font-mono text-[11px] leading-snug text-on-surface-variant/80"
            >
              {p.text}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Pseudocode */}
        <div className="shrink-0 self-start rounded-lg border border-outline-variant/60 bg-surface-container-lowest/70 p-3 sm:w-[190px]">
          <p className="mb-2 font-label-caps text-[9px] tracking-widest text-on-surface-variant/50">PSEUDOCODE</p>
          <pre className="font-mono text-[11px] leading-[1.9]">
            {PSEUDO.map((l, i) => (
              <div
                key={i}
                className={`-mx-1 rounded px-1 transition-colors duration-300 ${
                  p.line === i + 1 ? "bg-amber/15 text-amber" : "text-on-surface-variant/60"
                }`}
              >
                <span className="mr-1.5 select-none text-on-surface-variant/30">{i + 1}</span>
                {l}
              </div>
            ))}
          </pre>
          <div className="mt-3 flex gap-1.5">
            <span className="border border-amber/40 bg-amber/10 px-1.5 py-0.5 font-mono text-[10px] text-amber">O(1)</span>
            <span className="border border-mint/40 bg-mint/10 px-1.5 py-0.5 font-mono text-[10px] text-mint">O(1)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
