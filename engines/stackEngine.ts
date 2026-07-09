// ---------------------------------------------------------------------------
// Stack engine — LIFO compiler
//
// Compiles each stack operation into a StackProgram: a flat list of frames,
// every frame a snapshot of the cells (bottom→top) + the TOP pointer + token
// strips + narration + pseudocode lines. Follows the linked-list engine's
// granular style: one pointer/index change per frame, `rewired` marks what
// changed ("TOP" = the top box), `floating` lifts a cell out of the container
// while it is being pushed in or after it is popped.
//
// Two modes share the frame shape: "array" (fixed capacity, numeric top
// index; a pop leaves the old value in memory, dimmed — the array doesn't
// erase) and "list" (linked nodes with addresses; push/pop rewire pointers
// exactly like insert/delete at the head of a linked list).
// ---------------------------------------------------------------------------

import type {
  Complexity,
  StackCell,
  StackMode,
  StackOperationId,
  StackProgram,
  StackStep,
  TokenChip,
} from "@/types/visualization";

interface Builder {
  steps: StackStep[];
  cells: StackCell[]; // bottom → top
  mode: StackMode;
  capacity: number;
  top: number; // array mode index (−1 empty)
  topId: string | null; // list mode
  tokens?: TokenChip[];
  output?: TokenChip[];
  seq: number;
}

// Same varied-but-stable fake addresses as the linked-list engine.
const ADDR_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
function addrFor(seq: number): string {
  const a = ADDR_LETTERS[(seq * 7 + 4) % ADDR_LETTERS.length];
  const b = ADDR_LETTERS[(seq * 5 + 9) % ADDR_LETTERS.length];
  return a + b;
}

function makeCell(b: Builder, label: string, note?: string): StackCell {
  const s = b.seq++;
  return {
    id: `st-${s}`,
    label,
    addr: b.mode === "list" ? addrFor(s) : undefined,
    next: b.mode === "list" ? null : undefined,
    state: "idle",
    note,
  };
}

function snapshot(
  b: Builder,
  description: string,
  codeLines?: number[],
  opts: { rewired?: string[]; message?: StackStep["message"] } = {},
): void {
  b.steps.push({
    cells: b.cells.map((c) => ({ ...c })),
    mode: b.mode,
    capacity: b.mode === "array" && b.capacity > 0 ? b.capacity : undefined,
    top: b.top,
    topId: b.topId,
    tokens: b.tokens?.map((t) => ({ ...t })),
    output: b.output?.map((t) => ({ ...t })),
    message: opts.message,
    description,
    codeLines,
    rewired: opts.rewired,
  });
}

function clearStates(b: Builder): void {
  b.cells.forEach((c) => {
    if (!c.floating) c.state = "idle";
  });
}

function done(b: Builder, title: string, complexity: Complexity, pseudocode: string[]): StackProgram {
  return { steps: b.steps, complexity, pseudocode, title, mode: b.mode };
}

/** Seed the builder with initial contents (bottom → top). */
function buildBase(b: Builder, values: (number | string)[]): void {
  b.cells = values.map((v) => makeCell(b, String(v)));
  if (b.mode === "list") {
    // next points DOWNWARD (toward the bottom / NULL); top is the last cell.
    b.cells.forEach((c, i) => (c.next = i > 0 ? b.cells[i - 1].id : null));
    b.topId = b.cells.length ? b.cells[b.cells.length - 1].id : null;
  }
  b.top = b.cells.length - 1;
}

const cellById = (b: Builder, id: string | null | undefined) =>
  id ? b.cells.find((c) => c.id === id) : undefined;

// --- Array implementation ----------------------------------------------------

const PUSH_PSEUDO = [
  "if top == capacity − 1:",
  "  report OVERFLOW; stop",
  "top = top + 1",
  "stack[top] = value",
];

function push(b: Builder, value: number): StackProgram {
  snapshot(b, `Push ${value}. First check for space: top = ${b.top}, capacity − 1 = ${b.capacity - 1}.`, [1]);

  if (b.top >= b.capacity - 1) {
    b.cells.forEach((c) => (c.state = "removing"));
    snapshot(b, `top == capacity − 1: every slot is occupied. Pushing now would write past the array — OVERFLOW.`, [2], {
      message: { text: "STACK OVERFLOW", tone: "error" },
    });
    return done(b, "Push (overflow)", { time: "O(1)", space: "O(1)" }, PUSH_PSEUDO);
  }

  snapshot(b, `top (${b.top}) < capacity − 1 — there is room. Slot ${b.top + 1} is free.`, [1]);

  // top = top + 1 — the TOP box changes before the value lands.
  b.top += 1;
  snapshot(b, `top = top + 1: the TOP box changes from ${b.top - 1} to ${b.top}. It now points at the empty slot the value will occupy.`, [3], { rewired: ["TOP"] });

  // The value arrives above the opening, then drops in.
  const cell = makeCell(b, String(value));
  cell.state = "new";
  cell.floating = true;
  b.cells.push(cell);
  snapshot(b, `The value ${value} arrives at the opening of the stack — it can only enter from the top.`, [4], { rewired: [cell.id] });

  cell.floating = false;
  snapshot(b, `stack[top] = value: ${value} is written into slot ${b.top}.`, [4], { rewired: [cell.id] });

  cell.state = "idle";
  snapshot(b, `Push complete — ${value} is the new top. No shifting, no walking: O(1).`, [], {
    message: { text: `PUSHED ${value}`, tone: "ok" },
  });
  return done(b, "Push (array)", { time: "O(1)", space: "O(1)" }, PUSH_PSEUDO);
}

const POP_PSEUDO = [
  "if top == −1:",
  "  report UNDERFLOW; stop",
  "value = stack[top]",
  "top = top − 1",
];

function pop(b: Builder): StackProgram {
  snapshot(b, `Pop. First check the stack isn't empty: top = ${b.top}.`, [1]);

  if (b.top < 0) {
    snapshot(b, `top == −1: there is nothing to pop — UNDERFLOW.`, [2], {
      message: { text: "STACK UNDERFLOW", tone: "error" },
    });
    return done(b, "Pop (underflow)", { time: "O(1)", space: "O(1)" }, POP_PSEUDO);
  }

  const cell = b.cells[b.top];
  cell.state = "active";
  snapshot(b, `value = stack[top]: read ${cell.label} out of slot ${b.top}. Only the top is reachable — that is the whole LIFO contract.`, [3]);

  // top = top − 1 — the value is NOT erased, just abandoned.
  b.top -= 1;
  cell.state = "visited";
  snapshot(b, `top = top − 1: the TOP box changes from ${b.top + 1} to ${b.top}. Note that ${cell.label} is still sitting in memory — the array never erases it; it is simply above the top now, and the next push will overwrite it.`, [4], { rewired: ["TOP"] });

  snapshot(b, `Pop complete — returned ${cell.label}. O(1).`, [], {
    message: { text: `POPPED ${cell.label}`, tone: "ok" },
  });
  return done(b, "Pop (array)", { time: "O(1)", space: "O(1)" }, POP_PSEUDO);
}

const PEEK_PSEUDO = ["if top == −1:", "  report EMPTY; stop", "return stack[top]   // do not move top"];

function peek(b: Builder): StackProgram {
  snapshot(b, `Peek. Check the stack isn't empty: top = ${b.top}.`, [1]);
  if (b.top < 0) {
    snapshot(b, "top == −1: an empty stack has no top to look at.", [2], {
      message: { text: "STACK EMPTY", tone: "error" },
    });
    return done(b, "Peek (empty)", { time: "O(1)", space: "O(1)" }, PEEK_PSEUDO);
  }
  const cell = b.cells[b.top];
  cell.state = "found";
  snapshot(b, `return stack[top]: the top value is ${cell.label}. Unlike pop, top does not move — the stack is left untouched.`, [3], {
    message: { text: `TOP = ${cell.label}`, tone: "ok" },
  });
  return done(b, "Peek (array)", { time: "O(1)", space: "O(1)" }, PEEK_PSEUDO);
}

const OVF_PSEUDO = [
  "push(v):",
  "  if top == capacity − 1 → OVERFLOW",
  "pop():",
  "  if top == −1 → UNDERFLOW",
];

function overflowUnderflow(b: Builder, value: number): StackProgram {
  snapshot(b, `A fixed-size stack fails in two ways. Watch both: capacity = ${b.capacity}, top = ${b.top}.`, []);

  // Fill the remaining slots.
  let v = value;
  while (b.top < b.capacity - 1) {
    b.top += 1;
    const cell = makeCell(b, String(v));
    cell.state = "new";
    b.cells.push(cell);
    snapshot(b, `push(${v}): top < capacity − 1, so it fits — top becomes ${b.top}.`, [1, 2], { rewired: ["TOP", cell.id] });
    cell.state = "idle";
    v += 10;
  }

  // One more push → overflow.
  b.cells.forEach((c) => (c.state = "target"));
  snapshot(b, `push(${v}): now top == capacity − 1 (${b.top}). There is no slot ${b.top + 1} — writing there would corrupt memory beyond the array.`, [2], {
    message: { text: "STACK OVERFLOW", tone: "error" },
  });
  clearStates(b);

  // Pop everything.
  while (b.top >= 0) {
    const cell = b.cells[b.top];
    cell.state = "visited";
    b.top -= 1;
    snapshot(b, `pop(): returns ${cell.label}; top drops to ${b.top}. The value stays in memory, abandoned above the top.`, [3], { rewired: ["TOP"] });
  }

  // One more pop → underflow.
  snapshot(b, `pop(): top == −1 — there is nothing left to return. UNDERFLOW.`, [4], {
    message: { text: "STACK UNDERFLOW", tone: "error" },
  });
  snapshot(b, "Every push/pop must be guarded by these two checks — they are the boundary conditions of a fixed-size stack.", []);
  return done(b, "Overflow & Underflow", { time: "O(1)", space: "O(1)" }, OVF_PSEUDO);
}

// --- Linked-list implementation ---------------------------------------------
// Push = insert at head; pop = delete at head. TOP is an address box, and the
// frames rewire pointers one at a time, exactly like the linked-list canvas.

const LL_PUSH_PSEUDO = ["node = new Node(value)", "node.next = top", "top = node"];

function llPush(b: Builder, value: number): StackProgram {
  const oldTop = cellById(b, b.topId);
  snapshot(
    b,
    oldTop
      ? `Push ${value}. The TOP box stores @${oldTop.addr} — the address of ${oldTop.label}.`
      : `Push ${value} onto an empty stack. The TOP box stores NULL.`,
    [],
  );

  const node = makeCell(b, String(value));
  node.state = "new";
  node.floating = true;
  node.next = null;
  b.cells.push(node); // takes the visual top slot, but nothing points to it yet
  snapshot(b, `Allocate a new node at @${node.addr} holding ${value}. Its next is NULL — it is not part of the stack yet.`, [1], { rewired: [node.id] });

  if (oldTop) {
    node.next = oldTop.id;
    snapshot(b, `node.next = top: the new node's next cell copies @${oldTop.addr} out of the TOP box, so it now links down to ${oldTop.label}. TOP itself still points at the old node.`, [2], { rewired: [node.id] });
  }

  b.topId = node.id;
  b.top = b.cells.length - 1;
  node.floating = false;
  snapshot(b, oldTop
    ? `top = node: the TOP box is overwritten — @${oldTop.addr} is replaced by @${node.addr}. The node settles in as the new top.`
    : `top = node: the TOP box now stores @${node.addr}.`, [3], { rewired: ["TOP"] });

  node.state = "idle";
  snapshot(b, `Push complete — no capacity limit, no shifting: O(1) with one allocation.`, [], {
    message: { text: `PUSHED ${value}`, tone: "ok" },
  });
  return done(b, "Push (linked list)", { time: "O(1)", space: "O(1)" }, LL_PUSH_PSEUDO);
}

const LL_POP_PSEUDO = ["if top == NULL:", "  report UNDERFLOW; stop", "curr = top", "top = top.next", "free(curr)"];

function llPop(b: Builder): StackProgram {
  snapshot(b, `Pop. Check the stack isn't empty first.`, [1]);
  const old = cellById(b, b.topId);
  if (!old) {
    snapshot(b, "top == NULL — nothing to pop. UNDERFLOW.", [2], {
      message: { text: "STACK UNDERFLOW", tone: "error" },
    });
    return done(b, "Pop (underflow)", { time: "O(1)", space: "O(1)" }, LL_POP_PSEUDO);
  }

  old.state = "removing";
  snapshot(b, `curr = top: hold on to @${old.addr} (${old.label}) — once TOP moves on, this handle is the only way to free it.`, [3]);

  const below = cellById(b, old.next);
  b.topId = below?.id ?? null;
  b.top = b.cells.length - 2;
  snapshot(b, below
    ? `top = top.next: the TOP box is overwritten — @${old.addr} is replaced by @${below.addr}. The stack no longer reaches the old node.`
    : `top = top.next: the TOP box becomes NULL — the stack is about to be empty.`, [4], { rewired: ["TOP"] });

  old.floating = true;
  old.next = null;
  snapshot(b, `free(curr): the node detaches and its memory at @${old.addr} is released.`, [5], { rewired: [old.id] });

  b.cells.pop();
  snapshot(b, below ? `Pop complete — returned ${old.label}; ${below.label} is the new top.` : `Pop complete — the stack is empty.`, [], {
    message: { text: `POPPED ${old.label}`, tone: "ok" },
  });
  return done(b, "Pop (linked list)", { time: "O(1)", space: "O(1)" }, LL_POP_PSEUDO);
}

const LL_PEEK_PSEUDO = ["if top == NULL:", "  report EMPTY; stop", "return top.data   // top does not move"];

function llPeek(b: Builder): StackProgram {
  snapshot(b, "Peek. Check the stack isn't empty.", [1]);
  const topCell = cellById(b, b.topId);
  if (!topCell) {
    snapshot(b, "top == NULL — nothing to look at.", [2], { message: { text: "STACK EMPTY", tone: "error" } });
    return done(b, "Peek (empty)", { time: "O(1)", space: "O(1)" }, LL_PEEK_PSEUDO);
  }
  topCell.state = "found";
  snapshot(b, `return top.data: follow the TOP box to @${topCell.addr} and read ${topCell.label}. No pointer changes.`, [3], {
    message: { text: `TOP = ${topCell.label}`, tone: "ok" },
  });
  return done(b, "Peek (linked list)", { time: "O(1)", space: "O(1)" }, LL_PEEK_PSEUDO);
}

// --- Applications -------------------------------------------------------------

const OPENERS = "([{";
const CLOSERS = ")]}";
const MATCH: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

const PARENS_PSEUDO = [
  "for each ch in expr:",
  "  if ch is an opener ( [ { : push(ch)",
  "  else (a closer):",
  "    if stack empty or top ≠ its partner → ✗",
  "    pop the matching opener",
  "balanced ⇔ stack empty at the end",
];

function balancedParens(b: Builder, expr: string): StackProgram {
  const chars = expr.replace(/\s+/g, "").split("");
  b.tokens = chars.map((c) => ({ text: c, state: "pending" }));
  snapshot(b, `Scan "${chars.join("")}" left to right. Openers wait on the stack; each closer must match the most recent unclosed opener — exactly LIFO.`, [1]);

  let ok = true;
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    b.tokens[i].state = "active";

    if (OPENERS.includes(ch)) {
      snapshot(b, `'${ch}' is an opener — it starts a new bracket that must be closed later.`, [2]);
      const cell = makeCell(b, ch);
      cell.state = "new";
      b.cells.push(cell);
      b.top = b.cells.length - 1;
      snapshot(b, `push('${ch}'): the pending bracket goes on top of the stack.`, [2], { rewired: [cell.id, "TOP"] });
      cell.state = "idle";
      b.tokens[i].state = "done";
    } else if (CLOSERS.includes(ch)) {
      const need = MATCH[ch];
      const topCell = b.cells[b.cells.length - 1];
      if (!topCell) {
        b.tokens[i].state = "error";
        snapshot(b, `'${ch}' is a closer but the stack is empty — there is no opener for it to close. Not balanced.`, [4], {
          message: { text: "NOT BALANCED ✗", tone: "error" },
        });
        ok = false;
        break;
      }
      topCell.state = "target";
      snapshot(b, `'${ch}' is a closer — compare it with the top of the stack ('${topCell.label}').`, [3, 4]);
      if (topCell.label !== need) {
        topCell.state = "removing";
        b.tokens[i].state = "error";
        snapshot(b, `Top is '${topCell.label}' but '${ch}' needs '${need}' — the brackets interleave illegally. Not balanced.`, [4], {
          message: { text: "NOT BALANCED ✗", tone: "error" },
        });
        ok = false;
        break;
      }
      topCell.state = "found";
      b.tokens[i].state = "matched";
      snapshot(b, `'${topCell.label}' matches '${ch}' ✓ — pop it; that bracket pair is closed.`, [5]);
      b.cells.pop();
      b.top = b.cells.length - 1;
      snapshot(b, `pop(): the matched opener leaves the stack.`, [5], { rewired: ["TOP"] });
    } else {
      b.tokens[i].state = "done";
      snapshot(b, `'${ch}' is not a bracket — ignore it.`, [1]);
    }
  }

  if (ok) {
    if (b.cells.length === 0) {
      snapshot(b, "End of input and the stack is empty — every opener found its closer. Balanced ✓", [6], {
        message: { text: "BALANCED ✓", tone: "ok" },
      });
    } else {
      b.cells.forEach((c) => (c.state = "removing"));
      snapshot(b, `End of input but ${b.cells.length} opener(s) never closed — the stack is not empty. Not balanced.`, [6], {
        message: { text: "NOT BALANCED ✗", tone: "error" },
      });
    }
  }
  return done(b, "Balanced Parentheses", { time: "O(n)", space: "O(n)" }, PARENS_PSEUDO);
}

const PREC: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3 };

const IN2POST_PSEUDO = [
  "for each token:",
  "  operand → append to output",
  "  '(' → push it",
  "  ')' → pop to output until '('",
  "  operator → pop ops of ≥ precedence, then push",
  "pop everything left to output",
];

function infixToPostfix(b: Builder, expr: string): StackProgram {
  const chars = expr.replace(/\s+/g, "").split("");
  b.tokens = chars.map((c) => ({ text: c, state: "pending" }));
  b.output = [];
  snapshot(b, `Convert "${chars.join("")}" to postfix (shunting-yard). Operands stream to the output; operators wait on the stack until something of lower precedence forces them out.`, [1]);

  const popToOutput = (why: string, lines: number[]) => {
    const cell = b.cells.pop()!;
    b.top = b.cells.length - 1;
    b.output!.push({ text: cell.label, state: "done" });
    snapshot(b, why, lines, { rewired: ["TOP"] });
  };

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    b.tokens[i].state = "active";

    if (/[a-zA-Z0-9]/.test(ch)) {
      b.output.push({ text: ch, state: "done" });
      snapshot(b, `'${ch}' is an operand — operands never wait; append it straight to the output.`, [2]);
    } else if (ch === "(") {
      const cell = makeCell(b, ch);
      cell.state = "new";
      b.cells.push(cell);
      b.top = b.cells.length - 1;
      snapshot(b, `'(' opens a sub-expression — push it as a wall; nothing below it can be popped until ')' arrives.`, [3], { rewired: [cell.id, "TOP"] });
      cell.state = "idle";
    } else if (ch === ")") {
      snapshot(b, `')' closes the sub-expression — pop operators to the output until the matching '('.`, [4]);
      while (b.cells.length && b.cells[b.cells.length - 1].label !== "(") {
        const op = b.cells[b.cells.length - 1];
        op.state = "removing";
        popToOutput(`pop '${op.label}' to the output — it belonged inside the parentheses.`, [4]);
      }
      if (b.cells.length) {
        const paren = b.cells[b.cells.length - 1];
        paren.state = "removing";
        b.cells.pop();
        b.top = b.cells.length - 1;
        snapshot(b, `Discard the '(' — the parentheses did their job and never reach the output.`, [4], { rewired: ["TOP"] });
      }
    } else if (PREC[ch]) {
      // Pop operators with greater-or-equal precedence first.
      while (
        b.cells.length &&
        b.cells[b.cells.length - 1].label !== "(" &&
        (PREC[b.cells[b.cells.length - 1].label] ?? 0) >= PREC[ch]
      ) {
        const op = b.cells[b.cells.length - 1];
        op.state = "removing";
        popToOutput(`'${op.label}' (precedence ${PREC[op.label]}) ≥ '${ch}' (${PREC[ch]}) — it must be applied first, so pop it to the output.`, [5]);
      }
      const cell = makeCell(b, ch);
      cell.state = "new";
      b.cells.push(cell);
      b.top = b.cells.length - 1;
      snapshot(b, `push('${ch}') — it waits until an operator of lower precedence (or the end) flushes it.`, [5], { rewired: [cell.id, "TOP"] });
      cell.state = "idle";
    }
    b.tokens[i].state = "done";
  }

  while (b.cells.length) {
    const op = b.cells[b.cells.length - 1];
    op.state = "removing";
    popToOutput(`End of input — pop the remaining '${op.label}' to the output.`, [6]);
  }
  snapshot(b, `Done: postfix = ${b.output.map((t) => t.text).join(" ")}. Every operator now follows its operands — no parentheses needed.`, [6], {
    message: { text: b.output.map((t) => t.text).join(" "), tone: "ok" },
  });
  return done(b, "Infix → Postfix", { time: "O(n)", space: "O(n)" }, IN2POST_PSEUDO);
}

const POSTEVAL_PSEUDO = [
  "for each token:",
  "  number → push it",
  "  operator → b = pop, a = pop",
  "    push(a ⊕ b)",
  "result = the single value left",
];

function postfixEval(b: Builder, expr: string): StackProgram {
  const toks = expr.trim().split(/\s+/).filter(Boolean);
  b.tokens = toks.map((t) => ({ text: t, state: "pending" }));
  snapshot(b, `Evaluate the postfix expression "${toks.join(" ")}". Numbers wait on the stack; each operator consumes the two most recent values — LIFO again.`, [1]);

  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    b.tokens[i].state = "active";

    if (!Number.isNaN(parseFloat(t))) {
      const cell = makeCell(b, t);
      cell.state = "new";
      b.cells.push(cell);
      b.top = b.cells.length - 1;
      snapshot(b, `'${t}' is a number — push it and keep scanning.`, [2], { rewired: [cell.id, "TOP"] });
      cell.state = "idle";
    } else {
      if (b.cells.length < 2) {
        b.tokens[i].state = "error";
        snapshot(b, `'${t}' needs two operands but the stack has ${b.cells.length} — the expression is malformed.`, [3], {
          message: { text: "INVALID EXPRESSION", tone: "error" },
        });
        return done(b, "Postfix Evaluation", { time: "O(n)", space: "O(n)" }, POSTEVAL_PSEUDO);
      }
      const bCell = b.cells[b.cells.length - 1];
      const aCell = b.cells[b.cells.length - 2];
      bCell.state = "target";
      aCell.state = "target";
      snapshot(b, `'${t}' is an operator — pop the two most recent values: b = ${bCell.label}, a = ${aCell.label}. Order matters for − and /.`, [3]);
      const bv = parseFloat(bCell.label);
      const av = parseFloat(aCell.label);
      const r = t === "+" ? av + bv : t === "-" ? av - bv : t === "*" ? av * bv : t === "^" ? av ** bv : av / bv;
      const rStr = Number.isInteger(r) ? String(r) : r.toFixed(2);
      b.cells.pop();
      b.cells.pop();
      const cell = makeCell(b, rStr, `${av} ${t} ${bv}`);
      cell.state = "found";
      b.cells.push(cell);
      b.top = b.cells.length - 1;
      snapshot(b, `push(${av} ${t} ${bv} = ${rStr}): the result takes their place on the stack.`, [4], { rewired: [cell.id, "TOP"] });
      cell.state = "idle";
      cell.note = undefined;
      b.tokens[i].state = "matched";
    }
    if (b.tokens[i].state === "active") b.tokens[i].state = "done";
  }

  const result = b.cells[b.cells.length - 1];
  if (result) result.state = "found";
  snapshot(b, `End of input — the single value left on the stack is the answer: ${result?.label}.`, [5], {
    message: { text: `RESULT = ${result?.label}`, tone: "ok" },
  });
  return done(b, "Postfix Evaluation", { time: "O(n)", space: "O(n)" }, POSTEVAL_PSEUDO);
}

const RECURSION_PSEUDO = [
  "fact(n):",
  "  if n == 1: return 1",
  "  return n × fact(n − 1)",
];

function recursionStack(b: Builder, n: number): StackProgram {
  const N = Math.max(1, Math.min(n || 4, 7));
  snapshot(b, `Call fact(${N}). Every call gets a frame on the call stack; it cannot finish until the call above it returns — the machine's own use of LIFO.`, [1]);

  // Wind up: push a frame per call.
  for (let k = N; k >= 1; k--) {
    const cell = makeCell(b, `fact(${k})`, k > 1 ? `waits for fact(${k - 1})` : undefined);
    cell.state = "new";
    b.cells.push(cell);
    b.top = b.cells.length - 1;
    snapshot(
      b,
      k > 1
        ? `fact(${k}) starts, but needs fact(${k - 1}) before it can multiply — its frame stays on the stack, paused at line 3.`
        : `fact(1) is the base case — no further calls. The stack is at its deepest: ${b.cells.length} frames.`,
      k > 1 ? [1, 3] : [1, 2],
      { rewired: [cell.id, "TOP"] },
    );
    cell.state = "idle";
  }

  // Unwind: pop frames as calls return.
  let acc = 1;
  for (let k = 1; k <= N; k++) {
    const cell = b.cells[b.cells.length - 1];
    acc = acc * k;
    cell.state = "found";
    cell.note = `returns ${acc}`;
    snapshot(
      b,
      k === 1
        ? `fact(1) returns 1 — its frame pops off, and fact(2) can finally resume.`
        : `fact(${k}) resumes: ${k} × ${acc / k} = ${acc}. It returns ${acc} and its frame pops off.`,
      k === 1 ? [2] : [3],
    );
    b.cells.pop();
    b.top = b.cells.length - 1;
    snapshot(b, `Frame fact(${k}) removed — the stack unwinds in exactly the reverse order of the calls.`, [3], { rewired: ["TOP"] });
  }

  snapshot(b, `All frames returned: fact(${N}) = ${acc}. Deepest stack: ${N} frames — recursion depth is stack space, which is why infinite recursion overflows.`, [], {
    message: { text: `fact(${N}) = ${acc}`, tone: "ok" },
  });
  return done(b, `Recursion Stack — fact(${N})`, { time: "O(n)", space: "O(n)" }, RECURSION_PSEUDO);
}

// --- Dispatch -----------------------------------------------------------------

export interface StackRunParams {
  value?: number;
  text?: string;
  capacity?: number;
}

export function runStackOperation(
  op: StackOperationId,
  values: number[],
  params: StackRunParams = {},
): StackProgram {
  const isList = op === "llPush" || op === "llPop" || op === "llPeek";
  const isApp = op === "balancedParens" || op === "infixToPostfix" || op === "postfixEval" || op === "recursionStack";
  const b: Builder = {
    steps: [],
    cells: [],
    mode: isList ? "list" : "array",
    // Applications grow freely (capacity 0 = no fixed well drawn on the canvas).
    capacity: isApp ? 0 : Math.max(3, Math.min(params.capacity ?? 6, 10)),
    top: -1,
    topId: null,
    seq: 0,
  };
  const value = params.value ?? 0;
  const text = params.text ?? "";

  if (!isApp) buildBase(b, values);
  else b.top = -1; // applications start with an empty stack

  switch (op) {
    case "push":
      return push(b, value);
    case "pop":
      return pop(b);
    case "peek":
      return peek(b);
    case "overflowUnderflow":
      return overflowUnderflow(b, value || 50);
    case "llPush":
      return llPush(b, value);
    case "llPop":
      return llPop(b);
    case "llPeek":
      return llPeek(b);
    case "balancedParens":
      return balancedParens(b, text || "{[()()]}");
    case "infixToPostfix":
      return infixToPostfix(b, text || "a+b*(c-d)/e");
    case "postfixEval":
      return postfixEval(b, text || "5 3 + 8 2 - *");
    case "recursionStack":
      return recursionStack(b, value || 4);
    default:
      return peek(b);
  }
}

export interface StackOperationMeta {
  id: StackOperationId;
  label: string;
  icon: string;
  params: ("value" | "text")[];
  hint: string;
}

/** Registry used by the sidebar quick-tabs / param inputs. */
export const STACK_OPERATIONS: StackOperationMeta[] = [
  { id: "push", label: "Push", icon: "add_box", params: ["value"], hint: "Write value at top+1 — O(1)." },
  { id: "pop", label: "Pop", icon: "remove", params: [], hint: "Read stack[top], then top−− — O(1)." },
  { id: "peek", label: "Peek", icon: "visibility", params: [], hint: "Read the top without removing it." },
  { id: "overflowUnderflow", label: "Overflow/Underflow", icon: "warning", params: [], hint: "The two boundary failures of a fixed stack." },
  { id: "llPush", label: "Push", icon: "add_box", params: ["value"], hint: "New node → node.next = top → top = node." },
  { id: "llPop", label: "Pop", icon: "remove", params: [], hint: "top = top.next, then free the old node." },
  { id: "llPeek", label: "Peek", icon: "visibility", params: [], hint: "Follow TOP and read — no pointer changes." },
  { id: "balancedParens", label: "Balanced Parens", icon: "data_object", params: ["text"], hint: "Openers push; each closer must match the top." },
  { id: "infixToPostfix", label: "Infix → Postfix", icon: "swap_horiz", params: ["text"], hint: "Shunting-yard: operators wait by precedence." },
  { id: "postfixEval", label: "Postfix Eval", icon: "calculate", params: ["text"], hint: "Numbers push; operators pop two, push one." },
  { id: "recursionStack", label: "Recursion Stack", icon: "layers", params: ["value"], hint: "fact(n) frames wind up, then unwind (value = n)." },
];
