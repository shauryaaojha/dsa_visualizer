"use client";

// Presentational footer transport (play/step/scrub) + complexity badges.
// Both array and matrix screens pass their store's actions/state in.

import { Icon } from "@/components/ui/Icon";

interface TransportBarProps {
  hasProgram: boolean;
  isPlaying: boolean;
  stepIndex: number;
  total: number;
  complexity?: { time: string; space: string } | null;
  onToggle: () => void;
  onForward: () => void;
  onBack: () => void;
  onStart: () => void;
  onEnd: () => void;
}

export function TransportBar({
  hasProgram,
  isPlaying,
  stepIndex,
  total,
  complexity,
  onToggle,
  onForward,
  onBack,
  onStart,
  onEnd,
}: TransportBarProps) {
  return (
    <footer className="fixed bottom-0 z-50 flex h-14 w-full items-center justify-between border-t border-outline-variant bg-surface-container-lowest px-gutter gap-md">
      {/* Complexity */}
      <div className="flex items-center gap-2 shrink-0">
        {complexity ? (
          <>
            <div className="flex items-center gap-1.5 border border-amber/40 bg-amber/10 px-2.5 py-1 font-code-snippet text-code-snippet text-amber">
              <Icon name="schedule" className="text-[14px]" />
              {complexity.time}
            </div>
            <div className="flex items-center gap-1.5 border border-mint/40 bg-mint/10 px-2.5 py-1 font-code-snippet text-code-snippet text-mint">
              <Icon name="memory" className="text-[14px]" />
              {complexity.space}
            </div>
          </>
        ) : (
          <span className="font-label-caps text-label-caps text-on-surface-variant/50">Run an operation</span>
        )}
      </div>

      {/* Transport */}
      <div className="flex items-center gap-1 border border-outline-variant bg-surface-container p-1">
        <Btn title="Reset to start" icon="skip_previous" onClick={onStart} disabled={!hasProgram} />
        <Btn title="Step back" icon="fast_rewind" onClick={onBack} disabled={!hasProgram} />
        <button
          onClick={onToggle}
          disabled={!hasProgram}
          title={isPlaying ? "Pause" : "Play"}
          className="flex items-center gap-1 bg-primary-container px-4 py-1 font-label-caps text-label-caps text-surface transition-colors hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name={isPlaying ? "pause" : "play_arrow"} className="text-[18px]" />
          {isPlaying ? "PAUSE" : "PLAY"}
        </button>
        <Btn title="Step forward" icon="fast_forward" onClick={onForward} disabled={!hasProgram} />
        <Btn title="Jump to end" icon="skip_next" onClick={onEnd} disabled={!hasProgram} />
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3 shrink-0 min-w-[120px]">
        {hasProgram && (
          <>
            <div className="flex-1 h-1 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((stepIndex + 1) / total) * 100}%` }} />
            </div>
            <span className="font-mono text-[11px] text-on-surface-variant whitespace-nowrap">
              {stepIndex + 1}/{total}
            </span>
          </>
        )}
      </div>
    </footer>
  );
}

function Btn({ title, icon, onClick, disabled }: { title: string; icon: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="p-1 text-secondary-fixed-dim transition-colors hover:bg-surface-variant hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Icon name={icon} />
    </button>
  );
}
