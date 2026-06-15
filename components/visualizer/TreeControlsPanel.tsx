"use client";

import { TransportBar } from "@/components/visualizer/TransportBar";
import { useTreeStore } from "@/lib/treeStore";

export function TreeControlsPanel() {
  const program = useTreeStore((s) => s.program);
  const stepIndex = useTreeStore((s) => s.stepIndex);
  const isPlaying = useTreeStore((s) => s.isPlaying);

  return (
    <TransportBar
      hasProgram={!!program}
      isPlaying={isPlaying}
      stepIndex={stepIndex}
      total={program?.steps.length ?? 0}
      complexity={program?.complexity ?? null}
      onToggle={useTreeStore.getState().togglePlay}
      onForward={useTreeStore.getState().stepForward}
      onBack={useTreeStore.getState().stepBack}
      onStart={useTreeStore.getState().toStart}
      onEnd={useTreeStore.getState().toEnd}
    />
  );
}
