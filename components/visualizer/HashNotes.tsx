"use client";

import { NotesPanel } from "@/components/visualizer/NotesPanel";
import { useHashStore } from "@/lib/hashStore";

export function HashNotes() {
  const program = useHashStore((s) => s.program);
  const stepIndex = useHashStore((s) => s.stepIndex);

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
