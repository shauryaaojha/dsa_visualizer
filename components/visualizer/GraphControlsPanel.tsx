"use client";

import { TransportBar } from "@/components/visualizer/TransportBar";
import { useGraphStore } from "@/lib/graphStore";

export function GraphControlsPanel() {
  const program = useGraphStore((s) => s.program);
  const stepIndex = useGraphStore((s) => s.stepIndex);
  const isPlaying = useGraphStore((s) => s.isPlaying);
  const speed = useGraphStore((s) => s.speed);

  return (
    <TransportBar
      hasProgram={!!program}
      isPlaying={isPlaying}
      stepIndex={stepIndex}
      total={program?.steps.length ?? 0}
      complexity={program?.complexity ?? null}
      speed={speed}
      onToggle={useGraphStore.getState().togglePlay}
      onForward={useGraphStore.getState().stepForward}
      onBack={useGraphStore.getState().stepBack}
      onStart={useGraphStore.getState().toStart}
      onEnd={useGraphStore.getState().toEnd}
      onSpeedChange={useGraphStore.getState().setSpeed}
    />
  );
}
