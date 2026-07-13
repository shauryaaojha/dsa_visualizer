// UML diagram player (zustand). Steps through a diagram's buildSteps, revealing
// nodes/edges cumulatively so a diagram can be "constructed" with narration.
// Mirrors the transport API of the other stores (play/pause/step/speed) so the
// shared TransportBar drives it. Also tracks the clicked node for the info rail.

import { create } from "zustand";
import { getDiagram, type UmlDiagram } from "@/data/umlDiagrams";

const SPEED_OPTIONS = [0.5, 1, 1.5, 2, 4] as const;
type Speed = (typeof SPEED_OPTIONS)[number];
const BASE_DELAY = 2000; // UML steps carry more text — a touch slower

interface UmlState {
  diagram: UmlDiagram | null;
  stepIndex: number;
  isPlaying: boolean;
  speed: Speed;
  selectedNodeId: string | null;
  /** Relation kinds the user has hidden via the legend toggles. */
  hiddenKinds: string[];

  visibleIds: () => Set<string>;

  load: (id: string) => void;
  selectNode: (id: string | null) => void;
  toggleKind: (kind: string) => void;

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

export const useUmlStore = create<UmlState>((set, get) => {
  function scheduleTick() {
    clearT();
    const { isPlaying, diagram, speed } = get();
    if (!isPlaying || !diagram) return;
    timer = setTimeout(() => {
      const s = get();
      if (!s.diagram) return;
      const last = s.diagram.buildSteps.length - 1;
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
    diagram: null,
    stepIndex: 0,
    isPlaying: false,
    speed: 1,
    selectedNodeId: null,
    hiddenKinds: [],

    visibleIds: () => {
      const { diagram, stepIndex } = get();
      if (!diagram) return new Set();
      return new Set(diagram.buildSteps[Math.min(stepIndex, diagram.buildSteps.length - 1)]?.reveal ?? []);
    },

    load: (id) => {
      clearT();
      const diagram = getDiagram(id) ?? null;
      set({ diagram, stepIndex: 0, isPlaying: false, selectedNodeId: null, hiddenKinds: [] });
    },
    selectNode: (id) => set({ selectedNodeId: id }),
    toggleKind: (kind) =>
      set((s) => ({
        hiddenKinds: s.hiddenKinds.includes(kind)
          ? s.hiddenKinds.filter((k) => k !== kind)
          : [...s.hiddenKinds, kind],
      })),

    play: () => {
      const { diagram } = get();
      if (!diagram) return;
      if (get().stepIndex >= diagram.buildSteps.length - 1) set({ stepIndex: 0 });
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
      const { diagram, stepIndex } = get();
      if (!diagram) return;
      set({ isPlaying: false, stepIndex: Math.min(stepIndex + 1, diagram.buildSteps.length - 1) });
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
      const { diagram } = get();
      if (diagram) set({ isPlaying: false, stepIndex: diagram.buildSteps.length - 1 });
    },
    setSpeed: (speed) => {
      set({ speed: speed as Speed });
      if (get().isPlaying) scheduleTick();
    },
  };
});

export { SPEED_OPTIONS };
