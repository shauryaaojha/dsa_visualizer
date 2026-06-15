"use client";

import { NotesPanel } from "@/components/visualizer/NotesPanel";
import { useTreeStore } from "@/lib/treeStore";

export function TreeNotes() {
  const program = useTreeStore((s) => s.program);
  const stepIndex = useTreeStore((s) => s.stepIndex);
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
