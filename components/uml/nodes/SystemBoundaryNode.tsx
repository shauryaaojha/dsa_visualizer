"use client";

// The system boundary rectangle for use-case diagrams — a large dashed frame
// with a title, sized via node.style. It sits behind the use cases (low
// z-index) and ignores pointer events so clicks reach the nodes on top.

import type { NodeProps } from "reactflow";

export function SystemBoundaryNode({ data }: NodeProps<{ name: string }>) {
  return (
    <div className="pointer-events-none h-full w-full rounded-lg border-2 border-dashed border-outline-variant/70 bg-surface-container-lowest/20">
      <span className="absolute left-1/2 top-2 -translate-x-1/2 whitespace-nowrap font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant/60">
        {data.name}
      </span>
    </div>
  );
}
