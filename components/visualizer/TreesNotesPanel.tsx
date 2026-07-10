"use client";

import { NotesPanel } from "@/components/visualizer/NotesPanel";
import { useTreesStore } from "@/lib/treesStore";

export function TreesNotesPanel() {
  const program = useTreesStore((s) => s.program);
  const stepIndex = useTreesStore((s) => s.stepIndex);

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
