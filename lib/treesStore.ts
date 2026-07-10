// Trees-topic player store (zustand) — binary tree / BST / AVL / heap / trie.
// (lib/treeStore.ts is the older recursion-tree store for divide & conquer.)

import { create } from "zustand";
import { runTreeOperation, TREE_OPERATIONS } from "@/engines/treeEngine";
import type { TreesOperationId, TreesProgram, TreesStep } from "@/types/visualization";

const SPEED_OPTIONS = [0.5, 1, 1.5, 2, 4] as const;
type Speed = (typeof SPEED_OPTIONS)[number];
const BASE_DELAY = 1600;

interface TreesParams {
  value: number;
  text: string;
  words: string[];
}

interface TreesState {
  operation: TreesOperationId;
  values: number[];
  params: TreesParams;
  program: TreesProgram | null;
  stepIndex: number;
  isPlaying: boolean;
  speed: Speed;

  currentStep: () => TreesStep | null;

  setValues: (values: number[]) => void;
  randomize: (size?: number) => void;
  setOperation: (op: TreesOperationId) => void;
  setParams: (p: Partial<TreesParams>) => void;
  run: (op?: TreesOperationId, params?: Partial<TreesParams>) => void;

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

export const useTreesStore = create<TreesState>((set, get) => {
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
    operation: "btInorder",
    values: [],
    params: { value: 0, text: "", words: [] },
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
      set({ values: values.slice(0, 15), program: null, stepIndex: 0, isPlaying: false });
    },
    randomize: (size = 7) => {
      const values = [...new Set(Array.from({ length: size + 3 }, () => Math.floor(Math.random() * 90) + 10))].slice(0, size);
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
      const program = runTreeOperation(operation, state.values, merged);
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

export { TREE_OPERATIONS, SPEED_OPTIONS };
