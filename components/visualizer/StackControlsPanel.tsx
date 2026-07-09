"use client";

import { TransportBar } from "@/components/visualizer/TransportBar";
import { useStackStore } from "@/lib/stackStore";

export function StackControlsPanel() {
  const program = useStackStore((s) => s.program);
  const stepIndex = useStackStore((s) => s.stepIndex);
  const isPlaying = useStackStore((s) => s.isPlaying);
  const speed = useStackStore((s) => s.speed);

  return (
    <TransportBar
      hasProgram={!!program}
      isPlaying={isPlaying}
      stepIndex={stepIndex}
      total={program?.steps.length ?? 0}
      complexity={program?.complexity ?? null}
      speed={speed}
      onToggle={useStackStore.getState().togglePlay}
      onForward={useStackStore.getState().stepForward}
      onBack={useStackStore.getState().stepBack}
      onStart={useStackStore.getState().toStart}
      onEnd={useStackStore.getState().toEnd}
      onSpeedChange={useStackStore.getState().setSpeed}
    />
  );
}
