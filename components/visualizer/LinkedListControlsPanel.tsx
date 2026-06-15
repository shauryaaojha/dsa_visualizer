"use client";

import { TransportBar } from "@/components/visualizer/TransportBar";
import { useLinkedListStore } from "@/lib/linkedListStore";

export function LinkedListControlsPanel() {
  const program = useLinkedListStore((s) => s.program);
  const stepIndex = useLinkedListStore((s) => s.stepIndex);
  const isPlaying = useLinkedListStore((s) => s.isPlaying);
  const speed = useLinkedListStore((s) => s.speed);

  return (
    <TransportBar
      hasProgram={!!program}
      isPlaying={isPlaying}
      stepIndex={stepIndex}
      total={program?.steps.length ?? 0}
      complexity={program?.complexity ?? null}
      speed={speed}
      onToggle={useLinkedListStore.getState().togglePlay}
      onForward={useLinkedListStore.getState().stepForward}
      onBack={useLinkedListStore.getState().stepBack}
      onStart={useLinkedListStore.getState().toStart}
      onEnd={useLinkedListStore.getState().toEnd}
      onSpeedChange={useLinkedListStore.getState().setSpeed}
    />
  );
}
