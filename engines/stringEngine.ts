// ---------------------------------------------------------------------------
// String engine — classic LeetCode problems compiler
//
// Strings drawn as rows of character cells with floating cursors (two-pointer
// problems), a letter-frequency chip table (anagram-style problems) and an
// output strip. Same granular narration style as every other engine.
// ---------------------------------------------------------------------------

import type {
  Complexity,
  FreqEntry,
  SQCellState,
  StringOperationId,
  StringPointer,
  StringProgram,
  StringRow,
  StringStep,
  TokenChip,
} from "@/types/visualization";

const C_L = "#34C98A"; // left / i
const C_R = "#F5A623"; // right / j

interface Builder {
  steps: StringStep[];
  rows: StringRow[];
  freq?: FreqEntry[];
  output?: { label: string; chips: TokenChip[] };
  seq: number;
}

function makeRow(b: Builder, text: string, label?: string): StringRow {
  return { label, chars: text.split("").map((ch) => ({ id: `sc-${b.seq++}`, ch, state: "idle" as SQCellState })) };
}

function newB(texts: { text: string; label?: string }[]): Builder {
  const b: Builder = { steps: [], rows: [], seq: 0 };
  b.rows = texts.map((t) => makeRow(b, t.text, t.label));
  return b;
}

function snapshot(
  b: Builder,
  pointers: StringPointer[],
  description: string,
  codeLines?: number[],
  opts: { message?: StringStep["message"] } = {},
): void {
  b.steps.push({
    rows: b.rows.map((r) => ({ label: r.label, chars: r.chars.map((c) => ({ ...c })) })),
    pointers,
    freq: b.freq?.map((f) => ({ ...f })),
    output: b.output ? { label: b.output.label, chips: b.output.chips.map((c) => ({ ...c })) } : undefined,
    message: opts.message,
    description,
    codeLines,
  });
}

function done(b: Builder, title: string, complexity: Complexity, pseudocode: string[]): StringProgram {
  return { steps: b.steps, complexity, pseudocode, title };
}

const clean = (s: string, fallback: string) => (s && s.trim() ? s.trim().slice(0, 14) : fallback);

// --- #344 Reverse String ---------------------------------------------------------

const REV_PSEUDO = ["l = 0, r = length − 1", "while l < r:", "  swap s[l] and s[r]", "  l++, r−−", "// meet in the middle — done"];

function strReverse(b: Builder): StringProgram {
  const row = b.rows[0];
  const n = row.chars.length;
  snapshot(b, [{ label: "l", row: 0, index: 0, color: C_L }, { label: "r", row: 0, index: n - 1, color: C_R }], `Reverse the string IN PLACE: two pointers start at the ends and swap their way inward. No second string needed.`, [1]);

  let l = 0;
  let r = n - 1;
  while (l < r) {
    row.chars[l].state = "target";
    row.chars[r].state = "target";
    snapshot(b, [{ label: "l", row: 0, index: l, color: C_L }, { label: "r", row: 0, index: r, color: C_R }], `l < r, so there's still a pair to fix: '${row.chars[l].ch}' and '${row.chars[r].ch}'.`, [2]);
    const t = row.chars[l];
    row.chars[l] = row.chars[r];
    row.chars[r] = t;
    row.chars[l].state = "found";
    row.chars[r].state = "found";
    snapshot(b, [{ label: "l", row: 0, index: l, color: C_L }, { label: "r", row: 0, index: r, color: C_R }], `SWAP — the cells trade places (watch them slide). Each swap fixes TWO positions at once.`, [3]);
    row.chars[l].state = "visited";
    row.chars[r].state = "visited";
    l++;
    r--;
    if (l < r) snapshot(b, [{ label: "l", row: 0, index: l, color: C_L }, { label: "r", row: 0, index: r, color: C_R }], `Move both pointers one step inward.`, [4]);
  }
  if (l === r) row.chars[l].state = "visited";
  snapshot(b, [], `Pointers met in the middle — every pair swapped, string reversed. n/2 swaps: O(n) time, O(1) extra space.`, [5], {
    message: { text: `"${row.chars.map((c) => c.ch).join("")}"`, tone: "ok" },
  });
  return done(b, "Reverse String (#344)", { time: "O(n)", space: "O(1)" }, REV_PSEUDO);
}

// --- #125 Valid Palindrome ---------------------------------------------------------

const PAL_PSEUDO = ["l = 0, r = length − 1", "while l < r:", "  if s[l] != s[r]: return false ✗", "  l++, r−−", "return true ✓"];

function strPalindrome(b: Builder): StringProgram {
  const row = b.rows[0];
  const n = row.chars.length;
  snapshot(b, [{ label: "l", row: 0, index: 0, color: C_L }, { label: "r", row: 0, index: n - 1, color: C_R }], `Is the string the same forwards and backwards? Compare from both ends inward — the first mismatch ends it.`, [1]);

  let l = 0;
  let r = n - 1;
  while (l < r) {
    const a = row.chars[l];
    const z = row.chars[r];
    const match = a.ch.toLowerCase() === z.ch.toLowerCase();
    a.state = match ? "target" : "removing";
    z.state = match ? "target" : "removing";
    snapshot(b, [{ label: "l", row: 0, index: l, color: C_L }, { label: "r", row: 0, index: r, color: C_R }], `Compare '${a.ch}' with '${z.ch}' — ${match ? "match ✓" : "MISMATCH ✗"}.`, [2, 3]);
    if (!match) {
      snapshot(b, [{ label: "l", row: 0, index: l, color: C_L }, { label: "r", row: 0, index: r, color: C_R }], `One mismatched pair is enough — the string cannot be a palindrome. Stop immediately.`, [3], {
        message: { text: "NOT A PALINDROME ✗", tone: "error" },
      });
      return done(b, "Valid Palindrome (#125)", { time: "O(n)", space: "O(1)" }, PAL_PSEUDO);
    }
    a.state = "visited";
    z.state = "visited";
    l++;
    r--;
    if (l < r) snapshot(b, [{ label: "l", row: 0, index: l, color: C_L }, { label: "r", row: 0, index: r, color: C_R }], `Pair matched — step both pointers inward.`, [4]);
  }
  row.chars.forEach((c) => (c.state = "found"));
  snapshot(b, [], `Pointers met with every pair matching — it reads the same both ways. Palindrome ✓`, [5], {
    message: { text: "PALINDROME ✓", tone: "ok" },
  });
  return done(b, "Valid Palindrome (#125)", { time: "O(n)", space: "O(1)" }, PAL_PSEUDO);
}

// --- #242 Valid Anagram --------------------------------------------------------------

const ANA_PSEUDO = ["count each letter of s   (+1)", "count each letter of t   (−1 style)", "compare the two tallies:", "  any letter's counts differ → ✗", "all equal → anagram ✓"];

function strAnagram(b: Builder): StringProgram {
  const s = b.rows[0];
  const t = b.rows[1];
  b.freq = [];
  const entry = (key: string): FreqEntry => {
    let e = b.freq!.find((f) => f.key === key);
    if (!e) {
      e = { key, a: 0, b: 0, state: "idle" };
      b.freq!.push(e);
      b.freq!.sort((x, y) => x.key.localeCompare(y.key));
    }
    return e;
  };

  snapshot(b, [], `Are these two strings made of EXACTLY the same letters? Order doesn't matter — so don't compare positions, compare LETTER COUNTS (the tally table below).`, [1]);

  for (let i = 0; i < s.chars.length; i++) {
    const c = s.chars[i];
    c.state = "active";
    const e = entry(c.ch.toLowerCase());
    e.a += 1;
    e.state = "new";
    snapshot(b, [{ label: "i", row: 0, index: i, color: C_L }], `Tally '${c.ch}' from s → its s-count becomes ${e.a}.`, [1]);
    c.state = "visited";
    e.state = "idle";
  }
  for (let i = 0; i < t.chars.length; i++) {
    const c = t.chars[i];
    c.state = "active";
    const e = entry(c.ch.toLowerCase());
    e.b = (e.b ?? 0) + 1;
    e.state = "new";
    snapshot(b, [{ label: "j", row: 1, index: i, color: C_R }], `Tally '${c.ch}' from t → its t-count becomes ${e.b}.`, [2]);
    c.state = "visited";
    e.state = "idle";
  }

  snapshot(b, [], `Both tallies complete. Now the whole answer lives in the table: the strings are anagrams IFF every letter has equal counts.`, [3]);

  let ok = true;
  for (const e of b.freq) {
    const match = e.a === (e.b ?? 0);
    e.state = match ? "found" : "removing";
    snapshot(b, [], `'${e.key}': ${e.a} in s vs ${e.b ?? 0} in t — ${match ? "equal ✓" : "DIFFERENT ✗"}.`, match ? [3] : [4]);
    if (!match) {
      ok = false;
      break;
    }
  }
  snapshot(b, [], ok ? `Every letter balances — same letters, different order: anagram ✓ (Counting beats sorting: O(n) vs O(n log n).)` : `A letter's counts differ — not an anagram.`, [ok ? 5 : 4], {
    message: { text: ok ? "ANAGRAM ✓" : "NOT AN ANAGRAM ✗", tone: ok ? "ok" : "error" },
  });
  return done(b, "Valid Anagram (#242)", { time: "O(n)", space: "O(26)" }, ANA_PSEUDO);
}

// --- #387 First Unique Character ------------------------------------------------------

const UNIQ_PSEUDO = ["pass 1: count every letter", "pass 2: scan left → right:", "  first char with count == 1", "  → that's the answer", "none found → −1"];

function strFirstUnique(b: Builder): StringProgram {
  const s = b.rows[0];
  b.freq = [];
  const entry = (key: string): FreqEntry => {
    let e = b.freq!.find((f) => f.key === key);
    if (!e) {
      e = { key, a: 0, state: "idle" };
      b.freq!.push(e);
      b.freq!.sort((x, y) => x.key.localeCompare(y.key));
    }
    return e;
  };

  snapshot(b, [], `Find the FIRST character that appears exactly once. One pass to count, one pass to find — two cheap passes beat one expensive nested scan (O(n²)).`, [1]);

  for (let i = 0; i < s.chars.length; i++) {
    const c = s.chars[i];
    c.state = "active";
    const e = entry(c.ch.toLowerCase());
    e.a += 1;
    e.state = "new";
    snapshot(b, [{ label: "i", row: 0, index: i, color: C_L }], `Count '${c.ch}' → ${e.a}.`, [1]);
    c.state = "idle";
    e.state = "idle";
  }

  snapshot(b, [], `Counting done. Now scan again from the left — the ORDER of the scan is what makes the answer the FIRST unique, not just any unique.`, [2]);

  for (let i = 0; i < s.chars.length; i++) {
    const c = s.chars[i];
    const e = entry(c.ch.toLowerCase());
    const unique = e.a === 1;
    c.state = unique ? "found" : "removing";
    e.state = unique ? "found" : "removing";
    snapshot(b, [{ label: "i", row: 0, index: i, color: C_L }], `'${c.ch}' has count ${e.a} — ${unique ? "UNIQUE, and it's the first one: answer found!" : "repeated, keep scanning."}`, unique ? [3, 4] : [2]);
    if (unique) {
      snapshot(b, [{ label: "i", row: 0, index: i, color: C_L }], `First unique character: '${c.ch}' at index ${i}.`, [4], {
        message: { text: `'${c.ch}' AT INDEX ${i}`, tone: "ok" },
      });
      return done(b, "First Unique Character (#387)", { time: "O(n)", space: "O(26)" }, UNIQ_PSEUDO);
    }
    c.state = "visited";
    e.state = "idle";
  }
  snapshot(b, [], `Every character repeats — there is no unique one. Return −1.`, [5], {
    message: { text: "NO UNIQUE CHARACTER → −1", tone: "error" },
  });
  return done(b, "First Unique Character (#387)", { time: "O(n)", space: "O(26)" }, UNIQ_PSEUDO);
}

// --- #14 Longest Common Prefix ----------------------------------------------------------

const LCP_PSEUDO = ["for column i = 0, 1, 2, …:", "  ch = words[0][i]", "  if EVERY word has ch at i: keep going", "  else: stop — prefix ends here", "return word[0][0..i]"];

function strCommonPrefix(b: Builder): StringProgram {
  b.output = { label: "prefix", chips: [] };
  snapshot(b, [], `Find the longest starting text ALL words share. Strategy: check column by column — column i survives only if every word agrees on it (vertical scanning).`, [1]);

  const rows = b.rows;
  const minLen = Math.min(...rows.map((r) => r.chars.length));
  let i = 0;
  outer: for (; i < minLen; i++) {
    const ch = rows[0].chars[i].ch.toLowerCase();
    rows.forEach((r) => (r.chars[i].state = "target"));
    snapshot(b, rows.map((_, ri) => ({ label: ri === 0 ? "i" : "", row: ri, index: i, color: C_L })), `Column ${i}: does every word have '${rows[0].chars[i].ch}' here?`, [1, 2]);
    for (const r of rows) {
      if (r.chars[i].ch.toLowerCase() !== ch) {
        r.chars[i].state = "removing";
        snapshot(b, [{ label: "✗", row: rows.indexOf(r), index: i, color: "#FF5F4A" }], `'${r.chars[i].ch}' ≠ '${rows[0].chars[i].ch}' — the words disagree at column ${i}. The common prefix ends here.`, [4]);
        break outer;
      }
    }
    rows.forEach((r) => (r.chars[i].state = "found"));
    b.output.chips.push({ text: rows[0].chars[i].ch, state: "matched" });
    snapshot(b, [], `All words agree on '${rows[0].chars[i].ch}' — column ${i} joins the prefix.`, [3]);
    rows.forEach((r) => (r.chars[i].state = "visited"));
  }

  const prefix = b.output.chips.map((c) => c.text).join("");
  snapshot(b, [], prefix ? `Longest common prefix: "${prefix}" (${prefix.length} characters).` : `The words disagree at the very first column — no common prefix at all.`, [5], {
    message: { text: prefix ? `"${prefix}"` : `"" (EMPTY)`, tone: prefix ? "ok" : "error" },
  });
  return done(b, "Longest Common Prefix (#14)", { time: "O(n·m)", space: "O(1)" }, LCP_PSEUDO);
}

// --- Dispatch --------------------------------------------------------------------------

export interface StringRunParams {
  text?: string;
  text2?: string;
}

export function runStringOperation(op: StringOperationId, params: StringRunParams = {}): StringProgram {
  const t1 = params.text ?? "";
  const t2 = params.text2 ?? "";

  switch (op) {
    case "strReverse":
      return strReverse(newB([{ text: clean(t1, "visualize"), label: "s" }]));
    case "strPalindrome":
      return strPalindrome(newB([{ text: clean(t1, "racecar"), label: "s" }]));
    case "strAnagram":
      return strAnagram(newB([{ text: clean(t1, "listen"), label: "s" }, { text: clean(t2, "silent"), label: "t" }]));
    case "strFirstUnique":
      return strFirstUnique(newB([{ text: clean(t1, "leetcode"), label: "s" }]));
    case "strCommonPrefix": {
      const words = (t1 && t1.includes(",") ? t1.split(",") : ["flower", "flow", "flight"]).map((w) => clean(w, "flow")).slice(0, 4);
      return strCommonPrefix(newB(words.map((w, i) => ({ text: w, label: `w${i}` }))));
    }
    default:
      return strReverse(newB([{ text: clean(t1, "visualize"), label: "s" }]));
  }
}

export interface StringOperationMeta {
  id: StringOperationId;
  label: string;
  icon: string;
  params: ("text" | "text2")[];
  hint: string;
}

export const STRING_OPERATIONS: StringOperationMeta[] = [
  { id: "strReverse", label: "Reverse String", icon: "swap_horiz", params: ["text"], hint: "Two pointers swap inward (#344)." },
  { id: "strPalindrome", label: "Valid Palindrome", icon: "compare_arrows", params: ["text"], hint: "Compare both ends inward (#125)." },
  { id: "strAnagram", label: "Valid Anagram", icon: "shuffle", params: ["text", "text2"], hint: "Compare letter tallies, not positions (#242)." },
  { id: "strFirstUnique", label: "First Unique Char", icon: "looks_one", params: ["text"], hint: "Count pass + scan pass (#387)." },
  { id: "strCommonPrefix", label: "Common Prefix", icon: "align_horizontal_left", params: ["text"], hint: "Column-by-column agreement (#14). Comma-separate words." },
];
