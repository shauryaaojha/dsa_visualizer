// ---------------------------------------------------------------------------
// Queue engine — FIFO compiler
//
// Compiles each queue operation into a QueueProgram: frames of slots + the
// FRONT/REAR pointer boxes + narration + pseudocode, in the same granular
// style as the linked-list/stack engines (one index/pointer change per frame,
// `rewired` marks "FRONT"/"REAR"/cell ids, `floating` lifts arriving/leaving
// cells out of the row).
//
// Kinds: simple (linear array — dequeued slots are WASTED, motivating the
// circular queue), circular (ring with modulo arithmetic narrated), deque
// (both ends), pqArray (append O(1) / scan-max O(n)), pqHeap (binary max-heap
// with sift-up / sift-down swaps).
// ---------------------------------------------------------------------------

import type {
  Complexity,
  QueueCell,
  QueueKind,
  QueueLayout,
  QueueOperationId,
  QueueProgram,
  QueueStep,
} from "@/types/visualization";

interface Builder {
  steps: QueueStep[];
  slots: (QueueCell | null)[];
  front: number;
  rear: number;
  kind: QueueKind;
  layout: QueueLayout;
  seq: number;
}

function makeCell(b: Builder, label: string, priority?: number): QueueCell {
  return { id: `q-${b.seq++}`, label, priority, state: "idle" };
}

function snapshot(
  b: Builder,
  description: string,
  codeLines?: number[],
  opts: { rewired?: string[]; message?: QueueStep["message"] } = {},
): void {
  b.steps.push({
    slots: b.slots.map((c) => (c ? { ...c } : null)),
    front: b.front,
    rear: b.rear,
    layout: b.layout,
    message: opts.message,
    description,
    codeLines,
    rewired: opts.rewired,
  });
}

function done(b: Builder, title: string, complexity: Complexity, pseudocode: string[]): QueueProgram {
  return { steps: b.steps, complexity, pseudocode, title, kind: b.kind };
}

function clearStates(b: Builder): void {
  b.slots.forEach((c) => {
    if (c && !c.floating) c.state = "idle";
  });
}

// --- Simple (linear) queue ---------------------------------------------------
// Fixed slots; front/rear only ever move right. Freed slots are lost — that
// drift is the whole reason the circular queue exists.

function seedSimple(b: Builder, values: number[], capacity: number): void {
  const cap = Math.max(4, Math.min(capacity, 10));
  b.slots = Array(cap).fill(null);
  const vals = values.slice(0, cap);
  vals.forEach((v, i) => (b.slots[i] = makeCell(b, String(v))));
  b.front = vals.length ? 0 : -1;
  b.rear = vals.length - 1;
}

const ENQ_PSEUDO = [
  "if rear == capacity − 1:",
  "  report OVERFLOW; stop",
  "if front == −1: front = 0",
  "rear = rear + 1",
  "queue[rear] = value",
];

function enqueue(b: Builder, value: number): QueueProgram {
  snapshot(b, `Enqueue ${value}: new items join at the REAR (back of the line). Check for space first: rear = ${b.rear}, capacity − 1 = ${b.slots.length - 1}.`, [1]);

  if (b.rear >= b.slots.length - 1) {
    b.slots.forEach((c) => c && (c.state = "target"));
    const wasted = b.front > 0 ? ` Note the ${b.front} empty slot(s) on the left — dequeued and wasted; a linear queue can never reuse them. The circular queue fixes exactly this.` : "";
    snapshot(b, `rear == capacity − 1: no slot to the right of REAR.${wasted}`, [2], {
      message: { text: "QUEUE OVERFLOW", tone: "error" },
    });
    return done(b, "Enqueue (overflow)", { time: "O(1)", space: "O(1)" }, ENQ_PSEUDO);
  }

  if (b.front === -1) {
    b.front = 0;
    snapshot(b, `The queue was empty, so FRONT joins in: front = 0. Both pointers will now track the single item.`, [3], { rewired: ["FRONT"] });
  }

  b.rear += 1;
  snapshot(b, `rear = rear + 1: the REAR box changes from ${b.rear - 1} to ${b.rear}, pointing at the free slot the value will occupy.`, [4], { rewired: ["REAR"] });

  const cell = makeCell(b, String(value));
  cell.state = "new";
  cell.floating = true;
  b.slots[b.rear] = cell;
  snapshot(b, `${value} arrives above slot ${b.rear} — items may only enter at the rear.`, [5], { rewired: [cell.id] });

  cell.floating = false;
  snapshot(b, `queue[rear] = value: ${value} settles into slot ${b.rear}.`, [5], { rewired: [cell.id] });

  cell.state = "idle";
  snapshot(b, `Enqueue complete — O(1). FRONT still points at ${b.front}; ${value} must wait its turn behind everyone else.`, [], {
    message: { text: `ENQUEUED ${value}`, tone: "ok" },
  });
  return done(b, "Enqueue (simple)", { time: "O(1)", space: "O(1)" }, ENQ_PSEUDO);
}

const DEQ_PSEUDO = [
  "if front == −1 or front > rear:",
  "  report UNDERFLOW; stop",
  "value = queue[front]",
  "front = front + 1",
];

function dequeue(b: Builder): QueueProgram {
  snapshot(b, `Dequeue: items leave from the FRONT — first in, first out. Check the queue isn't empty: front = ${b.front}, rear = ${b.rear}.`, [1]);

  if (b.front === -1 || b.front > b.rear) {
    snapshot(b, "The queue is empty — nothing to dequeue. UNDERFLOW.", [2], {
      message: { text: "QUEUE UNDERFLOW", tone: "error" },
    });
    return done(b, "Dequeue (underflow)", { time: "O(1)", space: "O(1)" }, DEQ_PSEUDO);
  }

  const cell = b.slots[b.front]!;
  cell.state = "active";
  snapshot(b, `value = queue[front]: read ${cell.label} from slot ${b.front} — it has waited the longest.`, [3]);

  cell.state = "removing";
  cell.floating = true;
  snapshot(b, `${cell.label} leaves the queue from the front.`, [3], { rewired: [cell.id] });

  b.slots[b.front] = null;
  b.front += 1;
  const emptied = b.front > b.rear;
  snapshot(b, emptied
    ? `front = front + 1: FRONT (${b.front}) has passed REAR (${b.rear}) — the queue is now empty.`
    : `front = front + 1: the FRONT box changes from ${b.front - 1} to ${b.front}. Slot ${b.front - 1} is now WASTED — front never moves back, so a linear queue slowly abandons its own memory. This drift is what the circular queue solves.`, [4], { rewired: ["FRONT"] });

  snapshot(b, `Dequeue complete — returned ${cell.label}. O(1).`, [], {
    message: { text: `DEQUEUED ${cell.label}`, tone: "ok" },
  });
  return done(b, "Dequeue (simple)", { time: "O(1)", space: "O(1)" }, DEQ_PSEUDO);
}

const QPEEK_PSEUDO = ["if front == −1 or front > rear:", "  report EMPTY; stop", "return queue[front]   // front does not move"];

function qPeek(b: Builder): QueueProgram {
  snapshot(b, `Peek: read the front without removing it. front = ${b.front}.`, [1]);
  if (b.front === -1 || b.front > b.rear) {
    snapshot(b, "The queue is empty — there is no front to read.", [2], { message: { text: "QUEUE EMPTY", tone: "error" } });
    return done(b, "Peek (empty)", { time: "O(1)", space: "O(1)" }, QPEEK_PSEUDO);
  }
  const cell = b.slots[b.front]!;
  cell.state = "found";
  snapshot(b, `return queue[front]: the next item to be served is ${cell.label}. FRONT stays at ${b.front} — nothing moved.`, [3], {
    message: { text: `FRONT = ${cell.label}`, tone: "ok" },
  });
  return done(b, "Peek (simple)", { time: "O(1)", space: "O(1)" }, QPEEK_PSEUDO);
}

// --- Circular queue ------------------------------------------------------------

function seedCircular(b: Builder, values: number[], capacity: number): void {
  const cap = Math.max(4, Math.min(capacity, 10));
  b.slots = Array(cap).fill(null);
  const vals = values.slice(0, cap - 1);
  // Start the content a couple of slots in (as if some dequeues already
  // happened) so enqueues visibly WRAP around the ring.
  const start = vals.length ? Math.min(2, cap - vals.length) : 0;
  vals.forEach((v, i) => (b.slots[(start + i) % cap] = makeCell(b, String(v))));
  b.front = vals.length ? start : -1;
  b.rear = vals.length ? (start + vals.length - 1) % cap : -1;
}

const CENQ_PSEUDO = [
  "if (rear + 1) % N == front:",
  "  report OVERFLOW; stop",
  "if front == −1: front = 0",
  "rear = (rear + 1) % N",
  "queue[rear] = value",
];

function cEnqueue(b: Builder, value: number): QueueProgram {
  const N = b.slots.length;
  const nxt = (b.rear + 1) % N;
  snapshot(b, `Enqueue ${value} into the ring (N = ${N}). Full-check first: (rear + 1) % N = (${b.rear} + 1) % ${N} = ${nxt}; front = ${b.front}.`, [1]);

  if (nxt === b.front) {
    b.slots.forEach((c) => c && (c.state = "target"));
    snapshot(b, `(rear + 1) % N == front — REAR has chased FRONT all the way around the ring and caught it: every slot is occupied. The ring is full.`, [2], {
      message: { text: "QUEUE OVERFLOW", tone: "error" },
    });
    return done(b, "Enqueue (ring full)", { time: "O(1)", space: "O(1)" }, CENQ_PSEUDO);
  }

  if (b.front === -1) {
    b.front = 0;
    snapshot(b, "The ring was empty — front = 0.", [3], { rewired: ["FRONT"] });
  }

  const wrapped = nxt < b.rear;
  b.rear = nxt;
  snapshot(b, wrapped
    ? `rear = (rear + 1) % N = ${nxt} — REAR WRAPS AROUND to the start of the array. This modulo step is the whole trick: the freed slots on the "left" get reused.`
    : `rear = (rear + 1) % N = ${nxt}: the REAR box moves on around the ring.`, [4], { rewired: ["REAR"] });

  const cell = makeCell(b, String(value));
  cell.state = "new";
  cell.floating = true;
  b.slots[b.rear] = cell;
  snapshot(b, `${value} arrives at slot ${b.rear}.`, [5], { rewired: [cell.id] });
  cell.floating = false;
  snapshot(b, `queue[rear] = value: ${value} settles into slot ${b.rear}.`, [5], { rewired: [cell.id] });

  cell.state = "idle";
  snapshot(b, `Enqueue complete — O(1), and no slot is ever wasted.`, [], { message: { text: `ENQUEUED ${value}`, tone: "ok" } });
  return done(b, "Enqueue (circular)", { time: "O(1)", space: "O(1)" }, CENQ_PSEUDO);
}

const CDEQ_PSEUDO = [
  "if front == −1:",
  "  report UNDERFLOW; stop",
  "value = queue[front]",
  "if front == rear: front = rear = −1",
  "else front = (front + 1) % N",
];

function cDequeue(b: Builder): QueueProgram {
  const N = b.slots.length;
  snapshot(b, `Dequeue from the ring. Check: front = ${b.front}.`, [1]);
  if (b.front === -1) {
    snapshot(b, "front == −1: the ring is empty. UNDERFLOW.", [2], { message: { text: "QUEUE UNDERFLOW", tone: "error" } });
    return done(b, "Dequeue (empty)", { time: "O(1)", space: "O(1)" }, CDEQ_PSEUDO);
  }

  const cell = b.slots[b.front]!;
  cell.state = "active";
  snapshot(b, `value = queue[front]: read ${cell.label} from slot ${b.front}.`, [3]);

  cell.state = "removing";
  cell.floating = true;
  snapshot(b, `${cell.label} leaves the ring.`, [3], { rewired: [cell.id] });
  b.slots[b.front] = null;

  if (b.front === b.rear) {
    b.front = -1;
    b.rear = -1;
    snapshot(b, "That was the last item (front == rear) — reset front = rear = −1 so the ring reads as empty.", [4], { rewired: ["FRONT", "REAR"] });
  } else {
    const nxt = (b.front + 1) % N;
    const wrapped = nxt < b.front;
    b.front = nxt;
    snapshot(b, wrapped
      ? `front = (front + 1) % N = ${nxt} — FRONT WRAPS AROUND to the start. The freed slot is immediately reusable by the next enqueue.`
      : `front = (front + 1) % N = ${nxt}: FRONT moves on; the freed slot behind it can be reused — nothing is wasted.`, [5], { rewired: ["FRONT"] });
  }

  snapshot(b, `Dequeue complete — returned ${cell.label}. O(1).`, [], { message: { text: `DEQUEUED ${cell.label}`, tone: "ok" } });
  return done(b, "Dequeue (circular)", { time: "O(1)", space: "O(1)" }, CDEQ_PSEUDO);
}

function cOverflow(b: Builder, value: number): QueueProgram {
  const N = b.slots.length;
  snapshot(b, `When is a ring of N = ${N} slots "full"? Watch the check (rear + 1) % N == front as we enqueue.`, [1]);

  let v = value;
  for (;;) {
    const nxt = (b.rear + 1) % N;
    if (nxt === b.front) break;
    if (b.front === -1) b.front = 0;
    const wrapped = nxt < b.rear;
    b.rear = nxt;
    const cell = makeCell(b, String(v));
    cell.state = "new";
    b.slots[b.rear] = cell;
    snapshot(b, `enqueue(${v}): (${b.rear === 0 ? N - 1 : b.rear - 1} + 1) % ${N} = ${b.rear} ≠ front (${b.front}) — not full, ${v} goes in${wrapped ? ", wrapping around the ring" : ""}.`, [1, 4, 5], { rewired: ["REAR", cell.id] });
    cell.state = "idle";
    v += 10;
  }

  b.slots.forEach((c) => c && (c.state = "target"));
  snapshot(b, `enqueue(${v}): (rear + 1) % N = (${b.rear} + 1) % ${N} = ${(b.rear + 1) % N} == front — REAR has wrapped the whole way around and caught FRONT. Every slot is occupied: FULL.`, [1, 2], {
    message: { text: "QUEUE OVERFLOW", tone: "error" },
  });
  clearStates(b);
  snapshot(b, `Note the convention: we mark an empty ring with front == −1, so a completely full ring is unambiguous. Implementations that instead detect "empty" with front == rear must declare FULL one slot early — sacrificing a slot — because otherwise full and empty would look identical.`, [2]);
  return done(b, "Ring Overflow Condition", { time: "O(1)", space: "O(1)" }, CENQ_PSEUDO);
}

// --- Deque ----------------------------------------------------------------------
// Dense row: front is always the leftmost cell, rear the rightmost. Real
// implementations use a circular buffer or a doubly linked list for O(1) ends.

function seedDeque(b: Builder, values: number[]): void {
  b.slots = values.slice(0, 10).map((v) => makeCell(b, String(v)));
  b.front = b.slots.length ? 0 : -1;
  b.rear = b.slots.length - 1;
}

const DQ_PSEUDO_INS_F = ["node = new Node(value)", "link it before the current front", "front = node"];
const DQ_PSEUDO_INS_R = ["node = new Node(value)", "link it after the current rear", "rear = node"];
const DQ_PSEUDO_DEL_F = ["if empty: report UNDERFLOW", "value = front.data", "front = the next node"];
const DQ_PSEUDO_DEL_R = ["if empty: report UNDERFLOW", "value = rear.data", "rear = the previous node"];

function dqInsertFront(b: Builder, value: number): QueueProgram {
  snapshot(b, `Insert ${value} at the FRONT — the operation a plain queue forbids. A deque opens both ends.`, [1]);
  const cell = makeCell(b, String(value));
  cell.state = "new";
  cell.floating = true;
  b.slots.unshift(cell);
  b.front = 0;
  b.rear = b.slots.length - 1;
  snapshot(b, `The new element arrives at the front end.`, [1, 2], { rewired: [cell.id] });
  cell.floating = false;
  snapshot(b, `front = node: FRONT now points at ${value}; everyone else is behind it. (With a doubly linked list or circular buffer this is O(1) — no shifting.)`, [3], { rewired: ["FRONT", cell.id] });
  cell.state = "idle";
  snapshot(b, `Insert-front complete.`, [], { message: { text: `INSERTED ${value} AT FRONT`, tone: "ok" } });
  return done(b, "Insert Front (deque)", { time: "O(1)", space: "O(1)" }, DQ_PSEUDO_INS_F);
}

function dqInsertRear(b: Builder, value: number): QueueProgram {
  snapshot(b, `Insert ${value} at the REAR — same as a normal enqueue.`, [1]);
  const cell = makeCell(b, String(value));
  cell.state = "new";
  cell.floating = true;
  b.slots.push(cell);
  b.front = 0;
  b.rear = b.slots.length - 1;
  snapshot(b, `The new element arrives at the rear end.`, [1, 2], { rewired: [cell.id] });
  cell.floating = false;
  snapshot(b, `rear = node: REAR moves to ${value}.`, [3], { rewired: ["REAR", cell.id] });
  cell.state = "idle";
  snapshot(b, `Insert-rear complete — O(1).`, [], { message: { text: `INSERTED ${value} AT REAR`, tone: "ok" } });
  return done(b, "Insert Rear (deque)", { time: "O(1)", space: "O(1)" }, DQ_PSEUDO_INS_R);
}

function dqDeleteFront(b: Builder): QueueProgram {
  snapshot(b, "Delete from the FRONT — same as a normal dequeue.", [1]);
  if (!b.slots.length) {
    snapshot(b, "The deque is empty. UNDERFLOW.", [1], { message: { text: "DEQUE UNDERFLOW", tone: "error" } });
    return done(b, "Delete Front (empty)", { time: "O(1)", space: "O(1)" }, DQ_PSEUDO_DEL_F);
  }
  const cell = b.slots[0]!;
  cell.state = "removing";
  snapshot(b, `value = front.data: ${cell.label} is leaving from the front.`, [2]);
  cell.floating = true;
  snapshot(b, `${cell.label} lifts out of the deque.`, [2], { rewired: [cell.id] });
  b.slots.shift();
  b.front = b.slots.length ? 0 : -1;
  b.rear = b.slots.length - 1;
  snapshot(b, b.slots.length ? `front = next: FRONT now points at ${b.slots[0]!.label}.` : "The deque is now empty.", [3], { rewired: ["FRONT"] });
  snapshot(b, `Delete-front complete — returned ${cell.label}.`, [], { message: { text: `DELETED ${cell.label} FROM FRONT`, tone: "ok" } });
  return done(b, "Delete Front (deque)", { time: "O(1)", space: "O(1)" }, DQ_PSEUDO_DEL_F);
}

function dqDeleteRear(b: Builder): QueueProgram {
  snapshot(b, "Delete from the REAR — the other operation a plain queue forbids.", [1]);
  if (!b.slots.length) {
    snapshot(b, "The deque is empty. UNDERFLOW.", [1], { message: { text: "DEQUE UNDERFLOW", tone: "error" } });
    return done(b, "Delete Rear (empty)", { time: "O(1)", space: "O(1)" }, DQ_PSEUDO_DEL_R);
  }
  const cell = b.slots[b.slots.length - 1]!;
  cell.state = "removing";
  snapshot(b, `value = rear.data: ${cell.label} is leaving from the rear.`, [2]);
  cell.floating = true;
  snapshot(b, `${cell.label} lifts out of the deque.`, [2], { rewired: [cell.id] });
  b.slots.pop();
  b.front = b.slots.length ? 0 : -1;
  b.rear = b.slots.length - 1;
  snapshot(b, b.slots.length ? `rear = previous: REAR now points at ${b.slots[b.rear]!.label}.` : "The deque is now empty.", [3], { rewired: ["REAR"] });
  snapshot(b, `Delete-rear complete — returned ${cell.label}.`, [], { message: { text: `DELETED ${cell.label} FROM REAR`, tone: "ok" } });
  return done(b, "Delete Rear (deque)", { time: "O(1)", space: "O(1)" }, DQ_PSEUDO_DEL_R);
}

// --- Priority queue: unsorted array ----------------------------------------------

const PQA_PSEUDO = [
  "enqueue(v, p): append — O(1)",
  "dequeue():",
  "  scan every item for the highest priority",
  "  remove it and shift the rest — O(n)",
];

function pqArrayDemo(b: Builder, value: number, priority: number): QueueProgram {
  snapshot(b, "Priority queue on an unsorted array: items carry a priority badge; serving order ignores arrival order.", []);

  // Enqueue.
  const cell = makeCell(b, String(value || 45), priority || 4);
  cell.state = "new";
  cell.floating = true;
  b.slots.push(cell);
  b.front = 0;
  b.rear = b.slots.length - 1;
  snapshot(b, `enqueue(${cell.label}, p=${cell.priority}): just append at the end — no ordering work at all.`, [1], { rewired: [cell.id, "REAR"] });
  cell.floating = false;
  snapshot(b, `Appended in O(1). The array is unsorted — the cost is deferred to dequeue.`, [1], { rewired: [cell.id] });
  cell.state = "idle";

  // Dequeue = scan for max priority.
  snapshot(b, "dequeue(): the highest priority must be served first — but where is it? Scan everything.", [2, 3]);
  let bestIdx = 0;
  for (let i = 0; i < b.slots.length; i++) {
    const c = b.slots[i]!;
    c.state = "active";
    const best = b.slots[bestIdx]!;
    if ((c.priority ?? 0) > (best.priority ?? 0)) bestIdx = i;
    const nowBest = b.slots[bestIdx]!;
    snapshot(b, `Compare: ${c.label} has p=${c.priority}. Best so far: ${nowBest.label} (p=${nowBest.priority}).`, [3]);
    c.state = i === bestIdx ? "target" : "visited";
  }
  clearStates(b);
  const winner = b.slots[bestIdx]!;
  winner.state = "found";
  snapshot(b, `The scan found ${winner.label} (p=${winner.priority}) — the highest priority in the queue.`, [3]);

  winner.state = "removing";
  winner.floating = true;
  snapshot(b, `Remove ${winner.label}…`, [4], { rewired: [winner.id] });
  b.slots.splice(bestIdx, 1);
  b.front = b.slots.length ? 0 : -1;
  b.rear = b.slots.length - 1;
  snapshot(b, `…and shift the items after it left to close the gap. Total dequeue cost: O(n) scan + O(n) shift.`, [4], { rewired: ["REAR"] });
  snapshot(b, "Trade-off: O(1) enqueue / O(n) dequeue. A binary heap balances both to O(log n) — see the heap implementation.", [], {
    message: { text: `SERVED ${winner.label} (p=${winner.priority})`, tone: "ok" },
  });
  return done(b, "Priority Queue (array)", { time: "O(n)", space: "O(n)" }, PQA_PSEUDO);
}

// --- Priority queue: binary max-heap ----------------------------------------------

const PQH_PSEUDO = [
  "insert(v): append at the end",
  "  sift-up: swap with parent while v > parent",
  "extract(): the root is the max — take it",
  "  move the last leaf to the root",
  "  sift-down: swap with the larger child while smaller",
];

function pqHeapDemo(b: Builder, value: number): QueueProgram {
  const cells = () => b.slots as QueueCell[];
  const sync = () => {
    b.front = 0;
    b.rear = b.slots.length - 1;
  };
  const swap = (i: number, j: number) => {
    const t = b.slots[i];
    b.slots[i] = b.slots[j];
    b.slots[j] = t;
  };

  sync();
  snapshot(b, "A binary max-heap stored in a plain array: node i's children live at 2i+1 and 2i+2. The only rule — every parent ≥ its children — keeps the maximum at the root.", []);

  // Insert with sift-up.
  const v = value || 85;
  const cell = makeCell(b, String(v), v);
  cell.state = "new";
  b.slots.push(cell);
  sync();
  let i = b.slots.length - 1;
  snapshot(b, `insert(${v}): append at index ${i} — the next free leaf keeps the tree complete.`, [1], { rewired: [cell.id] });

  while (i > 0) {
    const p = (i - 1) >> 1;
    const parent = cells()[p];
    parent.state = "target";
    snapshot(b, `sift-up: compare ${v} with its parent ${parent.label} at index ${p} ( (${i}−1)/2 ).`, [2]);
    if (v > Number(parent.label)) {
      swap(i, p);
      snapshot(b, `${v} > ${parent.label} — the heap rule is violated, so SWAP them. ${v} climbs a level.`, [2], { rewired: [cell.id, parent.id] });
      parent.state = "idle";
      i = p;
    } else {
      parent.state = "idle";
      snapshot(b, `${v} ≤ ${parent.label} — the heap rule holds; ${v} stays at index ${i}.`, [2]);
      break;
    }
  }
  cell.state = "idle";
  snapshot(b, `Insert done in ${Math.ceil(Math.log2(b.slots.length + 1))} level(s) at most — O(log n), not O(n).`, [2], {
    message: { text: `INSERTED ${v}`, tone: "ok" },
  });

  // Extract max with sift-down.
  const root = cells()[0];
  root.state = "found";
  snapshot(b, `extract(): the maximum is always the root — ${root.label}. Take it out.`, [3]);
  root.state = "removing";
  root.floating = true;
  snapshot(b, `${root.label} leaves the heap.`, [3], { rewired: [root.id] });

  const last = b.slots.pop() as QueueCell;
  if (b.slots.length) {
    b.slots[0] = last;
    last.state = "active";
    sync();
    snapshot(b, `The hole at the root is filled by the LAST leaf (${last.label}) — that keeps the tree complete, but probably breaks the heap rule.`, [4], { rewired: [last.id] });

    let j = 0;
    for (;;) {
      const l = 2 * j + 1;
      const r = 2 * j + 2;
      if (l >= b.slots.length) break;
      let big = l;
      if (r < b.slots.length && Number(cells()[r].label) > Number(cells()[l].label)) big = r;
      const child = cells()[big];
      child.state = "target";
      snapshot(b, `sift-down: the larger child of index ${j} is ${child.label} (index ${big}).`, [5]);
      if (Number(child.label) > Number(cells()[j].label)) {
        swap(j, big);
        snapshot(b, `${child.label} > ${last.label} — SWAP; ${last.label} sinks a level.`, [5], { rewired: [last.id, child.id] });
        child.state = "idle";
        j = big;
      } else {
        child.state = "idle";
        snapshot(b, `${last.label} ≥ both children — the heap rule is restored.`, [5]);
        break;
      }
    }
    last.state = "idle";
  } else {
    sync();
  }
  snapshot(b, `Extract done — O(log n). Both operations are logarithmic; that balance is why real priority queues are heaps.`, [], {
    message: { text: `EXTRACTED MAX ${root.label}`, tone: "ok" },
  });
  return done(b, "Priority Queue (heap)", { time: "O(log n)", space: "O(n)" }, PQH_PSEUDO);
}

// --- Dispatch ----------------------------------------------------------------------

export interface QueueRunParams {
  value?: number;
  priority?: number;
  capacity?: number;
}

const LAYOUTS: Record<QueueKind, QueueLayout> = {
  simple: "row",
  circular: "ring",
  deque: "row",
  pqArray: "row",
  pqHeap: "heap",
};

export function runQueueOperation(
  op: QueueOperationId,
  kind: QueueKind,
  values: number[],
  params: QueueRunParams = {},
): QueueProgram {
  const b: Builder = {
    steps: [],
    slots: [],
    front: -1,
    rear: -1,
    kind,
    layout: LAYOUTS[kind],
    seq: 0,
  };
  const value = params.value ?? 0;
  const capacity = params.capacity ?? 6;

  switch (op) {
    case "enqueue":
      seedSimple(b, values, capacity);
      return enqueue(b, value || 99);
    case "dequeue":
      seedSimple(b, values, capacity);
      return dequeue(b);
    case "qPeek":
      seedSimple(b, values, capacity);
      return qPeek(b);
    case "cEnqueue":
      seedCircular(b, values, capacity);
      return cEnqueue(b, value || 99);
    case "cDequeue":
      seedCircular(b, values, capacity);
      return cDequeue(b);
    case "cOverflow":
      seedCircular(b, values.slice(0, 2), capacity);
      return cOverflow(b, value || 50);
    case "dqInsertFront":
      seedDeque(b, values);
      return dqInsertFront(b, value || 99);
    case "dqInsertRear":
      seedDeque(b, values);
      return dqInsertRear(b, value || 99);
    case "dqDeleteFront":
      seedDeque(b, values);
      return dqDeleteFront(b);
    case "dqDeleteRear":
      seedDeque(b, values);
      return dqDeleteRear(b);
    case "pqArrayDemo": {
      // values = pairs? Keep it simple: fixed seed with varied priorities.
      const seed: [number, number][] = values.length >= 3
        ? values.slice(0, 5).map((v, i) => [v, ((v + i * 3) % 9) + 1] as [number, number])
        : [[30, 2], [80, 5], [10, 1], [60, 3]];
      b.slots = seed.map(([v, p]) => makeCell(b, String(v), p));
      b.front = 0;
      b.rear = b.slots.length - 1;
      return pqArrayDemo(b, value || 45, params.priority ?? 4);
    }
    case "pqHeapDemo": {
      // Seed a valid max-heap regardless of input.
      const seedVals = (values.length >= 3 ? values.slice(0, 7) : [90, 70, 80, 30, 60]).sort((a, z) => z - a);
      // Sorted-descending arrays are valid max-heaps.
      b.slots = seedVals.map((v) => makeCell(b, String(v), v));
      b.front = 0;
      b.rear = b.slots.length - 1;
      return pqHeapDemo(b, value || 85);
    }
    default:
      seedSimple(b, values, capacity);
      return qPeek(b);
  }
}

export interface QueueOperationMeta {
  id: QueueOperationId;
  label: string;
  icon: string;
  params: ("value" | "priority")[];
  hint: string;
}

/** Registry used by the sidebar quick-tabs / param inputs. */
export const QUEUE_OPERATIONS: QueueOperationMeta[] = [
  { id: "enqueue", label: "Enqueue", icon: "login", params: ["value"], hint: "Join at the rear: rear++, then write." },
  { id: "dequeue", label: "Dequeue", icon: "logout", params: [], hint: "Serve the front: read, then front++." },
  { id: "qPeek", label: "Peek", icon: "visibility", params: [], hint: "Read the front without removing it." },
  { id: "cEnqueue", label: "Enqueue", icon: "login", params: ["value"], hint: "rear = (rear+1) % N — the ring reuses slots." },
  { id: "cDequeue", label: "Dequeue", icon: "logout", params: [], hint: "front = (front+1) % N; freed slots recycle." },
  { id: "cOverflow", label: "Full Condition", icon: "warning", params: ["value"], hint: "(rear+1) % N == front — why one slot stays empty." },
  { id: "dqInsertFront", label: "Insert Front", icon: "first_page", params: ["value"], hint: "The op a plain queue forbids — O(1)." },
  { id: "dqInsertRear", label: "Insert Rear", icon: "last_page", params: ["value"], hint: "Same as a normal enqueue." },
  { id: "dqDeleteFront", label: "Delete Front", icon: "backspace", params: [], hint: "Same as a normal dequeue." },
  { id: "dqDeleteRear", label: "Delete Rear", icon: "cancel", params: [], hint: "Remove from the back — deque only." },
  { id: "pqArrayDemo", label: "Array PQ", icon: "low_priority", params: ["value", "priority"], hint: "Append O(1); dequeue scans for max — O(n)." },
  { id: "pqHeapDemo", label: "Heap PQ", icon: "park", params: ["value"], hint: "Insert sifts up; extract sifts down — O(log n)." },
];
