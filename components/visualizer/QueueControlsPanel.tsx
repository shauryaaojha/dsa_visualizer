"use client";

import { TransportBar } from "@/components/visualizer/TransportBar";
import { useQueueStore } from "@/lib/queueStore";

export function QueueControlsPanel() {
  const program = useQueueStore((s) => s.program);
  const stepIndex = useQueueStore((s) => s.stepIndex);
  const isPlaying = useQueueStore((s) => s.isPlaying);
  const speed = useQueueStore((s) => s.speed);

  return (
    <TransportBar
      hasProgram={!!program}
      isPlaying={isPlaying}
      stepIndex={stepIndex}
      total={program?.steps.length ?? 0}
      complexity={program?.complexity ?? null}
      speed={speed}
      onToggle={useQueueStore.getState().togglePlay}
      onForward={useQueueStore.getState().stepForward}
      onBack={useQueueStore.getState().stepBack}
      onStart={useQueueStore.getState().toStart}
      onEnd={useQueueStore.getState().toEnd}
      onSpeedChange={useQueueStore.getState().setSpeed}
    />
  );
}
