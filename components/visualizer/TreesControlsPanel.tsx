"use client";

import { TransportBar } from "@/components/visualizer/TransportBar";
import { useTreesStore } from "@/lib/treesStore";

export function TreesControlsPanel() {
  const program = useTreesStore((s) => s.program);
  const stepIndex = useTreesStore((s) => s.stepIndex);
  const isPlaying = useTreesStore((s) => s.isPlaying);
  const speed = useTreesStore((s) => s.speed);

  return (
    <TransportBar
      hasProgram={!!program}
      isPlaying={isPlaying}
      stepIndex={stepIndex}
      total={program?.steps.length ?? 0}
      complexity={program?.complexity ?? null}
      speed={speed}
      onToggle={useTreesStore.getState().togglePlay}
      onForward={useTreesStore.getState().stepForward}
      onBack={useTreesStore.getState().stepBack}
      onStart={useTreesStore.getState().toStart}
      onEnd={useTreesStore.getState().toEnd}
      onSpeedChange={useTreesStore.getState().setSpeed}
    />
  );
}
