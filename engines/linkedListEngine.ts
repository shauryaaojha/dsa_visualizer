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

// Pointer colors (match the shader accent palette).
const C_HEAD = "#34C98A"; // mint
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

/** Assemble the floating cursors for a frame. */
function ptrs(
  b: Builder,
  opts: { curr?: string | null; prev?: string | null } = {},
): LLPointer[] {
  const list: LLPointer[] = [];
  if (b.headId) list.push({ label: "head", nodeId: b.headId, color: C_HEAD });
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
): void {
  b.steps.push({
    nodes: b.nodes.map((n) => ({ ...n })), // immutable clone per frame
    headId: b.headId,
    tailId: b.tailId,
    pointers,
    description,
    codeLines,
  });
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

const INSERT_PSEUDO = [
  "node = new Node(value)",
  "// wire node into the list",
  "node.next = …",
  "prev.next = node",
  "fix head / tail",
];

function insertBegin(b: Builder, value: number): LLProgram {
  snapshot(b, ptrs(b, { curr: b.headId }), `Insert ${value} at the beginning.`, [1]);
  const node = makeNode(b, value, undefined);
  node.state = "new";
  b.nodes.unshift(node);
  rewire(b);
  snapshot(b, ptrs(b, { curr: node.id }), `New node ${value}.next → old head; head → new node.`, [2, 3, 4]);
  node.state = "idle";
  snapshot(b, ptrs(b), `${value} is now the head.`, [5]);
  return done(b, `Insert at Begin (${b.kind})`, { time: "O(1)", space: "O(1)" }, INSERT_PSEUDO);
}

function insertEnd(b: Builder, value: number): LLProgram {
  if (b.nodes.length === 0) return insertBegin(b, value);
  // Walk to the tail.
  let curr = b.headId;
  let guard = 0;
  while (curr && guard < b.nodes.length - 1) {
    setState(b, curr, "visited");
    snapshot(b, ptrs(b, { curr }), "Walk to the tail…", [1]);
    curr = b.nodes.find((n) => n.id === curr)!.next;
    guard++;
  }
  clearStates(b);
  const node = makeNode(b, value, undefined);
  node.state = "new";
  b.nodes.push(node);
  rewire(b);
  const wireMsg =
    b.kind === "circular"
      ? `tail.next → new node; new node.next wraps back to head.`
      : `tail.next → new node; new node.next → NULL.`;
  snapshot(b, ptrs(b, { curr: node.id }), wireMsg, [3, 4, 5]);
  node.state = "idle";
  snapshot(b, ptrs(b), `${value} appended at the end.`, [5]);
  return done(b, `Insert at End (${b.kind})`, { time: "O(n)", space: "O(1)" }, INSERT_PSEUDO);
}

function insertPosition(b: Builder, pos: number, value: number): LLProgram {
  const n = b.nodes.length;
  if (pos <= 0 || n === 0) return insertBegin(b, value);
  if (pos >= n) return insertEnd(b, value);

  snapshot(b, ptrs(b, { curr: b.headId }), `Insert ${value} at position ${pos}.`, [1]);
  // Walk prev to index pos-1.
  let prevId = b.headId;
  for (let i = 0; i < pos - 1; i++) {
    setState(b, prevId, "visited");
    snapshot(b, ptrs(b, { prev: prevId, curr: b.nodes.find((x) => x.id === prevId)!.next }), `Advance to index ${i + 1}.`, [2]);
    prevId = b.nodes.find((x) => x.id === prevId)!.next;
  }
  clearStates(b);
  const idx = indexOfId(b, prevId);
  const node = makeNode(b, value, undefined);
  node.state = "new";
  b.nodes.splice(idx + 1, 0, node);
  rewire(b);
  snapshot(b, ptrs(b, { prev: prevId, curr: node.id }), `node.next → prev.next; prev.next → node.`, [3, 4]);
  node.state = "idle";
  snapshot(b, ptrs(b), `${value} inserted at position ${pos}.`, [5]);
  return done(b, `Insert at Position (${b.kind})`, { time: "O(n)", space: "O(1)" }, INSERT_PSEUDO);
}

// --- Deletion --------------------------------------------------------------

const DELETE_PSEUDO = [
  "// find the node to remove",
  "// re-route the pointer over it",
  "prev.next = target.next",
  "free(target)",
  "fix head / tail",
];

function deleteBegin(b: Builder): LLProgram {
  if (b.nodes.length === 0) {
    snapshot(b, ptrs(b), "List is empty — nothing to delete.", []);
    return done(b, `Delete at Begin (${b.kind})`, { time: "O(1)", space: "O(1)" }, DELETE_PSEUDO);
  }
  setState(b, b.headId, "removing");
  snapshot(b, ptrs(b, { curr: b.headId }), "Mark head for removal; head → head.next.", [1, 2]);
  b.nodes.shift();
  rewire(b);
  snapshot(b, ptrs(b), b.nodes.length ? "Old head unlinked." : "List is now empty.", [3, 4, 5]);
  return done(b, `Delete at Begin (${b.kind})`, { time: "O(1)", space: "O(1)" }, DELETE_PSEUDO);
}

function deleteEnd(b: Builder): LLProgram {
  if (b.nodes.length === 0) {
    snapshot(b, ptrs(b), "List is empty — nothing to delete.", []);
    return done(b, `Delete at End (${b.kind})`, { time: "O(n)", space: "O(1)" }, DELETE_PSEUDO);
  }
  if (b.nodes.length === 1) return deleteBegin(b);
  // Walk to second-last.
  let curr = b.headId;
  for (let i = 0; i < b.nodes.length - 2; i++) {
    setState(b, curr, "visited");
    snapshot(b, ptrs(b, { curr }), "Walk to the node before the tail…", [1]);
    curr = b.nodes.find((n) => n.id === curr)!.next;
  }
  clearStates(b);
  setState(b, b.tailId, "removing");
  snapshot(b, ptrs(b, { prev: curr, curr: b.tailId }), "Mark tail for removal; prev.next → NULL.", [2, 3]);
  b.nodes.pop();
  rewire(b);
  snapshot(b, ptrs(b), "Tail unlinked.", [4, 5]);
  return done(b, `Delete at End (${b.kind})`, { time: "O(n)", space: "O(1)" }, DELETE_PSEUDO);
}

function deletePosition(b: Builder, pos: number): LLProgram {
  const n = b.nodes.length;
  if (n === 0) {
    snapshot(b, ptrs(b), "List is empty — nothing to delete.", []);
    return done(b, `Delete at Position (${b.kind})`, { time: "O(n)", space: "O(1)" }, DELETE_PSEUDO);
  }
  if (pos <= 0) return deleteBegin(b);
  if (pos >= n - 1) return pos >= n ? deleteEnd(b) : deleteAt(b, pos);
  return deleteAt(b, pos);
}

function deleteAt(b: Builder, pos: number): LLProgram {
  snapshot(b, ptrs(b, { curr: b.headId }), `Delete the node at position ${pos}.`, [1]);
  let prevId = b.headId;
  for (let i = 0; i < pos - 1; i++) {
    setState(b, prevId, "visited");
    snapshot(b, ptrs(b, { prev: prevId, curr: b.nodes.find((x) => x.id === prevId)!.next }), `Advance to index ${i + 1}.`, [1]);
    prevId = b.nodes.find((x) => x.id === prevId)!.next;
  }
  const targetId = b.nodes.find((x) => x.id === prevId)!.next;
  clearStates(b);
  setState(b, targetId, "removing");
  snapshot(b, ptrs(b, { prev: prevId, curr: targetId }), "prev.next → target.next (route over the target).", [2, 3]);
  const idx = indexOfId(b, targetId);
  b.nodes.splice(idx, 1);
  rewire(b);
  snapshot(b, ptrs(b), `Node at position ${pos} removed.`, [4, 5]);
  return done(b, `Delete at Position (${b.kind})`, { time: "O(n)", space: "O(1)" }, DELETE_PSEUDO);
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
