"use client";

// Presentational right-rail: narrated steps + pseudocode with the live line lit.
// Used by both the array and matrix screens (they share the step shape).

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/Icon";

export interface NotesStep {
  description: string;
  codeLines?: number[];
}

interface NotesPanelProps {
  hasProgram: boolean;
  title?: string;
  steps: NotesStep[];
  stepIndex: number;
  pseudocode: string[];
}

export function NotesPanel({ hasProgram, title, steps, stepIndex, pseudocode }: NotesPanelProps) {
  const activeRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [stepIndex]);

  const codeLines = steps[stepIndex]?.codeLines ?? [];

  return (
    <aside className="z-40 hidden w-80 shrink-0 flex-col border-l border-outline-variant bg-surface-container-low/80 backdrop-blur-xl lg:flex h-full overflow-hidden">
      <div className="flex items-center justify-between border-b border-outline-variant px-md py-3 shrink-0">
        <h3 className="flex items-center gap-2 font-label-caps text-label-caps text-primary">
          <Icon name="school" className="text-[16px]" /> Instructor Notes
        </h3>
        {hasProgram && (
          <span className="font-mono text-[11px] text-on-surface-variant/60">
            {stepIndex + 1}/{steps.length}
          </span>
        )}
      </div>

      {/* Steps */}
      <div className="flex flex-col" style={{ flex: "0 0 55%", minHeight: 0 }}>
        <p className="px-md pt-2 pb-1 font-label-caps text-[10px] text-on-surface-variant/60 shrink-0">STEPS</p>
        <div className="scroll-thin flex-1 overflow-y-auto px-md pb-2 space-y-2">
          {!hasProgram && (
            <p className="font-body-sm text-body-sm text-on-surface-variant/60 mt-2">
              Press <span className="text-primary">Run</span> — each step will be narrated here.
            </p>
          )}
          {hasProgram &&
            steps.slice(0, stepIndex + 1).map((s, i) => {
              const isCurrent = i === stepIndex;
              return (
                <div
                  key={i}
                  ref={isCurrent ? activeRef : undefined}
                  className={`relative border p-sm transition-all ${
                    isCurrent
                      ? "border-coral bg-surface-container text-coral shadow-[0_0_10px_rgba(255,95,74,0.12)]"
                      : "border-outline-variant bg-surface-container text-on-surface-variant opacity-70"
                  }`}
                >
                  <span className={`absolute -left-1 top-2 h-2 w-2 ${isCurrent ? "bg-coral" : "bg-surface-variant"}`} />
                  <p className="font-code-snippet text-code-snippet">
                    <span className={isCurrent ? "font-bold" : "text-primary-container"}>Step {i + 1}:</span> {s.description}
                  </p>
                </div>
              );
            })}
        </div>
      </div>

      {/* Pseudocode */}
      <div className="flex flex-col border-t border-outline-variant" style={{ flex: "1 1 0", minHeight: 0 }}>
        <div className="flex items-center gap-2 px-md pt-3 pb-1 shrink-0">
          <Icon name="code" className="text-[14px] text-on-surface-variant" />
          <p className="font-label-caps text-[10px] text-on-surface-variant">{hasProgram ? title : "PSEUDOCODE"}</p>
        </div>
        <div className="scroll-thin flex-1 overflow-y-auto px-md pb-md min-h-0">
          {!hasProgram ? (
            <p className="font-body-sm text-body-sm text-on-surface-variant/60 mt-1">Pseudocode appears once you run an operation.</p>
          ) : (
            <pre className="rounded bg-surface-container-lowest p-2 font-code-snippet text-code-snippet leading-relaxed overflow-x-auto">
              {pseudocode.map((line, i) => {
                const lit = codeLines.includes(i + 1);
                return (
                  <div key={i} className={`-mx-2 px-2 ${lit ? "bg-amber/15 text-amber" : "text-on-surface-variant/70"}`}>
                    <span className="mr-2 inline-block w-4 select-none text-right text-on-surface-variant/30">{i + 1}</span>
                    {line}
                  </div>
                );
              })}
            </pre>
          )}
        </div>
      </div>
    </aside>
  );
}
