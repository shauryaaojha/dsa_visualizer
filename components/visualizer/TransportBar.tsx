"use client";

// Presentational footer transport (play/step/scrub) + complexity badges.
// Both array and matrix screens pass their store's actions/state in.

import { Icon } from "@/components/ui/Icon";

/** Discrete speed stops the slider snaps to (multiplier on playback speed). */
const SPEED_STOPS = [0.5, 1, 1.5, 2, 4];

interface TransportBarProps {
  hasProgram: boolean;
  isPlaying: boolean;
  stepIndex: number;
  total: number;
  complexity?: { time: string; space: string } | null;
  speed: number;
  onToggle: () => void;
  onForward: () => void;
  onBack: () => void;
  onStart: () => void;
  onEnd: () => void;
  onSpeedChange: (speed: number) => void;
}

export function TransportBar({
  hasProgram,
  isPlaying,
  stepIndex,
  total,
  complexity,
  speed,
  onToggle,
  onForward,
  onBack,
  onStart,
  onEnd,
  onSpeedChange,
}: TransportBarProps) {
  const speedIdx = Math.max(0, SPEED_STOPS.indexOf(speed));
  return (
    <footer className="fixed bottom-0 z-50 flex h-14 w-full items-center gap-3 border-t border-outline-variant bg-surface-container-lowest px-3 sm:px-gutter">
      {/* Left zone: complexity (flex-1 spacer keeps the center cluster centered) */}
      <div className="flex flex-1 items-center justify-start">
        <div className="hidden items-center gap-2 sm:flex">
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
      </div>

      {/* Center zone: transport + speed */}
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex items-center gap-1 border border-outline-variant bg-surface-container p-1">
          <Btn title="Reset to start" icon="skip_previous" onClick={onStart} disabled={!hasProgram} />
          <Btn title="Step back" icon="fast_rewind" onClick={onBack} disabled={!hasProgram} />
          <button
            onClick={onToggle}
            disabled={!hasProgram}
            title={isPlaying ? "Pause" : "Play"}
            className="flex items-center gap-1 bg-primary-container px-3 py-1 font-label-caps text-label-caps text-surface transition-colors hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
          >
            <Icon name={isPlaying ? "pause" : "play_arrow"} className="text-[18px]" />
            <span className="hidden sm:inline">{isPlaying ? "PAUSE" : "PLAY"}</span>
          </button>
          <Btn title="Step forward" icon="fast_forward" onClick={onForward} disabled={!hasProgram} />
          <Btn title="Jump to end" icon="skip_next" onClick={onEnd} disabled={!hasProgram} />
        </div>

        {/* Playback speed slider */}
        <div className="flex items-center gap-2">
          <Icon name="speed" className="text-[16px] text-on-surface-variant" />
          <input
            type="range"
            min={0}
            max={SPEED_STOPS.length - 1}
            step={1}
            value={speedIdx}
            onChange={(e) => onSpeedChange(SPEED_STOPS[parseInt(e.target.value, 10)])}
            title={`Speed: ${speed}x`}
            aria-label="Playback speed"
            className="speed-slider h-1 w-16 cursor-pointer appearance-none rounded-full bg-surface-container-high accent-primary sm:w-24"
          />
          <span className="w-7 shrink-0 font-mono text-[12px] font-bold text-on-surface-variant">{speed}x</span>
        </div>
      </div>

      {/* Right zone: progress (flex-1 spacer mirrors the left) */}
      <div className="flex flex-1 items-center justify-end">
        <div className="hidden items-center gap-3 sm:flex sm:min-w-[120px]">
          {hasProgram && (
            <>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-container-high">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((stepIndex + 1) / total) * 100}%` }} />
              </div>
              <span className="whitespace-nowrap font-mono text-[11px] text-on-surface-variant">
                {stepIndex + 1}/{total}
              </span>
            </>
          )}
        </div>
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
