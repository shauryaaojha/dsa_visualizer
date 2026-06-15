"use client";

import { NotesPanel } from "@/components/visualizer/NotesPanel";
import { useMatrixStore } from "@/lib/matrixStore";

export function MatrixNotes() {
  const program = useMatrixStore((s) => s.program);
  const stepIndex = useMatrixStore((s) => s.stepIndex);
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
