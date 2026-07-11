"use client";

import { TransportBar } from "@/components/visualizer/TransportBar";
import { useFoundationsStore } from "@/lib/foundationsStore";

export function FoundationsControlsPanel() {
  const program = useFoundationsStore((s) => s.program);
  const stepIndex = useFoundationsStore((s) => s.stepIndex);
  const isPlaying = useFoundationsStore((s) => s.isPlaying);
  const speed = useFoundationsStore((s) => s.speed);

  return (
    <TransportBar
      hasProgram={!!program}
      isPlaying={isPlaying}
      stepIndex={stepIndex}
      total={program?.steps.length ?? 0}
      complexity={program?.complexity ?? null}
      speed={speed}
      onToggle={useFoundationsStore.getState().togglePlay}
      onForward={useFoundationsStore.getState().stepForward}
      onBack={useFoundationsStore.getState().stepBack}
      onStart={useFoundationsStore.getState().toStart}
      onEnd={useFoundationsStore.getState().toEnd}
      onSpeedChange={useFoundationsStore.getState().setSpeed}
    />
  );
}
