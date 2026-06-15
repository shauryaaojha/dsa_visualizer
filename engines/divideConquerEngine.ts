// ---------------------------------------------------------------------------
// Divide & Conquer engine — recursion-tree compiler
//
// Compiles merge sort / quick sort into TreeProgram frames. Each frame is a
// snapshot of the recursion tree (nodes created so far + their states) plus the
// working array. This lets the canvas draw the array splitting into left/right
// subarrays and combining back — the classic D&C picture.
// ---------------------------------------------------------------------------

import type {
  HighlightKind,
  RTreeNode,
  TreeOperationId,
  TreeProgram,
  TreeStep,
} from "@/types/visualization";

let _tid = 0;
function nodeId() {
  _tid += 1;
  return `n${_tid}`;
}

interface Builder {
  steps: TreeStep[];
  nodes: Record<string, RTreeNode>;
  array: number[];
  maxDepth: number;
}

function snapshot(
  b: Builder,
  description: string,
  codeLines?: number[],
  arrayHighlights?: Record<number, HighlightKind>,
): void {
  // Deep-clone nodes + array so each frame is immutable.
  const nodes: Record<string, RTreeNode> = {};
  for (const k of Object.keys(b.nodes)) nodes[k] = { ...b.nodes[k], values: [...b.nodes[k].values] };
  b.steps.push({
    nodes,
    array: [...b.array],
    arrayHighlights,
    description,
    codeLines,
  });
}

function rangeHi(lo: number, hi: number, kind: HighlightKind): Record<number, HighlightKind> {
  const h: Record<number, HighlightKind> = {};
  for (let i = lo; i <= hi; i++) h[i] = kind;
  return h;
}

// --- Merge sort ------------------------------------------------------------

function mergeSort(values: number[]): TreeProgram {
  const b: Builder = { steps: [], nodes: {}, array: [...values], maxDepth: 0 };

  function rec(lo: number, hi: number, depth: number, parentId: string | null): string {
    b.maxDepth = Math.max(b.maxDepth, depth);
    const id = nodeId();
    b.nodes[id] = {
      id,
      lo,
      hi,
      depth,
      parentId,
      values: b.array.slice(lo, hi + 1),
      state: "dividing",
    };
    snapshot(b, `Divide [${lo}…${hi}] → ${JSON.stringify(b.array.slice(lo, hi + 1))}.`, [1, 2], rangeHi(lo, hi, "active"));

    if (lo === hi) {
      b.nodes[id].state = "done";
      snapshot(b, `Single element [${lo}] is trivially sorted.`, [3], rangeHi(lo, hi, "found"));
      return id;
    }

    const mid = Math.floor((lo + hi) / 2);
    const left = rec(lo, mid, depth + 1, id);
    const right = rec(mid + 1, hi, depth + 1, id);

    // Merge the two children back into the parent range.
    b.nodes[id].state = "combining";
    snapshot(b, `Combine: merge sorted halves [${lo}…${mid}] and [${mid + 1}…${hi}].`, [4, 5], rangeHi(lo, hi, "compare"));

    const merged: number[] = [];
    let i = lo;
    let j = mid + 1;
    while (i <= mid && j <= hi) merged.push(b.array[i] <= b.array[j] ? b.array[i++] : b.array[j++]);
    while (i <= mid) merged.push(b.array[i++]);
    while (j <= hi) merged.push(b.array[j++]);
    for (let k = 0; k < merged.length; k++) b.array[lo + k] = merged[k];

    b.nodes[id].values = [...merged];
    b.nodes[left].state = "done";
    b.nodes[right].state = "done";
    b.nodes[id].state = "done";
    snapshot(b, `Merged → ${JSON.stringify(merged)} written back to [${lo}…${hi}].`, [6], rangeHi(lo, hi, "found"));
    return id;
  }

  rec(0, values.length - 1, 0, null);
  snapshot(b, "Done — the root holds the fully sorted array.", [7], rangeHi(0, values.length - 1, "found"));

  return {
    steps: b.steps,
    complexity: { time: "O(n log n)", space: "O(n)" },
    title: "Merge Sort (recursion tree)",
    maxDepth: b.maxDepth,
    span: values.length,
    pseudocode: [
      "mergesort(lo, hi):",
      "  if lo == hi: return",
      "  mid = (lo + hi) / 2",
      "  mergesort(lo, mid)      // left subtree",
      "  mergesort(mid+1, hi)    // right subtree",
      "  merge halves → parent",
      "  return sorted range",
    ],
  };
}

// --- Quick sort ------------------------------------------------------------

function quickSort(values: number[]): TreeProgram {
  const b: Builder = { steps: [], nodes: {}, array: [...values], maxDepth: 0 };

  function rec(lo: number, hi: number, depth: number, parentId: string | null): string {
    b.maxDepth = Math.max(b.maxDepth, depth);
    const id = nodeId();
    b.nodes[id] = {
      id,
      lo,
      hi,
      depth,
      parentId,
      values: b.array.slice(lo, hi + 1),
      state: "dividing",
    };

    if (lo > hi) {
      b.nodes[id].state = "done";
      return id;
    }
    if (lo === hi) {
      b.nodes[id].state = "done";
      snapshot(b, `Single element [${lo}] = ${b.array[lo]} is sorted.`, [6], rangeHi(lo, hi, "found"));
      return id;
    }

    const pivot = b.array[hi];
    b.nodes[id].pivot = pivot;
    b.nodes[id].state = "active";
    snapshot(b, `Partition [${lo}…${hi}] around pivot ${pivot} (last element).`, [1, 2], rangeHi(lo, hi, "active"));

    // Lomuto partition in place.
    let i = lo;
    for (let j = lo; j < hi; j++) {
      if (b.array[j] < pivot) {
        [b.array[i], b.array[j]] = [b.array[j], b.array[i]];
        i++;
      }
    }
    [b.array[i], b.array[hi]] = [b.array[hi], b.array[i]];
    b.nodes[id].values = b.array.slice(lo, hi + 1);

    const hl: Record<number, HighlightKind> = {};
    for (let x = lo; x < i; x++) hl[x] = "active"; // < pivot
    hl[i] = "found"; // pivot in place
    for (let x = i + 1; x <= hi; x++) hl[x] = "compare"; // > pivot
    snapshot(b, `Pivot ${pivot} settles at index ${i}. Left < pivot, right ≥ pivot.`, [3], hl);

    const left = rec(lo, i - 1, depth + 1, id);
    const right = rec(i + 1, hi, depth + 1, id);
    b.nodes[left].state = "done";
    b.nodes[right].state = "done";
    b.nodes[id].state = "done";
    return id;
  }

  rec(0, values.length - 1, 0, null);
  snapshot(b, "Done — every pivot is in its final position, array sorted.", [7], rangeHi(0, values.length - 1, "found"));

  return {
    steps: b.steps,
    complexity: { time: "O(n log n) avg", space: "O(log n)" },
    title: "Quick Sort (recursion tree)",
    maxDepth: b.maxDepth,
    span: values.length,
    pseudocode: [
      "quicksort(lo, hi):",
      "  pivot = array[hi]",
      "  partition: < pivot | pivot | ≥ pivot",
      "  quicksort(lo, p-1)   // left subtree",
      "  quicksort(p+1, hi)   // right subtree",
      "  // pivot already placed",
      "  return",
    ],
  };
}

// --- Binary search (divide & conquer tree) -----------------------------------
// At every level we show BOTH halves: the chosen half recurses deeper, the
// eliminated half becomes an immediate leaf with state "done" (greyed out).

function binarySearch(inputValues: number[], target: number): TreeProgram {
  // Binary search requires sorted input; sort a copy so the caller's array is untouched.
  const arr = [...inputValues].sort((a, b) => a - b);
  const b: Builder = { steps: [], nodes: {}, array: arr, maxDepth: 0 };

  function rec(lo: number, hi: number, depth: number, parentId: string | null): void {
    b.maxDepth = Math.max(b.maxDepth, depth);
    const id = nodeId();

    if (lo > hi) {
      // Empty partition — target not present in this range.
      b.nodes[id] = { id, lo, hi, depth, parentId, values: [], state: "done" };
      snapshot(b, `Empty range — target ${target} not found in this partition.`, [4]);
      return;
    }

    b.nodes[id] = {
      id, lo, hi, depth, parentId,
      values: arr.slice(lo, hi + 1),
      state: "dividing",
    };

    const mid = Math.floor((lo + hi) / 2);
    const midVal = arr[mid];
    b.nodes[id].pivot = midVal;

    // Highlight the active range; mark mid as "compare".
    const hl: Record<number, HighlightKind> = {};
    for (let i = lo; i <= hi; i++) hl[i] = "visited";
    hl[mid] = "compare";
    snapshot(b, `Range [${lo}…${hi}] — check mid [${mid}] = ${midVal}. Target = ${target}.`, [2], hl);

    if (midVal === target) {
      b.nodes[id].state = "done";
      snapshot(b, `✓ Found! arr[${mid}] = ${target}.`, [3], { [mid]: "found" });
      return;
    }

    b.nodes[id].state = "active";

    if (target < midVal) {
      // Eliminated: right half [mid+1 … hi].
      const elimId = nodeId();
      b.nodes[elimId] = {
        id: elimId,
        lo: mid + 1, hi,
        depth: depth + 1, parentId: id,
        values: mid + 1 <= hi ? arr.slice(mid + 1, hi + 1) : [],
        state: "done",
      };
      snapshot(b, `${target} < ${midVal} — right [${mid + 1}…${hi}] eliminated, descend left [${lo}…${mid - 1}].`, [5], hl);
      rec(lo, mid - 1, depth + 1, id);
    } else {
      // Eliminated: left half [lo … mid-1].
      const elimId = nodeId();
      b.nodes[elimId] = {
        id: elimId,
        lo, hi: mid - 1,
        depth: depth + 1, parentId: id,
        values: lo <= mid - 1 ? arr.slice(lo, mid) : [],
        state: "done",
      };
      snapshot(b, `${target} > ${midVal} — left [${lo}…${mid - 1}] eliminated, descend right [${mid + 1}…${hi}].`, [6], hl);
      rec(mid + 1, hi, depth + 1, id);
    }

    b.nodes[id].state = "done";
  }

  rec(0, arr.length - 1, 0, null);
  snapshot(b, "Binary search complete.", [], {});

  return {
    steps: b.steps,
    complexity: { time: "O(log n)", space: "O(log n)" },
    title: `Binary Search (target = ${target})`,
    maxDepth: b.maxDepth,
    span: arr.length,
    pseudocode: [
      `binarySearch(lo, hi, target=${target}):`,
      "  mid = (lo + hi) / 2",
      "  if arr[mid] == target: return mid  ✓",
      "  if lo > hi: return -1              ✗",
      "  if target < arr[mid]:",
      "    recurse left  [lo, mid-1]",
      "  else:",
      "    recurse right [mid+1, hi]",
    ],
  };
}

export function runTreeOperation(
  op: TreeOperationId,
  values: number[],
  params?: { target?: number },
): TreeProgram {
  if (op === "quickSort") return quickSort(values);
  if (op === "binarySearch") return binarySearch(values, params?.target ?? 0);
  return mergeSort(values);
}
