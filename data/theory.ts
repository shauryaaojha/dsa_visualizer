// ---------------------------------------------------------------------------
// Theory registry
//
// One TheoryDoc per visualizer leaf, surfaced by the floating "Theory" button
// at the top-left of every canvas. Docs are keyed by a normalised route key so
// that the three linked-list kinds (singly/doubly/circular) share one doc for
// the operations that behave identically.
//
// getTheory(path) maps a page path → its TheoryDoc (or undefined for hubs).
// ---------------------------------------------------------------------------

export interface TheorySection {
  heading: string;
  body: string;
}

export interface TheoryDoc {
  title: string;
  /** One-line essence shown under the title. */
  summary: string;
  complexity?: { time: string; space: string };
  sections: TheorySection[];
  /** Optional LeetCode problem reference (e.g. "53. Maximum Subarray"). */
  leetcode?: string;
}

/** Normalise a route path into a theory key (see file header). */
export function theoryKey(path: string): string {
  const parts = path.split("/").filter(Boolean); // ['topics','arrays',...]
  if (parts[0] !== "topics") return parts.join("/");
  if (parts[1] === "linked-list") {
    const seg2 = parts[2] ?? "";
    if (seg2.endsWith("-linked-list")) return "ll:" + parts.slice(3).join("/");
    return "ll:" + parts.slice(2).join("/");
  }
  if (parts[1] === "stacks") return "st:" + parts.slice(2).join("/");
  if (parts[1] === "queues") return "q:" + parts.slice(2).join("/");
  // arrays (and future sections): category/leaf
  return parts.slice(2).join("/");
}

const s = (heading: string, body: string): TheorySection => ({ heading, body });

const THEORY: Record<string, TheoryDoc> = {
  // --- Arrays · basic operations -----------------------------------------
  "basic-operations/traversal": {
    title: "Array Traversal",
    summary: "Visit every element exactly once, left to right.",
    complexity: { time: "O(n)", space: "O(1)" },
    sections: [
      s("Idea", "An array stores its elements in one contiguous block. Traversal walks an index `i` from 0 to n−1, reading each slot once — the backbone of almost every array algorithm."),
      s("Why O(n)", "Each of the n elements is touched a constant number of times, so work grows linearly with the array's length."),
      s("Watch out", "Off-by-one errors at the boundaries (`i <= n` instead of `i < n`) are the classic bug — they read one slot past the end."),
    ],
  },
  "basic-operations/insertion": {
    title: "Array Insertion",
    summary: "Make room at an index by shifting the tail right, then place the value.",
    complexity: { time: "O(n)", space: "O(1)" },
    sections: [
      s("Idea", "Because memory is contiguous, inserting at index k means every element from k onward must move one slot to the right before the new value can occupy the freed slot."),
      s("Cost", "Inserting at the front shifts all n elements (O(n)); inserting at the very end is O(1) when there is spare capacity."),
      s("Trade-off", "Arrays buy O(1) random access at the price of O(n) inserts/deletes in the middle — the opposite trade-off to a linked list."),
    ],
  },
  "basic-operations/deletion": {
    title: "Array Deletion",
    summary: "Remove an element, then shift the tail left to close the gap.",
    complexity: { time: "O(n)", space: "O(1)" },
    sections: [
      s("Idea", "Deleting at index k leaves a hole; every element after k slides one slot left so the array stays contiguous."),
      s("Cost", "Deleting the first element shifts n−1 elements; deleting the last is O(1)."),
      s("Tip", "When order doesn't matter, you can delete in O(1) by swapping the target with the last element and popping — the 'swap-remove' trick."),
    ],
  },
  "basic-operations/updating": {
    title: "Array Update",
    summary: "Overwrite a value in place using its index — O(1).",
    complexity: { time: "O(1)", space: "O(1)" },
    sections: [
      s("Idea", "The address of index k is `base + k × elementSize`, so the CPU jumps straight there. Updating is just a single write."),
      s("Why it's fast", "No shifting and no scanning — random access is the array's superpower."),
    ],
  },

  // --- Arrays · searching -------------------------------------------------
  "searching/linear-search": {
    title: "Linear Search",
    summary: "Scan left to right, comparing each element to the target.",
    complexity: { time: "O(n)", space: "O(1)" },
    leetcode: "Foundational pattern",
    sections: [
      s("Idea", "Check elements one by one until you find the target or run off the end. Works on any array — sorted or not."),
      s("Cost", "Best case O(1) (first element); worst and average O(n)."),
      s("When to use", "Small arrays, unsorted data, or when you only search once and sorting first wouldn't pay off."),
    ],
  },
  "searching/binary-search": {
    title: "Binary Search",
    summary: "Halve a sorted range each step by comparing against the midpoint.",
    complexity: { time: "O(log n)", space: "O(1)" },
    leetcode: "704. Binary Search",
    sections: [
      s("Idea", "On a sorted array, compare the target with the middle element. If it's larger, the answer must be in the right half; if smaller, the left half. Each step discards half the remaining range."),
      s("Why O(log n)", "Halving n repeatedly reaches a single element in about log₂(n) steps — 20 steps cover a million elements."),
      s("Precondition", "The array MUST be sorted. The classic bug is `mid = (lo + hi) / 2` overflowing in fixed-width integers — use `lo + (hi − lo) / 2`."),
    ],
  },

  // --- Arrays · sorting ---------------------------------------------------
  "sorting/bubble-sort": {
    title: "Bubble Sort",
    summary: "Repeatedly swap adjacent out-of-order pairs; the largest 'bubbles' to the end.",
    complexity: { time: "O(n²)", space: "O(1)" },
    sections: [
      s("Idea", "Each pass walks the array swapping neighbours that are out of order, so the largest unsorted element settles into its final place at the end."),
      s("Optimisation", "If a whole pass makes no swaps, the array is already sorted — stop early. That makes the best case O(n)."),
      s("Reality", "Mostly a teaching algorithm: it's stable and simple but quadratic, so it loses to merge/quick sort on real data."),
    ],
  },
  "sorting/selection-sort": {
    title: "Selection Sort",
    summary: "Each pass selects the minimum of the unsorted region and places it next.",
    complexity: { time: "O(n²)", space: "O(1)" },
    sections: [
      s("Idea", "Find the smallest remaining element and swap it to the front of the unsorted region. Repeat, growing a sorted prefix."),
      s("Property", "Always O(n²) comparisons regardless of input, but performs at most n−1 swaps — useful when writes are expensive."),
      s("Note", "Unlike bubble/insertion sort, it is not stable in its simple form."),
    ],
  },
  "sorting/insertion-sort": {
    title: "Insertion Sort",
    summary: "Grow a sorted prefix by inserting each next element into place.",
    complexity: { time: "O(n²)", space: "O(1)" },
    sections: [
      s("Idea", "Take each element and shift the larger sorted elements right until the key slots into its correct position — like sorting a hand of cards."),
      s("Strength", "O(n) on nearly-sorted data and stable, so it's the go-to for small or almost-sorted arrays (and the base case inside hybrid sorts like Timsort)."),
    ],
  },
  "sorting/merge-sort": {
    title: "Merge Sort",
    summary: "Divide into halves, sort each, then merge the sorted halves.",
    complexity: { time: "O(n log n)", space: "O(n)" },
    sections: [
      s("Idea", "A classic divide-and-conquer: split the array until pieces are size 1 (trivially sorted), then merge pairs back together in order."),
      s("Why O(n log n)", "There are log n levels of splitting, and each level does O(n) work to merge — guaranteed, even in the worst case."),
      s("Cost", "Needs O(n) extra space for the merge buffer, but it is stable and predictable, making it ideal for linked lists and external sorting."),
    ],
  },
  "sorting/quick-sort": {
    title: "Quick Sort",
    summary: "Partition around a pivot, then recurse on each side.",
    complexity: { time: "O(n log n) avg", space: "O(log n)" },
    sections: [
      s("Idea", "Choose a pivot and rearrange so everything smaller is on its left and everything larger on its right. The pivot is now in its final place; recurse on both sides."),
      s("Performance", "Average O(n log n) and very cache-friendly in place. A bad pivot (e.g. already-sorted input with last-element pivot) degrades to O(n²) — randomised or median-of-three pivots avoid this."),
    ],
  },

  // --- Arrays · advanced patterns ----------------------------------------
  "advanced-array/prefix-sum": {
    title: "Prefix Sum",
    summary: "Precompute running totals so any range sum is O(1).",
    complexity: { time: "O(n)", space: "O(n)" },
    sections: [
      s("Idea", "Build an array where `prefix[i]` is the sum of all elements up to i. Then the sum of any range [l, r] is `prefix[r] − prefix[l−1]` — a single subtraction."),
      s("When to use", "Many range-sum queries over a static array. The one-time O(n) build pays off across repeated O(1) lookups."),
      s("Extensions", "2-D prefix sums answer submatrix queries; difference arrays do the inverse for range updates."),
    ],
  },
  "advanced-array/sliding-window": {
    title: "Sliding Window",
    summary: "Slide a contiguous window instead of recomputing each subarray.",
    complexity: { time: "O(n)", space: "O(1)" },
    sections: [
      s("Idea", "To find aggregates over every window of size k, compute the first window once, then on each slide subtract the element leaving and add the one entering — O(1) per step."),
      s("Variants", "Fixed-size windows (this demo) and variable-size windows that grow/shrink to satisfy a constraint (e.g. longest substring without repeats)."),
      s("Win", "Turns the brute-force O(n·k) over all windows into a single O(n) pass."),
    ],
  },
  "advanced-array/two-pointer": {
    title: "Two Pointers",
    summary: "Converge two indices from the ends of a sorted array.",
    complexity: { time: "O(n)", space: "O(1)" },
    leetcode: "167. Two Sum II",
    sections: [
      s("Idea", "With a sorted array, a left and right pointer bound the search. If their sum is too small, move left right; too big, move right left. Each move discards possibilities, so the array is scanned once."),
      s("Why it works", "Sortedness guarantees that moving a pointer changes the sum monotonically, so no valid pair is ever skipped."),
      s("Family", "Pair-sum, 3-sum, container-with-most-water, and merging sorted lists all use this technique."),
    ],
  },

  // --- Arrays · matrix ----------------------------------------------------
  "matrix/traversal": {
    title: "Matrix Traversal",
    summary: "Walk a 2-D grid in row-major order.",
    complexity: { time: "O(m·n)", space: "O(1)" },
    sections: [
      s("Idea", "A 2-D array is rows of columns. Row-major traversal uses an outer loop over rows and an inner loop over columns, visiting `m × n` cells."),
      s("Memory", "In most languages a matrix is laid out row by row in memory, so row-major traversal is the cache-friendly order."),
    ],
  },
  "matrix/rotation": {
    title: "Matrix Rotation",
    summary: "Rotate a square grid 90° in place.",
    complexity: { time: "O(m·n)", space: "O(1)" },
    leetcode: "48. Rotate Image",
    sections: [
      s("Idea", "Rotating 90° clockwise can be done as: transpose the matrix (swap across the diagonal), then reverse each row. Both steps are in place."),
      s("Alternative", "You can also rotate ring by ring, cycling four cells at a time — handy when an explicit transpose isn't allowed."),
    ],
  },
  "matrix/multiplication": {
    title: "Matrix Multiplication",
    summary: "Each result cell is a row · column dot product.",
    complexity: { time: "O(n³)", space: "O(n²)" },
    sections: [
      s("Idea", "Entry C[i][j] is the dot product of row i of A with column j of B. With three nested loops this is O(n³) for square matrices."),
      s("Beyond naïve", "Strassen's algorithm and blocked/tiled multiplication reduce the constant factor or the exponent; GPUs parallelise the independent dot products."),
    ],
  },
  "matrix/sparse-matrix": {
    title: "Sparse Matrix",
    summary: "Store only the non-zero entries as (row, col, value) triplets.",
    complexity: { time: "O(m·n) build", space: "O(k)" },
    sections: [
      s("Idea", "When most cells are zero, storing the full grid wastes space. Keep only the k non-zeros as triplets (or in CSR/CSC form)."),
      s("Pay-off", "Space drops from O(m·n) to O(k), and operations skip the zeros entirely — essential for graphs, NLP, and scientific computing."),
    ],
  },

  // --- Arrays · LeetCode patterns ----------------------------------------
  "patterns/maximum-subarray": {
    title: "Maximum Subarray (Kadane)",
    summary: "Find the contiguous subarray with the largest sum in one pass.",
    complexity: { time: "O(n)", space: "O(1)" },
    leetcode: "53. Maximum Subarray",
    sections: [
      s("Idea", "Track the best sum of a subarray ending at the current index. At each step decide: extend the previous run, or restart at the current element (whichever is larger). The global best is the answer."),
      s("Key insight", "A prefix with a negative running sum can only hurt what follows, so the moment `cur` would go negative it pays to start fresh."),
      s("Follow-ups", "Track start/end indices to recover the subarray itself; a divide-and-conquer variant also solves it in O(n log n)."),
    ],
  },
  "patterns/best-time-stock": {
    title: "Best Time to Buy & Sell Stock",
    summary: "Maximise profit from one buy and one later sell.",
    complexity: { time: "O(n)", space: "O(1)" },
    leetcode: "121. Best Time to Buy and Sell Stock",
    sections: [
      s("Idea", "Sweep left to right keeping the minimum price seen so far. For each day, the best profit if you sold today is `price − minSoFar`; keep the maximum over all days."),
      s("Why one pass", "The buy day must come before the sell day, and the best buy is always the cheapest price seen up to that point — so a single scan suffices."),
      s("Pitfall", "If prices only fall, no profit is possible — return 0, not a negative number."),
    ],
  },
  "patterns/move-zeroes": {
    title: "Move Zeroes",
    summary: "Push all zeros to the end while keeping non-zeros in order.",
    complexity: { time: "O(n)", space: "O(1)" },
    leetcode: "283. Move Zeroes",
    sections: [
      s("Idea", "A write pointer `w` marks the next slot for a non-zero value. Scan with `i`; whenever you hit a non-zero, swap it into position `w` and advance `w`."),
      s("Why stable", "Non-zeros are written in the order they're encountered, so their relative order is preserved; the zeros naturally collect at the tail."),
    ],
  },
  "patterns/container-most-water": {
    title: "Container With Most Water",
    summary: "Pick two lines that hold the most water between them.",
    complexity: { time: "O(n)", space: "O(1)" },
    leetcode: "11. Container With Most Water",
    sections: [
      s("Idea", "Area = min(height of the two walls) × distance between them. Start with the widest pair and move the shorter wall inward."),
      s("Why move the shorter wall", "The area is capped by the shorter wall, so moving the taller one can only shrink the width without raising the cap — moving the shorter wall is the only chance to improve."),
    ],
  },
  "patterns/sort-colors": {
    title: "Sort Colors (Dutch National Flag)",
    summary: "Sort an array of 0s, 1s, and 2s in a single pass.",
    complexity: { time: "O(n)", space: "O(1)" },
    leetcode: "75. Sort Colors",
    sections: [
      s("Idea", "Three pointers partition the array: `low` is the boundary of 0s, `high` the boundary of 2s, and `mid` scans. Swap 0s down to `low`, 2s up to `high`, and leave 1s in the middle."),
      s("Subtlety", "After swapping a 2 to the back, don't advance `mid` — the value you just pulled forward hasn't been examined yet."),
      s("Origin", "Dijkstra's Dutch National Flag problem; the same 3-way partition powers quicksort on arrays with many duplicates."),
    ],
  },
  "patterns/remove-duplicates": {
    title: "Remove Duplicates from Sorted Array",
    summary: "Compact a sorted array to its unique prefix in place.",
    complexity: { time: "O(n)", space: "O(1)" },
    leetcode: "26. Remove Duplicates from Sorted Array",
    sections: [
      s("Idea", "Because equal values are adjacent in a sorted array, a write pointer `w` keeps the last unique value. Scan with `i`; when `a[i]` differs from `a[w]`, it's new — advance `w` and copy it."),
      s("Result", "The first `w+1` slots hold the unique values; the new logical length is `w+1`."),
    ],
  },
  "patterns/majority-element": {
    title: "Majority Element (Boyer–Moore)",
    summary: "Find the value appearing more than n/2 times in O(1) space.",
    complexity: { time: "O(n)", space: "O(1)" },
    leetcode: "169. Majority Element",
    sections: [
      s("Idea", "Hold a candidate and a count. Each matching element is a +1 vote; each differing element is −1. When the count hits zero, adopt the current element as the new candidate."),
      s("Why it works", "A true majority (> n/2) outnumbers all other values combined, so its votes can never be fully cancelled — the candidate left standing is the majority."),
      s("Caveat", "If no element holds a strict majority, the survivor is arbitrary — a second pass is needed to verify."),
    ],
  },

  // --- Linked List · core operations -------------------------------------
  "ll:traversal": {
    title: "Linked List Traversal",
    summary: "Follow `next` pointers from head to the end.",
    complexity: { time: "O(n)", space: "O(1)" },
    sections: [
      s("Idea", "Unlike an array, nodes aren't contiguous — each one stores a pointer to the next. Start at `head` and follow `next` until you reach NULL (or wrap back to head, for a circular list)."),
      s("Trade-off", "No O(1) random access: reaching index k costs k steps. In exchange, inserting/deleting a known node is O(1) pointer surgery."),
    ],
  },
  "ll:insertion/insert-begin": {
    title: "Insert at Beginning",
    summary: "Prepend a node by pointing it at the old head — O(1).",
    complexity: { time: "O(1)", space: "O(1)" },
    sections: [
      s("Idea", "Create the node, set its `next` to the current head, then move `head` to the new node. No traversal needed."),
      s("Why O(1)", "Only a couple of pointers change, regardless of list length — the linked list's signature strength."),
      s("By kind", "Doubly: also fix the old head's `prev`. Circular: the tail's `next` must keep pointing at the (new) head."),
    ],
  },
  "ll:insertion/insert-end": {
    title: "Insert at End",
    summary: "Append a node at the tail.",
    complexity: { time: "O(n)", space: "O(1)" },
    sections: [
      s("Idea", "Walk to the last node, then point its `next` at the new node. With a maintained `tail` pointer this drops to O(1)."),
      s("By kind", "Circular: the new node's `next` wraps back to the head instead of NULL. Doubly: set the new node's `prev` to the old tail."),
    ],
  },
  "ll:insertion/insert-position": {
    title: "Insert at Position",
    summary: "Splice a node in after walking to index−1.",
    complexity: { time: "O(n)", space: "O(1)" },
    sections: [
      s("Idea", "Advance a `prev` pointer to the node just before the target index, then rewire: `node.next = prev.next; prev.next = node`."),
      s("Cost", "The pointer change is O(1), but finding the spot is O(n) because lists have no random access."),
    ],
  },
  "ll:deletion/delete-begin": {
    title: "Delete at Beginning",
    summary: "Drop the head by advancing it to `head.next` — O(1).",
    complexity: { time: "O(1)", space: "O(1)" },
    sections: [
      s("Idea", "Move `head` to the second node; the old head is now unreferenced and reclaimed. No shifting, unlike an array."),
      s("By kind", "Doubly: clear the new head's `prev`. Circular: update the tail's `next` to the new head."),
    ],
  },
  "ll:deletion/delete-end": {
    title: "Delete at End",
    summary: "Remove the tail by NULLing the second-last node's `next`.",
    complexity: { time: "O(n)", space: "O(1)" },
    sections: [
      s("Idea", "Walk to the second-last node and set its `next` to NULL (or to head, for circular). That node becomes the new tail."),
      s("Note", "Even a doubly linked list needs to reach the second-last node to fix the tail, though its `prev` pointers make the walk unnecessary if you track `tail`."),
    ],
  },
  "ll:deletion/delete-position": {
    title: "Delete at Position",
    summary: "Unlink a node by routing `prev.next` over it.",
    complexity: { time: "O(n)", space: "O(1)" },
    sections: [
      s("Idea", "Reach the node before the target, then set `prev.next = target.next`, bypassing the target so it drops out of the chain."),
      s("Doubly", "Also stitch `target.next.prev` back to `prev`, so both directions skip the removed node."),
    ],
  },

  // --- Linked List · applications ----------------------------------------
  "ll:applications/josephus-problem": {
    title: "Josephus Problem",
    summary: "Eliminate every k-th node around a circle until one survives.",
    complexity: { time: "O(n·k)", space: "O(n)" },
    sections: [
      s("Idea", "Model n people as a circular linked list. Repeatedly count k−1 hops and remove the k-th node, continuing from the next, until a single survivor remains."),
      s("Math", "There's a famous O(n) recurrence: `J(1)=0; J(n) = (J(n−1)+k) mod n`. The list simulation here makes the elimination order visible."),
    ],
  },
  "ll:applications/polynomial-representation": {
    title: "Polynomial Representation",
    summary: "Store a polynomial as a list of (coefficient, exponent) terms.",
    complexity: { time: "O(t)", space: "O(t)" },
    sections: [
      s("Idea", "Each node holds one non-zero term — its coefficient and exponent — kept in descending order of exponent. Sparse polynomials (e.g. x¹⁰⁰ + 1) cost only as much as their term count."),
      s("Operations", "Adding two polynomials merges the two sorted lists; multiplying distributes term by term, then combines like exponents."),
    ],
  },

  // --- Linked List · classic problems ------------------------------------
  "ll:classic-problems/reverse-list": {
    title: "Reverse a Linked List",
    summary: "Flip every `next` pointer so the tail becomes the head.",
    complexity: { time: "O(n)", space: "O(1)" },
    leetcode: "206. Reverse Linked List",
    sections: [
      s("Idea", "Walk the list with three pointers — `prev`, `curr`, `next`. At each node, save `next`, point `curr.next` back at `prev`, then advance all three. When `curr` is NULL, `prev` is the new head."),
      s("Why save next first", "Overwriting `curr.next` before remembering it would lose the rest of the list — sequence matters."),
      s("Recursive view", "The same reversal can be written recursively, but that uses O(n) stack space versus the iterative O(1)."),
    ],
  },
  "ll:classic-problems/find-middle": {
    title: "Middle of the Linked List",
    summary: "Tortoise and hare: when the fast runner ends, the slow one is at the middle.",
    complexity: { time: "O(n)", space: "O(1)" },
    leetcode: "876. Middle of the Linked List",
    sections: [
      s("Idea", "Move `slow` one node and `fast` two nodes per step. By the time `fast` reaches the end, `slow` has covered exactly half — landing on the middle."),
      s("Why it works", "`fast` travels twice as far as `slow`, so their positions stay in a 2:1 ratio: distance n for fast means n/2 for slow."),
      s("Reused everywhere", "The same two-speed trick detects cycles (Floyd's algorithm) and finds a cycle's entry point."),
    ],
  },
  "ll:classic-problems/remove-nth-end": {
    title: "Remove Nth Node From End",
    summary: "Open a gap of n between two pointers, then unlink.",
    complexity: { time: "O(n)", space: "O(1)" },
    leetcode: "19. Remove Nth Node From End of List",
    sections: [
      s("Idea", "Advance a `fast` pointer n steps ahead, then move `fast` and `slow` together. When `fast` hits the last node, `slow` sits just before the target — unlink it in one pointer change."),
      s("One pass", "The fixed n-node gap converts 'distance from the end' into 'distance from the front' without first measuring the list's length."),
      s("Edge case", "Removing the head itself is handled cleanly with a dummy node in front of the list."),
    ],
  },
  "ll:classic-problems/palindrome-list": {
    title: "Palindrome Linked List",
    summary: "Check whether the list reads the same forwards and backwards.",
    complexity: { time: "O(n)", space: "O(1)" },
    leetcode: "234. Palindrome Linked List",
    sections: [
      s("Idea", "Find the middle (slow/fast), reverse the second half, then walk both halves inward comparing values. If every pair matches, it's a palindrome."),
      s("Space", "Comparing from both ends inward — as visualised here — captures the logic; the O(1) version does it by reversing the back half in place."),
      s("Courtesy", "Good implementations restore the reversed half before returning, leaving the list unchanged."),
    ],
  },

  // --- Stacks · array implementation --------------------------------------
  "st:array-implementation/push": {
    title: "Stack Push (array)",
    summary: "Increment top, then write the value into the freed slot.",
    complexity: { time: "O(1)", space: "O(1)" },
    sections: [
      s("Idea", "A stack is an array you agree to touch only at one end. `top` stores the index of the last value; pushing is `top++` followed by `stack[top] = value` — two O(1) steps."),
      s("Order matters", "Increment first, then write. Writing first would overwrite the current top value."),
      s("Guard", "Before anything, check `top == capacity − 1`. A push into a full stack is an overflow — the write would land outside the array."),
    ],
  },
  "st:array-implementation/pop": {
    title: "Stack Pop (array)",
    summary: "Read stack[top], then decrement top — the value is abandoned, not erased.",
    complexity: { time: "O(1)", space: "O(1)" },
    sections: [
      s("Idea", "Pop reads the value at `top` and moves `top` down one. Nothing is deleted from memory — the slot merely stops being 'inside' the stack, and the next push overwrites it."),
      s("Guard", "Check `top == −1` first: popping an empty stack is an underflow."),
      s("LIFO", "Only the most recently pushed value is reachable. If you need anything deeper, you must pop everything above it first."),
    ],
  },
  "st:array-implementation/peek": {
    title: "Stack Peek",
    summary: "Read the top value without changing the stack.",
    complexity: { time: "O(1)", space: "O(1)" },
    sections: [
      s("Idea", "`peek()` (or `top()`) returns `stack[top]` and moves nothing. It answers 'what would pop return?' without committing to it."),
      s("Why it exists", "Algorithms like balanced-parentheses and shunting-yard constantly need to *inspect* the top before deciding whether to pop — peek makes that a safe read."),
    ],
  },
  "st:array-implementation/overflow-underflow": {
    title: "Overflow & Underflow",
    summary: "The two boundary failures every fixed-size stack must guard against.",
    complexity: { time: "O(1)", space: "O(1)" },
    sections: [
      s("Overflow", "Pushing when `top == capacity − 1`. The array has no next slot, so an unchecked write corrupts whatever lives beyond it. This is literally the 'stack overflow' a runaway recursion causes."),
      s("Underflow", "Popping when `top == −1`. There is no value to return; unchecked code would read garbage."),
      s("Fixes", "Check before every push/pop, grow the array dynamically (amortised O(1)), or switch to a linked-list stack that only overflows when the heap does."),
    ],
  },

  // --- Stacks · linked-list implementation --------------------------------
  "st:linked-list-implementation/push": {
    title: "Stack Push (linked list)",
    summary: "Insert at the head: node.next = top, then top = node.",
    complexity: { time: "O(1)", space: "O(1)" },
    sections: [
      s("Idea", "Keep a single TOP pointer to the first node. Pushing allocates a node, points it at the current top, then redirects TOP — insert-at-head from the linked-list topic, wearing a stack costume."),
      s("Order matters", "Wire `node.next = top` before `top = node`, or the old chain is lost."),
      s("Trade-off", "No capacity limit and no wasted slots, at the cost of one heap allocation per push and pointer-chasing cache misses."),
    ],
  },
  "st:linked-list-implementation/pop": {
    title: "Stack Pop (linked list)",
    summary: "top = top.next, then free the old node.",
    complexity: { time: "O(1)", space: "O(1)" },
    sections: [
      s("Idea", "Save a handle to the top node, redirect TOP to `top.next`, then free the saved node. Delete-at-head, exactly."),
      s("Why save curr first", "After `top = top.next` nothing else references the old node — without the saved handle you could never free it (a leak in manual-memory languages)."),
      s("Guard", "`top == NULL` is the empty case — underflow."),
    ],
  },
  "st:linked-list-implementation/peek": {
    title: "Stack Peek (linked list)",
    summary: "Follow TOP one hop and read the data — no pointers change.",
    complexity: { time: "O(1)", space: "O(1)" },
    sections: [
      s("Idea", "`return top.data`. One pointer dereference, zero mutations."),
      s("Contrast", "The array version reads `stack[top]` by index; the list version follows an address. Same contract, different memory model."),
    ],
  },

  // --- Stacks · applications ----------------------------------------------
  "st:applications/balanced-parentheses": {
    title: "Balanced Parentheses",
    summary: "Openers wait on the stack; every closer must match the most recent opener.",
    complexity: { time: "O(n)", space: "O(n)" },
    leetcode: "20. Valid Parentheses",
    sections: [
      s("Idea", "Scan once. Push every opener. On a closer, the top of the stack must be its partner — pop it; otherwise the brackets interleave illegally (like `([)]`)."),
      s("Why a stack", "The 'most recent unclosed opener' is exactly the last thing pushed — LIFO is not a trick here, it IS the problem's structure."),
      s("End condition", "Balanced requires the stack to be empty at the end: leftover openers (`((` …) were never closed."),
    ],
  },
  "st:applications/infix-to-postfix": {
    title: "Infix → Postfix",
    summary: "Shunting-yard: operands stream out; operators wait on the stack by precedence.",
    complexity: { time: "O(n)", space: "O(n)" },
    sections: [
      s("Idea", "Operands go straight to the output. An operator first pops any waiting operators of ≥ precedence (they must apply first), then pushes itself. '(' is a wall; ')' pops until the wall."),
      s("Why postfix", "Postfix (RPN) needs no parentheses and no precedence rules to evaluate — the order of operations is baked into the token order, which is why compilers and calculators use it."),
      s("Invariant", "Operators on the stack are always in strictly increasing precedence from bottom to top (walls excepted)."),
    ],
  },
  "st:applications/postfix-evaluation": {
    title: "Postfix Evaluation",
    summary: "Numbers push; each operator pops two, computes, pushes one.",
    complexity: { time: "O(n)", space: "O(n)" },
    leetcode: "150. Evaluate Reverse Polish Notation",
    sections: [
      s("Idea", "Scan once. A number waits on the stack. An operator consumes the two most recent values — pop b, pop a (order matters for − and /), push a⊕b. At the end exactly one value remains: the answer."),
      s("Why it works", "In postfix an operator always appears immediately after its two operands are complete — and 'the two most recent complete values' is precisely what LIFO hands you."),
      s("Pairing", "This is the second half of infix→postfix: convert once, then evaluate any number of times in O(n)."),
    ],
  },
  "st:applications/recursion-stack": {
    title: "The Recursion Stack",
    summary: "Every call pushes a frame; returns pop them in reverse order.",
    complexity: { time: "O(n)", space: "O(n)" },
    sections: [
      s("Idea", "When `fact(4)` calls `fact(3)`, the machine pushes a frame holding fact(4)'s state and jumps. Frames pile up until the base case, then pop one by one as each call returns — the deepest call finishes first."),
      s("Why LIFO", "A caller can only resume after its callee finishes: last called, first finished. The call stack is the reason 'stack overflow' is the name of a recursion bug."),
      s("Consequence", "Recursion depth = stack space. Converting recursion to iteration usually means managing an explicit stack yourself — the same structure, made visible."),
    ],
  },

  // --- Queues · simple queue ------------------------------------------------
  "q:simple-queue/array-implementation/enqueue": {
    title: "Enqueue (linear array)",
    summary: "Join at the rear: rear++, then write queue[rear].",
    complexity: { time: "O(1)", space: "O(1)" },
    sections: [
      s("Idea", "A queue touches both ends: items enter at REAR and leave at FRONT — first in, first out. Enqueue is `rear++` then `queue[rear] = value`."),
      s("Guards", "`rear == capacity − 1` is overflow. On the very first enqueue, front joins in at 0."),
      s("Fairness", "Nothing overtakes: a new item waits behind everything that arrived earlier — that fairness is the whole point of a queue."),
    ],
  },
  "q:simple-queue/array-implementation/dequeue": {
    title: "Dequeue (linear array)",
    summary: "Serve the front: read queue[front], then front++ — and waste the slot.",
    complexity: { time: "O(1)", space: "O(1)" },
    sections: [
      s("Idea", "Read `queue[front]`, then move front one right. The served slot is never reused, because front never moves backwards."),
      s("The flaw", "After enough dequeues the queue reports 'full' while its left side sits empty — a linear queue slowly abandons its own memory. Shifting every element left instead would make dequeue O(n)."),
      s("The fix", "Let the indices wrap around with modulo arithmetic — the circular queue."),
    ],
  },
  "q:simple-queue/array-implementation/peek": {
    title: "Queue Peek",
    summary: "Read the front value without removing it.",
    complexity: { time: "O(1)", space: "O(1)" },
    sections: [
      s("Idea", "`peek()` returns `queue[front]` — who gets served next — without moving any index."),
      s("Symmetry", "The stack peeks at where things *enter*; the queue peeks at where things *leave*. Both are safe O(1) reads."),
    ],
  },

  // --- Queues · circular queue ----------------------------------------------
  "q:circular-queue/enqueue": {
    title: "Enqueue (circular)",
    summary: "rear = (rear + 1) % N — the index wraps, so freed slots are reused.",
    complexity: { time: "O(1)", space: "O(1)" },
    sections: [
      s("Idea", "Same array, smarter indices: `(rear + 1) % N` walks off the right edge and lands back at slot 0. The slots a linear queue would waste get recycled automatically."),
      s("Full check", "Full is `(rear + 1) % N == front` — checked *before* moving rear, so rear never lands on front."),
      s("Picture it", "Stop thinking 'row with a right edge'; think clock face. rear chases front around the dial."),
    ],
  },
  "q:circular-queue/dequeue": {
    title: "Dequeue (circular)",
    summary: "Read queue[front], then front = (front + 1) % N.",
    complexity: { time: "O(1)", space: "O(1)" },
    sections: [
      s("Idea", "Serve `queue[front]`, then advance front around the ring. The freed slot is immediately available to the next enqueue — nothing is ever wasted."),
      s("Last item", "When `front == rear` the queue holds one item; after serving it, reset both to −1 so the ring reads as empty rather than leaving the indices pointing at a ghost."),
    ],
  },
  "q:circular-queue/overflow-condition": {
    title: "The Ring Full Condition",
    summary: "(rear + 1) % N == front — rear has wrapped around and caught front.",
    complexity: { time: "O(1)", space: "O(1)" },
    sections: [
      s("The condition", "In a ring, 'full' can't be `rear == N − 1` (rear wraps past it all the time). Full is relative: REAR has chased FRONT the whole way around — the next slot rear would take is front's. That is `(rear + 1) % N == front`."),
      s("The ambiguity", "The same relative position occurs when the ring is empty — so every implementation needs a way to tell the two apart. This one marks empty with `front == −1`, which lets all N slots fill."),
      s("Alternatives", "Implementations that detect empty with `front == rear` must declare full one slot early — permanently sacrificing a slot. Others keep a `count` variable. All three are O(1); they just spend the disambiguation cost differently."),
    ],
  },

  // --- Queues · deque ---------------------------------------------------------
  "q:deque/insert-front": {
    title: "Deque · Insert Front",
    summary: "Add at the serving end — the operation a plain queue forbids.",
    complexity: { time: "O(1)", space: "O(1)" },
    sections: [
      s("Idea", "A deque (double-ended queue) opens both ends: this element cuts to the front of the line and will be served next."),
      s("How it's O(1)", "With a doubly linked list, wire the new node before the old front; with a circular buffer, `front = (front − 1 + N) % N`. Either way, no shifting."),
      s("Use case", "Sliding-window algorithms (e.g. window maximum) push and pop at both ends in one pass."),
    ],
  },
  "q:deque/insert-rear": {
    title: "Deque · Insert Rear",
    summary: "Add at the back — identical to a normal enqueue.",
    complexity: { time: "O(1)", space: "O(1)" },
    sections: [
      s("Idea", "Exactly a queue's enqueue: the element joins behind everything else."),
      s("Perspective", "Restrict a deque to insert-rear + delete-front and you have a queue; restrict it to one end only and you have a stack. The deque is the general case of both."),
    ],
  },
  "q:deque/delete-front": {
    title: "Deque · Delete Front",
    summary: "Serve the front — identical to a normal dequeue.",
    complexity: { time: "O(1)", space: "O(1)" },
    sections: [
      s("Idea", "Remove and return the front element; FRONT moves to the next one."),
      s("Guard", "An empty deque underflows — same check as every other variant."),
    ],
  },
  "q:deque/delete-rear": {
    title: "Deque · Delete Rear",
    summary: "Remove from the back — take back the most recent arrival.",
    complexity: { time: "O(1)", space: "O(1)" },
    sections: [
      s("Idea", "Remove and return the rear element; REAR steps back to the previous one. A plain queue can never do this."),
      s("Why it matters", "In the sliding-window-maximum trick, delete-rear evicts elements that can never be the maximum — the deque's signature move."),
    ],
  },

  // --- Queues · priority queue -------------------------------------------------
  "q:priority-queue/array-implementation": {
    title: "Priority Queue (unsorted array)",
    summary: "Enqueue appends in O(1); dequeue scans everything for the best priority — O(n).",
    complexity: { time: "O(n)", space: "O(n)" },
    sections: [
      s("Idea", "Items carry a priority, and dequeue serves the highest priority, not the oldest. The unsorted-array version does zero work on insert and all the work on removal: scan for the max, remove it, close the gap."),
      s("Mirror image", "A *sorted*-array version flips the costs: O(n) insert (find the spot, shift), O(1) removal. Either way, one operation pays O(n)."),
      s("Motivation", "When n is large and both operations are frequent, O(n) hurts — that pressure is exactly what the binary heap resolves."),
    ],
  },
  "q:priority-queue/heap-implementation": {
    title: "Priority Queue (binary heap)",
    summary: "A complete tree in an array: insert sifts up, extract sifts down — both O(log n).",
    complexity: { time: "O(log n)", space: "O(n)" },
    sections: [
      s("Idea", "A max-heap is a complete binary tree where every parent ≥ its children, stored in a plain array: node i's children sit at 2i+1 and 2i+2 — no pointers needed. The maximum is always the root, at index 0."),
      s("Insert", "Append at the end (keeps the tree complete), then *sift up*: swap with the parent while larger. At most one swap per level — O(log n)."),
      s("Extract", "Take the root, move the last leaf into the hole, then *sift down*: swap with the larger child while smaller. Also O(log n)."),
      s("Payoff", "Both operations logarithmic — the balance the array versions can't offer. Heaps power heapsort, Dijkstra, and every task scheduler worth the name."),
    ],
  },
};

/** Look up the theory doc for a visualizer page path (undefined for hubs). */
export function getTheory(path: string): TheoryDoc | undefined {
  return THEORY[theoryKey(path)];
}
