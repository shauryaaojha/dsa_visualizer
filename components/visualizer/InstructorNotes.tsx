"use client";

import { NotesPanel } from "@/components/visualizer/NotesPanel";
import { useVisualizerStore } from "@/lib/visualizerStore";

export function InstructorNotes() {
  const program = useVisualizerStore((s) => s.program);
  const stepIndex = useVisualizerStore((s) => s.stepIndex);

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
