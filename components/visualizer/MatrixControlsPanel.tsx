"use client";

import { TransportBar } from "@/components/visualizer/TransportBar";
import { useMatrixStore } from "@/lib/matrixStore";

export function MatrixControlsPanel() {
  const program = useMatrixStore((s) => s.program);
  const stepIndex = useMatrixStore((s) => s.stepIndex);
  const isPlaying = useMatrixStore((s) => s.isPlaying);

  return (
    <TransportBar
      hasProgram={!!program}
      isPlaying={isPlaying}
      stepIndex={stepIndex}
      total={program?.steps.length ?? 0}
      complexity={program?.complexity ?? null}
      onToggle={useMatrixStore.getState().togglePlay}
      onForward={useMatrixStore.getState().stepForward}
      onBack={useMatrixStore.getState().stepBack}
      onStart={useMatrixStore.getState().toStart}
      onEnd={useMatrixStore.getState().toEnd}
    />
  );
}
