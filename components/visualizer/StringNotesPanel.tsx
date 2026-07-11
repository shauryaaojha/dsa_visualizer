"use client";

import { NotesPanel } from "@/components/visualizer/NotesPanel";
import { useStringStore } from "@/lib/stringStore";

export function StringNotesPanel() {
  const program = useStringStore((s) => s.program);
  const stepIndex = useStringStore((s) => s.stepIndex);

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
