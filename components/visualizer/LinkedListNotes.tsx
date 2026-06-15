"use client";

import { NotesPanel } from "@/components/visualizer/NotesPanel";
import { useLinkedListStore } from "@/lib/linkedListStore";

export function LinkedListNotes() {
  const program = useLinkedListStore((s) => s.program);
  const stepIndex = useLinkedListStore((s) => s.stepIndex);

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
