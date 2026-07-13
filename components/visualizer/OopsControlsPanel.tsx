"use client";

import { TransportBar } from "@/components/visualizer/TransportBar";
import { useOopsStore } from "@/lib/oopsStore";

export function OopsControlsPanel() {
  const program = useOopsStore((s) => s.program);
  const stepIndex = useOopsStore((s) => s.stepIndex);
  const isPlaying = useOopsStore((s) => s.isPlaying);
  const speed = useOopsStore((s) => s.speed);

  return (
    <TransportBar
      hasProgram={!!program}
      isPlaying={isPlaying}
      stepIndex={stepIndex}
      total={program?.steps.length ?? 0}
      complexity={program?.complexity ?? null}
      speed={speed}
      onToggle={useOopsStore.getState().togglePlay}
      onForward={useOopsStore.getState().stepForward}
      onBack={useOopsStore.getState().stepBack}
      onStart={useOopsStore.getState().toStart}
      onEnd={useOopsStore.getState().toEnd}
      onSpeedChange={useOopsStore.getState().setSpeed}
    />
  );
}
