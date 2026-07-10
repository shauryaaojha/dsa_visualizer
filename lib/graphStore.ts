// Graph player store (zustand). Graphs are curated presets chosen by the
// engine per operation; the only user knob is the start node (where relevant).

import { create } from "zustand";
import { runGraphOperation, GRAPH_OPERATIONS } from "@/engines/graphEngine";
import type { GraphOperationId, GraphProgram, GraphStep } from "@/types/visualization";

const SPEED_OPTIONS = [0.5, 1, 1.5, 2, 4] as const;
type Speed = (typeof SPEED_OPTIONS)[number];
const BASE_DELAY = 1600;

interface GraphParams {
  start: string;
}

interface GraphState {
  operation: GraphOperationId;
  params: GraphParams;
  program: GraphProgram | null;
  stepIndex: number;
  isPlaying: boolean;
  speed: Speed;

  currentStep: () => GraphStep | null;

  setOperation: (op: GraphOperationId) => void;
  setParams: (p: Partial<GraphParams>) => void;
  run: (op?: GraphOperationId, params?: Partial<GraphParams>) => void;

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

export const useGraphStore = create<GraphState>((set, get) => {
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
    operation: "bfs",
    params: { start: "A" },
    program: null,
    stepIndex: 0,
    isPlaying: false,
    speed: 1,

    currentStep: () => {
      const { program, stepIndex } = get();
      if (!program) return null;
      return program.steps[Math.min(stepIndex, program.steps.length - 1)] ?? null;
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
      const program = runGraphOperation(operation, merged);
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

export { GRAPH_OPERATIONS, SPEED_OPTIONS };
