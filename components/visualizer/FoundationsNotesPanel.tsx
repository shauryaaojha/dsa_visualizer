"use client";

import { NotesPanel } from "@/components/visualizer/NotesPanel";
import { useFoundationsStore } from "@/lib/foundationsStore";

export function FoundationsNotesPanel() {
  const program = useFoundationsStore((s) => s.program);
  const stepIndex = useFoundationsStore((s) => s.stepIndex);

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
