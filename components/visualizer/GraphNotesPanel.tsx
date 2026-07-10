"use client";

import { NotesPanel } from "@/components/visualizer/NotesPanel";
import { useGraphStore } from "@/lib/graphStore";

export function GraphNotesPanel() {
  const program = useGraphStore((s) => s.program);
  const stepIndex = useGraphStore((s) => s.stepIndex);

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
