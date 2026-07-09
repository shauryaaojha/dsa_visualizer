"use client";

import { NotesPanel } from "@/components/visualizer/NotesPanel";
import { useQueueStore } from "@/lib/queueStore";

export function QueueNotes() {
  const program = useQueueStore((s) => s.program);
  const stepIndex = useQueueStore((s) => s.stepIndex);

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
