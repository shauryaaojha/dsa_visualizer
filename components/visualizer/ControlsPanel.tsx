"use client";

import { TransportBar } from "@/components/visualizer/TransportBar";
import { useVisualizerStore } from "@/lib/visualizerStore";

export function ControlsPanel() {
  const program = useVisualizerStore((s) => s.program);
  const stepIndex = useVisualizerStore((s) => s.stepIndex);
  const isPlaying = useVisualizerStore((s) => s.isPlaying);
  const speed = useVisualizerStore((s) => s.speed);
  const togglePlay = useVisualizerStore((s) => s.togglePlay);
  const stepForward = useVisualizerStore((s) => s.stepForward);
  const stepBack = useVisualizerStore((s) => s.stepBack);
  const toStart = useVisualizerStore((s) => s.toStart);
  const toEnd = useVisualizerStore((s) => s.toEnd);
  const setSpeed = useVisualizerStore((s) => s.setSpeed);

  return (
    <TransportBar
      hasProgram={!!program}
      isPlaying={isPlaying}
      stepIndex={stepIndex}
      total={program?.steps.length ?? 0}
      complexity={program?.complexity ?? null}
      speed={speed}
      onToggle={togglePlay}
      onForward={stepForward}
      onBack={stepBack}
      onStart={toStart}
      onEnd={toEnd}
      onSpeedChange={setSpeed}
    />
  );
}
