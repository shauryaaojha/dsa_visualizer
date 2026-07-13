"use client";

// A UML class box: name compartment (italic + «stereotype» for abstract /
// interface), attributes compartment, methods compartment. Access glyphs are
// coloured (+ mint, − coral, # amber). Hidden handles on all four sides let the
// floating UmlEdge attach from any direction.

import { Handle, Position, type NodeProps } from "reactflow";

interface Data {
  name: string;
  stereotype?: "abstract" | "interface";
  attributes?: string[];
  methods?: string[];
}

function glyphColor(line: string): string {
  const t = line.trimStart();
  if (t.startsWith("+")) return "text-mint";
  if (t.startsWith("-") || t.startsWith("−")) return "text-coral";
  if (t.startsWith("#")) return "text-amber";
  return "text-on-surface-variant";
}

const HANDLE_STYLE = { opacity: 0, width: 1, height: 1, border: "none", background: "transparent" } as const;

export function UmlClassNode({ data, selected }: NodeProps<Data>) {
  return (
    <div
      className={`min-w-[150px] overflow-hidden rounded-md border-2 bg-surface-container/95 font-code-snippet shadow-lg backdrop-blur-sm transition-colors ${
        selected ? "border-primary shadow-[0_0_18px_rgba(255,95,74,0.35)]" : "border-outline-variant"
      }`}
    >
      <Handle type="target" position={Position.Top} style={HANDLE_STYLE} isConnectable={false} />
      <Handle type="source" position={Position.Bottom} style={HANDLE_STYLE} isConnectable={false} />

      <div className="flex flex-col items-center border-b border-outline-variant bg-surface-container-lowest/70 px-3 py-1.5">
        {data.stereotype && (
          <span className="font-mono text-[9px] uppercase tracking-wider text-on-surface-variant/60">«{data.stereotype}»</span>
        )}
        <span className={`text-[13px] font-bold text-on-surface ${data.stereotype ? "italic" : ""}`}>{data.name}</span>
      </div>

      {data.attributes && data.attributes.length > 0 && (
        <div className="border-b border-outline-variant/60 px-3 py-1">
          {data.attributes.map((a, i) => (
            <div key={i} className={`text-[11px] leading-relaxed ${glyphColor(a)}`}>{a}</div>
          ))}
        </div>
      )}

      {data.methods && data.methods.length > 0 && (
        <div className="px-3 py-1">
          {data.methods.map((m, i) => (
            <div key={i} className={`text-[11px] leading-relaxed ${glyphColor(m)}`}>{m}</div>
          ))}
        </div>
      )}
    </div>
  );
}
