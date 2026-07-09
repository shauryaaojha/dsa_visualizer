// ---------------------------------------------------------------------------
// Linked list engine — pointer-rewiring compiler
//
// Compiles each linked-list operation into an LLProgram: a flat list of frames,
// every frame a snapshot of the nodes (in head→tail visual order) + their next/
// prev wiring + floating cursors (head/tail/curr/prev) + narration + pseudocode.
// The canvas just draws the current frame; framer-motion animates by node id.
//
// `kind` (singly | doubly | circular) tweaks wiring: doubly keeps prev pointers,
// circular wraps tail.next back to head (drawn as a curved back-edge).
// ---------------------------------------------------------------------------

import type {
  Complexity,
  LLKind,
  LLNode,
  LLOperationId,
  LLPointer,
  LLProgram,
  LLStep,
} from "@/types/visualization";

// Pointer colors (match the shader accent palette). head lives in the HEAD
// box drawn by the canvas (mint), not as a floating cursor.
const C_TAIL = "#F5A623"; // amber
const C_CURR = "#FF5F4A"; // coral
const C_PREV = "#8ab4ff"; // soft blue

interface Builder {
  steps: LLStep[];
  nodes: LLNode[]; // visual order, head → tail
  headId: string | null;
  tailId: string | null;
  kind: LLKind;
  seq: number; // id counter
}

// Pick a varied-but-stable two-letter "address" per node (I/O omitted to avoid 1/0 confusion).
const ADDR_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
function addrFor(seq: number): string {
  const a = ADDR_LETTERS[(seq * 7 + 4) % ADDR_LETTERS.length];
  const b = ADDR_LETTERS[(seq * 5 + 9) % ADDR_LETTERS.length];
  return a + b;
}

function makeNode(b: Builder, value: number, label?: string): LLNode {
  const s = b.seq++;
  return { id: `ll-${s}`, addr: addrFor(s), value, next: null, prev: null, state: "idle", label };
}

function indexOfId(b: Builder, id: string | null): number {
  if (!id) return -1;
  return b.nodes.findIndex((n) => n.id === id);
}

/** Re-derive next/prev from the current visual order (circular wraps to head). */
function rewire(b: Builder): void {
  const n = b.nodes.length;
  b.headId = n ? b.nodes[0].id : null;
  b.tailId = n ? b.nodes[n - 1].id : null;
  b.nodes.forEach((node, i) => {
    node.next = i < n - 1 ? b.nodes[i + 1].id : b.kind === "circular" && n ? b.nodes[0].id : null;
    node.prev = b.kind === "doubly" ? (i > 0 ? b.nodes[i - 1].id : null) : undefined;
  });
}

function buildBase(b: Builder, values: number[], labels?: string[]): void {
  b.nodes = values.map((v, i) => makeNode(b, v, labels?.[i]));
  rewire(b);
}

/** Assemble the floating cursors for a frame. (head lives in the HEAD box drawn by the canvas, not as a cursor.) */
function ptrs(
  b: Builder,
  opts: { curr?: string | null; prev?: string | null } = {},
): LLPointer[] {
  const list: LLPointer[] = [];
  if (b.tailId) list.push({ label: "tail", nodeId: b.tailId, color: C_TAIL });
  if (opts.prev !== undefined && opts.prev) list.push({ label: "prev", nodeId: opts.prev, color: C_PREV });
  if (opts.curr !== undefined && opts.curr) list.push({ label: "curr", nodeId: opts.curr, color: C_CURR });
  return list;
}

function setState(b: Builder, id: string | null, state: LLNode["state"]): void {
  if (!id) return;
  const node = b.nodes.find((n) => n.id === id);
  if (node) node.state = state;
}

function clearStates(b: Builder): void {
  b.nodes.forEach((n) => (n.state = "idle"));
}

function snapshot(
  b: Builder,
  pointers: LLPointer[],
  description: string,
  codeLines?: number[],
  rewired?: string[],
): void {
  b.steps.push({
    nodes: b.nodes.map((n) => ({ ...n })), // immutable clone per frame
    headId: b.headId,
    tailId: b.tailId,
    pointers,
    description,
    codeLines,
    rewired,
  });
}

function nodeById(b: Builder, id: string | null | undefined): LLNode | undefined {
  return id ? b.nodes.find((n) => n.id === id) : undefined;
}

function done(
  b: Builder,
  title: string,
  complexity: Complexity,
  pseudocode: string[],
): LLProgram {
  return { steps: b.steps, complexity, pseudocode, title, kind: b.kind };
}

// --- Traversal -------------------------------------------------------------

function traverse(b: Builder): LLProgram {
  snapshot(b, ptrs(b, { curr: b.headId }), "Start at head; walk next pointers to the end.", [1]);
  let curr = b.headId;
  let guard = 0;
  while (curr && guard < b.nodes.length) {
    setState(b, curr, "active");
    const node = b.nodes.find((n) => n.id === curr)!;
    snapshot(b, ptrs(b, { curr }), `Visit node ${node.value}.`, [2, 3]);
    setState(b, curr, "visited");
    curr = node.next;
    guard++;
  }
  const tailNode = b.nodes[b.nodes.length - 1];
  const endMsg =
    b.kind === "circular"
      ? `Reached the tail; its next wraps back to head — stop after ${b.nodes.length} nodes.`
      : "Reached NULL — traversal complete.";
  snapshot(b, ptrs(b, { curr: b.kind === "circular" ? tailNode?.id ?? null : null }), endMsg, [4]);

  return done(b, `Traverse (${b.kind})`, { time: "O(n)", space: "O(1)" }, [
    "curr = head",
    "while curr != NULL:",
    "  visit(curr)",
    "  curr = curr.next",
  ]);
}

// --- Search ----------------------------------------------------------------

function search(b: Builder, target: number): LLProgram {
  snapshot(b, ptrs(b, { curr: b.headId }), `Search for ${target} from head.`, [1]);
  let curr = b.headId;
  let guard = 0;
  let foundId: string | null = null;
  while (curr && guard < b.nodes.length) {
    const node = b.nodes.find((n) => n.id === curr)!;
    setState(b, curr, "target");
    snapshot(b, ptrs(b, { curr }), `Compare ${node.value} with ${target}.`, [2, 3]);
    if (node.value === target) {
      setState(b, curr, "found");
      snapshot(b, ptrs(b, { curr }), `✓ Found ${target}.`, [4]);
      foundId = curr;
      break;
    }
    setState(b, curr, "visited");
    curr = node.next;
    guard++;
  }
  if (!foundId) snapshot(b, ptrs(b), `${target} is not in the list.`, [5]);

  return done(b, `Search ${target} (${b.kind})`, { time: "O(n)", space: "O(1)" }, [
    "curr = head",
    "while curr != NULL:",
    "  if curr.value == key:",
    "    return curr        ✓",
    "  curr = curr.next     // not found",
  ]);
}

// --- Insertion -------------------------------------------------------------
// Insert/delete are compiled into many small frames so the user can watch each
// pointer change happen: allocate (node floats above the row, unlinked) → wire
// node.next → rewire the neighbour / HEAD box → node drops into the row.
// Between the "allocate" and "drop in" frames we deliberately do NOT rewire();
// each frame hand-edits exactly the pointer named by the highlighted pseudocode
// line, so the arrows on the canvas break and re-form one at a time.

function insertBegin(b: Builder, value: number): LLProgram {
  const pseudo =
    b.kind === "doubly"
      ? ["node = new Node(value)", "node.next = head", "head.prev = node", "head = node"]
      : b.kind === "circular"
        ? ["node = new Node(value)", "node.next = head", "tail.next = node", "head = node"]
        : ["node = new Node(value)", "node.next = head", "head = node"];
  const finish = () => done(b, `Insert at Begin (${b.kind})`, { time: "O(1)", space: "O(1)" }, pseudo);
  const headLine = pseudo.length; // "head = node" is always the last line

  const oldHead = b.nodes[0] ?? null;
  snapshot(
    b,
    ptrs(b),
    oldHead
      ? `Insert ${value} at the beginning. The head box currently stores @${oldHead.addr} — the address of node ${oldHead.value}.`
      : `Insert ${value} into an empty list. The head box stores NULL.`,
    [],
  );

  // 1 — allocate: the node floats above the row, linked to nothing.
  const node = makeNode(b, value, undefined);
  node.state = "new";
  node.floating = true;
  node.next = null;
  if (b.kind === "doubly") node.prev = null;
  b.nodes.unshift(node); // takes visual slot 0, but no pointer touches it yet
  snapshot(b, ptrs(b), `Allocate a new node at address @${node.addr} holding ${value}. Its next pointer is NULL — nothing links to it and it links to nothing.`, [1], [node.id]);

  if (!oldHead) {
    b.headId = node.id;
    b.tailId = node.id;
    node.floating = false;
    rewire(b);
    snapshot(b, ptrs(b), `head = node: the head box now stores @${node.addr}. The list has its first node.`, [headLine], ["HEAD"]);
    node.state = "idle";
    snapshot(b, ptrs(b), `${value} inserted — O(1).`, []);
    return finish();
  }

  // 2 — node.next = head: the first new link forms.
  node.next = oldHead.id;
  snapshot(b, ptrs(b), `node.next = head: the new node's next cell copies the address out of the head box (@${oldHead.addr}), so it now points at ${oldHead.value}. Note: head itself still points at the old first node.`, [2], [node.id]);

  if (b.kind === "doubly") {
    oldHead.prev = node.id;
    snapshot(b, ptrs(b), `head.prev = node: the old head's prev cell now stores @${node.addr} — the backward link is made.`, [3], [oldHead.id]);
  }
  if (b.kind === "circular") {
    const tail = nodeById(b, b.tailId)!;
    tail.next = node.id;
    snapshot(b, ptrs(b), `tail.next = node: the tail's wrap-around link is re-routed from @${oldHead.addr} to @${node.addr}, so the circle will pass through the new node.`, [3], [tail.id]);
  }

  // 3 — head = node: the head box is overwritten; the node drops into the row.
  b.headId = node.id;
  node.floating = false;
  snapshot(b, ptrs(b), `head = node: the head box is overwritten — @${oldHead.addr} is replaced by @${node.addr}. The new node drops into place as the first node.`, [headLine], ["HEAD"]);

  node.state = "idle";
  rewire(b);
  snapshot(b, ptrs(b), `${value} is now the head. No node had to move in memory — only pointers changed. O(1).`, []);
  return finish();
}

function insertEnd(b: Builder, value: number): LLProgram {
  if (b.nodes.length === 0) return insertBegin(b, value);
  const circular = b.kind === "circular";
  const pseudo = circular
    ? ["node = new Node(value)", "curr = head", "while curr.next != head:", "  curr = curr.next", "curr.next = node", "node.next = head"]
    : b.kind === "doubly"
      ? ["node = new Node(value)", "curr = head", "while curr.next != NULL:", "  curr = curr.next", "curr.next = node", "node.prev = curr"]
      : ["node = new Node(value)", "curr = head", "while curr.next != NULL:", "  curr = curr.next", "curr.next = node"];

  const oldTail = nodeById(b, b.tailId)!;
  const head = nodeById(b, b.headId)!;

  snapshot(b, ptrs(b), `Insert ${value} at the end. Only head is stored, so we must walk node-to-node to reach the tail first.`, []);

  // 1 — allocate: floats above the last slot, unlinked.
  const node = makeNode(b, value, undefined);
  node.state = "new";
  node.floating = true;
  node.next = null;
  if (b.kind === "doubly") node.prev = null;
  b.nodes.push(node);
  snapshot(b, ptrs(b), `Allocate a new node at @${node.addr} holding ${value}. It is not part of the list yet — its next is NULL.`, [1], [node.id]);

  // 2 — walk curr to the tail.
  let currId: string | null = b.headId;
  snapshot(b, ptrs(b, { curr: currId }), `curr = head — start at ${head.value} (@${head.addr}).`, [2]);
  while (currId && currId !== oldTail.id) {
    const cn = nodeById(b, currId)!;
    setState(b, currId, "visited");
    const nx = nodeById(b, cn.next)!;
    currId = cn.next;
    snapshot(b, ptrs(b, { curr: currId }), `curr.next is @${nx.addr}, not ${circular ? "head" : "NULL"} — follow it: curr moves to ${nx.value}.`, [3, 4]);
  }
  clearStates(b);
  node.state = "new";

  // 3 — curr.next = node: the tail's pointer is overwritten.
  oldTail.next = node.id;
  snapshot(b, ptrs(b, { curr: oldTail.id }), circular
    ? `curr is the tail. curr.next = node: the wrap-around link (@${head.addr}) is overwritten with @${node.addr} — the old link to head is broken.`
    : `curr is the tail (next = NULL). curr.next = node: NULL is overwritten with @${node.addr} — a new link forms to the floating node.`, [5], [oldTail.id]);

  if (b.kind === "doubly") {
    node.prev = oldTail.id;
    snapshot(b, ptrs(b, { curr: oldTail.id }), `node.prev = curr: the backward link stores @${oldTail.addr}.`, [6], [node.id]);
  }
  if (circular) {
    node.next = b.headId;
    snapshot(b, ptrs(b, { curr: oldTail.id }), `node.next = head: the new node wraps back to @${head.addr}, closing the circle again.`, [6], [node.id]);
  }

  // 4 — drop into the row as the new tail.
  node.floating = false;
  b.tailId = node.id;
  rewire(b);
  snapshot(b, ptrs(b), `The node settles into place as the new tail${circular ? "" : "; its next stays NULL"}.`, [5], []);
  node.state = "idle";
  snapshot(b, ptrs(b), `${value} appended — O(n) to find the tail, O(1) to link.`, []);
  return done(b, `Insert at End (${b.kind})`, { time: "O(n)", space: "O(1)" }, pseudo);
}

function insertPosition(b: Builder, pos: number, value: number): LLProgram {
  const n = b.nodes.length;
  if (pos <= 0 || n === 0) return insertBegin(b, value);
  if (pos >= n) return insertEnd(b, value);

  const pseudo = [
    "node = new Node(value)",
    "prev = head",
    "repeat (pos − 1) times:",
    "  prev = prev.next",
    "node.next = prev.next",
    "prev.next = node",
  ];

  snapshot(b, ptrs(b), `Insert ${value} at position ${pos}: prev must stop on the node at position ${pos - 1}, because inserting needs the node *before* the gap.`, []);

  // 1 — allocate: hovers above the gap it will fill.
  const node = makeNode(b, value, undefined);
  node.state = "new";
  node.floating = true;
  node.next = null;
  if (b.kind === "doubly") node.prev = null;
  b.nodes.splice(pos, 0, node); // opens the visual gap; the wiring still skips it
  snapshot(b, ptrs(b), `Allocate a new node at @${node.addr} holding ${value}. It hovers over the gap — no pointer touches it yet, and the list still links straight across.`, [1], [node.id]);

  // 2 — walk prev to position pos-1.
  let prevId: string | null = b.headId;
  snapshot(b, ptrs(b, { prev: prevId }), `prev = head.`, [2]);
  for (let i = 0; i < pos - 1; i++) {
    setState(b, prevId, "visited");
    prevId = nodeById(b, prevId)!.next;
    snapshot(b, ptrs(b, { prev: prevId }), `Advance prev to position ${i + 1} (node ${nodeById(b, prevId)!.value}).`, [3, 4]);
  }
  clearStates(b);
  node.state = "new";
  const prev = nodeById(b, prevId)!;
  const after = nodeById(b, prev.next)!;

  // 3 — node.next = prev.next: link the new node first, so nothing is lost.
  node.next = prev.next;
  snapshot(b, ptrs(b, { prev: prevId }), `node.next = prev.next: the new node copies @${after.addr} into its next cell, so it points at ${after.value}. prev still links straight to ${after.value} — for a moment two arrows share the same target. Order matters: doing prev.next first would lose the rest of the list.`, [5], [node.id]);

  // 4 — prev.next = node: the old link breaks, the new one forms.
  prev.next = node.id;
  snapshot(b, ptrs(b, { prev: prevId }), `prev.next = node: prev's next cell is overwritten — @${after.addr} is replaced by @${node.addr}. The old link is broken; the chain now flows through the new node.`, [6], [prev.id]);

  if (b.kind === "doubly") {
    node.prev = prev.id;
    after.prev = node.id;
    snapshot(b, ptrs(b, { prev: prevId }), `Fix the backward links: node.prev = @${prev.addr} and ${after.value}.prev = @${node.addr}.`, [6], [node.id, after.id]);
  }

  // 5 — drop into the row.
  node.floating = false;
  rewire(b);
  snapshot(b, ptrs(b), `The node settles into position ${pos}.`, [6]);
  node.state = "idle";
  snapshot(b, ptrs(b), `${value} inserted at position ${pos} — O(n) walk + O(1) splice.`, []);
  return done(b, `Insert at Position (${b.kind})`, { time: "O(n)", space: "O(1)" }, pseudo);
}

// --- Deletion --------------------------------------------------------------

function deleteBegin(b: Builder): LLProgram {
  const pseudo =
    b.kind === "doubly"
      ? ["curr = head", "head = head.next", "head.prev = NULL", "free(curr)"]
      : b.kind === "circular"
        ? ["curr = head", "head = head.next", "tail.next = head", "free(curr)"]
        : ["curr = head", "head = head.next", "free(curr)"];
  const finish = () => done(b, `Delete at Begin (${b.kind})`, { time: "O(1)", space: "O(1)" }, pseudo);

  if (b.nodes.length === 0) {
    snapshot(b, ptrs(b), "List is empty — nothing to delete.", []);
    return finish();
  }
  const old = b.nodes[0];
  const newHead = b.nodes[1] ?? null;

  snapshot(b, ptrs(b, { curr: old.id }), `curr = head: keep a handle on the first node (@${old.addr}) — once head moves on, this is the only way to reach it to free it.`, [1]);
  old.state = "removing";
  snapshot(b, ptrs(b, { curr: old.id }), `Node ${old.value} is marked for deletion.`, [1]);

  // head = head.next: the head box is overwritten.
  b.headId = newHead?.id ?? null;
  snapshot(b, ptrs(b, { curr: old.id }), newHead
    ? `head = head.next: the head box is overwritten — @${old.addr} is replaced by @${newHead.addr}. The old node still exists, but the list no longer reaches it.`
    : `head = head.next: the head box becomes NULL — the list is about to be empty.`, [2], ["HEAD"]);

  if (b.kind === "doubly" && newHead) {
    newHead.prev = null;
    snapshot(b, ptrs(b, { curr: old.id }), `head.prev = NULL: the new head has no predecessor any more.`, [3], [newHead.id]);
  }
  if (b.kind === "circular" && newHead) {
    const tail = nodeById(b, b.tailId)!;
    tail.next = newHead.id;
    snapshot(b, ptrs(b, { curr: old.id }), `tail.next = head: the wrap-around link is re-routed from @${old.addr} to @${newHead.addr}, so the circle skips the old node.`, [3], [tail.id]);
  }

  // free(curr): detach visually, then reclaim.
  old.floating = true;
  old.next = null;
  snapshot(b, ptrs(b, { curr: old.id }), `free(curr): the node is fully unlinked — its memory at @${old.addr} is released.`, [pseudo.length], [old.id]);

  b.nodes.shift();
  rewire(b);
  snapshot(b, ptrs(b), b.nodes.length ? `Old head deleted; ${nodeById(b, b.headId)!.value} is the new head. Only pointers changed — O(1).` : "List is now empty.", []);
  return finish();
}

function deleteEnd(b: Builder): LLProgram {
  const circular = b.kind === "circular";
  const pseudo = circular
    ? ["prev = head", "while prev.next != tail:", "  prev = prev.next", "prev.next = head", "tail = prev", "free(old tail)"]
    : ["prev = head", "while prev.next.next != NULL:", "  prev = prev.next", "prev.next = NULL", "tail = prev", "free(old tail)"];
  const finish = () => done(b, `Delete at End (${b.kind})`, { time: "O(n)", space: "O(1)" }, pseudo);

  if (b.nodes.length === 0) {
    snapshot(b, ptrs(b), "List is empty — nothing to delete.", []);
    return finish();
  }
  if (b.nodes.length === 1) return deleteBegin(b);

  const oldTail = b.nodes[b.nodes.length - 1];
  const newTail = b.nodes[b.nodes.length - 2];

  snapshot(b, ptrs(b), `Delete the tail (${oldTail.value}). The tail cannot unlink itself — we need prev, the node just before it, to break the link.`, []);

  let prevId: string | null = b.headId;
  snapshot(b, ptrs(b, { prev: prevId }), `prev = head.`, [1]);
  while (prevId && prevId !== newTail.id) {
    setState(b, prevId, "visited");
    prevId = nodeById(b, prevId)!.next;
    snapshot(b, ptrs(b, { prev: prevId }), `Not at the second-to-last node yet — advance prev to ${nodeById(b, prevId)!.value}.`, [2, 3]);
  }
  clearStates(b);
  oldTail.state = "removing";
  snapshot(b, ptrs(b, { prev: prevId }), `prev now sits just before the tail. Node ${oldTail.value} (@${oldTail.addr}) is marked for deletion.`, [2, 3]);

  // Break the link into the old tail.
  newTail.next = circular ? b.headId : null;
  b.tailId = newTail.id;
  snapshot(b, ptrs(b, { prev: prevId }), circular
    ? `prev.next = head: prev's next cell is overwritten — @${oldTail.addr} is replaced by @${nodeById(b, b.headId)!.addr}. The circle now closes before the old tail; nothing reaches it any more. tail = prev.`
    : `prev.next = NULL: prev's next cell is overwritten — @${oldTail.addr} is replaced by NULL. The link into the old tail is broken. tail = prev.`, [4, 5], [newTail.id]);

  oldTail.floating = true;
  oldTail.next = null;
  snapshot(b, ptrs(b), `free(old tail): the node detaches and its memory at @${oldTail.addr} is released.`, [6], [oldTail.id]);

  b.nodes.pop();
  rewire(b);
  snapshot(b, ptrs(b), `Tail deleted — ${newTail.value} is the new tail.`, []);
  return finish();
}

function deletePosition(b: Builder, pos: number): LLProgram {
  const n = b.nodes.length;
  if (n === 0) {
    snapshot(b, ptrs(b), "List is empty — nothing to delete.", []);
    return done(b, `Delete at Position (${b.kind})`, { time: "O(n)", space: "O(1)" }, [
      "prev = head",
      "repeat (pos − 1) times:",
      "  prev = prev.next",
      "target = prev.next",
      "prev.next = target.next",
      "free(target)",
    ]);
  }
  if (pos <= 0) return deleteBegin(b);
  if (pos >= n) return deleteEnd(b);
  return deleteAt(b, pos);
}

function deleteAt(b: Builder, pos: number): LLProgram {
  const pseudo = [
    "prev = head",
    "repeat (pos − 1) times:",
    "  prev = prev.next",
    "target = prev.next",
    "prev.next = target.next",
    "free(target)",
  ];

  snapshot(b, ptrs(b), `Delete the node at position ${pos}. As with insertion, we need prev — the node *before* the target — because only prev can re-route its link.`, []);

  let prevId: string | null = b.headId;
  snapshot(b, ptrs(b, { prev: prevId }), `prev = head.`, [1]);
  for (let i = 0; i < pos - 1; i++) {
    setState(b, prevId, "visited");
    prevId = nodeById(b, prevId)!.next;
    snapshot(b, ptrs(b, { prev: prevId }), `Advance prev to position ${i + 1} (node ${nodeById(b, prevId)!.value}).`, [2, 3]);
  }
  clearStates(b);

  const prev = nodeById(b, prevId)!;
  const target = nodeById(b, prev.next)!;
  const after = nodeById(b, target.next); // circular tail-target: after = head (the wrap)

  target.state = "removing";
  snapshot(b, ptrs(b, { prev: prevId, curr: target.id }), `target = prev.next: the node to delete is ${target.value} at @${target.addr}.`, [4]);

  // prev.next = target.next: the bypass link forms; the target is skipped.
  prev.next = target.next;
  if (target.id === b.tailId) b.tailId = prev.id;
  snapshot(b, ptrs(b, { prev: prevId, curr: target.id }), after
    ? `prev.next = target.next: prev's next cell is overwritten — @${target.addr} is replaced by @${after.addr}. The list now routes *around* the target; its own next pointer still exists but nothing follows it.`
    : `prev.next = target.next: prev's next cell is overwritten — the list now ends (or wraps) before the target. Nothing reaches it any more.`, [5], [prev.id]);

  if (b.kind === "doubly" && after) {
    after.prev = prev.id;
    snapshot(b, ptrs(b, { prev: prevId, curr: target.id }), `Fix the backward link: ${after.value}.prev now stores @${prev.addr}, skipping the target.`, [5], [after.id]);
  }

  target.floating = true;
  target.next = null;
  snapshot(b, ptrs(b, { prev: prevId }), `free(target): the node detaches and its memory at @${target.addr} is released.`, [6], [target.id]);

  const idx = indexOfId(b, target.id);
  b.nodes.splice(idx, 1);
  rewire(b);
  snapshot(b, ptrs(b), `Node at position ${pos} deleted — the remaining nodes close the gap (visually; in memory nothing moved).`, []);
  return done(b, `Delete at Position (${b.kind})`, { time: "O(n)", space: "O(1)" }, pseudo);
}

// --- Applications ----------------------------------------------------------

// Josephus: n people in a circle, every k-th is eliminated until one remains.
function josephus(b: Builder, k: number): LLProgram {
  const step = Math.max(1, k);
  snapshot(b, ptrs(b, { curr: b.headId }), `Josephus: eliminate every ${step}-th node around the circle.`, [1]);
  let currId = b.headId;
  while (b.nodes.length > 1) {
    // Count step-1 hops to land on the k-th node.
    for (let c = 1; c < step; c++) {
      setState(b, currId, "active");
      snapshot(b, ptrs(b, { curr: currId }), `Count ${c} of ${step}…`, [2]);
      setState(b, currId, "idle");
      currId = b.nodes.find((n) => n.id === currId)!.next;
    }
    // currId is the k-th — eliminate it.
    setState(b, currId, "found");
    const victim = b.nodes.find((n) => n.id === currId)!;
    snapshot(b, ptrs(b, { curr: currId }), `Eliminate node ${victim.value}.`, [3]);
    const nextId = victim.next;
    const idx = indexOfId(b, currId);
    b.nodes.splice(idx, 1);
    rewire(b);
    currId = b.nodes.length ? nextId : null;
    snapshot(b, ptrs(b, { curr: currId }), `${victim.value} removed; continue from the next node.`, [4]);
  }
  setState(b, b.headId, "found");
  const survivor = b.nodes[0];
  snapshot(b, ptrs(b, { curr: b.headId }), `Survivor: node ${survivor?.value}.`, [5]);
  return done(b, `Josephus (k = ${step})`, { time: "O(n·k)", space: "O(n)" }, [
    "build circular list 1..n",
    "while size > 1:",
    "  advance k-1 nodes",
    "  eliminate the k-th node",
    "return the last survivor",
  ]);
}

// Polynomial: represent the coefficients as a list of non-zero terms,
// highest degree first. coeffs[i] is the coefficient of x^i.
function polynomial(b: Builder, coeffs: number[]): LLProgram {
  // Build term labels for non-zero coefficients, descending exponent.
  const terms: { coef: number; exp: number }[] = [];
  for (let exp = coeffs.length - 1; exp >= 0; exp--) {
    if (coeffs[exp] !== 0) terms.push({ coef: coeffs[exp], exp });
  }
  if (terms.length === 0) terms.push({ coef: 0, exp: 0 });

  b.nodes = [];
  b.headId = null;
  b.tailId = null;
  snapshot(b, ptrs(b), "Represent the polynomial as a linked list of terms (coef, exp).", [1]);

  terms.forEach((t, i) => {
    const node = makeNode(b, t.coef, fmtTerm(t.coef, t.exp));
    node.state = "new";
    b.nodes.push(node);
    rewire(b);
    snapshot(b, ptrs(b, { curr: node.id }), `Append term ${fmtTerm(t.coef, t.exp)} (coef ${t.coef}, exp ${t.exp}).`, [2, 3]);
    node.state = "idle";
    if (i === terms.length - 1) {
      snapshot(b, ptrs(b), `P(x) = ${terms.map((x) => fmtTerm(x.coef, x.exp)).join(" + ")}.`, [4]);
    }
  });

  return done(b, "Polynomial Representation", { time: "O(t)", space: "O(t)" }, [
    "for each non-zero term (coef, exp):",
    "  node = new TermNode(coef, exp)",
    "  append node (descending exp)",
    "// list ≡ the polynomial",
  ]);
}

function fmtTerm(coef: number, exp: number): string {
  if (exp === 0) return `${coef}`;
  if (exp === 1) return `${coef}x`;
  return `${coef}x^${exp}`;
}

// --- LeetCode classics -----------------------------------------------------

const C_SLOW = "#34C98A"; // reuse mint for slow
const C_FAST = "#8ab4ff"; // soft blue for fast

// Reverse the list. We flip the visual order and re-derive the wiring, while
// narrating the classic prev/curr/next three-pointer walk.
function reverseList(b: Builder): LLProgram {
  snapshot(b, ptrs(b, { curr: b.headId }), "Reverse: walk the list flipping each next pointer backwards.", [1]);
  const order = b.nodes.map((n) => n.id);
  let prevId: string | null = null;
  for (let i = 0; i < order.length; i++) {
    const currId = order[i];
    setState(b, currId, "active");
    snapshot(b, ptrs(b, { prev: prevId, curr: currId }), `Point curr (${b.nodes.find((n) => n.id === currId)!.value}).next back to prev; then advance.`, [2, 3, 4]);
    setState(b, currId, "visited");
    prevId = currId;
  }
  // Flip the visual order so the rewire produces the reversed list.
  b.nodes.reverse();
  rewire(b);
  clearStates(b);
  snapshot(b, ptrs(b, { curr: b.headId }), "All links flipped — the old tail is the new head.", [5]);
  return done(b, `Reverse (${b.kind})`, { time: "O(n)", space: "O(1)" }, [
    "prev = NULL, curr = head",
    "while curr != NULL:",
    "  next = curr.next",
    "  curr.next = prev",
    "  prev = curr; curr = next",
  ]);
}

// Middle of the list with the tortoise/hare: fast moves 2×, slow lands on the middle.
function findMiddle(b: Builder): LLProgram {
  snapshot(b, ptrs(b), "Two runners from head: slow steps 1, fast steps 2. When fast ends, slow is the middle.", [1]);
  const order = b.nodes.map((n) => n.id);
  const n = order.length;
  let slow = 0, fast = 0;
  while (fast < n && fast + 1 < n) {
    slow += 1;
    fast += 2;
    const slowId = order[slow];
    const fastId = fast < n ? order[fast] : null;
    setState(b, slowId, "active");
    snapshot(b, [
      ...ptrs(b),
      { label: "slow", nodeId: slowId, color: C_SLOW },
      ...(fastId ? [{ label: "fast", nodeId: fastId, color: C_FAST }] : []),
    ], fastId ? `slow → index ${slow}, fast → index ${fast}.` : `slow → index ${slow}; fast ran off the end.`, [2, 3]);
    setState(b, slowId, "idle");
  }
  const midId = order[slow];
  setState(b, midId, "found");
  snapshot(b, [...ptrs(b), { label: "mid", nodeId: midId, color: C_SLOW }], `Middle node: ${b.nodes.find((x) => x.id === midId)!.value} (index ${slow}).`, [4]);
  return done(b, `Middle (${b.kind})`, { time: "O(n)", space: "O(1)" }, [
    "slow = fast = head",
    "while fast and fast.next:",
    "  slow = slow.next",
    "  fast = fast.next.next",
    "return slow",
  ]);
}

// Remove Nth node from the end via a fixed gap of n between two pointers.
function removeNthEnd(b: Builder, nth: number): LLProgram {
  const len = b.nodes.length;
  const k = Math.max(1, Math.min(nth || 1, len));
  snapshot(b, ptrs(b, { curr: b.headId }), `Remove the ${k}-th node from the end. Open a gap of ${k} between fast and slow.`, [1]);
  const order = b.nodes.map((n) => n.id);
  // Advance fast k steps to create the gap.
  let fast = 0;
  for (let i = 0; i < k; i++) {
    fast = i;
    setState(b, order[fast], "visited");
    snapshot(b, [...ptrs(b), { label: "fast", nodeId: order[fast], color: C_FAST }], `Advance fast ${i + 1}/${k} to build the gap.`, [2]);
  }
  clearStates(b);
  // Move both until fast hits the last node; slow then sits before the target.
  let slow = -1; // slow starts "before head"
  let f = k - 1;
  while (f < len - 1) {
    f += 1;
    slow += 1;
    const prevId = slow >= 0 ? order[slow] : null;
    snapshot(b, [
      ...ptrs(b),
      ...(prevId ? [{ label: "slow", nodeId: prevId, color: C_SLOW }] : []),
      { label: "fast", nodeId: order[f], color: C_FAST },
    ], "Move fast and slow together until fast reaches the tail.", [3]);
  }
  const targetIdx = slow + 1; // node to remove
  const targetId = order[targetIdx];
  setState(b, targetId, "removing");
  snapshot(b, [...ptrs(b), { label: "target", nodeId: targetId, color: C_CURR }], `slow.next is the target (${b.nodes.find((x) => x.id === targetId)!.value}) — unlink it.`, [4]);
  b.nodes.splice(targetIdx, 1);
  rewire(b);
  clearStates(b);
  snapshot(b, ptrs(b), `Removed the ${k}-th node from the end.`, [5]);
  return done(b, `Remove ${k}th From End (${b.kind})`, { time: "O(n)", space: "O(1)" }, [
    "fast = head; advance n steps",
    "slow = dummy(head)",
    "while fast: fast=fast.next; slow=slow.next",
    "slow.next = slow.next.next",
    "return head",
  ]);
}

// Palindrome check: find the middle, then compare the front with the reversed back.
function palindrome(b: Builder): LLProgram {
  const vals = b.nodes.map((n) => n.value);
  snapshot(b, ptrs(b), "Palindrome? Compare the list with itself reversed, walking inward from both ends.", [1]);
  let l = 0, r = b.nodes.length - 1;
  let ok = true;
  while (l < r) {
    const lId = b.nodes[l].id, rId = b.nodes[r].id;
    const match = vals[l] === vals[r];
    setState(b, lId, match ? "target" : "removing");
    setState(b, rId, match ? "target" : "removing");
    snapshot(b, [
      ...ptrs(b),
      { label: "left", nodeId: lId, color: C_SLOW },
      { label: "right", nodeId: rId, color: C_TAIL },
    ], `Compare ${vals[l]} and ${vals[r]} — ${match ? "match" : "mismatch!"}.`, [2, 3]);
    setState(b, lId, "visited");
    setState(b, rId, "visited");
    if (!match) { ok = false; break; }
    l++; r--;
  }
  if (ok) b.nodes.forEach((n) => setState(b, n.id, "found"));
  snapshot(b, ptrs(b), ok ? "Every pair matched — the list is a palindrome. ✓" : "A pair differed — not a palindrome.", [4]);
  return done(b, `Palindrome (${b.kind})`, { time: "O(n)", space: "O(1)" }, [
    "find middle (slow/fast)",
    "reverse the second half",
    "compare halves node by node",
    "return all matched",
  ]);
}

// --- Dispatch --------------------------------------------------------------

export interface LLRunParams {
  index?: number;
  value?: number;
}

export function runLinkedListOperation(
  op: LLOperationId,
  kind: LLKind,
  values: number[],
  params: LLRunParams = {},
): LLProgram {
  const b: Builder = { steps: [], nodes: [], headId: null, tailId: null, kind, seq: 0 };
  const value = params.value ?? 0;
  const index = params.index ?? 0;

  if (op === "polynomial") {
    buildBase(b, values); // base built but replaced inside polynomial()
    return polynomial(b, values);
  }

  buildBase(b, values);

  switch (op) {
    case "traverse":
      return traverse(b);
    case "search":
      return search(b, value);
    case "insertBegin":
      return insertBegin(b, value);
    case "insertEnd":
      return insertEnd(b, value);
    case "insertPosition":
      return insertPosition(b, index, value);
    case "deleteBegin":
      return deleteBegin(b);
    case "deleteEnd":
      return deleteEnd(b);
    case "deletePosition":
      return deletePosition(b, index);
    case "josephus":
      return josephus(b, value || 2);
    case "reverseList":
      return reverseList(b);
    case "findMiddle":
      return findMiddle(b);
    case "removeNthEnd":
      return removeNthEnd(b, value || 2);
    case "palindrome":
      return palindrome(b);
    default:
      return traverse(b);
  }
}

export interface LLOperationMeta {
  id: LLOperationId;
  label: string;
  icon: string;
  params: ("index" | "value")[];
  hint: string;
}

/** Registry used by the sidebar quick-tabs / param inputs. */
export const LL_OPERATIONS: LLOperationMeta[] = [
  { id: "traverse", label: "Traverse", icon: "linear_scale", params: [], hint: "Walk head → tail following next." },
  { id: "search", label: "Search", icon: "search", params: ["value"], hint: "Scan for a value (value = key)." },
  { id: "insertBegin", label: "Insert Begin", icon: "first_page", params: ["value"], hint: "Prepend a node — O(1)." },
  { id: "insertEnd", label: "Insert End", icon: "last_page", params: ["value"], hint: "Append a node at the tail." },
  { id: "insertPosition", label: "Insert Pos", icon: "add_box", params: ["index", "value"], hint: "Splice a node at an index." },
  { id: "deleteBegin", label: "Delete Begin", icon: "first_page", params: [], hint: "Remove the head — O(1)." },
  { id: "deleteEnd", label: "Delete End", icon: "last_page", params: [], hint: "Remove the tail node." },
  { id: "deletePosition", label: "Delete Pos", icon: "delete", params: ["index"], hint: "Unlink the node at an index." },
  { id: "reverseList", label: "Reverse", icon: "swap_horiz", params: [], hint: "Flip every next pointer (prev/curr/next)." },
  { id: "findMiddle", label: "Find Middle", icon: "align_horizontal_center", params: [], hint: "Tortoise & hare — slow lands on the middle." },
  { id: "removeNthEnd", label: "Remove Nth End", icon: "last_page", params: ["value"], hint: "Two pointers with a gap of n (value = n)." },
  { id: "palindrome", label: "Palindrome", icon: "compare_arrows", params: [], hint: "Compare the list with its reverse." },
];
