// ---------------------------------------------------------------------------
// Tree engine — hierarchical-structure compiler
//
// Compiles every tree operation into a TreesProgram: frames of nodes (with
// grid coords: x = in-order position, y = depth) + edges + strips + narration.
// Layout is recomputed for every frame and nodes keep stable ids, so ANY
// structure change — insert, delete, AVL rotation — renders as nodes gliding
// to their new positions on the canvas.
//
// Beginner aids baked into the frames:
//  · traversals carry a live CALL-STACK (or queue) strip and an output strip
//  · BST ops narrate every comparison ("25 < 40 → go left")
//  · AVL nodes wear balance-factor badges that update as the tree changes
//  · heap ops show the backing array strip under the tree
//  · trie nodes are letters; end-of-word is a double ring
// ---------------------------------------------------------------------------

import type {
  Complexity,
  SQCellState,
  TokenChip,
  TreesOperationId,
  TreesProgram,
  TreesStep,
  TreeVEdge,
  TreeVNode,
} from "@/types/visualization";

// --- Core node + builder -----------------------------------------------------

interface TN {
  id: string;
  value: number;
  left: TN | null;
  right: TN | null;
}

interface Builder {
  steps: TreesStep[];
  root: TN | null;
  seq: number;
  states: Map<string, SQCellState>;
  tags: Map<string, string>;
  edgeStates: Map<string, TreeVEdge["state"]>; // "parent>child"
  showBf: boolean; // AVL: badge every node with its balance factor
  output?: { label: string; chips: TokenChip[] };
  aux?: { label: string; chips: TokenChip[] };
}

function newBuilder(): Builder {
  return { steps: [], root: null, seq: 0, states: new Map(), tags: new Map(), edgeStates: new Map(), showBf: false };
}

function mk(b: Builder, value: number): TN {
  return { id: `tn-${b.seq++}`, value, left: null, right: null };
}

function height(n: TN | null): number {
  if (!n) return 0;
  return 1 + Math.max(height(n.left), height(n.right));
}

function bf(n: TN): number {
  return height(n.left) - height(n.right);
}

/** In-order x, depth y. */
function layout(b: Builder): { nodes: TreeVNode[]; edges: TreeVEdge[]; gridW: number; gridH: number } {
  const nodes: TreeVNode[] = [];
  const edges: TreeVEdge[] = [];
  let x = 0;
  let maxD = 0;
  const walk = (n: TN | null, d: number) => {
    if (!n) return;
    walk(n.left, d + 1);
    maxD = Math.max(maxD, d);
    nodes.push({
      id: n.id,
      label: String(n.value),
      x: x++,
      y: d,
      state: b.states.get(n.id) ?? "idle",
      badge: b.showBf ? `bf ${bf(n) > 0 ? "+" : ""}${bf(n)}` : undefined,
      tag: b.tags.get(n.id),
    });
    walk(n.right, d + 1);
    for (const c of [n.left, n.right]) {
      if (c) edges.push({ from: n.id, to: c.id, state: b.edgeStates.get(`${n.id}>${c.id}`) ?? "idle" });
    }
  };
  walk(b.root, 0);
  return { nodes, edges, gridW: Math.max(1, x - 1), gridH: Math.max(1, maxD) };
}

function snapshot(
  b: Builder,
  description: string,
  codeLines?: number[],
  opts: { message?: TreesStep["message"] } = {},
): void {
  const l = layout(b);
  b.steps.push({
    ...l,
    output: b.output ? { label: b.output.label, chips: b.output.chips.map((c) => ({ ...c })) } : undefined,
    aux: b.aux ? { label: b.aux.label, chips: b.aux.chips.map((c) => ({ ...c })) } : undefined,
    message: opts.message,
    description,
    codeLines,
  });
}

function clearStates(b: Builder): void {
  b.states.clear();
  b.tags.clear();
  b.edgeStates.clear();
}

function softClear(b: Builder): void {
  // keep "visited" marks, drop cursors/highlights
  for (const [id, s] of [...b.states]) if (s !== "visited") b.states.delete(id);
  b.tags.clear();
  b.edgeStates.clear();
}

function done(b: Builder, title: string, complexity: Complexity, pseudocode: string[]): TreesProgram {
  return { steps: b.steps, complexity, pseudocode, title };
}

// --- Seeding -------------------------------------------------------------------

/** Complete binary tree from level-order values (plain binary-tree pages). */
function seedComplete(b: Builder, values: number[]): void {
  const nodes = values.map((v) => mk(b, v));
  nodes.forEach((n, i) => {
    const l = 2 * i + 1;
    const r = 2 * i + 2;
    n.left = l < nodes.length ? nodes[l] : null;
    n.right = r < nodes.length ? nodes[r] : null;
  });
  b.root = nodes[0] ?? null;
}

function bstAttach(b: Builder, value: number): TN {
  const node = mk(b, value);
  if (!b.root) {
    b.root = node;
    return node;
  }
  let curr = b.root;
  for (;;) {
    if (value < curr.value) {
      if (!curr.left) {
        curr.left = node;
        return node;
      }
      curr = curr.left;
    } else {
      if (!curr.right) {
        curr.right = node;
        return node;
      }
      curr = curr.right;
    }
  }
}

function seedBST(b: Builder, values: number[]): void {
  values.forEach((v) => bstAttach(b, v));
}

/** Seed a balanced AVL tree (silent rebalancing while seeding). */
function seedAVL(b: Builder, values: number[]): void {
  for (const v of values) {
    b.root = avlInsertRec(b, b.root, v);
  }
}

// --- Binary tree traversals ------------------------------------------------------

const chip = (text: string, state: TokenChip["state"] = "done"): TokenChip => ({ text, state });

type Order = "in" | "pre" | "post";

const TRAV_PSEUDO: Record<Order, string[]> = {
  in: ["inorder(node):", "  if node == NULL: return", "  inorder(node.left)", "  visit(node)", "  inorder(node.right)"],
  pre: ["preorder(node):", "  if node == NULL: return", "  visit(node)", "  preorder(node.left)", "  preorder(node.right)"],
  post: ["postorder(node):", "  if node == NULL: return", "  postorder(node.left)", "  postorder(node.right)", "  visit(node)"],
};

function recTraverse(b: Builder, order: Order, title: string, sortedNote = false): TreesProgram {
  b.output = { label: "visited", chips: [] };
  b.aux = { label: "call stack", chips: [] };
  const name = order === "in" ? "inorder" : order === "pre" ? "preorder" : "postorder";
  const when = order === "in" ? "BETWEEN its two subtrees (Left, Node, Right)" : order === "pre" ? "BEFORE its subtrees (Node, Left, Right)" : "AFTER its subtrees (Left, Right, Node)";
  snapshot(b, `${title}: each node is visited ${when}. Watch the call-stack strip — recursion IS a stack.`, [1]);

  const visit = (n: TN) => {
    b.states.set(n.id, "found");
    b.output!.chips.push(chip(String(n.value), "matched"));
    const line = order === "in" ? 4 : order === "pre" ? 3 : 5;
    snapshot(b, `Visit ${n.value} — append it to the output.`, [line]);
    b.states.set(n.id, "visited");
  };

  const go = (n: TN, from: string) => {
    b.aux!.chips.push(chip(`${name.slice(0, 3)}(${n.value})`, "active"));
    if (b.aux!.chips.length > 1) b.aux!.chips[b.aux!.chips.length - 2].state = "done";
    b.states.set(n.id, "active");
    snapshot(b, `Call ${name}(${n.value})${from ? ` from ${from}` : ""} — a frame goes on the call stack; it cannot finish until its recursive calls return.`, [1]);

    if (order === "pre") visit(n);
    if (n.left) go(n.left, String(n.value));
    if (order === "in") visit(n);
    if (n.right) go(n.right, String(n.value));
    if (order === "post") visit(n);

    b.aux!.chips.pop();
    if (b.aux!.chips.length) b.aux!.chips[b.aux!.chips.length - 1].state = "active";
    b.states.set(n.id, "visited");
    snapshot(b, `${name}(${n.value}) finished — pop its frame; control returns to the caller.`, [1]);
  };

  if (b.root) go(b.root, "");
  snapshot(
    b,
    sortedNote
      ? `Traversal complete. Notice the output is SORTED — in-order on a BST always yields ascending order, because left < node < right holds at every node.`
      : `Traversal complete — every node visited exactly once.`,
    [],
    { message: { text: b.output.chips.map((c) => c.text).join(" "), tone: "ok" } },
  );
  return done(b, title, { time: "O(n)", space: "O(h)" }, TRAV_PSEUDO[order]);
}

const LEVEL_PSEUDO = ["enqueue(root)", "while queue not empty:", "  node = dequeue()", "  visit(node)", "  enqueue(node.left, node.right)"];

function levelOrder(b: Builder): TreesProgram {
  b.output = { label: "visited", chips: [] };
  b.aux = { label: "queue", chips: [] };
  if (!b.root) {
    snapshot(b, "Empty tree — nothing to traverse.", []);
    return done(b, "Level Order", { time: "O(n)", space: "O(n)" }, LEVEL_PSEUDO);
  }
  const q: TN[] = [b.root];
  b.aux.chips.push(chip(String(b.root.value), "active"));
  b.states.set(b.root.id, "target");
  snapshot(b, `Level-order uses a QUEUE, not recursion: enqueue the root to start. FIFO guarantees each level finishes before the next begins.`, [1]);

  while (q.length) {
    const n = q.shift()!;
    b.aux.chips.shift();
    b.states.set(n.id, "active");
    snapshot(b, `Dequeue ${n.value} — it has waited longest, so it is the next node of the current level.`, [2, 3]);
    b.states.set(n.id, "found");
    b.output.chips.push(chip(String(n.value), "matched"));
    snapshot(b, `Visit ${n.value}.`, [4]);
    b.states.set(n.id, "visited");
    const kids = [n.left, n.right].filter((c): c is TN => !!c);
    if (kids.length) {
      for (const c of kids) {
        q.push(c);
        b.aux.chips.push(chip(String(c.value)));
        b.states.set(c.id, "target");
      }
      snapshot(b, `Enqueue ${n.value}'s children (${kids.map((k) => k.value).join(", ")}) — they wait behind everything already in the queue.`, [5]);
    }
  }
  snapshot(b, "Queue empty — every level visited left→right, top→bottom.", [], {
    message: { text: b.output.chips.map((c) => c.text).join(" "), tone: "ok" },
  });
  return done(b, "Level Order Traversal", { time: "O(n)", space: "O(n)" }, LEVEL_PSEUDO);
}

// --- Binary tree insert / delete ---------------------------------------------------

const BT_INSERT_PSEUDO = ["level-order scan for the first gap:", "  if node.left is empty → attach there", "  else if node.right is empty → attach there", "  else enqueue both children, continue"];

function btInsert(b: Builder, value: number): TreesProgram {
  if (!b.root) {
    b.root = mk(b, value);
    b.states.set(b.root.id, "new");
    snapshot(b, `Tree is empty — ${value} becomes the root.`, [1], { message: { text: `INSERTED ${value}`, tone: "ok" } });
    return done(b, "Insert (binary tree)", { time: "O(n)", space: "O(n)" }, BT_INSERT_PSEUDO);
  }
  snapshot(b, `Insert ${value}: a plain binary tree has NO ordering rule, so we fill the first empty spot (scanning level by level) to keep the tree compact.`, [1]);
  const q: TN[] = [b.root];
  while (q.length) {
    const n = q.shift()!;
    b.states.set(n.id, "active");
    if (!n.left || !n.right) {
      const side = !n.left ? "LEFT" : "RIGHT";
      snapshot(b, `${n.value} has a free ${side} slot — this is the first gap in the tree.`, [!n.left ? 2 : 3]);
      const node = mk(b, value);
      if (!n.left) n.left = node;
      else n.right = node;
      b.states.set(node.id, "new");
      b.edgeStates.set(`${n.id}>${node.id}`, "new");
      b.states.set(n.id, "visited");
      snapshot(b, `${value} attached as ${n.value}'s ${side.toLowerCase()} child.`, [side === "LEFT" ? 2 : 3], {
        message: { text: `INSERTED ${value}`, tone: "ok" },
      });
      break;
    }
    snapshot(b, `${n.value} already has both children — enqueue them and keep scanning.`, [4]);
    b.states.set(n.id, "visited");
    q.push(n.left, n.right);
  }
  clearStates(b);
  snapshot(b, "The tree stays as compact as possible — no gaps above the last level.", []);
  return done(b, "Insert (binary tree)", { time: "O(n)", space: "O(n)" }, BT_INSERT_PSEUDO);
}

const BT_DELETE_PSEUDO = ["find the target node (level-order)", "find the DEEPEST, right-most node", "copy the deepest value into the target", "delete the deepest node", "// the tree stays compact — no holes"];

function btDelete(b: Builder, value: number): TreesProgram {
  if (!b.root) {
    snapshot(b, "Empty tree — nothing to delete.", []);
    return done(b, "Delete (binary tree)", { time: "O(n)", space: "O(n)" }, BT_DELETE_PSEUDO);
  }
  snapshot(b, `Delete ${value}: we can't leave a hole mid-tree, so the trick is to OVERWRITE the target with the deepest node's value, then remove that deepest node instead.`, [1]);

  let target: TN | null = null;
  const q: TN[] = [b.root];
  let deepest: TN = b.root;
  const parents = new Map<string, TN>();
  while (q.length) {
    const n = q.shift()!;
    deepest = n;
    if (n.value === value && !target) {
      target = n;
      b.states.set(n.id, "removing");
      b.tags.set(n.id, "target");
      snapshot(b, `Found the target ${value}.`, [1]);
    }
    for (const c of [n.left, n.right]) {
      if (c) {
        parents.set(c.id, n);
        q.push(c);
      }
    }
  }
  if (!target) {
    snapshot(b, `${value} is not in the tree.`, [1], { message: { text: "NOT FOUND", tone: "error" } });
    return done(b, "Delete (binary tree)", { time: "O(n)", space: "O(n)" }, BT_DELETE_PSEUDO);
  }
  const deepestParent = parents.get(deepest.id) ?? null;
  b.tags.set(deepest.id, "deepest");
  b.states.set(deepest.id, "target");
  snapshot(b, `The deepest, right-most node is ${deepest.value} — the ONLY node that can vanish without leaving a hole in the shape.`, [2]);

  const removeDeepest = () => {
    if (deepestParent) {
      if (deepestParent.left?.id === deepest.id) deepestParent.left = null;
      else deepestParent.right = null;
    } else b.root = null;
    b.states.delete(deepest.id);
  };

  if (deepest.id === target.id) {
    removeDeepest();
    b.tags.clear();
    snapshot(b, `The target IS the deepest node — simply remove it.`, [4], { message: { text: `DELETED ${value}`, tone: "ok" } });
    return done(b, "Delete (binary tree)", { time: "O(n)", space: "O(n)" }, BT_DELETE_PSEUDO);
  }

  const dv = deepest.value;
  target.value = dv;
  b.states.set(target.id, "new");
  snapshot(b, `Copy ${dv} into the target — ${value} is gone, and ${dv} exists twice for a moment.`, [3]);

  removeDeepest();
  b.tags.clear();
  snapshot(b, `Delete the deepest node — the duplicate disappears and the tree is still compact.`, [4, 5], {
    message: { text: `DELETED ${value}`, tone: "ok" },
  });
  return done(b, "Delete (binary tree)", { time: "O(n)", space: "O(n)" }, BT_DELETE_PSEUDO);
}

// --- BST -----------------------------------------------------------------------------

const BST_SEARCH_PSEUDO = ["curr = root", "while curr != NULL:", "  if key == curr.value: found ✓", "  if key < curr.value: go LEFT", "  else: go RIGHT", "reached NULL — not in the tree ✗"];

function bstSearch(b: Builder, key: number): TreesProgram {
  snapshot(b, `Search ${key}. The BST rule — left < node < right — lets us discard HALF of what's left at every single comparison.`, [1]);
  let curr = b.root;
  while (curr) {
    b.states.set(curr.id, "active");
    b.tags.set(curr.id, "curr");
    if (key === curr.value) {
      b.states.set(curr.id, "found");
      snapshot(b, `${key} == ${curr.value} — found it ✓`, [3], { message: { text: `FOUND ${key}`, tone: "ok" } });
      return done(b, `Search ${key} (BST)`, { time: "O(h)", space: "O(1)" }, BST_SEARCH_PSEUDO);
    }
    const goLeft = key < curr.value;
    const next = goLeft ? curr.left : curr.right;
    if (next) b.edgeStates.set(`${curr.id}>${next.id}`, "active");
    snapshot(b, `${key} ${goLeft ? "<" : ">"} ${curr.value} → only the ${goLeft ? "LEFT" : "RIGHT"} subtree can contain it. The entire ${goLeft ? "right" : "left"} side is eliminated without looking at it.`, [goLeft ? 4 : 5]);
    b.states.set(curr.id, "visited");
    b.tags.delete(curr.id);
    curr = next;
  }
  snapshot(b, `Reached NULL — ${key} is not in the tree.`, [6], { message: { text: "NOT FOUND", tone: "error" } });
  return done(b, `Search ${key} (BST)`, { time: "O(h)", space: "O(1)" }, BST_SEARCH_PSEUDO);
}

const BST_INSERT_PSEUDO = ["walk down exactly like a search:", "  left if value < curr, right otherwise", "the search ends at a NULL —", "attach the new node right there", "// every ancestor's rule stays true"];

function bstInsert(b: Builder, value: number): TreesProgram {
  if (!b.root) {
    b.root = mk(b, value);
    b.states.set(b.root.id, "new");
    snapshot(b, `Empty tree — ${value} becomes the root.`, [4], { message: { text: `INSERTED ${value}`, tone: "ok" } });
    return done(b, `Insert ${value} (BST)`, { time: "O(h)", space: "O(1)" }, BST_INSERT_PSEUDO);
  }
  snapshot(b, `Insert ${value}: walk down exactly like a search — the NULL where a search for ${value} would fail is precisely where it belongs.`, [1]);
  let curr: TN = b.root;
  for (;;) {
    b.states.set(curr.id, "active");
    const goLeft = value < curr.value;
    const next = goLeft ? curr.left : curr.right;
    snapshot(b, `${value} ${goLeft ? "<" : "≥"} ${curr.value} → go ${goLeft ? "LEFT" : "RIGHT"}${next ? "." : " — and that spot is empty."}`, [2]);
    b.states.set(curr.id, "visited");
    if (!next) {
      const node = mk(b, value);
      if (goLeft) curr.left = node;
      else curr.right = node;
      b.states.set(node.id, "new");
      b.edgeStates.set(`${curr.id}>${node.id}`, "new");
      snapshot(b, `Attach ${value} as ${curr.value}'s ${goLeft ? "left" : "right"} child. Every comparison made on the way down stays true forever.`, [3, 4, 5], {
        message: { text: `INSERTED ${value}`, tone: "ok" },
      });
      return done(b, `Insert ${value} (BST)`, { time: "O(h)", space: "O(1)" }, BST_INSERT_PSEUDO);
    }
    curr = next;
  }
}

const BST_DELETE_PSEUDO = [
  "find the node (BST search)",
  "case 1 — leaf: just remove it",
  "case 2 — one child: parent adopts it",
  "case 3 — two children:",
  "  succ = LEFTMOST of the right subtree",
  "  copy succ's value; delete succ instead",
];

function findParent(root: TN | null, id: string): TN | null {
  if (!root) return null;
  if (root.left?.id === id || root.right?.id === id) return root;
  return findParent(root.left, id) ?? findParent(root.right, id);
}

function bstDelete(b: Builder, value: number): TreesProgram {
  snapshot(b, `Delete ${value}. Removing a node must not break "left < node < right" for anyone else — three cases, by how many children the node has.`, [1]);

  let curr = b.root;
  while (curr && curr.value !== value) {
    b.states.set(curr.id, "visited");
    const goLeft = value < curr.value;
    snapshot(b, `${value} ${goLeft ? "<" : ">"} ${curr.value} → go ${goLeft ? "left" : "right"}.`, [1]);
    curr = goLeft ? curr.left : curr.right;
  }
  if (!curr) {
    snapshot(b, `${value} is not in the tree.`, [1], { message: { text: "NOT FOUND", tone: "error" } });
    return done(b, `Delete ${value} (BST)`, { time: "O(h)", space: "O(1)" }, BST_DELETE_PSEUDO);
  }
  b.states.set(curr.id, "removing");
  b.tags.set(curr.id, "target");
  const kids = (curr.left ? 1 : 0) + (curr.right ? 1 : 0);
  snapshot(b, `Found ${value}. It has ${kids === 0 ? "no children — case 1, the easy one" : kids === 1 ? "exactly one child — case 2" : "two children — case 3, the interesting one"}.`, [kids === 0 ? 2 : kids === 1 ? 3 : 4]);

  const detach = (node: TN, replaceWith: TN | null) => {
    const p = findParent(b.root, node.id);
    if (!p) b.root = replaceWith;
    else if (p.left?.id === node.id) p.left = replaceWith;
    else p.right = replaceWith;
  };

  if (kids === 0) {
    detach(curr, null);
    b.states.delete(curr.id);
    b.tags.clear();
    snapshot(b, `A leaf holds nothing up — remove it outright.`, [2], { message: { text: `DELETED ${value}`, tone: "ok" } });
  } else if (kids === 1) {
    const child = (curr.left ?? curr.right)!;
    b.states.set(child.id, "new");
    snapshot(b, `Splice: ${curr.value}'s parent adopts its only child, ${child.value}. The whole subtree slides up one level — it was already on the correct side, so order is preserved.`, [3]);
    detach(curr, child);
    b.states.delete(curr.id);
    b.tags.clear();
    snapshot(b, `${value} removed; ${child.value}'s subtree took its place.`, [3], { message: { text: `DELETED ${value}`, tone: "ok" } });
  } else {
    snapshot(b, `A node with two subtrees can't just vanish — instead we REPLACE its value with the next value in sorted order (the in-order successor), which fits perfectly between the two subtrees.`, [4]);
    let succ = curr.right!;
    b.states.set(succ.id, "target");
    snapshot(b, `Step once into the RIGHT subtree (${succ.value})…`, [5]);
    while (succ.left) {
      b.states.set(succ.id, "visited");
      succ = succ.left;
      b.states.set(succ.id, "target");
      snapshot(b, `…then keep going LEFT: ${succ.value}. The leftmost node of the right subtree is the smallest value bigger than ${value}.`, [5]);
    }
    b.tags.set(succ.id, "succ");
    snapshot(b, `In-order successor found: ${succ.value}.`, [5]);
    const sv = succ.value;
    curr.value = sv;
    b.states.set(curr.id, "new");
    snapshot(b, `Copy ${sv} into the target. ${sv} is bigger than the whole left subtree and smaller than the rest of the right subtree — the BST rule survives.`, [6]);
    detach(succ, succ.right);
    b.states.delete(succ.id);
    b.tags.clear();
    snapshot(b, `Delete the old successor node — it had at most one child, so it's an easy case. Done.`, [6], { message: { text: `DELETED ${value}`, tone: "ok" } });
  }
  return done(b, `Delete ${value} (BST)`, { time: "O(h)", space: "O(1)" }, BST_DELETE_PSEUDO);
}

// --- AVL ------------------------------------------------------------------------------

const AVL_INSERT_PSEUDO = [
  "BST-insert the value",
  "walk back up, updating balance factors",
  "first node with |bf| = 2 → UNBALANCED",
  "LL → right-rot    RR → left-rot",
  "LR → left-rot child, then right-rot",
  "RL → right-rot child, then left-rot",
];

function rotateRight(b: Builder, y: TN): void {
  const x = y.left!;
  const t2 = x.right;
  const p = findParent(b.root, y.id);
  x.right = y;
  y.left = t2;
  if (!p) b.root = x;
  else if (p.left?.id === y.id) p.left = x;
  else p.right = x;
}

function rotateLeft(b: Builder, x: TN): void {
  const y = x.right!;
  const t2 = y.left;
  const p = findParent(b.root, x.id);
  y.left = x;
  x.right = t2;
  if (!p) b.root = y;
  else if (p.left?.id === x.id) p.left = y;
  else p.right = y;
}

/** Silent AVL insert used for seeding (no frames). */
function avlInsertRec(b: Builder, node: TN | null, value: number): TN {
  if (!node) return mk(b, value);
  if (value < node.value) node.left = avlInsertRec(b, node.left, value);
  else node.right = avlInsertRec(b, node.right, value);
  const balance = bf(node);
  const rotR = (y: TN): TN => {
    const x = y.left!;
    y.left = x.right;
    x.right = y;
    return x;
  };
  const rotL = (x: TN): TN => {
    const y = x.right!;
    x.right = y.left;
    y.left = x;
    return y;
  };
  if (balance > 1 && value < node.left!.value) return rotR(node);
  if (balance < -1 && value > node.right!.value) return rotL(node);
  if (balance > 1) {
    node.left = rotL(node.left!);
    return rotR(node);
  }
  if (balance < -1) {
    node.right = rotR(node.right!);
    return rotL(node);
  }
  return node;
}

function pathToValue(root: TN | null, value: number): TN[] {
  const path: TN[] = [];
  let curr = root;
  while (curr) {
    path.push(curr);
    if (value === curr.value) break;
    curr = value < curr.value ? curr.left : curr.right;
  }
  return path;
}

/** Animated rebalance at node z (|bf| = 2). Returns true if it rotated. */
function rebalance(b: Builder, z: TN): boolean {
  const balance = bf(z);
  if (Math.abs(balance) <= 1) return false;
  b.states.set(z.id, "removing");
  const leftHeavy = balance > 1;
  const child = leftHeavy ? z.left! : z.right!;
  const childBf = bf(child);
  const caseName = leftHeavy ? (childBf >= 0 ? "LL" : "LR") : childBf <= 0 ? "RR" : "RL";
  snapshot(b, `${z.value} is UNBALANCED: bf = ${balance > 0 ? "+" : ""}${balance}. Its ${leftHeavy ? "left" : "right"} child ${child.value} leans ${childBf > 0 ? "left" : childBf < 0 ? "right" : "neither way"} → this is the ${caseName} case.`, [3], {
    message: { text: `${caseName} CASE at ${z.value}`, tone: "error" },
  });

  b.states.set(child.id, "target");
  if (caseName === "LL") {
    snapshot(b, `LL fix — ONE RIGHT rotation around ${z.value}: ${child.value} rises to take its place, ${z.value} falls to the right, and ${child.value}'s old right subtree crosses over to become ${z.value}'s new left subtree. Watch the nodes glide.`, [4]);
    rotateRight(b, z);
  } else if (caseName === "RR") {
    snapshot(b, `RR fix — ONE LEFT rotation around ${z.value}: ${child.value} rises, ${z.value} falls to the left, and ${child.value}'s old left subtree crosses over to ${z.value}'s right.`, [4]);
    rotateLeft(b, z);
  } else if (caseName === "LR") {
    snapshot(b, `LR is a zig-zag — one rotation can't fix it. STEP 1: left-rotate the child ${child.value}, turning the zig-zag into a straight LL line.`, [5]);
    rotateLeft(b, child);
    snapshot(b, `STEP 2: now it IS an LL case — right-rotate around ${z.value}.`, [5]);
    rotateRight(b, z);
  } else {
    snapshot(b, `RL is a zig-zag — one rotation can't fix it. STEP 1: right-rotate the child ${child.value}, turning the zig-zag into a straight RR line.`, [6]);
    rotateRight(b, child);
    snapshot(b, `STEP 2: now it IS an RR case — left-rotate around ${z.value}.`, [6]);
    rotateLeft(b, z);
  }
  clearStates(b);
  snapshot(b, `Rotation done — every balance factor is back in {−1, 0, +1}. The whole repair was O(1) pointer surgery.`, [4], {
    message: { text: "BALANCED ✓", tone: "ok" },
  });
  return true;
}

function avlInsert(b: Builder, value: number, title = `AVL Insert ${value}`, pseudo = AVL_INSERT_PSEUDO): TreesProgram {
  b.showBf = true;
  snapshot(b, `Insert ${value}. Every node wears its balance factor, bf = height(left) − height(right). AVL's promise: |bf| ≤ 1 everywhere, so height stays O(log n).`, [1]);

  if (!b.root) {
    b.root = mk(b, value);
    b.states.set(b.root.id, "new");
    snapshot(b, `${value} becomes the root.`, [1], { message: { text: `INSERTED ${value}`, tone: "ok" } });
    return done(b, title, { time: "O(log n)", space: "O(log n)" }, pseudo);
  }
  let curr: TN = b.root;
  for (;;) {
    b.states.set(curr.id, "active");
    const goLeft = value < curr.value;
    const next = goLeft ? curr.left : curr.right;
    snapshot(b, `${value} ${goLeft ? "<" : "≥"} ${curr.value} → go ${goLeft ? "left" : "right"}.`, [1]);
    b.states.set(curr.id, "visited");
    if (!next) break;
    curr = next;
  }
  const node = mk(b, value);
  if (value < curr.value) curr.left = node;
  else curr.right = node;
  b.states.set(node.id, "new");
  b.edgeStates.set(`${curr.id}>${node.id}`, "new");
  snapshot(b, `${value} attached — a plain BST insert. Now check the balance factors on the path back to the root: the new node made some subtrees taller.`, [1, 2]);

  softClear(b);
  b.states.clear();
  const path = pathToValue(b.root, value).reverse(); // leaf → root
  for (const anc of path) {
    if (anc.id === node.id) continue;
    const balance = bf(anc);
    if (Math.abs(balance) > 1) {
      rebalance(b, anc);
      break; // insertion needs at most one fix
    }
    b.states.set(anc.id, "target");
    snapshot(b, `${anc.value}: bf = ${balance > 0 ? "+" : ""}${balance} — within ±1, keep climbing.`, [2]);
    b.states.set(anc.id, "idle");
  }
  clearStates(b);
  snapshot(b, `Insert complete — the tree is height-balanced, so every future search stays O(log n).`, [], {
    message: { text: `INSERTED ${value}`, tone: "ok" },
  });
  return done(b, title, { time: "O(log n)", space: "O(log n)" }, pseudo);
}

const AVL_DELETE_PSEUDO = ["BST-delete the value", "walk back up, updating balance factors", "any node with |bf| = 2 → rotate to fix", "(deletion can need fixes at SEVERAL levels)"];

function avlDelete(b: Builder, value: number): TreesProgram {
  b.showBf = true;
  snapshot(b, `Delete ${value} from an AVL tree: a normal BST delete, then repair balance on the way back up. Unlike insertion, a delete can unbalance MORE than one ancestor.`, [1]);

  let curr = b.root;
  while (curr && curr.value !== value) {
    b.states.set(curr.id, "visited");
    curr = value < curr.value ? curr.left : curr.right;
  }
  if (!curr) {
    snapshot(b, `${value} is not in the tree.`, [1], { message: { text: "NOT FOUND", tone: "error" } });
    return done(b, `AVL Delete ${value}`, { time: "O(log n)", space: "O(log n)" }, AVL_DELETE_PSEUDO);
  }
  b.states.set(curr.id, "removing");
  snapshot(b, `Found ${value} — delete it BST-style first.`, [1]);

  const detach = (node: TN, replaceWith: TN | null) => {
    const p = findParent(b.root, node.id);
    if (!p) b.root = replaceWith;
    else if (p.left?.id === node.id) p.left = replaceWith;
    else p.right = replaceWith;
  };
  if (!curr.left && !curr.right) {
    detach(curr, null);
  } else if (!curr.left || !curr.right) {
    detach(curr, curr.left ?? curr.right);
  } else {
    let succ = curr.right!;
    while (succ.left) succ = succ.left;
    b.states.set(succ.id, "target");
    b.tags.set(succ.id, "succ");
    snapshot(b, `Two children — copy the in-order successor ${succ.value} in, then remove the successor node.`, [1]);
    curr.value = succ.value;
    detach(succ, succ.right);
    b.states.delete(succ.id);
  }
  clearStates(b);
  snapshot(b, `Deleted. Now climb the whole path to the root, checking every balance factor.`, [2]);

  // Simplest correct sweep: repeatedly fix the deepest unbalanced node until none remain.
  let fixes = 0;
  for (;;) {
    let worst: TN | null = null;
    const findUnbalanced = (n: TN | null): void => {
      if (!n) return;
      findUnbalanced(n.left);
      findUnbalanced(n.right);
      if (!worst && Math.abs(bf(n)) > 1) worst = n; // deepest-first (post-order)
    };
    findUnbalanced(b.root);
    if (!worst) break;
    rebalance(b, worst);
    fixes++;
    if (fixes > 6) break; // safety
  }
  clearStates(b);
  snapshot(b, fixes ? `Delete complete — ${fixes} rotation fix(es) restored the AVL property.` : `Delete complete — every bf stayed within ±1; no rotation needed this time.`, [], {
    message: { text: `DELETED ${value}`, tone: "ok" },
  });
  return done(b, `AVL Delete ${value}`, { time: "O(log n)", space: "O(log n)" }, AVL_DELETE_PSEUDO);
}

const ROT_PSEUDO: Record<string, string[]> = {
  LL: ["insert lands in the LEFT subtree of the LEFT child", "the lowest unbalanced node gets bf = +2", "fix: ONE right rotation around it", "child rises, pivot falls right, subtree crosses over"],
  RR: ["insert lands in the RIGHT subtree of the RIGHT child", "the lowest unbalanced node gets bf = −2", "fix: ONE left rotation around it", "child rises, pivot falls left, subtree crosses over"],
  LR: ["insert lands in the RIGHT subtree of the LEFT child", "pivot bf = +2 but its child leans the OTHER way", "fix 1: left-rotate the child (zig-zag → straight line)", "fix 2: right-rotate the pivot (now a plain LL case)"],
  RL: ["insert lands in the LEFT subtree of the RIGHT child", "pivot bf = −2 but its child leans the OTHER way", "fix 1: right-rotate the child (zig-zag → straight line)", "fix 2: left-rotate the pivot (now a plain RR case)"],
};

// --- Heap -------------------------------------------------------------------------------

interface HeapItem {
  id: string;
  value: number;
}

interface HeapB {
  steps: TreesStep[];
  heap: HeapItem[];
  sorted: TokenChip[];
  states: Map<string, SQCellState>;
  tags: Map<string, string>;
  seq: number;
}

const chipOf = (text: string, state: TokenChip["state"] = "done"): TokenChip => ({ text, state });

function heapSnapshot(hb: HeapB, description: string, codeLines?: number[], opts: { message?: TreesStep["message"] } = {}): void {
  const n = hb.heap.length;
  const levels = n ? Math.floor(Math.log2(n)) + 1 : 1;
  const gridW = Math.max(2, 2 ** (levels - 1));
  const nodes: TreeVNode[] = hb.heap.map((h, i) => {
    const d = Math.floor(Math.log2(i + 1));
    const k = i - (2 ** d - 1);
    return {
      id: h.id,
      label: String(h.value),
      x: ((k + 0.5) * gridW) / 2 ** d - 0.5,
      y: d,
      state: hb.states.get(h.id) ?? "idle",
      badge: `[${i}]`,
      tag: hb.tags.get(h.id),
    };
  });
  const edges: TreeVEdge[] = [];
  for (let i = 1; i < n; i++) {
    const p = (i - 1) >> 1;
    edges.push({ from: hb.heap[p].id, to: hb.heap[i].id, state: "idle" });
  }
  hb.steps.push({
    nodes,
    edges,
    gridW: Math.max(1, gridW - 1),
    gridH: Math.max(1, levels - 1),
    aux: { label: "backing array", chips: hb.heap.map((h) => chipOf(String(h.value), hb.states.has(h.id) && hb.states.get(h.id) !== "idle" ? "active" : "done")) },
    output: hb.sorted.length ? { label: "sorted", chips: hb.sorted.map((c) => ({ ...c })) } : undefined,
    message: opts.message,
    description,
    codeLines,
  });
}

function makeHeapB(values: number[], asHeap: boolean): HeapB {
  const hb: HeapB = { steps: [], heap: [], sorted: [], states: new Map(), tags: new Map(), seq: 0 };
  const vals = values.slice(0, 10);
  if (asHeap) vals.sort((a, z) => z - a); // descending array is a valid max-heap
  vals.forEach((v) => hb.heap.push({ id: `tn-${hb.seq++}`, value: v }));
  return hb;
}

function heapDone(hb: HeapB, title: string, complexity: Complexity, pseudo: string[]): TreesProgram {
  return { steps: hb.steps, complexity, pseudocode: pseudo, title };
}

const HEAP_INSERT_PSEUDO = ["append the value at the end (next free leaf)", "sift-up: while it beats its parent, swap", "  parent index = (i − 1) / 2", "stop when parent ≥ it — rule restored"];

function heapInsert(hb: HeapB, value: number): TreesProgram {
  heapSnapshot(hb, `Insert ${value} into the max-heap. Two invariants: SHAPE (always complete — badges show each node's array index) and RULE (every parent ≥ its children).`, [1]);
  hb.heap.push({ id: `tn-${hb.seq++}`, value });
  let i = hb.heap.length - 1;
  const id = hb.heap[i].id;
  hb.states.set(id, "new");
  heapSnapshot(hb, `Append ${value} at index ${i} — the next free leaf keeps the shape complete. The rule, though, may now be broken.`, [1]);
  while (i > 0) {
    const p = (i - 1) >> 1;
    hb.states.set(hb.heap[p].id, "target");
    heapSnapshot(hb, `Compare with the parent: index (${i}−1)/2 = ${p}, value ${hb.heap[p].value}.`, [2, 3]);
    if (hb.heap[i].value > hb.heap[p].value) {
      const pv = hb.heap[p].value;
      const t = hb.heap[i];
      hb.heap[i] = hb.heap[p];
      hb.heap[p] = t;
      heapSnapshot(hb, `${value} > ${pv} — SWAP. ${value} climbs a level; ${pv} drops into its old spot.`, [2]);
      hb.states.set(hb.heap[i].id, "idle");
      i = p;
    } else {
      heapSnapshot(hb, `${value} ≤ ${hb.heap[p].value} — the rule holds here, so it holds everywhere above. Stop.`, [4]);
      hb.states.set(hb.heap[p].id, "idle");
      break;
    }
  }
  hb.states.clear();
  heapSnapshot(hb, `Insert done — at most one swap per level: O(log n).`, [], { message: { text: `INSERTED ${value}`, tone: "ok" } });
  return heapDone(hb, `Heap Insert ${value}`, { time: "O(log n)", space: "O(1)" }, HEAP_INSERT_PSEUDO);
}

const HEAP_DELETE_PSEUDO = ["the max is the ROOT — take it out", "move the LAST leaf into the root hole", "sift-down: swap with the LARGER child", "  while a child is bigger", "// O(log n): one level per swap"];

function siftDownFrames(hb: HeapB, from: number, size: number, lines: number[]): void {
  let j = from;
  for (;;) {
    const l = 2 * j + 1;
    const r = 2 * j + 2;
    if (l >= size) break;
    let big = l;
    if (r < size && hb.heap[r].value > hb.heap[l].value) big = r;
    hb.states.set(hb.heap[big].id, "target");
    heapSnapshot(hb, `Larger child of index ${j}: ${hb.heap[big].value} at index ${big}.`, lines);
    if (hb.heap[big].value > hb.heap[j].value) {
      const jv = hb.heap[j].value;
      const t = hb.heap[j];
      hb.heap[j] = hb.heap[big];
      hb.heap[big] = t;
      heapSnapshot(hb, `${jv} < ${hb.heap[j].value} — SWAP; ${jv} sinks one level.`, lines);
      hb.states.set(hb.heap[j].id, "idle");
      j = big;
    } else {
      heapSnapshot(hb, `${hb.heap[j].value} ≥ both children — the heap rule is restored.`, lines);
      hb.states.set(hb.heap[big].id, "idle");
      break;
    }
  }
}

function heapDelete(hb: HeapB): TreesProgram {
  if (!hb.heap.length) {
    heapSnapshot(hb, "Heap is empty.", []);
    return heapDone(hb, "Heap Delete", { time: "O(log n)", space: "O(1)" }, HEAP_DELETE_PSEUDO);
  }
  const root = hb.heap[0];
  hb.states.set(root.id, "found");
  heapSnapshot(hb, `Delete-max: the maximum is ALWAYS the root (${root.value}) — that is the whole point of a max-heap.`, [1]);
  hb.states.set(root.id, "removing");
  heapSnapshot(hb, `Take ${root.value} out — leaving a hole at the root.`, [1]);
  const last = hb.heap.pop()!;
  if (hb.heap.length && last.id !== root.id) {
    hb.heap[0] = last;
    hb.states.delete(root.id);
    hb.states.set(last.id, "active");
    heapSnapshot(hb, `Fill the hole with the LAST leaf (${last.value}) — the only node that can move without breaking the complete shape. It is probably too small to be the root.`, [2]);
    siftDownFrames(hb, 0, hb.heap.length, [3, 4]);
  }
  hb.states.clear();
  heapSnapshot(hb, `Delete done — root removed, shape complete, rule restored. O(log n).`, [5], { message: { text: `EXTRACTED MAX ${root.value}`, tone: "ok" } });
  return heapDone(hb, "Heap Delete (extract max)", { time: "O(log n)", space: "O(1)" }, HEAP_DELETE_PSEUDO);
}

const HEAPIFY_PSEUDO = ["leaves are already valid 1-node heaps", "for i = last parent down to 0:", "  sift-down(i)", "// bottom-up build: O(n) total"];

function heapify(hb: HeapB): TreesProgram {
  heapSnapshot(hb, `Heapify: turn this ARBITRARY array into a max-heap in place. Key insight: every leaf is already a valid heap — only the parents need fixing, bottom-up.`, [1]);
  const n = hb.heap.length;
  for (let i = (n - 2) >> 1; i >= 0; i--) {
    hb.states.set(hb.heap[i].id, "active");
    heapSnapshot(hb, `sift-down(index ${i}): both subtrees below it are already heaps, so one sift-down makes THIS subtree a heap too.`, [2, 3]);
    siftDownFrames(hb, i, n, [3]);
    hb.states.clear();
  }
  heapSnapshot(hb, `Every subtree is a heap — done. Bottom-up building costs O(n), not O(n log n): most nodes live near the bottom and barely sift.`, [4], {
    message: { text: "HEAP BUILT ✓", tone: "ok" },
  });
  return heapDone(hb, "Heapify (build heap)", { time: "O(n)", space: "O(1)" }, HEAPIFY_PSEUDO);
}

const HEAPSORT_PSEUDO = ["heapify the array — O(n)", "repeat until one item left:", "  swap root (max) with the last heap item", "  shrink the heap by one (it's sorted now)", "  sift-down the new root", "// total O(n log n), in place"];

function heapSort(hb: HeapB): TreesProgram {
  heapSnapshot(hb, `Heap sort: build a max-heap, then repeatedly send the max to the end. The sorted region grows from the right of the array.`, [1]);
  const n = hb.heap.length;
  for (let i = (n - 2) >> 1; i >= 0; i--) {
    let j = i;
    for (;;) {
      const l = 2 * j + 1,
        r = 2 * j + 2;
      if (l >= n) break;
      let big = l;
      if (r < n && hb.heap[r].value > hb.heap[l].value) big = r;
      if (hb.heap[big].value > hb.heap[j].value) {
        const t = hb.heap[j];
        hb.heap[j] = hb.heap[big];
        hb.heap[big] = t;
        j = big;
      } else break;
    }
  }
  heapSnapshot(hb, `Heapified (the O(n) bottom-up build — see the Heapify page). The max, ${hb.heap[0].value}, sits at the root.`, [1]);

  let size = n;
  while (size > 1) {
    const mx = hb.heap[0];
    hb.states.set(mx.id, "found");
    hb.states.set(hb.heap[size - 1].id, "target");
    heapSnapshot(hb, `Root ${mx.value} is the largest remaining value — swap it with the LAST heap item (${hb.heap[size - 1].value}) so it lands in its final sorted position.`, [2, 3]);
    const t = hb.heap[0];
    hb.heap[0] = hb.heap[size - 1];
    hb.heap[size - 1] = t;
    size -= 1;
    hb.sorted.unshift(chipOf(String(mx.value), "matched"));
    const gone = hb.heap.splice(size, 1)[0];
    hb.states.delete(gone.id);
    if (hb.heap.length) hb.states.set(hb.heap[0].id, "active");
    heapSnapshot(hb, `${mx.value} leaves the heap for the sorted region. The new root came from the bottom — sift it down.`, [4]);
    siftDownFrames(hb, 0, size, [5]);
    hb.states.clear();
  }
  if (hb.heap.length) {
    hb.sorted.unshift(chipOf(String(hb.heap[0].value), "matched"));
    hb.heap.splice(0, 1);
  }
  heapSnapshot(hb, `Sorted: ${hb.sorted.map((c) => c.text).join(", ")}. n extract-max operations at O(log n) each → O(n log n), in place, no worst case.`, [6], {
    message: { text: hb.sorted.map((c) => c.text).join(" "), tone: "ok" },
  });
  return heapDone(hb, "Heap Sort", { time: "O(n log n)", space: "O(1)" }, HEAPSORT_PSEUDO);
}

// --- Trie -----------------------------------------------------------------------------

interface TrieN {
  id: string;
  ch: string;
  children: Map<string, TrieN>;
  end: boolean;
}

interface TrieB {
  steps: TreesStep[];
  root: TrieN;
  seq: number;
  states: Map<string, SQCellState>;
  edgeStates: Map<string, TreeVEdge["state"]>;
}

function trieSnapshot(tb: TrieB, description: string, codeLines?: number[], opts: { message?: TreesStep["message"] } = {}): void {
  const nodes: TreeVNode[] = [];
  const edges: TreeVEdge[] = [];
  let x = 0;
  let maxD = 0;
  const walk = (n: TrieN, d: number): number => {
    maxD = Math.max(maxD, d);
    const kids = [...n.children.values()];
    let myX: number;
    if (!kids.length) myX = x++;
    else {
      const xs = kids.map((k) => walk(k, d + 1));
      myX = (Math.min(...xs) + Math.max(...xs)) / 2;
    }
    nodes.push({ id: n.id, label: n.ch || "•", x: myX, y: d, state: tb.states.get(n.id) ?? "idle", ring: n.end });
    for (const k of kids) edges.push({ from: n.id, to: k.id, state: tb.edgeStates.get(`${n.id}>${k.id}`) ?? "idle" });
    return myX;
  };
  walk(tb.root, 0);
  tb.steps.push({
    nodes,
    edges,
    gridW: Math.max(1, x - 1),
    gridH: Math.max(1, maxD),
    message: opts.message,
    description,
    codeLines,
  });
}

function makeTrie(words: string[]): TrieB {
  const tb: TrieB = { steps: [], root: { id: "tr-0", ch: "", children: new Map(), end: false }, seq: 1, states: new Map(), edgeStates: new Map() };
  for (const w of words) {
    let n = tb.root;
    for (const c of w.toLowerCase()) {
      if (!n.children.has(c)) n.children.set(c, { id: `tr-${tb.seq++}`, ch: c, children: new Map(), end: false });
      n = n.children.get(c)!;
    }
    n.end = true;
  }
  return tb;
}

function trieDone(tb: TrieB, title: string, pseudo: string[]): TreesProgram {
  return { steps: tb.steps, complexity: { time: "O(L)", space: "O(L)" }, pseudocode: pseudo, title };
}

const TRIE_INSERT_PSEUDO = ["node = root", "for each letter of the word:", "  no edge for it? create a node", "  follow the edge down", "mark the last node END-OF-WORD (ring)"];

function trieInsert(tb: TrieB, word: string): TreesProgram {
  const w = word.toLowerCase().replace(/[^a-z]/g, "") || "cart";
  trieSnapshot(tb, `Insert "${w}". A trie stores words as PATHS — one letter per edge; words with the same prefix share the same nodes. Rings mark where a word ends.`, [1]);
  let n = tb.root;
  tb.states.set(n.id, "active");
  for (const c of w) {
    const existing = n.children.get(c);
    if (existing) {
      tb.states.set(n.id, "visited");
      tb.states.set(existing.id, "active");
      tb.edgeStates.set(`${n.id}>${existing.id}`, "active");
      trieSnapshot(tb, `'${c}' already exists on this path — a shared prefix costs nothing new. Follow it down.`, [2, 4]);
      n = existing;
    } else {
      const node: TrieN = { id: `tr-${tb.seq++}`, ch: c, children: new Map(), end: false };
      n.children.set(c, node);
      tb.states.set(n.id, "visited");
      tb.states.set(node.id, "new");
      tb.edgeStates.set(`${n.id}>${node.id}`, "new");
      trieSnapshot(tb, `No edge labelled '${c}' from here — create a new node and descend into it.`, [3, 4]);
      n = node;
    }
  }
  n.end = true;
  tb.states.set(n.id, "found");
  trieSnapshot(tb, `Mark the final node END-OF-WORD (the ring). Without it "${w}" would only be a prefix on the way to longer words, not a stored word.`, [5], {
    message: { text: `INSERTED "${w}"`, tone: "ok" },
  });
  return trieDone(tb, `Trie Insert "${w}"`, TRIE_INSERT_PSEUDO);
}

const TRIE_SEARCH_PSEUDO = ["node = root", "for each letter:", "  no edge for it → NOT FOUND ✗", "  follow the edge", "found ⇔ the last node has the END ring"];

function trieSearch(tb: TrieB, word: string): TreesProgram {
  const w = word.toLowerCase().replace(/[^a-z]/g, "") || "car";
  trieSnapshot(tb, `Search "${w}": follow the letter path from the root. Cost = O(word length) — no matter how many thousands of words are stored.`, [1]);
  let n = tb.root;
  for (const c of w) {
    const next = n.children.get(c);
    if (!next) {
      tb.states.set(n.id, "removing");
      trieSnapshot(tb, `No edge labelled '${c}' from here — the path breaks, so "${w}" cannot be in the trie.`, [3], {
        message: { text: `"${w}" NOT FOUND`, tone: "error" },
      });
      return trieDone(tb, `Trie Search "${w}"`, TRIE_SEARCH_PSEUDO);
    }
    tb.states.set(n.id, "visited");
    tb.states.set(next.id, "active");
    tb.edgeStates.set(`${n.id}>${next.id}`, "active");
    trieSnapshot(tb, `Edge '${c}' exists — follow it.`, [2, 4]);
    n = next;
  }
  if (n.end) {
    tb.states.set(n.id, "found");
    trieSnapshot(tb, `The whole path exists AND the last node has the END ring — "${w}" is a stored word. ✓`, [5], {
      message: { text: `FOUND "${w}"`, tone: "ok" },
    });
  } else {
    tb.states.set(n.id, "target");
    trieSnapshot(tb, `The path exists but there is NO ring here — "${w}" is only a prefix of longer words (like "${w}…"), not a stored word itself. This is the classic trie gotcha.`, [5], {
      message: { text: `"${w}" IS ONLY A PREFIX`, tone: "error" },
    });
  }
  return trieDone(tb, `Trie Search "${w}"`, TRIE_SEARCH_PSEUDO);
}

const TRIE_DELETE_PSEUDO = ["walk the word's path (it must exist)", "remove the END ring on the last node", "climb back up: while a node has", "  no children and no ring — prune it", "stop at the first shared node"];

function trieDelete(tb: TrieB, word: string): TreesProgram {
  const w = word.toLowerCase().replace(/[^a-z]/g, "") || "card";
  trieSnapshot(tb, `Delete "${w}": un-mark its end ring, then prune the letters no other word needs — and ONLY those.`, [1]);
  const path: TrieN[] = [tb.root];
  let n = tb.root;
  for (const c of w) {
    const next = n.children.get(c);
    if (!next) {
      tb.states.set(n.id, "removing");
      trieSnapshot(tb, `"${w}" is not in the trie — nothing to delete.`, [1], { message: { text: "NOT FOUND", tone: "error" } });
      return trieDone(tb, `Trie Delete "${w}"`, TRIE_DELETE_PSEUDO);
    }
    tb.states.set(next.id, "active");
    n = next;
    path.push(n);
  }
  trieSnapshot(tb, `Path found — every letter of "${w}" exists.`, [1]);
  if (!n.end) {
    tb.states.set(n.id, "target");
    trieSnapshot(tb, `The last node has no END ring — "${w}" was never a stored word, only a prefix.`, [2], { message: { text: "NOT A STORED WORD", tone: "error" } });
    return trieDone(tb, `Trie Delete "${w}"`, TRIE_DELETE_PSEUDO);
  }
  n.end = false;
  tb.states.set(n.id, "target");
  trieSnapshot(tb, `Remove the END ring — "${w}" is no longer a word. Its letters may still serve other words, so don't delete nodes yet.`, [2]);

  for (let i = path.length - 1; i >= 1; i--) {
    const node = path[i];
    const parent = path[i - 1];
    if (node.children.size === 0 && !node.end) {
      tb.states.set(node.id, "removing");
      trieSnapshot(tb, `'${node.ch}' now has no children and no ring — no word needs it any more. Prune it.`, [3, 4]);
      parent.children.delete(node.ch);
      tb.states.delete(node.id);
    } else {
      tb.states.set(node.id, "found");
      trieSnapshot(tb, `'${node.ch}' is still ${node.end ? "the end of another word" : "on the path of other words"} — stop pruning. Shared prefixes survive.`, [5]);
      break;
    }
  }
  tb.states.clear();
  trieSnapshot(tb, `Delete complete.`, [], { message: { text: `DELETED "${w}"`, tone: "ok" } });
  return trieDone(tb, `Trie Delete "${w}"`, TRIE_DELETE_PSEUDO);
}

// --- Dispatch ----------------------------------------------------------------------------

export interface TreeRunParams {
  value?: number;
  text?: string;
  words?: string[];
}

const DEFAULT_BT = [1, 2, 3, 4, 5, 6, 7];
const DEFAULT_BST = [50, 30, 70, 20, 40, 60, 80];
const DEFAULT_WORDS = ["cat", "car", "card", "dog"];

export function runTreeOperation(
  op: TreesOperationId,
  values: number[],
  params: TreeRunParams = {},
): TreesProgram {
  const value = params.value ?? 0;
  const text = params.text ?? "";
  const vals = values.length ? values.slice(0, 15) : op.startsWith("bst") || op.startsWith("avl") ? DEFAULT_BST : DEFAULT_BT;

  if (op === "trieInsert" || op === "trieSearch" || op === "trieDelete") {
    const words = params.words?.length ? params.words : DEFAULT_WORDS;
    const tb = makeTrie(words);
    if (op === "trieInsert") return trieInsert(tb, text || "cart");
    if (op === "trieSearch") return trieSearch(tb, text || "car");
    return trieDelete(tb, text || "card");
  }

  if (op === "heapInsert" || op === "heapDelete" || op === "heapify" || op === "heapSort") {
    const hb = makeHeapB(vals, op === "heapInsert" || op === "heapDelete");
    if (op === "heapInsert") return heapInsert(hb, value || 85);
    if (op === "heapDelete") return heapDelete(hb);
    if (op === "heapify") return heapify(hb);
    return heapSort(hb);
  }

  const b = newBuilder();

  switch (op) {
    case "btInorder":
      seedComplete(b, vals);
      return recTraverse(b, "in", "In-order Traversal");
    case "btPreorder":
      seedComplete(b, vals);
      return recTraverse(b, "pre", "Pre-order Traversal");
    case "btPostorder":
      seedComplete(b, vals);
      return recTraverse(b, "post", "Post-order Traversal");
    case "btLevelOrder":
      seedComplete(b, vals);
      return levelOrder(b);
    case "btInsert":
      seedComplete(b, vals);
      return btInsert(b, value || 8);
    case "btDelete":
      seedComplete(b, vals);
      return btDelete(b, value || 3);
    case "bstTraversal":
      seedBST(b, vals);
      return recTraverse(b, "in", "BST In-order Traversal", true);
    case "bstSearch":
      seedBST(b, vals);
      return bstSearch(b, value || 40);
    case "bstInsert":
      seedBST(b, vals);
      return bstInsert(b, value || 45);
    case "bstDelete":
      seedBST(b, vals);
      return bstDelete(b, value || 30);
    case "avlInsert":
      seedAVL(b, vals);
      return avlInsert(b, value || 5);
    case "avlDelete":
      seedAVL(b, vals);
      return avlDelete(b, value || 70);
    case "avlRotLL":
      seedAVL(b, [30, 20]);
      return avlInsert(b, value || 10, "LL Rotation (single right)", ROT_PSEUDO.LL);
    case "avlRotRR":
      seedAVL(b, [10, 20]);
      return avlInsert(b, value || 30, "RR Rotation (single left)", ROT_PSEUDO.RR);
    case "avlRotLR":
      seedAVL(b, [30, 10]);
      return avlInsert(b, value || 20, "LR Rotation (left–right)", ROT_PSEUDO.LR);
    case "avlRotRL":
      seedAVL(b, [10, 30]);
      return avlInsert(b, value || 20, "RL Rotation (right–left)", ROT_PSEUDO.RL);
    default:
      seedComplete(b, vals);
      return recTraverse(b, "in", "In-order Traversal");
  }
}

export interface TreeOperationMeta {
  id: TreesOperationId;
  label: string;
  icon: string;
  params: ("value" | "text")[];
  hint: string;
}

export const TREE_OPERATIONS: TreeOperationMeta[] = [
  { id: "btInorder", label: "In-order", icon: "swap_horiz", params: [], hint: "Left → Node → Right." },
  { id: "btPreorder", label: "Pre-order", icon: "first_page", params: [], hint: "Node → Left → Right." },
  { id: "btPostorder", label: "Post-order", icon: "last_page", params: [], hint: "Left → Right → Node." },
  { id: "btLevelOrder", label: "Level order", icon: "reorder", params: [], hint: "Top → bottom, using a queue." },
  { id: "btInsert", label: "Insert", icon: "add_box", params: ["value"], hint: "Fill the first free spot (level-order)." },
  { id: "btDelete", label: "Delete", icon: "delete", params: ["value"], hint: "Overwrite with the deepest node; remove it." },
  { id: "bstTraversal", label: "Traversal", icon: "swap_horiz", params: [], hint: "In-order on a BST = sorted output." },
  { id: "bstSearch", label: "Search", icon: "search", params: ["value"], hint: "Discard half the tree per comparison." },
  { id: "bstInsert", label: "Insert", icon: "add_box", params: ["value"], hint: "Walk like a search; attach at the NULL." },
  { id: "bstDelete", label: "Delete", icon: "delete", params: ["value"], hint: "Leaf / one child / two children (successor)." },
  { id: "avlInsert", label: "Insert", icon: "add_box", params: ["value"], hint: "BST insert + rotations keep |bf| ≤ 1." },
  { id: "avlDelete", label: "Delete", icon: "delete", params: ["value"], hint: "BST delete + rebalance on the way up." },
  { id: "avlRotLL", label: "LL Rotation", icon: "rotate_right", params: ["value"], hint: "Left-left case → one right rotation." },
  { id: "avlRotRR", label: "RR Rotation", icon: "rotate_left", params: ["value"], hint: "Right-right case → one left rotation." },
  { id: "avlRotLR", label: "LR Rotation", icon: "sync", params: ["value"], hint: "Zig-zag: rotate child, then pivot." },
  { id: "avlRotRL", label: "RL Rotation", icon: "sync", params: ["value"], hint: "Zig-zag: rotate child, then pivot." },
  { id: "heapInsert", label: "Insert", icon: "add_box", params: ["value"], hint: "Append at the end, then sift up." },
  { id: "heapDelete", label: "Delete Max", icon: "remove", params: [], hint: "Take the root; last leaf sifts down." },
  { id: "heapify", label: "Heapify", icon: "construction", params: [], hint: "Bottom-up build — O(n) total." },
  { id: "heapSort", label: "Heap Sort", icon: "sort", params: [], hint: "Extract max n times → sorted." },
  { id: "trieInsert", label: "Insert", icon: "add_box", params: ["text"], hint: "Create the letter path; ring the end." },
  { id: "trieSearch", label: "Search", icon: "search", params: ["text"], hint: "Follow letters; found ⇔ end ring." },
  { id: "trieDelete", label: "Delete", icon: "delete", params: ["text"], hint: "Un-ring, then prune unused letters." },
];
