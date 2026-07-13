// ---------------------------------------------------------------------------
// Hashing engine — key → index compiler
//
// Compiles each hashing operation into a HashProgram: a flat list of frames,
// every frame a snapshot of the m slots + the worked-arithmetic panel + the
// incoming key chip + probe badges + narration + pseudocode lines.
//
// The design rule of this engine: NEVER jump to h(k) — every operation shows
// the actual calculation (quotient & remainder, k·A and its fraction, digit
// groups, the rolling hash char by char) one line per frame, so the hash
// function is something the learner computes along with, not a black box.
// ---------------------------------------------------------------------------

import type {
  Complexity,
  HashCalcLine,
  HashEntryVis,
  HashMode,
  HashOperationId,
  HashProbe,
  HashProgram,
  HashSlotVis,
  HashStep,
} from "@/types/visualization";

interface Builder {
  steps: HashStep[];
  slots: HashSlotVis[];
  mode: HashMode;
  m: number;
  calcTitle: string;
  calc: HashCalcLine[] | null;
  incoming: HashStep["incoming"] | null;
  probes: HashProbe[];
  showLoad: boolean;
  n: number; // stored entries
  seq: number;
}

function makeSlots(m: number): HashSlotVis[] {
  return Array.from({ length: m }, (_, index) => ({ index, state: "idle" as const, entries: [] }));
}

function makeBuilder(mode: HashMode, m: number): Builder {
  return {
    steps: [],
    slots: makeSlots(m),
    mode,
    m,
    calcTitle: "",
    calc: null,
    incoming: null,
    probes: [],
    showLoad: false,
    n: 0,
    seq: 0,
  };
}

function entry(b: Builder, key: string, state: HashEntryVis["state"] = "idle", note?: string): HashEntryVis {
  return { id: `he-${b.seq++}`, key, state, note };
}

function snapshot(
  b: Builder,
  description: string,
  codeLines?: number[],
  message?: HashStep["message"],
): void {
  b.steps.push({
    slots: b.slots.map((s) => ({ ...s, entries: s.entries.map((e) => ({ ...e })) })),
    calc: b.calc ? { title: b.calcTitle, lines: b.calc.map((l) => ({ ...l })) } : undefined,
    incoming: b.incoming ? { ...b.incoming } : undefined,
    probes: b.probes.length ? b.probes.map((p) => ({ ...p })) : undefined,
    load: b.showLoad ? { n: b.n, m: b.m } : undefined,
    message,
    description,
    codeLines,
  });
}

function clearStates(b: Builder): void {
  b.slots.forEach((s) => {
    s.state = "idle";
    s.entries.forEach((e) => {
      e.state = "idle";
      e.note = undefined;
    });
  });
  b.probes = [];
}

/** Start a fresh worked-arithmetic panel. */
function calcReset(b: Builder, title: string): void {
  b.calcTitle = title;
  b.calc = [];
}

/** Add a line to the panel; previous lines dim to "done". */
function calcLine(b: Builder, text: string): void {
  if (!b.calc) b.calc = [];
  b.calc.forEach((l) => (l.state = "done"));
  b.calc.push({ text, state: "active" });
}

function done(b: Builder, title: string, complexity: Complexity, pseudocode: string[]): HashProgram {
  return { steps: b.steps, complexity, pseudocode, title, mode: b.mode, m: b.m };
}

/** k mod m via explicit quotient/remainder — the numbers the calc panel shows. */
function divmod(k: number, m: number): { q: number; r: number } {
  const q = Math.floor(k / m);
  return { q, r: k - q * m };
}

/** Silently pre-fill a chaining table (insert at head, no frames). */
function prefill(b: Builder, keys: number[]): void {
  keys.forEach((k) => {
    const { r } = divmod(k, b.m);
    b.slots[r].entries.unshift(entry(b, String(k)));
    b.n += 1;
  });
}

// --- Hash functions ----------------------------------------------------------

const DIV_PSEUDO = [
  "h(k) = k mod m",
  "  q = ⌊k / m⌋      // whole m's in k",
  "  r = k − q·m      // what's left",
  "table[r] ← k",
];

function divisionMethod(b: Builder, keys: number[]): HashProgram {
  snapshot(
    b,
    `The division method: h(k) = k mod m. The remainder after dividing by the table size m = ${b.m} is always in 0…${b.m - 1} — a valid slot by construction.`,
    [1],
  );

  keys.forEach((k) => {
    clearStates(b);
    b.incoming = { key: String(k), state: "active" };
    calcReset(b, `h(${k})`);
    calcLine(b, `h(${k}) = ${k} mod ${b.m}`);
    snapshot(b, `Hash ${k}. "mod" asks: after taking out every whole ${b.m}, what remains?`, [1]);

    const { q, r } = divmod(k, b.m);
    calcLine(b, `q = ⌊${k} / ${b.m}⌋ = ${q}`);
    snapshot(b, `${b.m} fits into ${k} exactly ${q} whole times (${q} × ${b.m} = ${q * b.m}).`, [2]);

    calcLine(b, `r = ${k} − ${q}×${b.m} = ${r}`);
    b.slots[r].state = "target";
    snapshot(b, `The remainder is ${k} − ${q * b.m} = ${r}. So h(${k}) = ${r} — slot ${r}.`, [3]);

    const collided = b.slots[r].entries.length > 0;
    b.slots[r].entries.push(entry(b, String(k), "new"));
    b.n += 1;
    b.incoming = null;
    snapshot(
      b,
      collided
        ? `Slot ${r} was already occupied — a COLLISION. Two different keys, same remainder. (Resolution methods are the next category.)`
        : `${k} lands in slot ${r}.`,
      [4],
      collided ? { text: `COLLISION AT ${r}`, tone: "error" } : undefined,
    );
  });

  clearStates(b);
  b.calc = null;
  snapshot(
    b,
    `Why is m = ${b.m} prime? With m = 10 the remainder is just the last digit; with m = 2^p it's the low bits — real-world keys share those patterns, so non-prime m funnels them into few slots. A prime m makes every digit of the key matter.`,
    [],
  );
  return done(b, `Division Method (m = ${b.m})`, { time: "O(1)", space: "O(1)" }, DIV_PSEUDO);
}

const MUL_PSEUDO = [
  "A = (√5 − 1) / 2 ≈ 0.6180339887",
  "x = k × A",
  "f = frac(x)        // keep only the decimals",
  "h(k) = ⌊m × f⌋",
];

function multiplicationMethod(b: Builder, keys: number[]): HashProgram {
  const A = 0.6180339887;
  snapshot(
    b,
    `The multiplication method: multiply the key by a constant A ∈ (0,1), keep only the FRACTIONAL part, and scale it up to a slot. Knuth's choice A = (√5−1)/2 (the golden ratio conjugate) scatters consecutive keys widely.`,
    [1],
  );

  keys.forEach((k) => {
    clearStates(b);
    b.incoming = { key: String(k), state: "active" };
    calcReset(b, `h(${k})`);

    const x = k * A;
    calcLine(b, `x = ${k} × 0.6180339887`);
    calcLine(b, `x = ${x.toFixed(4)}`);
    snapshot(b, `Multiply: ${k} × A = ${x.toFixed(4)}. The integer part is noise — only the decimals carry the "randomness".`, [2]);

    const f = x - Math.floor(x);
    calcLine(b, `f = frac(${x.toFixed(4)}) = ${f.toFixed(4)}`);
    snapshot(b, `Strip the integer part: frac(${x.toFixed(4)}) = ${f.toFixed(4)} — a number in [0, 1).`, [3]);

    const h = Math.floor(b.m * f);
    calcLine(b, `h = ⌊${b.m} × ${f.toFixed(4)}⌋ = ⌊${(b.m * f).toFixed(3)}⌋ = ${h}`);
    b.slots[h].state = "target";
    snapshot(b, `Scale [0,1) up to the table: ${b.m} × ${f.toFixed(4)} = ${(b.m * f).toFixed(3)}, floor it → slot ${h}.`, [4]);

    const collided = b.slots[h].entries.length > 0;
    b.slots[h].entries.push(entry(b, String(k), "new"));
    b.n += 1;
    b.incoming = null;
    snapshot(b, collided ? `Slot ${h} already held a key — collision.` : `${k} lands in slot ${h}.`, [4],
      collided ? { text: `COLLISION AT ${h}`, tone: "error" } : undefined);
  });

  clearStates(b);
  b.calc = null;
  snapshot(
    b,
    `Unlike the division method, the value of m barely matters here — m = ${b.m} (even a power of 2) is fine, because the scattering comes from the multiplication, not the modulus.`,
    [],
  );
  return done(b, `Multiplication Method (A ≈ 0.618)`, { time: "O(1)", space: "O(1)" }, MUL_PSEUDO);
}

const FOLD_PSEUDO = [
  "split the key's digits into fixed-size groups",
  "sum the groups",
  "h(k) = sum mod m",
];

/** Split digits into groups of 2, from the right (fold-shifting). */
function digitGroups(k: number): string[] {
  const s = String(k);
  const groups: string[] = [];
  for (let end = s.length; end > 0; end -= 2) groups.unshift(s.slice(Math.max(0, end - 2), end));
  return groups;
}

function foldingMethod(b: Builder, keys: number[]): HashProgram {
  snapshot(
    b,
    `The folding method: for LONG keys (IDs, phone numbers) chop the digits into small groups, add the groups, then mod m. Every digit influences the sum — no part of the key is wasted.`,
    [1],
  );

  keys.forEach((k) => {
    clearStates(b);
    b.incoming = { key: String(k), state: "active" };
    calcReset(b, `h(${k})`);

    const groups = digitGroups(k);
    calcLine(b, `split: ${groups.join(" | ")}`);
    snapshot(b, `Fold ${k}: split its digits into groups of two → ${groups.join(", ")}.`, [1]);

    const sum = groups.reduce((acc, g) => acc + parseInt(g, 10), 0);
    calcLine(b, `sum = ${groups.map((g) => parseInt(g, 10)).join(" + ")} = ${sum}`);
    snapshot(b, `Add the groups: ${groups.map((g) => parseInt(g, 10)).join(" + ")} = ${sum}. The long key is now a small number.`, [2]);

    const { q, r } = divmod(sum, b.m);
    calcLine(b, `h = ${sum} mod ${b.m} = ${sum} − ${q}×${b.m} = ${r}`);
    b.slots[r].state = "target";
    snapshot(b, `Finish with the division method: ${sum} mod ${b.m} = ${r} → slot ${r}.`, [3]);

    const collided = b.slots[r].entries.length > 0;
    b.slots[r].entries.push(entry(b, String(k), "new"));
    b.n += 1;
    b.incoming = null;
    snapshot(b, collided ? `Slot ${r} occupied — collision.` : `${k} lands in slot ${r}.`, [3],
      collided ? { text: `COLLISION AT ${r}`, tone: "error" } : undefined);
  });

  clearStates(b);
  b.calc = null;
  snapshot(b, `Folding shines when keys are much bigger than the table (a 10-digit phone number vs m = ${b.m}) — plain k mod m would work too, but folding survives fixed prefixes (like a shared area code) better.`, []);
  return done(b, "Folding Method", { time: "O(d)", space: "O(1)" }, FOLD_PSEUDO);
}

const STR_PSEUDO = [
  "h = 0",
  "for each character c in s:",
  "  h = (h × 31 + code(c)) mod m",
  "return h",
];

function stringHashing(b: Builder, text: string): HashProgram {
  const s = (text || "hello").slice(0, 10);
  snapshot(
    b,
    `Hash the string "${s}" with a polynomial rolling hash: treat the characters as digits of a base-31 number, reduced mod m at every step so it never overflows. This is (essentially) Java's String.hashCode.`,
    [1],
  );

  b.incoming = { key: `"${s}"`, state: "active" };
  calcReset(b, `h("${s}")`);
  calcLine(b, `h = 0`);
  snapshot(b, `Start with h = 0. Each character will fold into it.`, [1]);

  let h = 0;
  for (const ch of s) {
    const code = ch.charCodeAt(0);
    const nh = (h * 31 + code) % b.m;
    calcLine(b, `h = (${h}×31 + ${code}) mod ${b.m} = ${nh}    '${ch}'`);
    snapshot(
      b,
      `'${ch}' has character code ${code}. Fold it in: h = (${h} × 31 + ${code}) mod ${b.m} = ${(h * 31 + code)} mod ${b.m} = ${nh}. Multiplying by 31 shifts the old characters up, so ORDER matters — "ab" and "ba" hash differently.`,
      [2, 3],
    );
    h = nh;
  }

  b.slots[h].state = "target";
  snapshot(b, `All characters consumed: h("${s}") = ${h} → slot ${h}.`, [4]);

  b.slots[h].entries.push(entry(b, `"${s}"`, "new"));
  b.n += 1;
  b.incoming = null;
  snapshot(b, `"${s}" is stored in slot ${h}. Same string → same walk → same slot, every time: hashing is deterministic.`, [4], {
    text: `h("${s}") = ${h}`,
    tone: "ok",
  });
  return done(b, `String Hashing — "${s}"`, { time: "O(L)", space: "O(1)" }, STR_PSEUDO);
}

// --- Hash table operations (separate chaining) --------------------------------

/** One-frame hash for table ops: full quotient/remainder shown but compact. */
function quickHash(b: Builder, k: number, lines: number[]): number {
  const { q, r } = divmod(k, b.m);
  calcReset(b, `h(${k})`);
  calcLine(b, `h(${k}) = ${k} mod ${b.m}`);
  calcLine(b, `= ${k} − ${q}×${b.m} = ${r}`);
  b.slots[r].state = "target";
  snapshot(b, `First, hash the key: ${k} mod ${b.m} = ${k} − ${q}×${b.m} = ${r} — everything about key ${k} happens in slot ${r}.`, lines);
  return r;
}

const INS_PSEUDO = [
  "i = h(key) = key mod m",
  "walk chain[i]: if key already there → stop",
  "node = new Node(key)",
  "node.next = chain[i]; chain[i] = node   // head insert",
];

function htInsert(b: Builder, keys: number[], key: number): HashProgram {
  prefill(b, keys);
  b.showLoad = true;
  snapshot(b, `Insert ${key}. The table holds ${b.n} keys in m = ${b.m} slots (α = ${(b.n / b.m).toFixed(2)}). A hash table never scans the whole table — the hash jumps straight to the one relevant slot.`, [1]);

  const r = quickHash(b, key, [1]);

  // Duplicate check.
  const chain = b.slots[r].entries;
  for (const e of chain) {
    e.state = "active";
    const dup = e.key === String(key);
    snapshot(b, dup
      ? `Walk the chain: ${e.key} == ${key} — the key is already present. A hash table stores each key once; stop.`
      : `Walk the chain: ${e.key} ≠ ${key} — keep walking.`, [2]);
    if (dup) {
      e.state = "found";
      snapshot(b, `Insert aborted — ${key} was already in slot ${r}.`, [2], { text: "KEY EXISTS", tone: "error" });
      return done(b, `Insert ${key} (duplicate)`, { time: "O(1+α)", space: "O(1)" }, INS_PSEUDO);
    }
    e.state = "idle";
  }
  if (chain.length === 0) snapshot(b, `Slot ${r}'s chain is empty — no duplicate possible.`, [2]);

  const node = entry(b, String(key), "new");
  chain.unshift(node);
  b.n += 1;
  snapshot(b, `Create the node and insert it at the HEAD of chain[${r}] — one pointer swap, O(1), no shifting. (Head insert is why chaining inserts stay fast even in a long chain.)`, [3, 4]);

  clearStates(b);
  b.calc = null;
  snapshot(b, `Done. Expected cost: O(1) for the hash + O(α) for the duplicate walk, where α = n/m = ${(b.n / b.m).toFixed(2)} is the average chain length.`, [], {
    text: `INSERTED ${key} → SLOT ${r}`,
    tone: "ok",
  });
  return done(b, `Insert ${key}`, { time: "O(1+α)", space: "O(1)" }, INS_PSEUDO);
}

const SEARCH_PSEUDO = [
  "i = h(key) = key mod m",
  "for node in chain[i]:",
  "  if node.key == key → FOUND",
  "reached NULL → NOT FOUND",
];

function htSearch(b: Builder, keys: number[], key: number): HashProgram {
  prefill(b, keys);
  snapshot(b, `Search for ${key} among ${b.n} stored keys. An array would scan up to ${b.n} slots; the hash table will look at exactly ONE chain.`, [1]);

  const r = quickHash(b, key, [1]);
  const chain = b.slots[r].entries;

  if (chain.length === 0) {
    snapshot(b, `Chain[${r}] is empty. If ${key} existed it would HAVE to be here — same key, same hash, same slot. It isn't. Not found, without touching any other slot.`, [4], {
      text: "NOT FOUND", tone: "error",
    });
    return done(b, `Search ${key} (miss)`, { time: "O(1+α)", space: "O(1)" }, SEARCH_PSEUDO);
  }

  for (const e of chain) {
    e.state = "active";
    const hit = e.key === String(key);
    snapshot(b, hit ? `Compare: ${e.key} == ${key} ✓` : `Compare: ${e.key} ≠ ${key} — follow next.`, [2, 3]);
    if (hit) {
      e.state = "found";
      snapshot(b, `Found ${key} in slot ${r} after ${chain.indexOf(e) + 1} comparison(s). Total work: one hash + a short chain walk.`, [3], {
        text: `FOUND IN SLOT ${r}`, tone: "ok",
      });
      return done(b, `Search ${key} (hit)`, { time: "O(1+α)", space: "O(1)" }, SEARCH_PSEUDO);
    }
    e.state = "visited";
  }

  snapshot(b, `Reached the end of chain[${r}] (NULL) — ${key} is not in the table. Note the search NEVER looked at the other ${b.m - 1} slots.`, [4], {
    text: "NOT FOUND", tone: "error",
  });
  return done(b, `Search ${key} (miss)`, { time: "O(1+α)", space: "O(1)" }, SEARCH_PSEUDO);
}

const DEL_PSEUDO = [
  "i = h(key) = key mod m",
  "walk chain[i] keeping prev",
  "found → prev.next = node.next   // unlink",
  "free the node",
];

function htDelete(b: Builder, keys: number[], key: number): HashProgram {
  prefill(b, keys);
  b.showLoad = true;
  snapshot(b, `Delete ${key}. Hash to its slot, walk the chain to the node, unlink it — a linked-list deletion, but only inside ONE bucket.`, [1]);

  const r = quickHash(b, key, [1]);
  const chain = b.slots[r].entries;

  for (let i = 0; i < chain.length; i++) {
    const e = chain[i];
    e.state = "active";
    const hit = e.key === String(key);
    snapshot(b, hit ? `${e.key} == ${key} — this is the node to remove.` : `${e.key} ≠ ${key} — remember it as prev, move on.`, [2]);
    if (hit) {
      e.state = "removing";
      snapshot(b, i === 0
        ? `Unlink: it is the chain's head, so chain[${r}] simply becomes its next node.`
        : `Unlink: ${chain[i - 1].key}.next skips over ${key} to the node after it. No shifting — pointers just route around it.`, [3]);
      chain.splice(i, 1);
      b.n -= 1;
      clearStates(b);
      b.calc = null;
      snapshot(b, `${key} is gone and its memory freed. Cost: one hash + a walk of ≤ ${i + 1} node(s).`, [4], {
        text: `DELETED ${key}`, tone: "ok",
      });
      return done(b, `Delete ${key}`, { time: "O(1+α)", space: "O(1)" }, DEL_PSEUDO);
    }
    e.state = "visited";
  }

  snapshot(b, `Reached NULL — ${key} was never in the table; nothing to delete.`, [2], { text: "NOT FOUND", tone: "error" });
  return done(b, `Delete ${key} (miss)`, { time: "O(1+α)", space: "O(1)" }, DEL_PSEUDO);
}

const LOAD_PSEUDO = [
  "α = n / m           // load factor",
  "insert; n++ → α grows",
  "if α > 0.75:",
  "  m′ = 2m + 1; rehash EVERY key with the new m",
];

function loadFactor(b: Builder, keys: number[]): HashProgram {
  b.showLoad = true;
  snapshot(b, `The load factor α = n/m measures how full the table is — it IS the expected chain length, so it IS the search cost. Watch α climb as we insert, and what happens when it crosses 0.75.`, [1]);

  for (const k of keys) {
    clearStates(b);
    b.incoming = { key: String(k), state: "active" };
    const { q, r } = divmod(k, b.m);
    calcReset(b, `h(${k})`);
    calcLine(b, `${k} mod ${b.m} = ${k} − ${q}×${b.m} = ${r}`);
    b.slots[r].state = "target";
    b.slots[r].entries.unshift(entry(b, String(k), "new"));
    b.n += 1;
    b.incoming = null;
    snapshot(b, `Insert ${k} → slot ${r}. Now n = ${b.n}, so α = ${b.n}/${b.m} = ${(b.n / b.m).toFixed(2)}.`, [2]);

    if (b.n / b.m > 0.75) {
      const oldM = b.m;
      const old = b.slots.flatMap((s) => s.entries.map((e) => parseInt(e.key, 10)));
      b.slots.forEach((s) => (s.state = "removing"));
      snapshot(b, `α = ${(b.n / b.m).toFixed(2)} > 0.75 — chains are getting long and O(1+α) is drifting toward O(n). Time to REHASH: grow the table and re-place every key.`, [3], {
        text: `α > 0.75 — REHASH`, tone: "error",
      });

      b.m = 2 * oldM + 1;
      b.slots = makeSlots(b.m);
      b.n = 0;
      calcReset(b, "rehash");
      calcLine(b, `m′ = 2×${oldM} + 1 = ${b.m}`);
      snapshot(b, `New table: m′ = 2×${oldM}+1 = ${b.m} slots (kept odd/prime-ish). Every key must be re-hashed — h(k) depends on m, so all the old positions are now WRONG.`, [4]);

      for (const ok of old) {
        const { q: q2, r: r2 } = divmod(ok, b.m);
        calcLine(b, `${ok} mod ${b.m} = ${ok} − ${q2}×${b.m} = ${r2}`);
        b.slots[r2].entries.unshift(entry(b, String(ok), "new", "rehashed"));
        b.n += 1;
        snapshot(b, `Re-insert ${ok}: ${ok} mod ${b.m} = ${r2} — a different slot than before, because m changed.`, [4]);
      }
      clearStates(b);
      snapshot(b, `Rehash complete: n = ${b.n}, m = ${b.m}, α back down to ${(b.n / b.m).toFixed(2)}. This one insert cost O(n) — but doubling means it happens so rarely that inserts stay O(1) AMORTIZED.`, [4]);
    }
  }

  clearStates(b);
  b.calc = null;
  snapshot(b, `Final state: n = ${b.n}, m = ${b.m}, α = ${(b.n / b.m).toFixed(2)}. Keeping α bounded is the deal that keeps every operation O(1) on average.`, [1]);
  return done(b, "Load Factor & Rehashing", { time: "O(1) amortized", space: "O(n)" }, LOAD_PSEUDO);
}

// --- Collision resolution ------------------------------------------------------

const CHAIN_PSEUDO = [
  "i = k mod m",
  "if chain[i] is occupied → COLLISION",
  "new node at the HEAD of chain[i]   // O(1)",
];

function chainingOp(b: Builder, keys: number[]): HashProgram {
  snapshot(b, `Separate chaining: every slot owns a linked list. A collision isn't an error — the new key simply joins the chain. Watch several keys fight over the same slots (m = ${b.m}).`, [1]);

  for (const k of keys) {
    clearStates(b);
    b.incoming = { key: String(k), state: "active" };
    const { q, r } = divmod(k, b.m);
    calcReset(b, `h(${k})`);
    calcLine(b, `${k} mod ${b.m} = ${k} − ${q}×${b.m} = ${r}`);
    b.slots[r].state = "target";
    snapshot(b, `h(${k}) = ${k} mod ${b.m} = ${r}.`, [1]);

    const chain = b.slots[r].entries;
    const collided = chain.length > 0;
    if (collided) {
      chain.forEach((e) => (e.state = "active"));
      snapshot(b, `Slot ${r} already holds ${chain.map((e) => e.key).join(", ")} — COLLISION. Different keys, same remainder mod ${b.m}.`, [2], {
        text: `COLLISION AT ${r}`, tone: "error",
      });
    }
    chain.unshift(entry(b, String(k), "new"));
    b.n += 1;
    b.incoming = null;
    snapshot(b, collided
      ? `${k} is prepended at the chain's head — O(1) regardless of chain length. The chain now has ${chain.length} nodes; searching this slot costs ${chain.length} comparisons.`
      : `Slot ${r} was free — chain of length 1.`, [3]);
  }

  clearStates(b);
  b.calc = null;
  const longest = Math.max(...b.slots.map((s) => s.entries.length));
  snapshot(b, `Result: ${b.n} keys, longest chain = ${longest}. Average search is O(1+α) — but if a bad hash sent EVERYTHING to one slot, the "hash table" would secretly be a linked list: O(n). The hash function's quality is the whole game.`, []);
  return done(b, "Separate Chaining", { time: "O(1+α)", space: "O(n+m)" }, CHAIN_PSEUDO);
}

/** Shared skeleton for the three probing strategies. */
function probing(
  b: Builder,
  keys: number[],
  kind: "linear" | "quadratic" | "double",
): HashProgram {
  const intro: Record<typeof kind, string> = {
    linear: `Linear probing: on a collision, step to the NEXT slot — (h(k)+i) mod m for i = 0,1,2… The table stays a plain array (great cache behaviour), but occupied runs grow.`,
    quadratic: `Quadratic probing: jump by square offsets — (h(k)+i²) mod m, i.e. +1, +4, +9… Colliding keys leap OVER clusters instead of piling onto their edge.`,
    double: `Double hashing: a SECOND hash sets the step size — (h₁(k) + i·h₂(k)) mod m with h₂(k) = 1 + (k mod ${b.m - 1}). Keys that collide on h₁ almost never share h₂, so their probe paths diverge immediately.`,
  };
  const pseudo: Record<typeof kind, string[]> = {
    linear: ["i = 0", "idx = (h(k) + i) mod m", "while table[idx] occupied:", "  i++; idx = (h(k) + i) mod m", "table[idx] = k"],
    quadratic: ["i = 0", "idx = (h(k) + i²) mod m", "while table[idx] occupied:", "  i++; idx = (h(k) + i²) mod m", "table[idx] = k"],
    double: ["h₁ = k mod m", "h₂ = 1 + (k mod (m−1))   // never 0", "idx = (h₁ + i·h₂) mod m, i = 0,1,2…", "first free idx ← k"],
  };
  snapshot(b, intro[kind], [1]);

  for (const k of keys) {
    clearStates(b);
    b.incoming = { key: String(k), state: "active" };
    const { q, r: h1 } = divmod(k, b.m);
    const h2 = kind === "double" ? 1 + (k % (b.m - 1)) : 0;
    calcReset(b, `h(${k})`);
    calcLine(b, `h₁ = ${k} mod ${b.m} = ${k} − ${q}×${b.m} = ${h1}`);
    if (kind === "double") {
      calcLine(b, `h₂ = 1 + (${k} mod ${b.m - 1}) = ${h2}`);
      snapshot(b, `Two hashes for ${k}: home slot h₁ = ${h1}, personal step size h₂ = ${h2} (the +1 guarantees the step is never 0).`, [1, 2]);
    } else {
      snapshot(b, `h(${k}) = ${k} mod ${b.m} = ${h1} — the home slot.`, [1]);
    }

    for (let i = 0; i < b.m; i++) {
      const offset = kind === "linear" ? i : kind === "quadratic" ? i * i : i * h2;
      const idx = (h1 + offset) % b.m;
      const occupied = b.slots[idx].entries.length > 0;
      b.probes.push({ index: idx, order: i, hit: occupied ? "occupied" : "free" });
      b.slots[idx].state = occupied ? "removing" : "target";

      if (i > 0) {
        const formula =
          kind === "linear" ? `(${h1} + ${i}) mod ${b.m} = ${idx}`
          : kind === "quadratic" ? `(${h1} + ${i}²) mod ${b.m} = (${h1} + ${i * i}) mod ${b.m} = ${idx}`
          : `(${h1} + ${i}×${h2}) mod ${b.m} = (${h1} + ${i * h2}) mod ${b.m} = ${idx}`;
        calcLine(b, formula);
      }

      if (occupied) {
        snapshot(b, i === 0
          ? `Slot ${idx} is occupied by ${b.slots[idx].entries[0].key} — collision. Probe again with i = 1.`
          : `Probe i=${i}: slot ${idx} — also occupied. Keep probing.`, i === 0 ? [2, 3] : [3, 4]);
      } else {
        b.slots[idx].entries.push(entry(b, String(k), "new"));
        b.n += 1;
        snapshot(b, i === 0
          ? `Slot ${idx} is free — ${k} takes its home slot, no probing needed.`
          : `Probe i=${i}: slot ${idx} is FREE — ${k} settles there, ${i} step(s) from home.`, i === 0 ? [2, 5] : [5], {
          text: i === 0 ? `${k} → SLOT ${idx}` : `${k} → SLOT ${idx} (${i} PROBES)`, tone: "ok",
        });
        break;
      }
    }
    b.incoming = null;
  }

  clearStates(b);
  b.calc = null;
  if (kind === "linear") {
    // Highlight the longest occupied run (circular) — primary clustering.
    let best = { start: 0, len: 0 };
    for (let s = 0; s < b.m; s++) {
      if (b.slots[s].entries.length === 0) continue;
      let len = 0;
      while (len < b.m && b.slots[(s + len) % b.m].entries.length > 0) len += 1;
      if (len > best.len) best = { start: s, len };
    }
    for (let i = 0; i < best.len; i++) b.slots[(best.start + i) % b.m].state = "target";
    snapshot(b, `The scar of linear probing: a contiguous RUN of ${best.len} occupied slots. Any key hashing anywhere inside it must walk to its end — and then extends it. Clusters feed themselves: PRIMARY CLUSTERING.`, []);
  } else if (kind === "quadratic") {
    snapshot(b, `Square jumps disperse keys that share a home slot — no primary clustering. Remaining weakness: keys with the SAME home slot still follow the same path (secondary clustering), and only m prime + α < 0.5 guarantees a free slot is found.`, []);
  } else {
    snapshot(b, `Because the step size h₂ differs per key, even keys with the same home slot scatter along different paths — no primary or secondary clustering. This is the strongest open-addressing scheme (used with m prime).`, []);
  }
  const title = kind === "linear" ? "Linear Probing" : kind === "quadratic" ? "Quadratic Probing" : "Double Hashing";
  return done(b, title, { time: "O(1) avg · O(n) worst", space: "O(m)" }, pseudo[kind]);
}

// --- Dispatch -----------------------------------------------------------------

export interface HashRunParams {
  key?: number;
  text?: string;
  m?: number;
}

const CALC_OPS: HashOperationId[] = ["divisionMethod", "multiplicationMethod", "foldingMethod", "stringHashing"];
const OPEN_OPS: HashOperationId[] = ["linearProbing", "quadraticProbing", "doubleHashing"];

export function runHashOperation(
  op: HashOperationId,
  keys: number[],
  params: HashRunParams = {},
): HashProgram {
  const mode: HashMode = CALC_OPS.includes(op) ? "calc" : OPEN_OPS.includes(op) ? "open" : "chaining";
  const m = Math.max(3, Math.min(params.m ?? 7, 13));
  const b = makeBuilder(mode, m);
  const key = params.key ?? 13;
  const ks = keys.length ? keys.slice(0, 8) : [15, 11, 27, 8];

  switch (op) {
    case "divisionMethod":
      return divisionMethod(b, ks);
    case "multiplicationMethod":
      return multiplicationMethod(b, ks);
    case "foldingMethod":
      return foldingMethod(b, ks);
    case "stringHashing":
      return stringHashing(b, params.text ?? "hello");
    case "htInsert":
      return htInsert(b, ks, key);
    case "htSearch":
      return htSearch(b, ks, key);
    case "htDelete":
      return htDelete(b, ks, key);
    case "loadFactor":
      return loadFactor(b, ks);
    case "chaining":
      return chainingOp(b, ks);
    case "linearProbing":
      return probing(b, ks, "linear");
    case "quadraticProbing":
      return probing(b, ks, "quadratic");
    case "doubleHashing":
      return probing(b, ks, "double");
    default:
      return divisionMethod(b, ks);
  }
}

export interface HashOperationMeta {
  id: HashOperationId;
  label: string;
  icon: string;
  params: ("keys" | "key" | "text" | "m")[];
  hint: string;
}

/** Registry used by the sidebar quick-tabs / param inputs. */
export const HASH_OPERATIONS: HashOperationMeta[] = [
  { id: "divisionMethod", label: "Division", icon: "percent", params: ["keys", "m"], hint: "h(k) = k mod m — shown as quotient & remainder." },
  { id: "multiplicationMethod", label: "Multiplication", icon: "close", params: ["keys", "m"], hint: "h(k) = ⌊m·frac(k·A)⌋ with Knuth's A ≈ 0.618." },
  { id: "foldingMethod", label: "Folding", icon: "content_cut", params: ["keys", "m"], hint: "Split digits into groups, sum, then mod m." },
  { id: "stringHashing", label: "String Hash", icon: "abc", params: ["text", "m"], hint: "Rolling hash: h = (h·31 + code) mod m per char." },
  { id: "htInsert", label: "Insert", icon: "add_box", params: ["keys", "key", "m"], hint: "Hash → duplicate check → head insert. O(1+α)." },
  { id: "htSearch", label: "Search", icon: "search", params: ["keys", "key", "m"], hint: "Hash → walk ONE chain. O(1+α)." },
  { id: "htDelete", label: "Delete", icon: "delete", params: ["keys", "key", "m"], hint: "Hash → walk → unlink the node. O(1+α)." },
  { id: "loadFactor", label: "Load Factor", icon: "speed", params: ["keys", "m"], hint: "α = n/m; crossing 0.75 triggers a full rehash." },
  { id: "chaining", label: "Chaining", icon: "link", params: ["keys", "m"], hint: "Colliding keys join the slot's linked list." },
  { id: "linearProbing", label: "Linear", icon: "arrow_forward", params: ["keys", "m"], hint: "(h+i) mod m — simple, but clusters grow." },
  { id: "quadraticProbing", label: "Quadratic", icon: "moving", params: ["keys", "m"], hint: "(h+i²) mod m — leaps over clusters." },
  { id: "doubleHashing", label: "Double Hash", icon: "tag", params: ["keys", "m"], hint: "(h₁+i·h₂) mod m — per-key step size." },
];
