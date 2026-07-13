"use client";

// A use-case oval (ellipse) with a verb-phrase label. Sits inside the system
// boundary.

import { Handle, Position, type NodeProps } from "reactflow";

const HANDLE_STYLE = { opacity: 0, width: 1, height: 1, border: "none", background: "transparent" } as const;

export function UseCaseNode({ data, selected }: NodeProps<{ name: string }>) {
  return (
    <div
      className={`flex h-[52px] w-[150px] items-center justify-center rounded-[50%] border-2 bg-surface-container/95 px-3 text-center font-code-snippet text-[11px] shadow-md backdrop-blur-sm transition-colors ${
        selected ? "border-primary text-primary shadow-[0_0_16px_rgba(255,95,74,0.35)]" : "border-coral/70 text-on-surface"
      }`}
    >
      <Handle type="target" position={Position.Left} style={HANDLE_STYLE} isConnectable={false} />
      <Handle type="source" position={Position.Right} style={HANDLE_STYLE} isConnectable={false} />
      {data.name}
    </div>
  );
}
