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
  /** Lifted out of the row: freshly allocated (not linked yet) or just freed. */
  floating?: boolean;
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
  /** Ids of nodes whose outgoing pointer was rewired this frame ("HEAD" = the head box) — the canvas highlights those links. */
  rewired?: string[];
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

// ---------------------------------------------------------------------------
// Stack visualization
//
// A vertical container, open at the top. Two implementations share the frame
// shape: "array" draws a fixed-capacity well with a numeric TOP index box;
// "list" draws linked nodes ([data|next]) stacked top-down with a TOP address
// box — push/pop animate pointer rewiring exactly like the linked-list canvas.
// Applications add an input token strip, an output strip and verdict badges.
// ---------------------------------------------------------------------------

export type StackMode = "array" | "list";

/** Shared cell state palette for stack/queue canvases (mirrors LLNodeState). */
export type SQCellState =
  | "idle"
  | "active" // being read / compared
  | "visited" // logically gone but still in memory (array pop leaves it stale)
  | "new" // freshly pushed
  | "removing" // being popped / rejected
  | "target" // candidate during a scan
  | "found"; // result / match

export interface StackCell {
  id: string;
  /** Display text: "42", "(", "fact(3)", "a+b" … */
  label: string;
  /** Fake memory address — list mode only. */
  addr?: string;
  /** id of the cell *below* it (toward NULL) — list mode only. */
  next?: string | null;
  state: SQCellState;
  /** Lifted out of the container: being pushed in or just popped/freed. */
  floating?: boolean;
  /** Small side annotation (e.g. "waiting for fact(2)", "returns 6"). */
  note?: string;
}

/** A chip in the input / output strips of the application visualizers. */
export interface TokenChip {
  text: string;
  state: "pending" | "active" | "done" | "matched" | "error";
}

export interface StackStep {
  /** Bottom → top. In array mode stale cells above `top` may remain (dimmed). */
  cells: StackCell[];
  mode: StackMode;
  /** Array mode: fixed slot count. */
  capacity?: number;
  /** Array mode: index stored in the TOP box (−1 = empty). */
  top: number;
  /** List mode: id of the node the TOP box points at (null = NULL). */
  topId?: string | null;
  /** Input strip (expressions / call script). */
  tokens?: TokenChip[];
  /** Output strip (infix → postfix). */
  output?: TokenChip[];
  message?: { text: string; tone: "ok" | "error" | "info" };
  description: string;
  codeLines?: number[];
  /** Ids whose pointer changed this frame ("TOP" = the top box) — highlighted. */
  rewired?: string[];
}

export interface StackProgram {
  steps: StackStep[];
  complexity: Complexity;
  pseudocode: string[];
  title: string;
  mode: StackMode;
}

export type StackOperationId =
  | "push"
  | "pop"
  | "peek"
  | "overflowUnderflow"
  | "llPush"
  | "llPop"
  | "llPeek"
  | "balancedParens"
  | "infixToPostfix"
  | "postfixEval"
  | "recursionStack";

// ---------------------------------------------------------------------------
// Queue visualization
//
// Layouts: "row" (simple queue / deque / priority-array — horizontal slots
// with FRONT and REAR index boxes), "ring" (circular queue — slots on a
// circle, modulo arithmetic narrated), "heap" (priority queue — implicit
// binary tree drawn above its backing array, sift swaps animated by id).
// ---------------------------------------------------------------------------

export type QueueKind = "simple" | "circular" | "deque" | "pqArray" | "pqHeap";
export type QueueLayout = "row" | "ring" | "heap";

export interface QueueCell {
  id: string;
  label: string;
  /** Priority queues: the priority badge. */
  priority?: number;
  state: SQCellState;
  /** Lifted out of the row (arriving / leaving). */
  floating?: boolean;
}

export interface QueueStep {
  /** Fixed length for array/circular layouts (null = empty slot); dense for deque/heap. */
  slots: (QueueCell | null)[];
  /** Index stored in the FRONT box (−1 = empty queue). */
  front: number;
  /** Index stored in the REAR box (−1 = empty queue). */
  rear: number;
  layout: QueueLayout;
  message?: { text: string; tone: "ok" | "error" | "info" };
  description: string;
  codeLines?: number[];
  /** What changed this frame: "FRONT", "REAR", or a cell id — highlighted. */
  rewired?: string[];
}

export interface QueueProgram {
  steps: QueueStep[];
  complexity: Complexity;
  pseudocode: string[];
  title: string;
  kind: QueueKind;
}

export type QueueOperationId =
  | "enqueue"
  | "dequeue"
  | "qPeek"
  | "cEnqueue"
  | "cDequeue"
  | "cOverflow"
  | "dqInsertFront"
  | "dqInsertRear"
  | "dqDeleteFront"
  | "dqDeleteRear"
  | "pqArrayDemo"
  | "pqHeapDemo";

// ---------------------------------------------------------------------------
// Tree visualization
//
// Nodes are circles laid out by the engine on a small grid (x = in-order
// position or heap-level position, y = depth) — the canvas just scales the
// grid to pixels. Because layout is recomputed every frame and nodes keep
// stable ids, ANY structure change (insert, delete, AVL rotation) renders as
// nodes gliding to their new places. Traversals carry an output strip and a
// live call-stack / queue strip; AVL nodes carry balance-factor badges.
// ---------------------------------------------------------------------------

export interface TreeVNode {
  id: string;
  label: string;
  /** Grid coords: x in [0, gridW], y = depth. */
  x: number;
  y: number;
  state: SQCellState;
  /** Small badge under the node (balance factor "bf −1", heap index, disc/low). */
  badge?: string;
  /** Cursor tag above the node ("curr", "succ", "min"…). */
  tag?: string;
  /** Double ring (trie end-of-word marker). */
  ring?: boolean;
}

export interface TreeVEdge {
  from: string;
  to: string;
  state: "idle" | "active" | "new" | "removing";
}

export interface TreesStep {
  nodes: TreeVNode[];
  edges: TreeVEdge[];
  gridW: number;
  gridH: number;
  /** Visit-order / sorted-output strip. */
  output?: { label: string; chips: TokenChip[] };
  /** Auxiliary structure strip (call stack, queue, backing array). */
  aux?: { label: string; chips: TokenChip[] };
  message?: { text: string; tone: "ok" | "error" | "info" };
  description: string;
  codeLines?: number[];
}

export interface TreesProgram {
  steps: TreesStep[];
  complexity: Complexity;
  pseudocode: string[];
  title: string;
}

export type TreesOperationId =
  | "btInorder"
  | "btPreorder"
  | "btPostorder"
  | "btLevelOrder"
  | "btInsert"
  | "btDelete"
  | "bstTraversal"
  | "bstSearch"
  | "bstInsert"
  | "bstDelete"
  | "avlInsert"
  | "avlDelete"
  | "avlRotLL"
  | "avlRotRR"
  | "avlRotLR"
  | "avlRotRL"
  | "heapInsert"
  | "heapDelete"
  | "heapify"
  | "heapSort"
  | "trieInsert"
  | "trieSearch"
  | "trieDelete";

// ---------------------------------------------------------------------------
// Graph visualization
//
// Preset graphs with hand-placed normalized coordinates (0–100), curated per
// algorithm for beginner clarity. Frames carry the node/edge states plus an
// optional data table (dist/key tables, adjacency matrix) and a strip (BFS
// queue, DFS stack, sorted edge list, finish order). Node `group` colors
// connected components (Kruskal's union-find, SCCs).
// ---------------------------------------------------------------------------

export interface GraphVNode {
  id: string;
  label: string;
  /** Normalized coords 0–100. */
  x: number;
  y: number;
  state: SQCellState;
  /** Badge under the node (dist, disc/low…). */
  badge?: string;
  /** Component index — canvas maps it to a hue (union-find / SCC). */
  group?: number;
  /** Ring highlight (articulation point). */
  ring?: boolean;
}

export interface GraphVEdge {
  id: string;
  from: string;
  to: string;
  weight?: number;
  directed?: boolean;
  state: "idle" | "active" | "tree" | "rejected" | "special";
}

export interface GraphTableCell {
  text: string;
  state?: "idle" | "changed" | "final" | "head";
}

export interface GraphStep {
  nodes: GraphVNode[];
  edges: GraphVEdge[];
  /** Data table beside the graph (dist table, adjacency matrix…). */
  table?: { title: string; columns: string[]; rows: { label: string; cells: GraphTableCell[] }[] };
  /** Auxiliary strip (queue, stack, edge list, finish order). */
  strip?: { label: string; chips: TokenChip[] };
  message?: { text: string; tone: "ok" | "error" | "info" };
  description: string;
  codeLines?: number[];
}

export interface GraphProgram {
  steps: GraphStep[];
  complexity: Complexity;
  pseudocode: string[];
  title: string;
}

export type GraphOperationId =
  | "adjMatrix"
  | "adjList"
  | "bfs"
  | "dfs"
  | "dijkstra"
  | "bellmanFord"
  | "floydWarshall"
  | "prim"
  | "kruskal"
  | "bridges"
  | "articulation"
  | "scc";

// ---------------------------------------------------------------------------
// Foundations visualization — "the glass machine"
//
// For absolute beginners: every frame shows the three invisible things that
// make programming make sense — the program counter (highlighted pseudocode
// line), MEMORY as labeled variable boxes (values overwritten with a flash,
// same box language as the HEAD/TOP pointer boxes), and a CONSOLE where
// output accumulates. The complexity pages add step-tile counters: every
// executed line drops a tile, so "time complexity" is literally watching
// tiles pile up faster for bigger inputs.
// ---------------------------------------------------------------------------

export interface FoundVar {
  name: string;
  value: string;
  type: "number" | "string" | "boolean";
  state: SQCellState;
}

export interface FoundCounter {
  /** Row label, e.g. "n = 4" or "O(n²)". */
  label: string;
  /** Number of step tiles to draw. */
  steps: number;
  /** Accent color for the tiles. */
  color: string;
  /** Small note after the tiles, e.g. "= 3n + 2". */
  note?: string;
  /** Highlight this row as currently running. */
  active?: boolean;
}

export interface FoundChartSeries {
  label: string;
  color: string;
  /** [x, y] points, x = input size n, y = steps/cost. Drawn in order. */
  points: [number, number][];
  /** Render as a dashed reference curve instead of a solid measured line. */
  dashed?: boolean;
}

/** Live growth chart shown on the complexity pages — cost drawn as a CURVE. */
export interface FoundChart {
  title: string;
  xLabel: string;
  yLabel: string;
  series: FoundChartSeries[];
}

export interface FoundationsStep {
  vars: FoundVar[];
  /** Console output so far; the last line renders as freshly printed. */
  consoleLines: string[];
  /** Step-tile rows (complexity pages). */
  counters?: FoundCounter[];
  /** Live growth chart (complexity pages) — gains points as steps play. */
  chart?: FoundChart;
  message?: { text: string; tone: "ok" | "error" | "info" };
  description: string;
  codeLines?: number[];
}

export interface FoundationsProgram {
  steps: FoundationsStep[];
  complexity: Complexity;
  /** The little program itself — the star of the page. */
  pseudocode: string[];
  title: string;
}

export type FoundationsOperationId =
  | "fWhatIsAProgram"
  | "fVariables"
  | "fDatatypes"
  | "fConditionals"
  | "fLoops"
  | "fCountingSteps"
  | "fBigO"
  | "fGrowthRates"
  // --- complexity analysis ---
  | "fTimeComplexity"
  | "fSpaceComplexity"
  | "fBestCase"
  | "fWorstCase"
  | "fAverageCase"
  // --- asymptotic notation ---
  | "fBigOBound"
  | "fBigOmega"
  | "fBigTheta"
  | "fLittleO"
  | "fLittleOmega"
  // --- amortized analysis ---
  | "fAggregate"
  | "fAccounting"
  | "fPotential"
  // --- mathematical foundations ---
  | "fInduction"
  | "fRecurrence";

// ---------------------------------------------------------------------------
// String visualization
//
// Strings drawn as rows of character cells (an array wearing quotes), with
// floating cursors above them, an optional letter-frequency chip table
// (anagram-style problems) and an output strip. Classic LeetCode problems.
// ---------------------------------------------------------------------------

export interface StrChar {
  id: string;
  ch: string;
  state: SQCellState;
}

export interface StringRow {
  /** e.g. `s`, `t`. */
  label?: string;
  chars: StrChar[];
}

export interface StringPointer {
  label: string;
  row: number;
  index: number;
  color?: string;
}

export interface FreqEntry {
  key: string;
  /** count from string a / string b. */
  a: number;
  b?: number;
  state: SQCellState;
}

export interface StringStep {
  rows: StringRow[];
  pointers: StringPointer[];
  freq?: FreqEntry[];
  output?: { label: string; chips: TokenChip[] };
  message?: { text: string; tone: "ok" | "error" | "info" };
  description: string;
  codeLines?: number[];
}

export interface StringProgram {
  steps: StringStep[];
  complexity: Complexity;
  pseudocode: string[];
  title: string;
}

export type StringOperationId =
  | "strReverse"
  | "strPalindrome"
  | "strAnagram"
  | "strFirstUnique"
  | "strCommonPrefix";

// --- OOP visualization -------------------------------------------------------
// One shared frame schema drives every OOP animation. A frame shows three
// memory regions — CLASS AREA (blueprint boxes + statics + relation arrows),
// STACK (named references) and HEAP (objects with layered fields + vtables) —
// plus at most a couple of animated method-call arrows and an output strip.
// SOLID pages use only the class area (empty heap/refs); pattern pages are
// heap-heavy. Steps carry a language-agnostic `anchor` instead of raw line
// numbers: each Java/C++/Python code sample maps anchors to ITS OWN lines.

export type OopsAccess = "public" | "private" | "protected";
export type OopsLanguage = "java" | "cpp" | "python";

export interface OopsMember {
  id: string;
  /** e.g. "balance: int" or "deposit(amount)" — access glyph drawn by canvas. */
  name: string;
  kind: "field" | "method";
  access: OopsAccess;
  isStatic?: boolean; // rendered underlined (UML convention)
  isAbstract?: boolean; // rendered italic
  isFinal?: boolean; // lock glyph
  state: SQCellState;
  note?: string; // "overridden", "= 0"
}

/** A class box in the CLASS AREA column — also doubles as a mini UML node. */
export interface OopsClassBox {
  id: string;
  name: string;
  stereotype?: "abstract" | "interface";
  members: OopsMember[];
  /** Static values live IN the class box, not in objects. */
  statics?: { name: string; value: string; state: SQCellState }[];
  /** Grid coords (col, row) — canvas maps to px. */
  x: number;
  y: number;
  state: SQCellState;
}

export interface OopsRelation {
  id: string;
  from: string; // OopsClassBox id (child / dependent)
  to: string; // OopsClassBox id (parent / target)
  kind: "extends" | "implements" | "association" | "aggregation" | "composition" | "dependency";
  state: "idle" | "active" | "new" | "removing";
  label?: string;
}

export interface OopsObjectField {
  id: string;
  name: string;
  value: string;
  /** Declaring class — inheritance draws layered compartments per class. */
  from?: string;
  access: OopsAccess;
  state: SQCellState;
}

/** A heap object: fake address, per-class field layers, optional vtable. */
export interface OopsHeapObject {
  id: string;
  className: string;
  addr: string; // "AA" — same fake-address trick as the stack/list engines
  fields: OopsObjectField[];
  vtable?: { method: string; impl: string; state: SQCellState }[];
  state: SQCellState;
  /** Being constructed / just freed — hovers outside the heap row. */
  floating?: boolean;
}

/** A named reference in the STACK column (like the HEAD/TOP pointer boxes). */
export interface OopsRef {
  id: string;
  name: string; // "a"
  declaredType: string; // "Animal"
  targetId: string | null; // heap object id; null = null reference
  state: SQCellState;
}

/** An animated call/access arrow. */
export interface OopsCall {
  id: string;
  from: "main" | string; // ref id, or "main" for top-level code
  toObjectId?: string; // instance call target
  toClassId?: string; // static call / new / blocked-at-class target
  method: string; // "speak()"
  phase: "calling" | "resolving" | "returned" | "blocked";
  result?: string; // return-value chip text
  note?: string; // "private — access denied"
}

export interface OopsStep {
  classes: OopsClassBox[];
  relations: OopsRelation[];
  heap: OopsHeapObject[];
  refs: OopsRef[];
  calls: OopsCall[];
  /** Program output so far (console strip). */
  output?: TokenChip[];
  message?: { text: string; tone: "ok" | "error" | "info" };
  description: string;
  /** Semantic anchor into the code samples (resolved per language). */
  anchor?: string;
}

export interface OopsProgram {
  steps: OopsStep[];
  title: string;
  /** Key into OOPS_CODE — the real Java/C++/Python samples for the rail. */
  codeKey: string;
  complexity?: Complexity;
}

export type OopsOperationId =
  | "classesObjects"
  | "constructors"
  | "thisReferences"
  | "accessModifiers"
  | "encapsulation"
  | "inheritance"
  | "overloading"
  | "overriding"
  | "abstraction"
  | "interfacesVsAbstract"
  | "staticFinal"
  | "compositionVsInheritance"
  | "srp"
  | "ocp"
  | "lsp"
  | "isp"
  | "dip"
  | "singleton"
  | "factoryMethod"
  | "observer"
  | "strategy"
  | "decorator";

// ---------------------------------------------------------------------------
// Hashing visualization
//
// One frame shape drives three canvas layouts (HashMode):
//   "calc"     — hash-function pages: a worked-arithmetic panel + a row of m
//                buckets the key drops into.
//   "open"     — open addressing: a row of m cells with numbered probe badges.
//   "chaining" — separate chaining: a column of m index slots, each owning a
//                linked chain of entries drawn to the right.
// The `calc` panel is the heart of the section: every op shows the REAL
// arithmetic (quotient/remainder, k·A fraction, digit folding, rolling hash)
// line by line, not just the final index.
// ---------------------------------------------------------------------------

export type HashMode = "calc" | "open" | "chaining";

export interface HashEntryVis {
  id: string;
  /** Display key: "27", "\"hello\"" … */
  key: string;
  state: SQCellState;
  /** Small annotation (e.g. "moved from 3" after a rehash). */
  note?: string;
}

export interface HashSlotVis {
  index: number;
  state: SQCellState;
  /** Chaining: the whole chain head→tail. Open addressing: 0 or 1 entries. */
  entries: HashEntryVis[];
}

export interface HashCalcLine {
  text: string;
  state: "active" | "done";
}

/** One probe of an open-addressing sequence, badged above the slot. */
export interface HashProbe {
  index: number;
  /** i in the probe sequence (0, 1, 2 …). */
  order: number;
  hit: "occupied" | "free" | "match" | "miss";
}

export interface HashStep {
  slots: HashSlotVis[];
  /** Worked arithmetic, revealed line by line. */
  calc?: { title: string; lines: HashCalcLine[] };
  /** The key currently being hashed (chip above the table). */
  incoming?: { key: string; state: SQCellState };
  probes?: HashProbe[];
  /** Load-factor meter (α = n/m) — shown when the op cares about it. */
  load?: { n: number; m: number };
  message?: { text: string; tone: "ok" | "error" | "info" };
  description: string;
  codeLines?: number[];
}

export interface HashProgram {
  steps: HashStep[];
  complexity: Complexity;
  pseudocode: string[];
  title: string;
  mode: HashMode;
  /** Table size the program ENDS with (rehash can grow it mid-run). */
  m: number;
}

export type HashOperationId =
  | "divisionMethod"
  | "multiplicationMethod"
  | "foldingMethod"
  | "stringHashing"
  | "htInsert"
  | "htSearch"
  | "htDelete"
  | "loadFactor"
  | "chaining"
  | "linearProbing"
  | "quadraticProbing"
  | "doubleHashing";
