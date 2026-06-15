// ---------------------------------------------------------------------------
// Array engine
//
// Pure functions that compile an array operation into an `AnimationProgram`
// (a deterministic list of frames). No React, no timers — just data in, frames
// out. The store/player is responsible for advancing through them.
// ---------------------------------------------------------------------------

import type {
  AnimationProgram,
  AnimationStep,
  ArrayCell,
  ArrayOperationId,
  ArrayOperationMeta,
  HighlightKind,
  Pointer,
} from "@/types/visualization";

let _idCounter = 0;
/** Create a fresh cell with a stable, unique id (used as React key). */
export function makeCell(value: number): ArrayCell {
  _idCounter += 1;
  return { id: `cell-${_idCounter}-${Math.random().toString(36).slice(2, 7)}`, value };
}

export function makeCells(values: number[]): ArrayCell[] {
  return values.map(makeCell);
}

/** Deep-ish clone of a cell list (ids preserved, objects fresh). */
function clone(cells: ArrayCell[]): ArrayCell[] {
  return cells.map((c) => ({ ...c }));
}

/** Helper to build a frame, defaulting the noisy fields. */
function frame(
  array: ArrayCell[],
  description: string,
  opts: {
    highlights?: Record<string, HighlightKind>;
    pointers?: Pointer[];
    codeLines?: number[];
  } = {},
): AnimationStep {
  return {
    array: clone(array),
    description,
    highlights: opts.highlights ?? {},
    pointers: opts.pointers ?? [],
    codeLines: opts.codeLines,
  };
}

// --- Operations ------------------------------------------------------------

function traverse(cells: ArrayCell[]): AnimationProgram {
  const steps: AnimationStep[] = [];
  const highlights: Record<string, HighlightKind> = {};
  steps.push(frame(cells, "Begin traversal at index 0. We will visit every element once.", { codeLines: [1] }));
  cells.forEach((cell, i) => {
    steps.push(
      frame(cells, `Visit index ${i} → value ${cell.value}.`, {
        highlights: { ...highlights, [cell.id]: "active" },
        pointers: [{ label: "i", index: i }],
        codeLines: [2, 3],
      }),
    );
    highlights[cell.id] = "visited";
  });
  steps.push(frame(cells, "Traversal complete — all elements visited.", { highlights: { ...highlights }, codeLines: [4] }));
  return {
    steps,
    complexity: { time: "O(n)", space: "O(1)" },
    title: "Traverse",
    pseudocode: ["for i = 0 to n-1:", "  visit array[i]", "  // do work", "end"],
  };
}

function access(cells: ArrayCell[], index: number): AnimationProgram {
  const steps: AnimationStep[] = [];
  steps.push(frame(cells, `Access is direct: the address of index ${index} is computed as base + ${index} × size.`, { codeLines: [1] }));
  if (index < 0 || index >= cells.length) {
    steps.push(frame(cells, `Index ${index} is out of bounds (0…${cells.length - 1}). No element to access.`, { codeLines: [2] }));
  } else {
    const cell = cells[index];
    steps.push(
      frame(cells, `Jump straight to index ${index} → value ${cell.value}. No scanning needed.`, {
        highlights: { [cell.id]: "found" },
        pointers: [{ label: "idx", index, color: "#34C98A" }],
        codeLines: [2],
      }),
    );
  }
  return {
    steps,
    complexity: { time: "O(1)", space: "O(1)" },
    title: `Access (index = ${index})`,
    pseudocode: ["addr = base + index * elemSize", "return array[index]"],
  };
}

function update(cells: ArrayCell[], index: number, value: number): AnimationProgram {
  const steps: AnimationStep[] = [];
  steps.push(frame(cells, `Update index ${index} to ${value}.`, { codeLines: [1] }));
  if (index < 0 || index >= cells.length) {
    steps.push(frame(cells, `Index ${index} is out of bounds. Nothing updated.`));
    return {
      steps,
      complexity: { time: "O(1)", space: "O(1)" },
      title: `Update (index = ${index})`,
      pseudocode: ["array[index] = value"],
    };
  }
  const targetId = cells[index].id;
  steps.push(
    frame(cells, `Locate index ${index} (direct address — O(1)).`, {
      highlights: { [targetId]: "active" },
      pointers: [{ label: "idx", index }],
      codeLines: [1],
    }),
  );
  const next = clone(cells);
  next[index] = { ...next[index], value };
  steps.push(
    frame(next, `Overwrite the value in place → ${value}.`, {
      highlights: { [targetId]: "found" },
      pointers: [{ label: "idx", index, color: "#34C98A" }],
      codeLines: [1],
    }),
  );
  return {
    steps,
    complexity: { time: "O(1)", space: "O(1)" },
    title: `Update (index = ${index}, value = ${value})`,
    pseudocode: ["array[index] = value"],
  };
}

function linearSearch(cells: ArrayCell[], target: number): AnimationProgram {
  const steps: AnimationStep[] = [];
  const visited: Record<string, HighlightKind> = {};
  steps.push(frame(cells, `Linear search for ${target}. Compare each element left → right.`, { codeLines: [1] }));
  let foundAt = -1;
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    steps.push(
      frame(cells, `Compare array[${i}] = ${cell.value} with target ${target}.`, {
        highlights: { ...visited, [cell.id]: "compare" },
        pointers: [{ label: "i", index: i }],
        codeLines: [2, 3],
      }),
    );
    if (cell.value === target) {
      foundAt = i;
      steps.push(
        frame(cells, `Match! Found ${target} at index ${i}.`, {
          highlights: { ...visited, [cell.id]: "found" },
          pointers: [{ label: "i", index: i, color: "#34C98A" }],
          codeLines: [4],
        }),
      );
      break;
    }
    visited[cell.id] = "visited";
  }
  if (foundAt === -1) {
    steps.push(frame(cells, `Reached the end without a match. ${target} is not in the array.`, { highlights: { ...visited }, codeLines: [5] }));
  }
  return {
    steps,
    complexity: { time: "O(n)", space: "O(1)" },
    title: `Linear Search (target = ${target})`,
    pseudocode: ["for i = 0 to n-1:", "  if array[i] == target:", "    return i", "  // keep going", "return -1"],
  };
}

function binarySearch(cells: ArrayCell[], target: number): AnimationProgram {
  const steps: AnimationStep[] = [];
  const sorted = [...cells].every((c, i, a) => i === 0 || a[i - 1].value <= c.value);
  steps.push(
    frame(cells, sorted
      ? `Binary search for ${target}. The array is sorted, so halve the range each step.`
      : `Binary search requires a sorted array — results are only valid when sorted. Searching for ${target}.`, { codeLines: [1] }),
  );
  let lo = 0;
  let hi = cells.length - 1;
  let foundAt = -1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const cell = cells[mid];
    const dim: Record<string, HighlightKind> = {};
    cells.forEach((c, i) => {
      if (i < lo || i > hi) dim[c.id] = "visited";
    });
    steps.push(
      frame(cells, `Range [${lo}…${hi}]. Check the midpoint array[${mid}] = ${cell.value}.`, {
        highlights: { ...dim, [cell.id]: "compare" },
        pointers: [
          { label: "lo", index: lo },
          { label: "mid", index: mid, color: "#F5A623" },
          { label: "hi", index: hi },
        ],
        codeLines: [3, 4],
      }),
    );
    if (cell.value === target) {
      foundAt = mid;
      steps.push(
        frame(cells, `Match! Found ${target} at index ${mid}.`, {
          highlights: { ...dim, [cell.id]: "found" },
          pointers: [{ label: "mid", index: mid, color: "#34C98A" }],
          codeLines: [5],
        }),
      );
      break;
    }
    if (cell.value < target) {
      steps.push(frame(cells, `${cell.value} < ${target} → discard the left half. lo = ${mid + 1}.`, { highlights: { ...dim, [cell.id]: "visited" }, codeLines: [6] }));
      lo = mid + 1;
    } else {
      steps.push(frame(cells, `${cell.value} > ${target} → discard the right half. hi = ${mid - 1}.`, { highlights: { ...dim, [cell.id]: "visited" }, codeLines: [7] }));
      hi = mid - 1;
    }
  }
  if (foundAt === -1) {
    steps.push(frame(cells, `Range is empty — ${target} is not present.`, { codeLines: [8] }));
  }
  return {
    steps,
    complexity: { time: "O(log n)", space: "O(1)" },
    title: `Binary Search (target = ${target})`,
    pseudocode: [
      "lo = 0, hi = n-1",
      "while lo <= hi:",
      "  mid = (lo + hi) / 2",
      "  if array[mid] == target:",
      "    return mid",
      "  if array[mid] < target: lo = mid + 1",
      "  else: hi = mid - 1",
      "return -1",
    ],
  };
}

function insert(cells: ArrayCell[], index: number, value: number): AnimationProgram {
  const steps: AnimationStep[] = [];
  const clamped = Math.max(0, Math.min(index, cells.length));
  steps.push(frame(cells, `Insert ${value} at index ${clamped}. Existing elements must shift right to make room.`, { codeLines: [1] }));

  // Shift visualization: walk from the end down to the insertion point.
  const working = clone(cells);
  for (let i = working.length - 1; i >= clamped; i--) {
    steps.push(
      frame(working, `Shift array[${i}] = ${working[i].value} one slot to the right (to index ${i + 1}).`, {
        highlights: { [working[i].id]: "active" },
        pointers: [{ label: "shift", index: i, color: "#F5A623" }],
        codeLines: [2, 3],
      }),
    );
  }

  const newCell = makeCell(value);
  const next = clone(cells);
  next.splice(clamped, 0, newCell);
  steps.push(
    frame(next, `Place ${value} into the freed slot at index ${clamped}.`, {
      highlights: { [newCell.id]: "insert" },
      pointers: [{ label: "new", index: clamped, color: "#34C98A" }],
      codeLines: [4],
    }),
  );
  steps.push(frame(next, `Insertion complete. Array length is now ${next.length}.`, { highlights: { [newCell.id]: "found" } }));
  return {
    steps,
    complexity: { time: "O(n)", space: "O(1)" },
    title: `Insert (index = ${clamped}, value = ${value})`,
    pseudocode: ["for i = n down to index+1:", "  array[i] = array[i-1]", "  // shift right", "array[index] = value"],
  };
}

function remove(cells: ArrayCell[], index: number): AnimationProgram {
  const steps: AnimationStep[] = [];
  steps.push(frame(cells, `Delete the element at index ${index}.`, { codeLines: [1] }));
  if (index < 0 || index >= cells.length) {
    steps.push(frame(cells, `Index ${index} is out of bounds. Nothing to delete.`));
    return {
      steps,
      complexity: { time: "O(n)", space: "O(1)" },
      title: `Delete (index = ${index})`,
      pseudocode: ["remove array[index]", "shift the rest left"],
    };
  }
  const removed = cells[index];
  steps.push(
    frame(cells, `Mark array[${index}] = ${removed.value} for removal.`, {
      highlights: { [removed.id]: "remove" },
      pointers: [{ label: "idx", index, color: "#FF5F4A" }],
      codeLines: [1],
    }),
  );
  // Show each element to the right sliding one slot left.
  const next = clone(cells);
  next.splice(index, 1);
  for (let i = index; i < next.length; i++) {
    steps.push(
      frame(next, `Shift array[${i + 1}] = ${next[i].value} left into index ${i}.`, {
        highlights: { [next[i].id]: "active" },
        pointers: [{ label: "shift", index: i, color: "#F5A623" }],
        codeLines: [2],
      }),
    );
  }
  steps.push(frame(next, `Deletion complete. Array length is now ${next.length}.`));
  return {
    steps,
    complexity: { time: "O(n)", space: "O(1)" },
    title: `Delete (index = ${index})`,
    pseudocode: ["remove array[index]", "for i = index to n-2: array[i] = array[i+1]"],
  };
}

function reverse(cells: ArrayCell[]): AnimationProgram {
  const steps: AnimationStep[] = [];
  const working = clone(cells);
  steps.push(frame(working, "Reverse in place with two pointers converging from both ends.", { codeLines: [1] }));
  let l = 0;
  let r = working.length - 1;
  const done: Record<string, HighlightKind> = {};
  while (l < r) {
    steps.push(
      frame(working, `Swap array[${l}] = ${working[l].value} with array[${r}] = ${working[r].value}.`, {
        highlights: { ...done, [working[l].id]: "swap", [working[r].id]: "swap" },
        pointers: [
          { label: "l", index: l },
          { label: "r", index: r },
        ],
        codeLines: [2, 3],
      }),
    );
    [working[l], working[r]] = [working[r], working[l]];
    done[working[l].id] = "visited";
    done[working[r].id] = "visited";
    steps.push(
      frame(working, `Swapped. Move pointers inward.`, {
        highlights: { ...done },
        pointers: [
          { label: "l", index: l + 1 },
          { label: "r", index: r - 1 },
        ],
        codeLines: [4],
      }),
    );
    l++;
    r--;
  }
  steps.push(frame(working, "Pointers met — the array is reversed.", { highlights: { ...done } }));
  return {
    steps,
    complexity: { time: "O(n)", space: "O(1)" },
    title: "Reverse",
    pseudocode: ["l = 0, r = n-1", "while l < r:", "  swap(array[l], array[r])", "  l++, r--"],
  };
}

function bubbleSort(cells: ArrayCell[]): AnimationProgram {
  const steps: AnimationStep[] = [];
  const working = clone(cells);
  const n = working.length;
  const sorted: Record<string, HighlightKind> = {};
  steps.push(frame(working, "Bubble sort: repeatedly compare adjacent pairs and swap if out of order.", { codeLines: [1] }));
  for (let i = 0; i < n - 1; i++) {
    let swappedAny = false;
    for (let j = 0; j < n - 1 - i; j++) {
      steps.push(
        frame(working, `Compare array[${j}] = ${working[j].value} and array[${j + 1}] = ${working[j + 1].value}.`, {
          highlights: { ...sorted, [working[j].id]: "compare", [working[j + 1].id]: "compare" },
          pointers: [
            { label: "j", index: j },
            { label: "j+1", index: j + 1 },
          ],
          codeLines: [3, 4],
        }),
      );
      if (working[j].value > working[j + 1].value) {
        steps.push(
          frame(working, `${working[j].value} > ${working[j + 1].value} → swap them.`, {
            highlights: { ...sorted, [working[j].id]: "swap", [working[j + 1].id]: "swap" },
            pointers: [
              { label: "j", index: j },
              { label: "j+1", index: j + 1 },
            ],
            codeLines: [5],
          }),
        );
        [working[j], working[j + 1]] = [working[j + 1], working[j]];
        swappedAny = true;
      }
    }
    // The largest unsorted element has bubbled to its final place.
    sorted[working[n - 1 - i].id] = "found";
    steps.push(
      frame(working, `Pass ${i + 1} done — array[${n - 1 - i}] = ${working[n - 1 - i].value} is locked in place.`, {
        highlights: { ...sorted },
        codeLines: [6],
      }),
    );
    if (!swappedAny) {
      steps.push(frame(working, "No swaps this pass — the array is already sorted. Stop early.", { highlights: { ...sorted } }));
      break;
    }
  }
  // Lock anything still unmarked (e.g. early-exit / index 0).
  working.forEach((c) => (sorted[c.id] = "found"));
  steps.push(frame(working, "Sorting complete — every element is in its final position.", { highlights: { ...sorted } }));
  return {
    steps,
    complexity: { time: "O(n²)", space: "O(1)" },
    title: "Bubble Sort",
    pseudocode: [
      "for i = 0 to n-2:",
      "  swapped = false",
      "  for j = 0 to n-2-i:",
      "    if array[j] > array[j+1]:",
      "      swap(array[j], array[j+1])",
      "  if not swapped: break",
    ],
  };
}

function selectionSort(cells: ArrayCell[]): AnimationProgram {
  const steps: AnimationStep[] = [];
  const working = clone(cells);
  const n = working.length;
  const sorted: Record<string, HighlightKind> = {};
  steps.push(frame(working, "Selection sort: each pass picks the minimum of the unsorted region.", { codeLines: [1] }));
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    steps.push(
      frame(working, `Pass ${i + 1}: assume array[${i}] = ${working[i].value} is the minimum.`, {
        highlights: { ...sorted, [working[min].id]: "active" },
        pointers: [{ label: "min", index: min, color: "#34C98A" }, { label: "i", index: i }],
        codeLines: [2, 3],
      }),
    );
    for (let j = i + 1; j < n; j++) {
      steps.push(
        frame(working, `Compare array[${j}] = ${working[j].value} with current min ${working[min].value}.`, {
          highlights: { ...sorted, [working[min].id]: "active", [working[j].id]: "compare" },
          pointers: [{ label: "min", index: min, color: "#34C98A" }, { label: "j", index: j }],
          codeLines: [4, 5],
        }),
      );
      if (working[j].value < working[min].value) min = j;
    }
    if (min !== i) {
      steps.push(
        frame(working, `Swap the minimum array[${min}] = ${working[min].value} into position ${i}.`, {
          highlights: { ...sorted, [working[i].id]: "swap", [working[min].id]: "swap" },
          codeLines: [6],
        }),
      );
      [working[i], working[min]] = [working[min], working[i]];
    }
    sorted[working[i].id] = "found";
    steps.push(frame(working, `array[${i}] = ${working[i].value} is now locked in place.`, { highlights: { ...sorted } }));
  }
  working.forEach((c) => (sorted[c.id] = "found"));
  steps.push(frame(working, "Sorting complete.", { highlights: { ...sorted } }));
  return {
    steps,
    complexity: { time: "O(n²)", space: "O(1)" },
    title: "Selection Sort",
    pseudocode: ["for i = 0 to n-2:", "  min = i", "  for j = i+1 to n-1:", "    if array[j] < array[min]:", "      min = j", "  swap(array[i], array[min])"],
  };
}

function insertionSort(cells: ArrayCell[]): AnimationProgram {
  const steps: AnimationStep[] = [];
  const working = clone(cells);
  const n = working.length;
  const sorted: Record<string, HighlightKind> = {};
  if (n) sorted[working[0].id] = "found";
  steps.push(frame(working, "Insertion sort: grow a sorted prefix by inserting each next element into place.", { highlights: { ...sorted }, codeLines: [1] }));
  for (let i = 1; i < n; i++) {
    const keyCell = working[i];
    const key = keyCell.value;
    steps.push(
      frame(working, `Take array[${i}] = ${key} as the key to insert into the sorted prefix.`, {
        highlights: { ...sorted, [keyCell.id]: "active" },
        pointers: [{ label: "key", index: i, color: "#FF5F4A" }],
        codeLines: [2, 3],
      }),
    );
    let j = i - 1;
    while (j >= 0 && working[j].value > key) {
      steps.push(
        frame(working, `${working[j].value} > ${key} → shift array[${j}] right.`, {
          highlights: { ...sorted, [working[j].id]: "compare" },
          pointers: [{ label: "j", index: j }],
          codeLines: [4, 5],
        }),
      );
      working[j + 1] = working[j];
      j--;
    }
    working[j + 1] = keyCell;
    sorted[keyCell.id] = "found";
    steps.push(frame(working, `Insert the key at index ${j + 1}. Prefix [0…${i}] is sorted.`, { highlights: { ...sorted }, codeLines: [6] }));
  }
  steps.push(frame(working, "Sorting complete.", { highlights: { ...sorted } }));
  return {
    steps,
    complexity: { time: "O(n²)", space: "O(1)" },
    title: "Insertion Sort",
    pseudocode: ["for i = 1 to n-1:", "  key = array[i]", "  j = i - 1", "  while j >= 0 and array[j] > key:", "    array[j+1] = array[j]; j--", "  array[j+1] = key"],
  };
}

function quickSort(cells: ArrayCell[]): AnimationProgram {
  const steps: AnimationStep[] = [];
  const working = clone(cells);
  const sorted: Record<string, HighlightKind> = {};
  steps.push(frame(working, "Quick sort (Lomuto): partition around a pivot, then recurse on each side.", { codeLines: [1] }));

  function partition(lo: number, hi: number): number {
    const pivot = working[hi].value;
    steps.push(
      frame(working, `Partition [${lo}…${hi}]. Pivot = array[${hi}] = ${pivot}.`, {
        highlights: { ...sorted, [working[hi].id]: "target" },
        pointers: [{ label: "pivot", index: hi, color: "#F5A623" }],
        codeLines: [2],
      }),
    );
    let i = lo;
    for (let j = lo; j < hi; j++) {
      steps.push(
        frame(working, `Compare array[${j}] = ${working[j].value} with pivot ${pivot}.`, {
          highlights: { ...sorted, [working[hi].id]: "target", [working[j].id]: "compare" },
          pointers: [{ label: "i", index: i }, { label: "j", index: j }, { label: "pivot", index: hi, color: "#F5A623" }],
          codeLines: [3, 4],
        }),
      );
      if (working[j].value < pivot) {
        if (i !== j) {
          steps.push(
            frame(working, `${working[j].value} < ${pivot} → swap into the "smaller" region (index ${i}).`, {
              highlights: { ...sorted, [working[i].id]: "swap", [working[j].id]: "swap" },
              codeLines: [5],
            }),
          );
          [working[i], working[j]] = [working[j], working[i]];
        }
        i++;
      }
    }
    if (i !== hi) {
      steps.push(
        frame(working, `Place the pivot at its sorted index ${i}.`, {
          highlights: { ...sorted, [working[i].id]: "swap", [working[hi].id]: "swap" },
          codeLines: [6],
        }),
      );
      [working[i], working[hi]] = [working[hi], working[i]];
    }
    sorted[working[i].id] = "found";
    return i;
  }

  function qs(lo: number, hi: number) {
    if (lo > hi) return;
    if (lo === hi) {
      sorted[working[lo].id] = "found";
      return;
    }
    const p = partition(lo, hi);
    qs(lo, p - 1);
    qs(p + 1, hi);
  }
  qs(0, working.length - 1);
  working.forEach((c) => (sorted[c.id] = "found"));
  steps.push(frame(working, "Sorting complete.", { highlights: { ...sorted } }));
  return {
    steps,
    complexity: { time: "O(n log n)", space: "O(log n)" },
    title: "Quick Sort",
    pseudocode: ["quicksort(lo, hi):", "  pivot = array[hi]", "  for j = lo to hi-1:", "    if array[j] < pivot:", "      swap(array[i++], array[j])", "  swap(array[i], array[hi]); recurse"],
  };
}

function mergeSort(cells: ArrayCell[]): AnimationProgram {
  const steps: AnimationStep[] = [];
  const working = clone(cells);
  steps.push(frame(working, "Merge sort: recursively split into halves, then merge them back in order.", { codeLines: [1] }));

  function regionDim(lo: number, hi: number): Record<string, HighlightKind> {
    const h: Record<string, HighlightKind> = {};
    working.forEach((c, idx) => {
      if (idx < lo || idx > hi) h[c.id] = "visited";
    });
    return h;
  }

  function merge(lo: number, mid: number, hi: number) {
    const left = working.slice(lo, mid + 1).map((c) => ({ ...c }));
    const right = working.slice(mid + 1, hi + 1).map((c) => ({ ...c }));
    steps.push(
      frame(working, `Merge sorted halves [${lo}…${mid}] and [${mid + 1}…${hi}].`, {
        highlights: regionDim(lo, hi),
        pointers: [{ label: "lo", index: lo }, { label: "mid", index: mid, color: "#F5A623" }, { label: "hi", index: hi }],
        codeLines: [4],
      }),
    );
    let i = 0, j = 0, k = lo;
    while (i < left.length && j < right.length) {
      const pick = left[i].value <= right[j].value ? left[i++] : right[j++];
      working[k] = pick;
      steps.push(
        frame(working, `Write ${pick.value} into index ${k} (smaller of the two fronts).`, {
          highlights: { ...regionDim(lo, hi), [pick.id]: "swap" },
          pointers: [{ label: "k", index: k, color: "#34C98A" }],
          codeLines: [5],
        }),
      );
      k++;
    }
    while (i < left.length) { working[k] = left[i++]; steps.push(frame(working, `Drain remaining ${working[k].value} into index ${k}.`, { highlights: { ...regionDim(lo, hi), [working[k].id]: "swap" }, codeLines: [6] })); k++; }
    while (j < right.length) { working[k] = right[j++]; steps.push(frame(working, `Drain remaining ${working[k].value} into index ${k}.`, { highlights: { ...regionDim(lo, hi), [working[k].id]: "swap" }, codeLines: [6] })); k++; }
  }

  function ms(lo: number, hi: number) {
    if (lo >= hi) return;
    const mid = Math.floor((lo + hi) / 2);
    ms(lo, mid);
    ms(mid + 1, hi);
    merge(lo, mid, hi);
  }
  ms(0, working.length - 1);
  const done: Record<string, HighlightKind> = {};
  working.forEach((c) => (done[c.id] = "found"));
  steps.push(frame(working, "Sorting complete.", { highlights: done }));
  return {
    steps,
    complexity: { time: "O(n log n)", space: "O(n)" },
    title: "Merge Sort",
    pseudocode: ["mergesort(lo, hi):", "  if lo >= hi: return", "  mid = (lo + hi) / 2", "  mergesort halves", "  merge: write smaller front", "  drain leftovers"],
  };
}

function prefixSum(cells: ArrayCell[]): AnimationProgram {
  const steps: AnimationStep[] = [];
  const working = clone(cells);
  steps.push(frame(working, "Prefix sum: replace each element with the running total up to that index.", { codeLines: [1] }));
  if (working.length) {
    steps.push(frame(working, `prefix[0] stays ${working[0].value}.`, { highlights: { [working[0].id]: "found" }, pointers: [{ label: "i", index: 0 }], codeLines: [2] }));
  }
  const done: Record<string, HighlightKind> = working.length ? { [working[0].id]: "found" } : {};
  for (let i = 1; i < working.length; i++) {
    steps.push(
      frame(working, `prefix[${i}] = array[${i}] (${working[i].value}) + prefix[${i - 1}] (${working[i - 1].value}).`, {
        highlights: { ...done, [working[i].id]: "compare", [working[i - 1].id]: "active" },
        pointers: [{ label: "i", index: i }],
        codeLines: [3, 4],
      }),
    );
    working[i] = { ...working[i], value: working[i].value + working[i - 1].value };
    done[working[i].id] = "found";
    steps.push(frame(working, `→ prefix[${i}] = ${working[i].value}.`, { highlights: { ...done }, pointers: [{ label: "i", index: i }], codeLines: [4] }));
  }
  steps.push(frame(working, "Done. Any range sum [l…r] is now prefix[r] − prefix[l−1] in O(1).", { highlights: { ...done } }));
  return {
    steps,
    complexity: { time: "O(n)", space: "O(n)" },
    title: "Prefix Sum",
    pseudocode: ["prefix[0] = array[0]", "for i = 1 to n-1:", "  prefix[i] =", "    array[i] + prefix[i-1]", "// rangeSum(l,r) = prefix[r] - prefix[l-1]"],
  };
}

function slidingWindow(cells: ArrayCell[], k: number): AnimationProgram {
  const steps: AnimationStep[] = [];
  const n = cells.length;
  const size = Math.max(1, Math.min(k || 3, n));
  steps.push(frame(cells, `Sliding window (size ${size}): find the maximum sum of any ${size} consecutive elements.`, { codeLines: [1] }));
  const windowHi = (start: number): Record<string, HighlightKind> => {
    const h: Record<string, HighlightKind> = {};
    for (let x = start; x < start + size; x++) if (cells[x]) h[cells[x].id] = "compare";
    return h;
  };
  let windowSum = 0;
  for (let x = 0; x < size; x++) windowSum += cells[x].value;
  let best = windowSum;
  let bestStart = 0;
  steps.push(frame(cells, `Initial window [0…${size - 1}] sums to ${windowSum}.`, { highlights: windowHi(0), pointers: [{ label: "L", index: 0 }, { label: "R", index: size - 1 }], codeLines: [2] }));
  for (let start = 1; start + size - 1 < n; start++) {
    const out = cells[start - 1].value;
    const inc = cells[start + size - 1].value;
    windowSum += inc - out;
    steps.push(
      frame(cells, `Slide: drop ${out}, add ${inc} → window sum ${windowSum}.`, {
        highlights: windowHi(start),
        pointers: [{ label: "L", index: start }, { label: "R", index: start + size - 1 }],
        codeLines: [3, 4],
      }),
    );
    if (windowSum > best) {
      best = windowSum;
      bestStart = start;
    }
  }
  const bestHi: Record<string, HighlightKind> = {};
  for (let x = bestStart; x < bestStart + size; x++) bestHi[cells[x].id] = "found";
  steps.push(frame(cells, `Best window starts at index ${bestStart} with sum ${best}.`, { highlights: bestHi, codeLines: [5] }));
  return {
    steps,
    complexity: { time: "O(n)", space: "O(1)" },
    title: `Sliding Window (k = ${size})`,
    pseudocode: ["sum = sum of first k", "best = sum", "for each slide:", "  sum += in - out", "  best = max(best, sum)"],
  };
}

function twoPointer(cells: ArrayCell[], target: number): AnimationProgram {
  const steps: AnimationStep[] = [];
  const sortedView = cells.every((c, i, a) => i === 0 || a[i - 1].value <= c.value);
  steps.push(
    frame(cells, sortedView
      ? `Two pointers: find a pair summing to ${target} on the sorted array.`
      : `Two pointers needs a sorted array — results are only valid when sorted. Target ${target}.`, { codeLines: [1] }),
  );
  let l = 0;
  let r = cells.length - 1;
  let found = false;
  while (l < r) {
    const sum = cells[l].value + cells[r].value;
    steps.push(
      frame(cells, `array[${l}] + array[${r}] = ${cells[l].value} + ${cells[r].value} = ${sum}.`, {
        highlights: { [cells[l].id]: "compare", [cells[r].id]: "compare" },
        pointers: [{ label: "L", index: l }, { label: "R", index: r }],
        codeLines: [2, 3],
      }),
    );
    if (sum === target) {
      steps.push(frame(cells, `Match! ${cells[l].value} + ${cells[r].value} = ${target}.`, { highlights: { [cells[l].id]: "found", [cells[r].id]: "found" }, pointers: [{ label: "L", index: l }, { label: "R", index: r }], codeLines: [4] }));
      found = true;
      break;
    }
    if (sum < target) {
      steps.push(frame(cells, `${sum} < ${target} → move L right to grow the sum.`, { highlights: { [cells[l].id]: "visited" }, codeLines: [5] }));
      l++;
    } else {
      steps.push(frame(cells, `${sum} > ${target} → move R left to shrink the sum.`, { highlights: { [cells[r].id]: "visited" }, codeLines: [6] }));
      r--;
    }
  }
  if (!found) steps.push(frame(cells, `Pointers crossed — no pair sums to ${target}.`));
  return {
    steps,
    complexity: { time: "O(n)", space: "O(1)" },
    title: `Two Pointer (target = ${target})`,
    pseudocode: ["l = 0, r = n-1", "while l < r:", "  sum = array[l] + array[r]", "  if sum == target: return", "  if sum < target: l++", "  else: r--"],
  };
}

// --- Public dispatch -------------------------------------------------------

export const ARRAY_OPERATIONS: ArrayOperationMeta[] = [
  { id: "traverse", label: "Traverse", icon: "linear_scale", params: [], hint: "Visit every element once." },
  { id: "access", label: "Access", icon: "my_location", params: ["index"], hint: "Jump straight to an index — O(1)." },
  { id: "update", label: "Update", icon: "edit", params: ["index", "value"], hint: "Overwrite a value in place." },
  { id: "linearSearch", label: "Linear Search", icon: "search", params: ["value"], hint: "Scan left → right for a value." },
  { id: "binarySearch", label: "Binary Search", icon: "manage_search", params: ["value"], hint: "Halve a sorted range each step." },
  { id: "insert", label: "Insert", icon: "add_box", params: ["index", "value"], hint: "Shift right, then place." },
  { id: "delete", label: "Delete", icon: "delete", params: ["index"], hint: "Remove, then shift left." },
  { id: "reverse", label: "Reverse", icon: "swap_horiz", params: [], hint: "Two-pointer in-place reversal." },
  { id: "bubbleSort", label: "Bubble Sort", icon: "sort", params: [], hint: "Adjacent compare-and-swap." },
  { id: "selectionSort", label: "Selection Sort", icon: "filter_list", params: [], hint: "Pick the minimum each pass." },
  { id: "insertionSort", label: "Insertion Sort", icon: "playlist_add", params: [], hint: "Grow a sorted prefix." },
  { id: "mergeSort", label: "Merge Sort", icon: "call_split", params: [], hint: "Divide, sort halves, merge." },
  { id: "quickSort", label: "Quick Sort", icon: "swap_vert", params: [], hint: "Partition around a pivot." },
  { id: "prefixSum", label: "Prefix Sum", icon: "functions", params: [], hint: "Running totals for O(1) range sums." },
  { id: "slidingWindow", label: "Sliding Window", icon: "crop_landscape", params: ["value"], hint: "Max sum of k consecutive (value = k)." },
  { id: "twoPointer", label: "Two Pointer", icon: "compare_arrows", params: ["value"], hint: "Pair sum on sorted (value = target)." },
];

export interface RunParams {
  index?: number;
  value?: number;
  /** Window size for sliding-window. */
  k?: number;
  /** Target sum for two-pointer / searches. */
  target?: number;
}

/** Compile an operation into an animation program. */
export function runArrayOperation(
  op: ArrayOperationId,
  cells: ArrayCell[],
  params: RunParams = {},
): AnimationProgram {
  const index = params.index ?? 0;
  const value = params.value ?? 0;
  switch (op) {
    case "traverse":
      return traverse(cells);
    case "access":
      return access(cells, index);
    case "update":
      return update(cells, index, value);
    case "linearSearch":
      return linearSearch(cells, value);
    case "binarySearch":
      return binarySearch(cells, value);
    case "insert":
      return insert(cells, index, value);
    case "delete":
      return remove(cells, index);
    case "reverse":
      return reverse(cells);
    case "bubbleSort":
      return bubbleSort(cells);
    case "selectionSort":
      return selectionSort(cells);
    case "insertionSort":
      return insertionSort(cells);
    case "mergeSort":
      return mergeSort(cells);
    case "quickSort":
      return quickSort(cells);
    case "prefixSum":
      return prefixSum(cells);
    case "slidingWindow":
      return slidingWindow(cells, params.k ?? value ?? 3);
    case "twoPointer":
      return twoPointer(cells, params.target ?? value ?? 0);
    default:
      return traverse(cells);
  }
}
