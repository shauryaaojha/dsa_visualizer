// Queue player store (zustand). Mirrors linkedListStore/stackStore: the pure
// engine compiles a QueueProgram, this store plays it frame by frame.

import { create } from "zustand";
import { runQueueOperation, QUEUE_OPERATIONS } from "@/engines/queueEngine";
import type { QueueKind, QueueOperationId, QueueProgram, QueueStep } from "@/types/visualization";

const SPEED_OPTIONS = [0.5, 1, 1.5, 2, 4] as const;
type Speed = (typeof SPEED_OPTIONS)[number];
const BASE_DELAY = 1600;

const DEFAULT_VALUES = [10, 20, 30, 40];

interface QueueParams {
  value: number;
  priority: number;
  capacity: number;
}

interface QueueState {
  kind: QueueKind;
  operation: QueueOperationId;
  values: number[];
  params: QueueParams;
  program: QueueProgram | null;
  stepIndex: number;
  isPlaying: boolean;
  speed: Speed;

  currentStep: () => QueueStep | null;

  setValues: (values: number[]) => void;
  randomize: (size?: number) => void;
  setKind: (kind: QueueKind) => void;
  setOperation: (op: QueueOperationId) => void;
  setParams: (p: Partial<QueueParams>) => void;
  run: (op?: QueueOperationId, params?: Partial<QueueParams>) => void;

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

export const useQueueStore = create<QueueState>((set, get) => {
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
    kind: "simple",
    operation: "enqueue",
    values: DEFAULT_VALUES,
    params: { value: 99, priority: 4, capacity: 6 },
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
    randomize: (size = 4) => {
      const values = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
      get().setValues(values);
    },
    setKind: (kind) => {
      clearT();
      set({ kind, program: null, stepIndex: 0, isPlaying: false });
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
      const program = runQueueOperation(operation, state.kind, state.values, merged);
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

export { QUEUE_OPERATIONS, SPEED_OPTIONS };
