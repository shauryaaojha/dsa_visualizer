"use client";

import { NotesPanel } from "@/components/visualizer/NotesPanel";
import { useStackStore } from "@/lib/stackStore";

export function StackNotes() {
  const program = useStackStore((s) => s.program);
  const stepIndex = useStackStore((s) => s.stepIndex);

  return (
    <NotesPanel
      hasProgram={!!program}
      title={program?.title}
      steps={program?.steps ?? []}
      stepIndex={stepIndex}
      pseudocode={program?.pseudocode ?? []}
    />
  );
}
