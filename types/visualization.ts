// ---------------------------------------------------------------------------
// Core visualization types
//
// Every data-structure engine (array, linked-list, tree, graph, ...) compiles a
// user operation into a flat list of `AnimationStep`s. The player walks that list
// forward/backward; the canvas renders whatever the *current* step describes.
// This keeps animation deterministic, scrubbable, and identical on every replay.
// ---------------------------------------------------------------------------

/** Visual state a single element can be in during a step. Drives its color/glow. */
export type HighlightKind =
  | "active" // currently being looked at / the cursor
  | "compare" // being compared against another element
  | "swap" // about to be / just swapped
  | "visited" // already processed
  | "target" // the value we are searching for
  | "found" // search succeeded here
  | "insert" // freshly inserted
  | "remove"; // about to be removed

/** A named cursor that floats above a position in the structure (e.g. i, j, mid). */
export interface Pointer {
  label: string;
  /** Index (array) the pointer sits above. */
  index: number;
  /** Tailwind-ready accent color. Defaults to coral. */
  color?: string;
}

/** One element of an array. A stable `id` lets the renderer animate movement
 *  (insert/delete/swap) instead of cross-fading, since React keys by id. */
export interface ArrayCell {
  id: string;
  value: number;
}

/** Big-O annotation surfaced in the floating badges. */
export interface Complexity {
  time: string;
  space: string;
}

/** A single, fully-described frame of an animation. */
export interface AnimationStep {
  /** Snapshot of the array at this frame. */
  array: ArrayCell[];
  /** cellId -> highlight. Keyed by id so highlights follow elements as they move. */
  highlights: Record<string, HighlightKind>;
  /** Floating cursors for this frame. */
  pointers: Pointer[];
  /** Instructor-note sentence describing what is happening. */
  description: string;
  /** Optional pseudo-code line numbers to highlight (1-based). */
  codeLines?: number[];
}

/** The compiled result an engine returns for one operation. */
export interface AnimationProgram {
  steps: AnimationStep[];
  complexity: Complexity;
  /** Pseudo-code shown alongside, line by line. */
  pseudocode: string[];
  /** Human label, e.g. "Linear Search (target = 42)". */
  title: string;
}

/** Identifiers for the array operations the engine supports. */
export type ArrayOperationId =
  | "traverse"
  | "access"
  | "linearSearch"
  | "binarySearch"
  | "insert"
  | "delete"
  | "update"
  | "reverse"
  | "bubbleSort"
  | "selectionSort"
  | "insertionSort"
  | "mergeSort"
  | "quickSort"
  | "prefixSum"
  | "slidingWindow"
  | "twoPointer"
  // --- LeetCode patterns ---
  | "kadane"
  | "maxProfit"
  | "moveZeroes"
  | "maxArea"
  | "sortColors"
  | "removeDuplicates"
  | "majorityElement";

export interface ArrayOperationMeta {
  id: ArrayOperationId;
  label: string;
  /** Material Symbols icon name. */
  icon: string;
  /** Which numeric/index params this op needs from the user. */
  params: ("index" | "value")[];
  hint: string;
}

// ---------------------------------------------------------------------------
// Matrix (2-D) visualization
//
// Same engine→step→player pattern as 1-D, but a frame can carry several named
// grids (e.g. A, B and the result C for multiplication). Highlights are keyed
// by cell id, per grid.
// ---------------------------------------------------------------------------

export interface MatrixCell {
  id: string;
  value: number;
  /** Optional badge text shown under the value (e.g. an accumulation). */
  note?: string;
}

export interface MatrixGrid {
  label: string;
  cells: MatrixCell[][];
  highlights: Record<string, HighlightKind>;
}

export interface MatrixStep {
  grids: MatrixGrid[];
  description: string;
  codeLines?: number[];
}

export interface MatrixProgram {
  steps: MatrixStep[];
  complexity: Complexity;
  pseudocode: string[];
  title: string;
}

export type MatrixOperationId = "traverse" | "rotation" | "multiplication" | "sparse";

// ---------------------------------------------------------------------------
// Recursion tree (divide & conquer)
//
// For algorithms like merge sort and quick sort we visualize the recursion as a
// tree: each node is a sub-array (a range of the original), splitting into a
// left and right child, then combining back on the way up. Node x-position is
// derived from the range midpoint, y from recursion depth.
// ---------------------------------------------------------------------------

export type TreeNodeState = "idle" | "dividing" | "active" | "combining" | "done";

export interface RTreeNode {
  id: string;
  /** Inclusive range [lo, hi] in the original array. */
  lo: number;
  hi: number;
  depth: number;
  values: number[];
  state: TreeNodeState;
  parentId: string | null;
  /** Optional pivot value badge (quick sort). */
  pivot?: number;
}

export interface TreeStep {
  /** All nodes that exist at this frame, keyed by id. */
  nodes: Record<string, RTreeNode>;
  /** The working array snapshot shown under the tree. */
  array: number[];
  /** Highlights on the bottom array row, by index. */
  arrayHighlights?: Record<number, HighlightKind>;
  description: string;
  codeLines?: number[];
}

export interface TreeProgram {
  steps: TreeStep[];
  complexity: Complexity;
  pseudocode: string[];
  title: string;
  /** Total recursion depth, for layout sizing. */
  maxDepth: number;
  /** Original array length, for x-layout. */
  span: number;
}

export type TreeOperationId = "mergeSort" | "quickSort" | "binarySearch";

// ---------------------------------------------------------------------------
// Linked list visualization
//
// A linked list is nodes connected by pointers (arrows). Unlike the array
// canvas (contiguous cells) this is its own primitive: boxes wired by next
// (and prev, for doubly) pointers, with floating head/tail/curr/prev cursors,
// and arrow re-wiring animated on every insert/delete. Stable node ids let
// framer-motion slide nodes instead of snapping.
// ---------------------------------------------------------------------------

export type LLKind = "singly" | "doubly" | "circular";

export type LLNodeState =
  | "idle"
  | "active" // the cursor is on this node
  | "visited" // already walked past
  | "new" // freshly inserted
  | "removing" // about to be unlinked
  | "target" // candidate during search
  | "found"; // search/elimination hit

export interface LLNode {
  id: string;
  value: number;
  /** Fake memory address shown in the node (e.g. "AA") so the next-cell is legible. */
  addr: string;
  /** id of the next node, or null for the tail (circular wraps to head id). */
  next: string | null;
  /** id of the previous node — doubly only. */
  prev?: string | null;
  state: LLNodeState;
  /** Optional display override (e.g. polynomial term "3x^2"). */
  label?: string;
}

/** A named cursor floating above a node (head, tail, curr, prev, …). */
export interface LLPointer {
  label: string;
  /** id of the node it points at, or null (e.g. head = null on empty list). */
  nodeId: string | null;
  color?: string;
}

export interface LLStep {
  /** Nodes in head→tail visual order. */
  nodes: LLNode[];
  headId: string | null;
  tailId?: string | null;
  pointers: LLPointer[];
  description: string;
  codeLines?: number[];
}

export interface LLProgram {
  steps: LLStep[];
  complexity: Complexity;
  pseudocode: string[];
  title: string;
  /** Drives prev-arrows (doubly) and the tail→head back-edge (circular). */
  kind: LLKind;
}

export type LLOperationId =
  | "traverse"
  | "search"
  | "insertBegin"
  | "insertEnd"
  | "insertPosition"
  | "deleteBegin"
  | "deleteEnd"
  | "deletePosition"
  | "josephus"
  | "polynomial"
  // --- LeetCode classics ---
  | "reverseList"
  | "findMiddle"
  | "removeNthEnd"
  | "palindrome";
