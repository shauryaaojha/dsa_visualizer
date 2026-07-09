// Stack player store (zustand). Mirrors linkedListStore: the pure engine
// compiles a StackProgram, this store plays it (play/pause/step/speed via a
// self-scheduling timeout). The canvas renders the current frame.

import { create } from "zustand";
import { runStackOperation, STACK_OPERATIONS } from "@/engines/stackEngine";
import type { StackOperationId, StackProgram, StackStep } from "@/types/visualization";

const SPEED_OPTIONS = [0.5, 1, 1.5, 2, 4] as const;
type Speed = (typeof SPEED_OPTIONS)[number];
// Same roomy per-frame delay as the linked list: one pointer change + one
// sentence of narration per frame.
const BASE_DELAY = 1600;

const DEFAULT_VALUES = [10, 20, 30];

interface StackParams {
  value: number;
  text: string;
  capacity: number;
}

interface StackState {
  operation: StackOperationId;
  values: number[];
  params: StackParams;
  program: StackProgram | null;
  stepIndex: number;
  isPlaying: boolean;
  speed: Speed;

  currentStep: () => StackStep | null;

  setValues: (values: number[]) => void;
  randomize: (size?: number) => void;
  setOperation: (op: StackOperationId) => void;
  setParams: (p: Partial<StackParams>) => void;
  run: (op?: StackOperationId, params?: Partial<StackParams>) => void;

  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  stepForward: () => void;
  stepBack: () => void;
  toStart: () => void;
  toEnd: () => void;
  setSpeed: (speed: number) => void;
}

let timer: ReturnType<typeof setTimeout> | null = null;
function clearT() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

export const useStackStore = create<StackState>((set, get) => {
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
    operation: "push",
    values: DEFAULT_VALUES,
    params: { value: 42, text: "", capacity: 6 },
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
      set({ values: values.slice(0, 10), program: null, stepIndex: 0, isPlaying: false });
    },
    randomize: (size = 3) => {
      const values = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
      get().setValues(values);
    },
    setOperation: (op) => {
      clearT();
      set({ operation: op, program: null, stepIndex: 0, isPlaying: false });
    },
    setParams: (p) => set({ params: { ...get().params, ...p } }),

    run: (op, params) => {
      clearT();
      const state = get();
      const operation = op ?? state.operation;
      const merged = { ...state.params, ...params };
      const program = runStackOperation(operation, state.values, merged);
      set({ operation, params: merged, program, stepIndex: 0, isPlaying: false });
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
    setSpeed: (speed) => {
      set({ speed: speed as Speed });
      if (get().isPlaying) scheduleTick();
    },
  };
});

export { STACK_OPERATIONS, SPEED_OPTIONS };
