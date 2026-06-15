// Matrix player store (zustand). Mirrors the array player but over 2-D grids.

import { create } from "zustand";
import { randomMatrix, randomSparse, runMatrixOperation } from "@/engines/matrixEngine";
import type { MatrixCell, MatrixOperationId, MatrixProgram, MatrixStep } from "@/types/visualization";

const SPEED_OPTIONS = [0.5, 1, 1.5, 2, 4] as const;
type Speed = (typeof SPEED_OPTIONS)[number];
const BASE_DELAY = 850;

interface MatrixState {
  operation: MatrixOperationId;
  a: MatrixCell[][];
  b: MatrixCell[][]; // only used by multiplication
  rows: number;
  cols: number;
  p: number; // B's column count (multiplication)

  program: MatrixProgram | null;
  stepIndex: number;
  isPlaying: boolean;
  speed: Speed;

  currentStep: () => MatrixStep | null;

  setDims: (rows: number, cols: number, p?: number) => void;
  randomize: () => void;
  run: () => void;
  setOperation: (op: MatrixOperationId) => void;

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

function buildMatrices(op: MatrixOperationId, rows: number, cols: number, p: number) {
  if (op === "sparse") return { a: randomSparse(rows, cols), b: [] as MatrixCell[][] };
  if (op === "multiplication") return { a: randomMatrix(rows, cols), b: randomMatrix(cols, p) };
  return { a: randomMatrix(rows, cols), b: [] as MatrixCell[][] };
}

export const useMatrixStore = create<MatrixState>((set, get) => {
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
    operation: "traverse",
    a: randomMatrix(3, 3),
    b: [],
    rows: 3,
    cols: 3,
    p: 3,
    program: null,
    stepIndex: 0,
    isPlaying: false,
    speed: 1,

    currentStep: () => {
      const { program, stepIndex } = get();
      if (!program) return null;
      return program.steps[Math.min(stepIndex, program.steps.length - 1)] ?? null;
    },

    setDims: (rows, cols, p) => {
      clearT();
      const np = p ?? get().p;
      const { operation } = get();
      const built = buildMatrices(operation, rows, cols, np);
      set({ rows, cols, p: np, ...built, program: null, stepIndex: 0, isPlaying: false });
    },

    randomize: () => {
      clearT();
      const { operation, rows, cols, p } = get();
      set({ ...buildMatrices(operation, rows, cols, p), program: null, stepIndex: 0, isPlaying: false });
    },

    setOperation: (op) => {
      clearT();
      const { rows, cols, p } = get();
      set({ operation: op, ...buildMatrices(op, rows, cols, p), program: null, stepIndex: 0, isPlaying: false });
    },

    run: () => {
      clearT();
      const { operation, a, b } = get();
      const program = runMatrixOperation(operation, a, b);
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
