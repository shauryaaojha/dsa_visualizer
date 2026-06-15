// Recursion-tree player store (zustand) for divide & conquer algorithms.

import { create } from "zustand";
import { runTreeOperation } from "@/engines/divideConquerEngine";
import type { TreeOperationId, TreeProgram, TreeStep } from "@/types/visualization";

const DEFAULT_VALUES = [38, 27, 43, 3, 9, 82, 10];
const SPEED_OPTIONS = [0.5, 1, 1.5, 2, 4] as const;
type Speed = (typeof SPEED_OPTIONS)[number];
const BASE_DELAY = 950;

interface TreeState {
  operation: TreeOperationId;
  values: number[];
  target: number;
  program: TreeProgram | null;
  stepIndex: number;
  isPlaying: boolean;
  speed: Speed;

  currentStep: () => TreeStep | null;

  setValues: (values: number[]) => void;
  randomize: (size?: number) => void;
  setOperation: (op: TreeOperationId) => void;
  setTarget: (target: number) => void;
  run: () => void;

  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  stepForward: () => void;
  stepBack: () => void;
  toStart: () => void;
  toEnd: () => void;
  cycleSpeed: () => void;
}

let timer: ReturnType<typeof setTimeout> | null = null;
function clearT() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

export const useTreeStore = create<TreeState>((set, get) => {
  function scheduleTick() {
    clearT();
    const { isPlaying, program, speed } = get();
    if (!isPlaying || !program) return;
    timer = setTimeout(() => {
      const s = get();
      if (!s.program) return;
      const last = s.program.steps.length - 1;
      if (s.stepIndex >= last) {
        set({ isPlaying: false });
        clearT();
        return;
      }
      set({ stepIndex: s.stepIndex + 1 });
      scheduleTick();
    }, BASE_DELAY / speed);
  }

  return {
    operation: "mergeSort",
    values: DEFAULT_VALUES,
    target: 23,
    program: null,
    stepIndex: 0,
    isPlaying: false,
    speed: 1,

    currentStep: () => {
      const { program, stepIndex } = get();
      if (!program) return null;
      return program.steps[Math.min(stepIndex, program.steps.length - 1)] ?? null;
    },

    setValues: (values) => {
      clearT();
      set({ values: values.slice(0, 12), program: null, stepIndex: 0, isPlaying: false });
    },
    randomize: (size = 7) => {
      const values = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 1);
      get().setValues(values);
    },
    setOperation: (op) => {
      clearT();
      set({ operation: op, program: null, stepIndex: 0, isPlaying: false });
    },
    setTarget: (target) => {
      clearT();
      set({ target, program: null, stepIndex: 0, isPlaying: false });
    },

    run: () => {
      clearT();
      const { operation, values, target } = get();
      const program = runTreeOperation(operation, values, { target });
      set({ program, stepIndex: 0, isPlaying: false });
      get().play();
    },

    play: () => {
      const { program } = get();
      if (!program) return;
      if (get().stepIndex >= program.steps.length - 1) set({ stepIndex: 0 });
      set({ isPlaying: true });
      scheduleTick();
    },
    pause: () => {
      clearT();
      set({ isPlaying: false });
    },
    togglePlay: () => (get().isPlaying ? get().pause() : get().play()),
    stepForward: () => {
      clearT();
      const { program, stepIndex } = get();
      if (!program) return;
      set({ isPlaying: false, stepIndex: Math.min(stepIndex + 1, program.steps.length - 1) });
    },
    stepBack: () => {
      clearT();
      set({ isPlaying: false, stepIndex: Math.max(get().stepIndex - 1, 0) });
    },
    toStart: () => {
      clearT();
      set({ isPlaying: false, stepIndex: 0 });
    },
    toEnd: () => {
      clearT();
      const { program } = get();
      if (program) set({ isPlaying: false, stepIndex: program.steps.length - 1 });
    },
    cycleSpeed: () => {
      const idx = SPEED_OPTIONS.indexOf(get().speed);
      const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
      set({ speed: next });
      if (get().isPlaying) scheduleTick();
    },
  };
});
