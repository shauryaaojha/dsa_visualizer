"use client";

// A use-case diagram actor — a stick figure with a label. Actors sit OUTSIDE
// the system boundary.

import { Handle, Position, type NodeProps } from "reactflow";

const HANDLE_STYLE = { opacity: 0, width: 1, height: 1, border: "none", background: "transparent" } as const;

export function ActorNode({ data, selected }: NodeProps<{ name: string }>) {
  return (
    <div className="flex w-[84px] flex-col items-center">
      <Handle type="source" position={Position.Right} style={HANDLE_STYLE} isConnectable={false} />
      <Handle type="target" position={Position.Left} style={HANDLE_STYLE} isConnectable={false} />
      <svg width="40" height="56" viewBox="0 0 40 56" className={selected ? "text-primary" : "text-on-surface"}>
        <g stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round">
          <circle cx="20" cy="9" r="7" />
          <line x1="20" y1="16" x2="20" y2="36" />
          <line x1="6" y1="24" x2="34" y2="24" />
          <line x1="20" y1="36" x2="8" y2="52" />
          <line x1="20" y1="36" x2="32" y2="52" />
        </g>
      </svg>
      <span className={`mt-1 text-center font-code-snippet text-[11px] ${selected ? "text-primary" : "text-on-surface"}`}>{data.name}</span>
    </div>
  );
}
