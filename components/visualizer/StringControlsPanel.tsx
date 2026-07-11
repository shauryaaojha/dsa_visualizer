"use client";

import { TransportBar } from "@/components/visualizer/TransportBar";
import { useStringStore } from "@/lib/stringStore";

export function StringControlsPanel() {
  const program = useStringStore((s) => s.program);
  const stepIndex = useStringStore((s) => s.stepIndex);
  const isPlaying = useStringStore((s) => s.isPlaying);
  const speed = useStringStore((s) => s.speed);

  return (
    <TransportBar
      hasProgram={!!program}
      isPlaying={isPlaying}
      stepIndex={stepIndex}
      total={program?.steps.length ?? 0}
      complexity={program?.complexity ?? null}
      speed={speed}
      onToggle={useStringStore.getState().togglePlay}
      onForward={useStringStore.getState().stepForward}
      onBack={useStringStore.getState().stepBack}
      onStart={useStringStore.getState().toStart}
      onEnd={useStringStore.getState().toEnd}
      onSpeedChange={useStringStore.getState().setSpeed}
    />
  );
}
