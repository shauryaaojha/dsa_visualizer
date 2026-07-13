"use client";

// Control rail for the OOP visualizer. OOP concepts run a fixed scenario (no
// numeric data to edit), so the rail focuses on: which concept is playing, the
// language for the code rail, a one-line hint, and a re-run button.

import { Icon } from "@/components/ui/Icon";
import { OOPS_OPERATIONS, useOopsStore } from "@/lib/oopsStore";
import type { OopsLanguage } from "@/types/visualization";

const LANGS: { id: OopsLanguage; label: string }[] = [
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
  { id: "python", label: "Python" },
];

export function OopsSidebar() {
  const operation = useOopsStore((s) => s.operation);
  const language = useOopsStore((s) => s.language);
  const setLanguage = useOopsStore((s) => s.setLanguage);
  const run = useOopsStore((s) => s.run);

  const meta = OOPS_OPERATIONS.find((o) => o.id === operation);

  return (
    <aside className="z-40 flex h-full w-72 shrink-0 flex-col border-r border-outline-variant bg-surface-container-low/95 backdrop-blur-xl overflow-y-auto scroll-thin md:bg-surface-container-low/80">
      <div className="flex flex-1 flex-col gap-md p-md">
        <div className="flex items-center gap-2 border-b border-outline-variant pb-md">
          <Icon name={meta?.icon ?? "deployed_code"} className="text-[16px] text-primary" />
          <h2 className="font-label-caps text-label-caps text-primary">{meta?.label ?? "OOP"}</h2>
        </div>

        <div>
          <label className="mb-1.5 block font-label-caps text-[10px] text-on-surface-variant">CODE LANGUAGE</label>
          <div className="grid grid-cols-3 gap-1">
            {LANGS.map((l) => {
              const selected = l.id === language;
              return (
                <button
                  key={l.id}
                  onClick={() => setLanguage(l.id)}
                  className={`border px-1 py-1.5 font-label-caps text-[9px] tracking-wider transition-colors ${
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-outline-variant text-on-surface-variant hover:border-primary/60 hover:text-on-surface"
                  }`}
                >
                  {l.label}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 font-body-sm text-[10px] text-on-surface-variant/60">
            Samples run in all three — switch anytime; the highlighted lines stay in sync.
          </p>
        </div>

        {meta && (
          <div className="border-t border-outline-variant pt-md">
            <p className="font-body-sm text-[11px] leading-relaxed text-on-surface-variant/80">{meta.hint}</p>
          </div>
        )}

        <button
          onClick={() => run(operation)}
          className="mt-auto flex w-full items-center justify-center gap-2 bg-primary-container py-2.5 font-label-caps text-label-caps text-surface transition-transform hover:bg-opacity-90 active:scale-[0.98]"
        >
          <Icon name="replay" className="text-[18px]" /> Replay
        </button>
      </div>
    </aside>
  );
}
