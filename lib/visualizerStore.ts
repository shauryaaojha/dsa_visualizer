// ---------------------------------------------------------------------------
// Visualizer store (zustand)
//
// Holds the "base" array the user edits, the compiled animation program, the
// playback cursor, and speed. Playback is driven here via a self-scheduling
// timeout so any component can play/pause/step without owning a timer.
// ---------------------------------------------------------------------------

import { create } from "zustand";
import {
  ARRAY_OPERATIONS,
  makeCells,
  runArrayOperation,
  type RunParams,
} from "@/engines/arrayEngine";
import type {
  AnimationProgram,
  AnimationStep,
  ArrayCell,
  ArrayOperationId,
} from "@/types/visualization";

const DEFAULT_VALUES = [8, 3, 17, 5, 12, 1, 9, 14];
const SPEED_OPTIONS = [0.5, 1, 1.5, 2, 4] as const;
export type Speed = (typeof SPEED_OPTIONS)[number];

/** Base delay (ms) between frames at 1x. Divided by the speed multiplier. */
const BASE_DELAY = 850;

interface VisualizerState {
  // Source data the user manipulates between runs.
  baseArray: ArrayCell[];

  // Compiled animation + playback cursor.
  program: AnimationProgram | null;
  stepIndex: number;
  isPlaying: boolean;
  speed: Speed;

  // The active operation (for the input panel / re-runs).
  operation: ArrayOperationId;
  // Last params used (so the sidebar can reflect a topic page's seed values).
  params: { index: number; value: number };

  // Derived getter: the frame currently on screen.
  currentStep: () => AnimationStep | null;
  cellsOnScreen: () => ArrayCell[];

  // Mutations to the base array.
  setBaseArray: (values: number[]) => void;
  randomize: (size?: number) => void;
  setParams: (params: Partial<{ index: number; value: number }>) => void;

  // Build + play.
  run: (op: ArrayOperationId, params?: RunParams) => void;
  setOperation: (op: ArrayOperationId) => void;

  // Transport controls.
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  stepForward: () => void;
  stepBack: () => void;
  toStart: () => void;
  toEnd: () => void;
  cycleSpeed: () => void;
  setSpeed: (speed: number) => void;
  reset: () => void;
}

// Module-scoped timer so it survives re-renders but is not part of state.
let playTimer: ReturnType<typeof setTimeout> | null = null;

function clearTimer() {
  if (playTimer) {
    clearTimeout(playTimer);
    playTimer = null;
  }
}

export const useVisualizerStore = create<VisualizerState>((set, get) => {
  /** Schedule the next frame if still playing and not at the end. */
  function scheduleTick() {
    clearTimer();
    const { isPlaying, program, speed } = get();
    if (!isPlaying || !program) return;
    playTimer = setTimeout(() => {
      const s = get();
      if (!s.program) return;
      const last = s.program.steps.length - 1;
      if (s.stepIndex >= last) {
        set({ isPlaying: false });
        clearTimer();
        return;
      }
      set({ stepIndex: s.stepIndex + 1 });
      scheduleTick();
    }, BASE_DELAY / speed);
  }

  return {
    baseArray: makeCells(DEFAULT_VALUES),
    program: null,
    stepIndex: 0,
    isPlaying: false,
    speed: 1,
    operation: "traverse",
    params: { index: 0, value: 42 },

    currentStep: () => {
      const { program, stepIndex } = get();
      if (!program) return null;
      return program.steps[Math.min(stepIndex, program.steps.length - 1)] ?? null;
    },

    cellsOnScreen: () => {
      const step = get().currentStep();
      return step ? step.array : get().baseArray;
    },

    setBaseArray: (values) => {
      clearTimer();
      set({ baseArray: makeCells(values), program: null, stepIndex: 0, isPlaying: false });
    },

    randomize: (size = 8) => {
      const values = Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1);
      get().setBaseArray(values);
    },

    setOperation: (op) => set({ operation: op }),

    setParams: (params) => set({ params: { ...get().params, ...params } }),

    run: (op, params = {}) => {
      clearTimer();
      const merged = { ...get().params, ...params };
      const program = runArrayOperation(op, get().baseArray, merged);
      set({ program, stepIndex: 0, operation: op, params: merged, isPlaying: false });
      // Auto-play the freshly compiled program.
      get().play();
    },

    play: () => {
      const { program } = get();
      if (!program) return;
      // If parked at the end, restart from the top.
      if (get().stepIndex >= program.steps.length - 1) {
        set({ stepIndex: 0 });
      }
      set({ isPlaying: true });
      scheduleTick();
    },

    pause: () => {
      clearTimer();
      set({ isPlaying: false });
    },

    togglePlay: () => {
      if (get().isPlaying) get().pause();
      else get().play();
    },

    stepForward: () => {
      clearTimer();
      const { program, stepIndex } = get();
      if (!program) return;
      set({ isPlaying: false, stepIndex: Math.min(stepIndex + 1, program.steps.length - 1) });
    },

    stepBack: () => {
      clearTimer();
      const { stepIndex } = get();
      set({ isPlaying: false, stepIndex: Math.max(stepIndex - 1, 0) });
    },

    toStart: () => {
      clearTimer();
      set({ isPlaying: false, stepIndex: 0 });
    },

    toEnd: () => {
      clearTimer();
      const { program } = get();
      if (!program) return;
      set({ isPlaying: false, stepIndex: program.steps.length - 1 });
    },

    cycleSpeed: () => {
      const idx = SPEED_OPTIONS.indexOf(get().speed);
      const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
      set({ speed: next });
      if (get().isPlaying) scheduleTick(); // re-time the in-flight tick
    },
    setSpeed: (speed) => {
      set({ speed: speed as Speed });
      if (get().isPlaying) scheduleTick(); // re-time the in-flight tick
    },

    reset: () => {
      clearTimer();
      set({ program: null, stepIndex: 0, isPlaying: false });
    },
  };
});

export { ARRAY_OPERATIONS, SPEED_OPTIONS };
