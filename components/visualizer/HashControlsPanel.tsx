"use client";

import { TransportBar } from "@/components/visualizer/TransportBar";
import { useHashStore } from "@/lib/hashStore";

export function HashControlsPanel() {
  const program = useHashStore((s) => s.program);
  const stepIndex = useHashStore((s) => s.stepIndex);
  const isPlaying = useHashStore((s) => s.isPlaying);
  const speed = useHashStore((s) => s.speed);

  return (
    <TransportBar
      hasProgram={!!program}
      isPlaying={isPlaying}
      stepIndex={stepIndex}
      total={program?.steps.length ?? 0}
      complexity={program?.complexity ?? null}
      speed={speed}
      onToggle={useHashStore.getState().togglePlay}
      onForward={useHashStore.getState().stepForward}
      onBack={useHashStore.getState().stepBack}
      onStart={useHashStore.getState().toStart}
      onEnd={useHashStore.getState().toEnd}
      onSpeedChange={useHashStore.getState().setSpeed}
    />
  );
}
