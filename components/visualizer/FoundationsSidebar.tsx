"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { FOUNDATIONS_OPERATIONS, useFoundationsStore } from "@/lib/foundationsStore";
import type { FoundationsOperationId } from "@/types/visualization";

type Tab = { id: FoundationsOperationId; label: string; icon: string; subpath: string };

const TABS: Record<string, Tab[]> = {
  basics: [
    { id: "fWhatIsAProgram", label: "Program?", icon: "smart_toy", subpath: "programming-basics/what-is-a-program" },
    { id: "fVariables", label: "Variables", icon: "inventory_2", subpath: "programming-basics/variables" },
    { id: "fDatatypes", label: "Datatypes", icon: "category", subpath: "programming-basics/datatypes" },
    { id: "fConditionals", label: "If / Else", icon: "alt_route", subpath: "programming-basics/conditionals" },
    { id: "fLoops", label: "Loops", icon: "repeat", subpath: "programming-basics/loops" },
  ],
  complexity: [
    { id: "fCountingSteps", label: "Count Steps", icon: "timer", subpath: "time-complexity/counting-steps" },
    { id: "fBigO", label: "Big-O", icon: "functions", subpath: "time-complexity/big-o-notation" },
    { id: "fGrowthRates", label: "Growth", icon: "trending_up", subpath: "time-complexity/growth-rates" },
  ],
  analysis: [
    { id: "fTimeComplexity", label: "Time", icon: "schedule", subpath: "complexity-analysis/time-complexity" },
    { id: "fSpaceComplexity", label: "Space", icon: "memory", subpath: "complexity-analysis/space-complexity" },
    { id: "fBestCase", label: "Best", icon: "sentiment_satisfied", subpath: "complexity-analysis/best-case" },
    { id: "fWorstCase", label: "Worst", icon: "sentiment_dissatisfied", subpath: "complexity-analysis/worst-case" },
    { id: "fAverageCase", label: "Average", icon: "sentiment_neutral", subpath: "complexity-analysis/average-case" },
  ],
  asymptotic: [
    { id: "fBigOBound", label: "Big-O", icon: "vertical_align_top", subpath: "asymptotic-analysis/big-o" },
    { id: "fBigOmega", label: "Big-Ω", icon: "vertical_align_bottom", subpath: "asymptotic-analysis/big-omega" },
    { id: "fBigTheta", label: "Big-Θ", icon: "vertical_align_center", subpath: "asymptotic-analysis/big-theta" },
    { id: "fLittleO", label: "little-o", icon: "keyboard_double_arrow_down", subpath: "asymptotic-analysis/little-o" },
    { id: "fLittleOmega", label: "little-ω", icon: "keyboard_double_arrow_up", subpath: "asymptotic-analysis/little-omega" },
  ],
  amortized: [
    { id: "fAggregate", label: "Aggregate", icon: "calculate", subpath: "amortized-analysis/aggregate-method" },
    { id: "fAccounting", label: "Accounting", icon: "savings", subpath: "amortized-analysis/accounting-method" },
    { id: "fPotential", label: "Potential", icon: "battery_charging_full", subpath: "amortized-analysis/potential-method" },
  ],
  math: [
    { id: "fInduction", label: "Induction", icon: "domino_mask", subpath: "mathematical-foundations/induction" },
    { id: "fRecurrence", label: "Recurrences", icon: "all_inclusive", subpath: "mathematical-foundations/recurrence-relations" },
  ],
};

const VALUE_LABEL: Partial<Record<FoundationsOperationId, string>> = {
  fConditionals: "AGE",
  fLoops: "LAPS (1–7)",
  fGrowthRates: "n (4–25)",
};

const LIST_LABEL: Partial<Record<FoundationsOperationId, string>> = {
  fCountingSteps: "YOUR LIST (2–8 numbers)",
  fTimeComplexity: "YOUR LIST (length = n)",
  fSpaceComplexity: "LIST TO REVERSE",
  fBestCase: "LIST TO SEARCH",
  fWorstCase: "LIST TO SEARCH",
  fAverageCase: "LIST TO SEARCH",
};

const TEXT_LABEL: Partial<Record<FoundationsOperationId, string>> = {
  fWhatIsAProgram: "YOUR NAME",
};

export function FoundationsSidebar() {
  const router = useRouter();
  const operation = useFoundationsStore((s) => s.operation);
  const params = useFoundationsStore((s) => s.params);
  const setParams = useFoundationsStore((s) => s.setParams);
  const run = useFoundationsStore((s) => s.run);

  const group = (Object.keys(TABS) as (keyof typeof TABS)[]).find((g) => TABS[g].some((t) => t.id === operation)) ?? "basics";
  const meta = FOUNDATIONS_OPERATIONS.find((o) => o.id === operation);

  return (
    <aside className="z-40 flex h-full w-72 shrink-0 flex-col border-r border-outline-variant bg-surface-container-low/95 backdrop-blur-xl overflow-y-auto scroll-thin md:bg-surface-container-low/80">
      <div className="flex flex-1 flex-col gap-md p-md">
        <div className="flex items-center gap-2 border-b border-outline-variant pb-md">
          <Icon name="school" className="text-[16px] text-primary" />
          <h2 className="font-label-caps text-label-caps text-primary">
            {{
              basics: "Programming Basics",
              complexity: "Time Complexity",
              analysis: "Complexity Analysis",
              asymptotic: "Asymptotic Notation",
              amortized: "Amortized Analysis",
              math: "Math Foundations",
            }[group] ?? "Foundations"}
          </h2>
        </div>

        <p className="font-body-sm text-[11px] leading-relaxed text-on-surface-variant/70">
          Watch the highlighted line in the code panel — that&apos;s the instruction running
          RIGHT NOW. Everything on the canvas is what that one line did.
        </p>

        {/* Lesson tabs */}
        <div>
          <label className="mb-1.5 block font-label-caps text-[10px] text-on-surface-variant">LESSONS</label>
          <div className="grid grid-cols-2 gap-1">
            {TABS[group].map((t) => {
              const selected = t.id === operation;
              return (
                <button
                  key={t.id}
                  onClick={() => router.push(`/topics/foundations/${t.subpath}`)}
                  title={t.label}
                  className={`flex flex-col items-center gap-0.5 border px-1 py-1.5 transition-colors ${
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-outline-variant text-on-surface-variant hover:border-primary/60 hover:text-on-surface"
                  }`}
                >
                  <Icon name={t.icon} className="text-[16px]" />
                  <span className="text-center font-label-caps text-[8px] leading-tight">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Params */}
        {meta?.params.includes("value") && (
          <div>
            <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">
              {VALUE_LABEL[operation] ?? "VALUE"}
            </label>
            <input
              type="number"
              value={params.value || ""}
              placeholder={operation === "fLoops" ? "4" : operation === "fGrowthRates" ? "16" : "15"}
              onChange={(e) => setParams({ value: parseInt(e.target.value, 10) || 0 })}
              className="w-full border border-outline-variant bg-surface-container-lowest px-2 py-1.5 font-mono text-body-sm text-on-surface outline-none focus:border-primary"
            />
          </div>
        )}

        {meta?.params.includes("list") && (
          <div>
            <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">
              {LIST_LABEL[operation] ?? "CUSTOM LIST"}
            </label>
            <input
              type="text"
              value={params.list}
              placeholder="e.g. 5, 3, 8, 1, 9"
              onChange={(e) => setParams({ list: e.target.value })}
              className="w-full border border-outline-variant bg-surface-container-lowest px-2 py-1.5 font-mono text-body-sm text-on-surface outline-none focus:border-primary"
            />
            <p className="mt-1 font-body-sm text-[10px] text-on-surface-variant/50">
              Comma-separated numbers · leave empty for the default
            </p>
          </div>
        )}

        {meta?.params.includes("text") && (
          <div>
            <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">
              {TEXT_LABEL[operation] ?? "TEXT"}
            </label>
            <input
              type="text"
              value={params.text}
              placeholder="Ada"
              maxLength={12}
              onChange={(e) => setParams({ text: e.target.value })}
              className="w-full border border-outline-variant bg-surface-container-lowest px-2 py-1.5 font-mono text-body-sm text-on-surface outline-none focus:border-primary"
            />
          </div>
        )}

        {meta && <p className="font-body-sm text-[11px] text-on-surface-variant/70">{meta.hint}</p>}

        <button
          onClick={() => run(operation, params)}
          className="flex w-full items-center justify-center gap-2 bg-primary-container py-2.5 font-label-caps text-label-caps text-surface transition-transform hover:bg-opacity-90 active:scale-[0.98]"
        >
          <Icon name="play_circle" className="text-[18px]" /> Re-run
        </button>
      </div>
    </aside>
  );
}
