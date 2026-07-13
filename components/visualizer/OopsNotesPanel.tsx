"use client";

// Right rail for the OOP visualizer: narrated steps on top, the real
// multi-language source (CodePanel) below. The active step's `anchor` is
// resolved against the current language's line map so the correct lines light
// up — and stay correct when the user switches Java / C++ / Python mid-run.

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import { CodePanel } from "@/components/visualizer/CodePanel";
import { OOPS_CODE } from "@/data/oops/code";
import { useOopsStore } from "@/lib/oopsStore";

export function OopsNotesPanel() {
  const program = useOopsStore((s) => s.program);
  const stepIndex = useOopsStore((s) => s.stepIndex);
  const language = useOopsStore((s) => s.language);
  const setLanguage = useOopsStore((s) => s.setLanguage);

  const activeRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [stepIndex]);

  const hasProgram = !!program;
  const steps = program?.steps ?? [];
  const entry = program ? OOPS_CODE[program.codeKey] : undefined;
  const anchor = steps[stepIndex]?.anchor;
  const activeLines = entry && anchor ? entry.samples[language].lines[anchor] ?? [] : [];

  return (
    <aside className="z-40 hidden w-96 shrink-0 flex-col border-l border-outline-variant bg-surface-container-low/80 backdrop-blur-xl lg:flex h-full overflow-hidden">
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
      <div className="flex flex-col" style={{ flex: "0 0 44%", minHeight: 0 }}>
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

      {/* Source code */}
      <div className="flex flex-col border-t border-outline-variant" style={{ flex: "1 1 0", minHeight: 0 }}>
        <div className="flex items-center gap-2 px-md pt-3 pb-2 shrink-0">
          <Icon name="code" className="text-[14px] text-on-surface-variant" />
          <p className="font-label-caps text-[10px] text-on-surface-variant">{entry ? entry.title : "SOURCE"}</p>
        </div>
        {entry ? (
          <CodePanel entry={entry} language={language} onLanguageChange={setLanguage} activeLines={activeLines} />
        ) : (
          <p className="px-md font-body-sm text-body-sm text-on-surface-variant/60">Source appears once you run a concept.</p>
        )}
      </div>
    </aside>
  );
}
