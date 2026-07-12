// ---------------------------------------------------------------------------
// Foundations engine — "the glass machine"
//
// Compiles tiny beginner programs into FoundationsPrograms. Every frame is one
// executed line: the program counter (highlighted pseudocode line) moves, a
// variable box in MEMORY appears or is overwritten, or a line lands in the
// CONSOLE. The whole point is to make the three invisible things visible:
// instructions run one at a time, memory is labeled boxes, output is a log.
//
// The complexity pages add step-tile counters: executed work drops tiles, so
// "time complexity" is literally watching tiles pile up faster as n grows.
// ---------------------------------------------------------------------------

import type {
  Complexity,
  FoundationsOperationId,
  FoundationsProgram,
  FoundationsStep,
  FoundChart,
  FoundChartSeries,
  FoundCounter,
  FoundVar,
  SQCellState,
} from "@/types/visualization";

interface Builder {
  steps: FoundationsStep[];
  vars: FoundVar[];
  consoleLines: string[];
  counters?: FoundCounter[];
  chart?: FoundChart;
}

function newB(): Builder {
  return { steps: [], vars: [], consoleLines: [] };
}

function snapshot(
  b: Builder,
  description: string,
  codeLines?: number[],
  opts: { message?: FoundationsStep["message"] } = {},
): void {
  b.steps.push({
    vars: b.vars.map((v) => ({ ...v })),
    consoleLines: [...b.consoleLines],
    counters: b.counters?.map((c) => ({ ...c })),
    chart: b.chart
      ? {
          ...b.chart,
          series: b.chart.series.map((s) => ({ ...s, points: s.points.map((p) => [...p] as [number, number]) })),
        }
      : undefined,
    message: opts.message,
    description,
    codeLines,
  });
}

// --- Chart helpers -------------------------------------------------------------

function chartInit(b: Builder, title: string, xLabel: string, yLabel: string, series: FoundChartSeries[]): void {
  b.chart = { title, xLabel, yLabel, series };
}

/** A dashed reference curve, e.g. the ideal n or n² line. */
function refCurve(label: string, color: string, fn: (x: number) => number, from: number, to: number): FoundChartSeries {
  const points: [number, number][] = [];
  for (let x = from; x <= to; x++) points.push([x, fn(x)]);
  return { label, color, dashed: true, points };
}

function chartPush(b: Builder, seriesIndex: number, point: [number, number]): void {
  b.chart?.series[seriesIndex]?.points.push(point);
}

/** Parse/clamp a custom list param: keep 2–8 finite values, else fall back. */
function useList(list: number[] | undefined, fallback: number[]): number[] {
  const clean = (list ?? []).filter((x) => Number.isFinite(x)).slice(0, 8).map((x) => Math.round(x));
  return clean.length >= 2 ? clean : fallback;
}

function setVar(b: Builder, name: string, value: string, type: FoundVar["type"], state: SQCellState = "new"): void {
  const existing = b.vars.find((v) => v.name === name);
  if (existing) {
    existing.value = value;
    existing.state = state;
  } else {
    b.vars.push({ name, value, type, state });
  }
}

function calm(b: Builder): void {
  b.vars.forEach((v) => (v.state = "idle"));
}

function done(b: Builder, title: string, complexity: Complexity, pseudocode: string[]): FoundationsProgram {
  return { steps: b.steps, complexity, pseudocode, title };
}

// --- Programming basics -------------------------------------------------------

function fWhatIsAProgram(b: Builder, text?: string): FoundationsProgram {
  const name = (text ?? "").trim().replace(/["\\]/g, "").slice(0, 12) || "Ada";
  const pseudo = [`name = "${name}"`, 'greeting = "Hello, " + name', "print(greeting)", 'print("Nice to meet you!")'];

  snapshot(b, "A program is a LIST OF INSTRUCTIONS. The computer runs them ONE at a time, top to bottom — the highlighted line is the one running right now. Watch what each line does to MEMORY (the boxes) and the CONSOLE (the output). (Tip: type YOUR name in the sidebar and re-run — the program greets you instead.)", []);

  setVar(b, "name", `"${name}"`, "string");
  snapshot(b, `Line 1 runs: the computer creates a labeled box in memory called \`name\` and puts the text "${name}" inside it. Then it moves to the next line — always the next line, unless told otherwise.`, [1]);
  calm(b);

  setVar(b, "greeting", `"Hello, ${name}"`, "string");
  snapshot(b, "Line 2 runs: the computer LOOKS UP the box `name`, glues the two texts together, and stores the result in a new box `greeting`. Instructions can read memory as well as write it.", [2]);
  calm(b);

  b.consoleLines.push(`Hello, ${name}`);
  snapshot(b, "Line 3 runs: `print` sends the contents of `greeting` to the console — that is how a program talks back to you.", [3]);

  b.consoleLines.push("Nice to meet you!");
  snapshot(b, "Line 4 runs: another print. And that's the last instruction, so the program ends.", [4]);

  snapshot(b, "That is ALL a program is: instructions → memory → output. Everything else you will ever learn — loops, functions, data structures — is just clever arrangements of this.", [], {
    message: { text: "INSTRUCTIONS → MEMORY → OUTPUT", tone: "ok" },
  });
  return done(b, "What Is a Program?", { time: "4 steps", space: "2 boxes" }, pseudo);
}

const VARS_PSEUDO = ["x = 5", "y = x", "x = 10", "print(x)", "print(y)"];

function fVariables(b: Builder): FoundationsProgram {
  snapshot(b, "A variable is a LABELED BOX in memory. The label is the name you chose; the box holds exactly one value at a time. Let's create some and — the important part — overwrite one.", []);

  setVar(b, "x", "5", "number");
  snapshot(b, "Line 1: a box labeled `x` is created and 5 goes inside.", [1]);
  calm(b);

  const x = b.vars.find((v) => v.name === "x")!;
  x.state = "target";
  setVar(b, "y", "5", "number");
  snapshot(b, "Line 2: `y = x` COPIES the value out of x's box into a brand-new box `y`. The boxes are not connected — y got a photocopy of the 5, not a link to x.", [2]);
  calm(b);

  setVar(b, "x", "10", "number", "removing");
  snapshot(b, "Line 3: `x = 10` OVERWRITES the box. The old 5 is gone — a box only ever holds one value, and assignment replaces it.", [3]);
  const x2 = b.vars.find((v) => v.name === "x")!;
  x2.state = "new";
  snapshot(b, "x now holds 10. Question before the next line runs: what will y print?", [3]);
  calm(b);

  b.consoleLines.push("10");
  snapshot(b, "Line 4: prints x → 10.", [4]);

  const y = b.vars.find((v) => v.name === "y")!;
  y.state = "found";
  b.consoleLines.push("5");
  snapshot(b, "Line 5: prints y → still 5! Changing x later did NOT touch y, because line 2 copied the value. This trips up almost every beginner once — now it won't trip you.", [5], {
    message: { text: "COPIES DON'T FOLLOW THE ORIGINAL", tone: "ok" },
  });
  return done(b, "Variables", { time: "5 steps", space: "2 boxes" }, VARS_PSEUDO);
}

const TYPES_PSEUDO = ["a = 5", 'b = "5"', "print(a + 1)", "print(b + 1)", "sunny = true", 'if sunny: print("go outside")'];

function fDatatypes(b: Builder): FoundationsProgram {
  snapshot(b, "Every value has a TYPE — number, text (string), true/false (boolean). The type badge on each box decides what operations MEAN. Watch the same `+` do two totally different jobs.", []);

  setVar(b, "a", "5", "number");
  snapshot(b, "Line 1: `a` holds the NUMBER 5 — a quantity you can do math with.", [1]);
  calm(b);

  setVar(b, "b", '"5"', "string");
  snapshot(b, 'Line 2: `b` holds the STRING "5" — the same character on your screen, but to the computer it is a piece of TEXT, like "hello". Note the different type badge.', [2]);
  calm(b);

  b.consoleLines.push("6");
  b.vars.find((v) => v.name === "a")!.state = "target";
  snapshot(b, "Line 3: number + number → the `+` does MATH: 5 + 1 = 6.", [3]);
  calm(b);

  b.consoleLines.push('"51"');
  b.vars.find((v) => v.name === "b")!.state = "removing";
  snapshot(b, 'Line 4: string + number → the `+` GLUES TEXT: "5" + 1 becomes "51". Same symbol, completely different behaviour — the TYPE decided. This is why type errors are the most common beginner bug.', [4], {
    message: { text: '"5" + 1 = "51" — THE TYPE DECIDES', tone: "error" },
  });
  calm(b);

  setVar(b, "sunny", "true", "boolean");
  snapshot(b, "Line 5: `sunny` holds a BOOLEAN — the only two values are true and false. Booleans exist to answer questions.", [5]);
  calm(b);

  b.consoleLines.push("go outside");
  snapshot(b, "Line 6: and questions drive decisions — the if runs its line because sunny is true. (That's the next lesson.)", [6], {
    message: { text: "TYPES DECIDE WHAT OPERATIONS MEAN", tone: "ok" },
  });
  return done(b, "Datatypes", { time: "6 steps", space: "3 boxes" }, TYPES_PSEUDO);
}

const COND_PSEUDO = ["age = 15", "if age >= 18:", '  print("can vote ✓")', "else:", '  print("too young")', 'print("done")'];

function fConditionals(b: Builder, age: number): FoundationsProgram {
  const a1 = Number.isFinite(age) && age > 0 ? age : 15;
  const a2 = a1 >= 18 ? 15 : 25; // the contrasting second run

  snapshot(b, "So far the computer ran every line, top to bottom. An IF gives it a CHOICE: ask a true/false question, then run one path and SKIP the other. We'll run the same program twice with different data.", []);

  const runOnce = (age: number, first: boolean) => {
    setVar(b, "age", String(age), "number", first ? "new" : "removing");
    snapshot(b, first ? `Line 1: age = ${age}.` : `REPLAY — same program, new data: age is overwritten to ${age}.`, [1]);
    const v = b.vars.find((x) => x.name === "age")!;
    v.state = "target";
    const pass = age >= 18;
    snapshot(b, `Line 2: the question — is ${age} >= 18? ${pass ? "TRUE" : "FALSE"}. The answer decides where the program counter goes next.`, [2]);
    calm(b);
    if (pass) {
      b.consoleLines.push("can vote ✓");
      snapshot(b, `TRUE → the computer enters the if-branch and runs line 3. Lines 4–5 (the else) are SKIPPED — they simply never execute this run.`, [3]);
    } else {
      b.consoleLines.push("too young");
      snapshot(b, `FALSE → line 3 is SKIPPED — the program counter JUMPS over it to the else, and runs line 5 instead.`, [5]);
    }
    b.consoleLines.push("done");
    snapshot(b, "Both paths meet again afterwards: line 6 runs either way.", [6]);
  };

  runOnce(a1, true);
  runOnce(a2, false);

  snapshot(b, "Same instructions, different data, different path — that is all decision-making in software is. Every game, every app: mountains of tiny if-questions.", [], {
    message: { text: "DATA PICKS THE PATH", tone: "ok" },
  });
  return done(b, "Conditionals (if / else)", { time: "one path runs", space: "1 box" }, COND_PSEUDO);
}

const LOOP_PSEUDO = ["n = 4", "i = 1", "while i <= n:", '  print("tick", i)', "  i = i + 1", 'print("liftoff!")'];

function fLoops(b: Builder, n: number): FoundationsProgram {
  const N = Math.max(1, Math.min(Number.isFinite(n) && n > 0 ? n : 4, 7));
  const pseudo = [...LOOP_PSEUDO];
  pseudo[0] = `n = ${N}`;

  snapshot(b, "A loop is the program counter JUMPING BACKWARDS. That's it — the computer re-runs the same lines until a question says stop. This is where computers earn their keep: they never get bored.", []);

  setVar(b, "n", String(N), "number");
  snapshot(b, `Line 1: n = ${N} — how many times we want to repeat.`, [1]);
  calm(b);
  setVar(b, "i", "1", "number");
  snapshot(b, "Line 2: i = 1 — the loop's counter. It will tick up every lap.", [2]);
  calm(b);

  let i = 1;
  while (i <= N) {
    const v = b.vars.find((x) => x.name === "i")!;
    v.state = "target";
    snapshot(b, `Line 3: is i (${i}) <= n (${N})? TRUE → enter the loop body.`, [3]);
    calm(b);
    b.consoleLines.push(`tick ${i}`);
    snapshot(b, `Line 4: print. The console grows by one line per lap.`, [4]);
    i += 1;
    setVar(b, "i", String(i), "number", "new");
    snapshot(b, `Line 5: i = i + 1 — the box is overwritten, ${i - 1} → ${i}. Now the magic: the program counter JUMPS BACK UP to line 3.`, [5]);
    calm(b);
  }
  const v = b.vars.find((x) => x.name === "i")!;
  v.state = "removing";
  snapshot(b, `Line 3, one last time: is i (${i}) <= n (${N})? FALSE → the loop is over; the counter finally moves DOWN past it.`, [3]);
  calm(b);
  b.consoleLines.push("liftoff!");
  snapshot(b, "Line 6 runs, and the program ends. One question + one backwards jump = every loop ever written.", [6], {
    message: { text: `${N} LAPS, ZERO BOREDOM`, tone: "ok" },
  });
  return done(b, "Loops (while)", { time: `${N} laps`, space: "2 boxes" }, pseudo);
}

// --- Time complexity ------------------------------------------------------------

const C_N1 = "#34C98A";
const C_N2 = "#F5A623";
const C_N3 = "#FF5F4A";
const C_N4 = "#9ccaff";

const COUNT_PSEUDO = ["biggest = list[0]", "for each item in list:", "  if item > biggest:", "    biggest = item", "return biggest"];

function fCountingSteps(b: Builder, customList?: number[]): FoundationsProgram {
  const base = useList(customList, [3, 7, 2, 9]);
  const doubled = [...base, ...base.map((x) => x + 1)];

  b.counters = [];
  chartInit(b, "steps vs input size", "n (items)", "steps", [
    { label: "measured steps", color: C_N2, points: [] },
    refCurve("n (for shape)", "#7a8087", (x) => x, 1, doubled.length),
  ]);
  snapshot(b, `How do we measure "fast"? Not in seconds — computers differ. We COUNT STEPS: every executed line is one step (one tile). Let's find the biggest number in a list and count. (Sidebar: paste your OWN list and re-run.)`, []);

  const run = (list: number[], color: string) => {
    const row: FoundCounter = { label: `n = ${list.length}`, steps: 0, color, active: true };
    b.counters!.push(row);
    setVar(b, "list", `[${list.join(", ")}]`, "string", "idle");
    setVar(b, "biggest", String(list[0]), "number");
    row.steps += 1;
    snapshot(b, `A list of ${list.length} numbers. Line 1: start with the first as \`biggest\` — 1 step (1 tile).`, [1]);
    calm(b);
    let biggest = list[0];
    for (let k = 1; k < list.length; k++) {
      row.steps += 1;
      let lines = [2, 3];
      let msg = `Compare ${list[k]} with ${biggest} — 1 step.`;
      if (list[k] > biggest) {
        biggest = list[k];
        setVar(b, "biggest", String(biggest), "number", "new");
        row.steps += 1;
        lines = [3, 4];
        msg = `${list[k]} is bigger — compare AND update: 2 steps.`;
      }
      snapshot(b, msg, lines);
      calm(b);
    }
    row.steps += 1;
    row.active = false;
    chartPush(b, 0, [list.length, row.steps]);
    snapshot(b, `Return — 1 step. Total for n = ${list.length}: ${row.steps} steps — a new point lands on the GRAPH: (${list.length}, ${row.steps}).`, [5]);
  };

  run(base, C_N1);
  snapshot(b, "Now the interesting question: what happens to the step count if the list gets TWICE as long?", []);
  run(doubled, C_N2);

  snapshot(b, "Twice the input → roughly twice the tiles — look at the graph: the measured points rise IN PROPORTION to n, hugging the straight dashed line. That relationship — not the exact number — is what we call time complexity.", [], {
    message: { text: "COST = HOW STEPS GROW WITH n", tone: "ok" },
  });
  return done(b, "Counting Steps", { time: "≈ n steps", space: "O(1)" }, COUNT_PSEUDO);
}

const BIGO_PSEUDO = ["find-max costs, for a list of n items:", "  1 step     setup (biggest = list[0])", "  n steps    the loop touches every item", "  1 step     return", "total: n + 2   →   we say O(n)"];

function fBigO(b: Builder): FoundationsProgram {
  b.counters = [
    { label: "setup", steps: 0, color: "#7a8087" },
    { label: "loop (n = 12)", steps: 0, color: C_N2 },
    { label: "return", steps: 0, color: "#7a8087" },
  ];
  chartInit(b, "n + 2 vs plain n — same curve", "n", "steps", [
    { label: "T(n) = n + 2", color: C_N2, points: [] },
    refCurve("n", "#7a8087", (x) => x, 1, 16),
  ]);
  snapshot(b, "We counted steps; now let's write the count as a FORMULA and simplify it. That simplified form is Big-O — the universal language for algorithm cost.", [1]);

  b.counters[0].steps = 1;
  snapshot(b, "Setup runs once, no matter how long the list is: 1 tile.", [2]);

  for (let k = 3; k <= 12; k += 3) {
    b.counters[1].steps = k;
    for (let x = k - 2; x <= k; x++) chartPush(b, 0, [x, x + 2]);
    snapshot(b, `The loop runs once per item — for n = 12, that's 12 tiles. This is the part that GROWS when the input grows. On the graph, T(n) = n + 2 is being drawn against plain n.`, [3]);
  }

  b.counters[2].steps = 1;
  snapshot(b, "Return: 1 more tile. Total = n + 2.", [4]);

  b.counters[0].note = "fixed";
  b.counters[2].note = "fixed";
  b.counters[1].note = "grows with n ←";
  snapshot(b, "Now imagine n = 1,000,000. The loop contributes 1,000,000 tiles; setup and return still contribute 2. Next to the loop, they are invisible — so we DROP them.", [5]);

  b.counters = [{ label: "O(n)", steps: 12, color: C_N1, note: "only the growing part survives" }];
  snapshot(b, "n + 2 → O(n). Big-O keeps ONLY the fastest-growing part and drops constants: 3n+5, n+2 and 2n are all just O(n). It answers one question: when the input explodes, how does the work explode?", [5], {
    message: { text: "n + 2  →  O(n)", tone: "ok" },
  });
  return done(b, "Big-O Notation", { time: "O(n)", space: "O(1)" }, BIGO_PSEUDO);
}

function fGrowthRates(b: Builder, value?: number): FoundationsProgram {
  const N = Math.max(4, Math.min(Number.isFinite(value) && (value ?? 0) > 0 ? Math.round(value!) : 16, 25));
  const LOG = Math.max(1, Math.ceil(Math.log2(N)));
  const pseudo = [
    `for n = ${N} items:`,
    `O(1)      1 step${" ".repeat(6)}grab by index`,
    `O(log n)  ${LOG} steps     halve until found`,
    `O(n)      ${N} steps    touch every item`,
    `O(n²)     ${N * N} steps   compare every pair`,
  ];

  b.counters = [
    { label: "O(1)", steps: 0, color: C_N1 },
    { label: "O(log n)", steps: 0, color: C_N4 },
    { label: "O(n)", steps: 0, color: C_N2 },
    { label: "O(n²)", steps: 0, color: C_N3 },
  ];
  chartInit(b, "the four curves, same n", "n", "steps", [
    { label: "O(1)", color: C_N1, points: [] },
    { label: "O(log n)", color: C_N4, points: [] },
    { label: "O(n)", color: C_N2, points: [] },
    { label: "O(n²)", color: C_N3, points: [] },
  ]);
  snapshot(b, `The four growth rates you will meet everywhere, racing on the SAME input: a list of n = ${N} items. Watch how differently they scale — tiles pile up, and each racer draws its curve on the graph. (Sidebar: change n and re-run.)`, [1]);

  const fillCurve = (idx: number, fn: (x: number) => number) => {
    for (let x = 1; x <= N; x++) chartPush(b, idx, [x, fn(x)]);
  };

  b.counters[0].steps = 1;
  b.counters[0].active = true;
  fillCurve(0, () => 1);
  snapshot(b, `O(1) — constant: grabbing item #7 by index costs 1 step whether the list has ${N} items or 16 billion. A perfectly FLAT line. Arrays give you this.`, [2]);
  b.counters[0].active = false;

  b.counters[1].active = true;
  for (let s = 1; s <= LOG; s++) {
    b.counters[1].steps = s;
    if (s === 1) fillCurve(1, (x) => Math.max(1, Math.ceil(Math.log2(x + 1))));
    snapshot(b, `O(log n) — halving: binary search cuts the list in half each step. Only ${s === LOG ? `${LOG} steps total` : `${s} step(s) so far`} — its curve barely lifts off the floor.`, [3]);
  }
  b.counters[1].active = false;

  b.counters[2].active = true;
  const nStep = Math.max(1, Math.ceil(N / 4));
  for (let s = nStep; s < N + nStep; s += nStep) {
    const k = Math.min(s, N);
    b.counters[2].steps = k;
    if (s === nStep) fillCurve(2, (x) => x);
    snapshot(b, `O(n) — linear: checking every item once. ${k} of ${N} tiles — a straight diagonal on the graph.`, [4]);
    if (k === N) break;
  }
  b.counters[2].active = false;

  b.counters[3].active = true;
  const qStep = Math.max(1, Math.ceil((N * N) / 4));
  for (let s = qStep; s < N * N + qStep; s += qStep) {
    const k = Math.min(s, N * N);
    b.counters[3].steps = k;
    if (s === qStep) fillCurve(3, (x) => x * x);
    snapshot(b, `O(n²) — quadratic: comparing every item with every other (like bubble sort). ${N} × ${N} = ${N * N} tiles… ${k} and counting. Its curve is the one shooting off the top of the chart.`, [5]);
    if (k === N * N) break;
  }
  b.counters[3].active = false;

  snapshot(b, "Now scale n to 1,000,000: O(1) is still 1 step, O(log n) about 20, O(n) a million — and O(n²) a TRILLION (hours of compute). The gap between these curves is why algorithms matter more than fast computers.", [], {
    message: { text: "AT n = 10⁶: 1 vs 20 vs 10⁶ vs 10¹²", tone: "ok" },
  });
  return done(b, "Growth Rates", { time: "O(1) → O(n²)", space: "—" }, pseudo);
}

// --- Complexity analysis (formal) ---------------------------------------------------

const TC_PSEUDO = ["total = 0          // 1 step", "for each item:     // runs n times", "  total = total + item", "return total       // 1 step", "T(n) = n + 2   ← a FUNCTION of n"];

function fTimeComplexity(b: Builder, customList?: number[]): FoundationsProgram {
  const nBase = customList && customList.length >= 2 ? Math.min(customList.length, 8) : 5;
  const sizes = Array.from(new Set([Math.max(2, Math.round(nBase / 2) + 1), nBase, Math.min(nBase * 2, 12)]));
  const maxN = sizes[sizes.length - 1];

  b.counters = [];
  chartInit(b, "T(n) — steps as a function of n", "n", "steps", [
    { label: "measured T(n)", color: C_N2, points: [] },
    refCurve("n + 2", "#7a8087", (x) => x + 2, 1, maxN + 2),
  ]);
  snapshot(b, `Time complexity is a FUNCTION: T(n) = "how many steps for an input of size n". Let's measure the same program at three sizes and read the function right off the tiles — and off the graph. (Sidebar: give your own list; its length sets n.)`, [5]);

  const run = (n: number, color: string) => {
    const row: FoundCounter = { label: `n = ${n}`, steps: 0, color, active: true };
    b.counters!.push(row);
    setVar(b, "n", String(n), "number", "new");
    setVar(b, "total", "0", "number");
    row.steps = 1;
    snapshot(b, `Sum a list of ${n} items. Setup: 1 step.`, [1]);
    calm(b);
    for (let k = 1; k <= n; k++) {
      row.steps += 1;
      if (k === n || k % 2 === 0) snapshot(b, `The loop body runs once per item — ${k} of ${n} so far.`, [2, 3]);
    }
    row.steps += 1;
    row.active = false;
    row.note = `= ${n} + 2`;
    chartPush(b, 0, [n, n + 2]);
    snapshot(b, `Return: 1 step. Total for n = ${n}: ${n + 2} steps — point (${n}, ${n + 2}) lands exactly on the dashed n + 2 curve.`, [4]);
  };

  const runColors = [C_N1, C_N2, C_N3];
  sizes.forEach((n, i) => run(n, runColors[i % runColors.length]));

  snapshot(b, `Read the pattern: ${sizes.map((n) => n + 2).join(", ")} steps for n = ${sizes.join(", ")} — always n + 2. That formula IS the time complexity: T(n) = n + 2, which Big-O rounds to O(n). Time complexity is never one number; it is steps AS A FUNCTION of input size — the curve on the graph.`, [5], {
    message: { text: "T(n) = n + 2 → O(n)", tone: "ok" },
  });
  return done(b, "Time Complexity", { time: "O(n)", space: "O(1)" }, TC_PSEUDO);
}

const SC_PSEUDO = ["// reverse a list of n items", "way A: build a reversed COPY", "  → n new boxes of memory", "way B: swap in place with l, r", "  → 2 boxes, no matter how big n is", "space: A = O(n),  B = O(1)"];

function fSpaceComplexity(b: Builder, customList?: number[]): FoundationsProgram {
  const list = useList(customList, [1, 2, 3, 4, 5, 6]);
  const n = list.length;
  const rev = [...list].reverse();

  b.counters = [];
  chartInit(b, "extra memory vs n", "n (items)", "boxes", [
    { label: "way A: copy — n boxes", color: C_N3, points: [] },
    { label: "way B: in place — 2 boxes", color: C_N1, points: [] },
  ]);
  snapshot(b, `Time counts steps; SPACE counts extra memory boxes. Same task — reverse a list of ${n} — solved two ways with very different memory bills. (Sidebar: use your own list.)`, [1]);

  setVar(b, "list", `[${list.join(",")}]`, "string");
  const rowA: FoundCounter = { label: "way A: copy", steps: 0, color: C_N3, active: true };
  b.counters.push(rowA);
  snapshot(b, `Way A: walk the list backwards and append each item to a NEW list. Simple — but every item needs a new box.`, [2]);
  for (let k = 1; k <= n; k++) {
    rowA.steps = k;
    chartPush(b, 0, [k, k]);
    if (k % 2 === 0 || k === n) {
      setVar(b, "copy", `[${rev.slice(0, k).join(",")}${k < n ? "…" : ""}]`, "string", "new");
      snapshot(b, `${k} items copied → ${k} extra boxes allocated. The memory bill grows WITH the input — watch way A's line climb.`, [2, 3]);
      calm(b);
    }
  }
  rowA.active = false;
  rowA.note = "= n boxes";
  snapshot(b, `Way A total: n extra boxes — space complexity O(n).`, [3]);

  const rowB: FoundCounter = { label: "way B: in place", steps: 0, color: C_N1, active: true };
  b.counters.push(rowB);
  b.vars = b.vars.filter((v) => v.name !== "copy");
  setVar(b, "l", "0", "number");
  setVar(b, "r", String(n - 1), "number");
  rowB.steps = 2;
  for (let k = 1; k <= n; k++) chartPush(b, 1, [k, 2]);
  snapshot(b, `Way B: two pointers swap ends inward, reusing the list's own boxes. Extra memory: just l and r — 2 boxes. Its line on the graph is FLAT.`, [4]);
  rowB.active = false;
  rowB.note = "= 2 boxes, always";
  setVar(b, "list", `[${rev.join(",")}]`, "string", "new");
  snapshot(b, `Reversed with the SAME 2 extra boxes whether the list holds ${n} items or 6 million — space complexity O(1). Time and space are separate budgets; great algorithms mind both.`, [5, 6], {
    message: { text: "A: O(n) SPACE · B: O(1) SPACE", tone: "ok" },
  });
  return done(b, "Space Complexity", { time: "O(n)", space: "O(1) vs O(n)" }, SC_PSEUDO);
}

const CASE_PSEUDO = ["for i = 0 … n−1:", "  if list[i] == target:", "    return i        // found", "return −1           // not found"];

function linearSearchCase(b: Builder, kind: "best" | "worst" | "average", customList?: number[]): FoundationsProgram {
  const list = useList(customList, [7, 3, 9, 4, 2, 8]);
  const n = list.length;
  const absent = Math.max(...list) + 1;
  const costOf = (target: number) => {
    const i = list.indexOf(target);
    return i === -1 ? n : i + 1;
  };
  b.counters = [];

  const search = (target: number, color: string, label: string) => {
    const row: FoundCounter = { label, steps: 0, color, active: true };
    b.counters!.push(row);
    setVar(b, "list", `[${list.join(",")}]`, "string");
    setVar(b, "target", String(target), "number", "new");
    snapshot(b, `Search for ${target} with a left-to-right scan.`, [1]);
    calm(b);
    for (let i = 0; i < list.length; i++) {
      row.steps += 1;
      if (list[i] === target) {
        snapshot(b, `Compare with ${list[i]} — FOUND at index ${i} after ${row.steps} comparison(s). Stop.`, [2, 3]);
        row.active = false;
        return;
      }
      snapshot(b, `Compare with ${list[i]} — no. Keep going.`, [2]);
    }
    snapshot(b, `Scanned all ${list.length} items — ${target} is not there.`, [4]);
    row.active = false;
  };

  if (kind === "best") {
    snapshot(b, `The SAME algorithm can cost wildly different amounts depending on the data. Best case: the luckiest possible input. (Sidebar: try your own list — the first element is always the lucky one.)`, [1]);
    search(list[0], C_N1, "target first");
    snapshot(b, `The target sat at index 0 — one comparison, done. Best case = Ω(1) for linear search. Useful to know, but never something to COUNT on: real inputs are rarely this kind.`, [], {
      message: { text: "BEST CASE: 1 STEP — PURE LUCK", tone: "ok" },
    });
    return done(b, "Best Case", { time: "Ω(1)", space: "O(1)" }, CASE_PSEUDO);
  }
  if (kind === "worst") {
    const lastCost = costOf(list[n - 1]);
    snapshot(b, `Worst case: the UNLUCKIEST input — the one guarantee an algorithm can make. This is what the O(·) badges all over this app describe.`, [1]);
    search(list[n - 1], C_N3, "target last");
    search(absent, C_N2, "target absent");
    snapshot(b, `Target at the end: ${lastCost} comparison(s). Target absent: ${n} — the scan can never stop early. Worst case = O(n), and it's the honest number: "no input can cost more than this".`, [], {
      message: { text: `WORST CASE: n = ${n} STEPS, GUARANTEED`, tone: "ok" },
    });
    return done(b, "Worst Case", { time: "O(n)", space: "O(1)" }, CASE_PSEUDO);
  }

  // average case — with a cost-vs-position chart
  const idxs = Array.from(new Set([Math.min(1, n - 1), Math.floor(n / 2), n - 1]));
  const costs = idxs.map((i) => costOf(list[i]));
  const avg = costs.reduce((a, c) => a + c, 0) / costs.length;
  chartInit(b, "cost vs where the target sits", "position", "comparisons", [
    { label: "cost of this search", color: C_N2, points: [] },
    { label: `average ≈ ${avg.toFixed(1)}`, color: C_N4, dashed: true, points: [[1, avg], [n, avg]] },
  ]);
  snapshot(b, `Average case: what a TYPICAL input costs — average the cost over all equally-likely target positions. Each search will drop a point on the graph.`, [1]);
  const caseColors = [C_N1, C_N2, C_N3];
  idxs.forEach((idx, k) => {
    search(list[idx], caseColors[k % caseColors.length], `found at #${idx + 1}`);
    chartPush(b, 0, [costOf(list[idx]), costOf(list[idx])]);
  });
  b.counters.push({ label: "average", steps: Math.round(avg), color: C_N4, note: "≈ (n+1)/2" });
  snapshot(b, `Costs of ${costs.join(", ")} average to ${avg.toFixed(1)} ≈ (n+1)/2. On the graph the cost climbs linearly with position, and the dashed line is the average — half a scan. Still O(n): a constant factor of ½ doesn't change the growth curve.`, [], {
    message: { text: "AVERAGE ≈ n/2 — STILL O(n)", tone: "ok" },
  });
  return done(b, "Average Case", { time: "Θ(n)", space: "O(1)" }, CASE_PSEUDO);
}

// --- Asymptotic notation --------------------------------------------------------------

const BOUND_PSEUDO_O = ["f(n) = 2n + 3      // our step count", "claim:  f is O(n)", "pick    c = 3,  n₀ = 3", "check:  2n + 3 ≤ 3·n  for all n ≥ 3", "holds forever → f = O(n)  (upper bound)"];

function fBigOBound(b: Builder): FoundationsProgram {
  b.counters = [];
  chartInit(b, "f under the ceiling 3n", "n", "cost", [
    { label: "f(n) = 2n + 3", color: C_N2, points: [] },
    refCurve("ceiling 3·n", "#7a8087", (x) => 3 * x, 1, 10),
  ]);
  snapshot(b, `Big-O, precisely this time: f = O(g) means "beyond some point n₀, f(n) never exceeds c·g(n) for a fixed constant c". Let's TEST the claim 2n+3 = O(n) with c = 3 — watch f's curve against the dashed ceiling.`, [1, 2, 3]);

  let lastX = 0;
  const check = (n: number) => {
    for (let x = lastX + 1; x <= n; x++) chartPush(b, 0, [x, 2 * x + 3]);
    lastX = n;
    const f = 2 * n + 3;
    const g = 3 * n;
    const ok = f <= g;
    b.counters!.push({ label: `f(${n}) = ${f}`, steps: f, color: ok ? C_N1 : C_N3, active: true });
    b.counters!.push({ label: `3·g(${n}) = ${g}`, steps: g, color: "#7a8087", note: ok ? "f fits under ✓" : "f pokes above ✗" });
    snapshot(b, ok
      ? `n = ${n}: f = ${f} ≤ ${g} = 3n — the bound HOLDS. And it only gets more comfortable as n grows.`
      : `n = ${n}: f = ${f} > ${g} = 3n — the bound FAILS here. That's fine! Big-O only cares about "eventually": we're allowed to ignore small n.`, [4]);
    b.counters!.forEach((c) => (c.active = false));
  };

  check(2);
  check(4);
  check(8);

  for (let x = lastX + 1; x <= 10; x++) chartPush(b, 0, [x, 2 * x + 3]);
  snapshot(b, `Below n₀ = 3 the bound may fail (f starts ABOVE the dashed line); from n₀ on it stays under forever. That's the whole definition: f = O(g) ⇔ ∃ c, n₀ such that f(n) ≤ c·g(n) for all n ≥ n₀. Big-O is a CEILING on growth.`, [5], {
    message: { text: "2n + 3 = O(n) — CEILING", tone: "ok" },
  });
  return done(b, "Big-O (upper bound)", { time: "O(n)", space: "—" }, BOUND_PSEUDO_O);
}

const BOUND_PSEUDO_OM = ["f(n) = 2n + 3", "claim:  f is Ω(n)", "pick    c = 1,  n₀ = 1", "check:  2n + 3 ≥ 1·n  for all n ≥ 1", "holds → f = Ω(n)  (lower bound / FLOOR)"];

function fBigOmega(b: Builder): FoundationsProgram {
  b.counters = [];
  chartInit(b, "f above the floor 1·n", "n", "cost", [
    { label: "f(n) = 2n + 3", color: C_N2, points: [] },
    refCurve("floor 1·n", "#7a8087", (x) => x, 1, 10),
  ]);
  snapshot(b, `Big-Ω is Big-O's mirror: a FLOOR. f = Ω(g) means "beyond n₀, f(n) is AT LEAST c·g(n)" — the work never drops below that curve. Test: 2n+3 = Ω(n) with c = 1.`, [1, 2, 3]);

  let lastX = 0;
  for (const n of [2, 4, 8]) {
    for (let x = lastX + 1; x <= n; x++) chartPush(b, 0, [x, 2 * x + 3]);
    lastX = n;
    const f = 2 * n + 3;
    b.counters.push({ label: `f(${n}) = ${f}`, steps: f, color: C_N2, active: true });
    b.counters.push({ label: `1·g(${n}) = ${n}`, steps: n, color: "#7a8087", note: "f stays above ✓" });
    snapshot(b, `n = ${n}: f = ${f} ≥ ${n} = 1·n. On the graph f's curve never dips below the dashed floor.`, [4]);
    b.counters.forEach((c) => (c.active = false));
  }
  for (let x = lastX + 1; x <= 10; x++) chartPush(b, 0, [x, 2 * x + 3]);

  snapshot(b, `f = Ω(n): the algorithm ALWAYS does at least linear work. O(·) promises "no worse than"; Ω(·) warns "no better than". Sorting by comparisons, for example, is Ω(n log n) — no algorithm can beat it.`, [5], {
    message: { text: "2n + 3 = Ω(n) — FLOOR", tone: "ok" },
  });
  return done(b, "Big-Omega (lower bound)", { time: "Ω(n)", space: "—" }, BOUND_PSEUDO_OM);
}

const BOUND_PSEUDO_TH = ["f(n) = 2n + 3", "floor:    2n + 3 ≥ 1·n   (Ω)", "ceiling:  2n + 3 ≤ 3·n   (O, n ≥ 3)", "both hold → f = Θ(n)", "// sandwiched: f grows EXACTLY like n"];

function fBigTheta(b: Builder): FoundationsProgram {
  b.counters = [];
  chartInit(b, "the sandwich: 1n ≤ f ≤ 3n", "n", "cost", [
    { label: "f(n) = 2n + 3", color: C_N1, points: [] },
    refCurve("ceiling 3n", "#7a8087", (x) => 3 * x, 1, 10),
    refCurve("floor 1n", "#7a8087", (x) => x, 1, 10),
  ]);
  snapshot(b, `Big-Θ is the sandwich: f = Θ(g) when f is BOTH O(g) and Ω(g) — squeezed between a floor and a ceiling of the same shape. That pins the growth rate exactly. Watch f's curve live strictly between the two dashed lines.`, [1]);

  let lastX = 0;
  for (const n of [4, 8]) {
    for (let x = lastX + 1; x <= n; x++) chartPush(b, 0, [x, 2 * x + 3]);
    lastX = n;
    const f = 2 * n + 3;
    b.counters.push({ label: `ceiling 3n = ${3 * n}`, steps: 3 * n, color: "#7a8087" });
    b.counters.push({ label: `f(${n}) = ${f}`, steps: f, color: C_N1, active: true, note: "in the sandwich ✓" });
    b.counters.push({ label: `floor 1n = ${n}`, steps: n, color: "#7a8087" });
    snapshot(b, `n = ${n}: ${n} ≤ ${f} ≤ ${3 * n} — f sits strictly between the two linear curves.`, [2, 3]);
    b.counters.forEach((c) => (c.active = false));
  }
  for (let x = lastX + 1; x <= 10; x++) chartPush(b, 0, [x, 2 * x + 3]);

  snapshot(b, `Squeezed from both sides by multiples of n → f = Θ(n): it grows EXACTLY linearly. Θ is the most honest statement you can make; when people casually say "it's O(n)", they usually mean Θ(n).`, [4, 5], {
    message: { text: "Ω(n) + O(n) = Θ(n) — EXACT", tone: "ok" },
  });
  return done(b, "Big-Theta (tight bound)", { time: "Θ(n)", space: "—" }, BOUND_PSEUDO_TH);
}

const BOUND_PSEUDO_LO = ["f(n) = n,   g(n) = n²", "little-o is STRICT: for EVERY c > 0,", "  f(n) < c·g(n) eventually", "f/g = 1/n → shrinks to 0", "→ n = o(n²): strictly slower growth"];

function fLittleO(b: Builder): FoundationsProgram {
  b.counters = [];
  chartInit(b, "n falls hopelessly behind n²", "n", "cost", [
    { label: "f(n) = n", color: C_N1, points: [] },
    refCurve("g(n) = n²", C_N3, (x) => x * x, 1, 8),
  ]);
  snapshot(b, `little-o is Big-O with the equals sign removed: f = o(g) means f grows STRICTLY slower — for EVERY constant c, c·g eventually dwarfs f. Watch n against n² on the graph.`, [1, 2]);

  let lastX = 0;
  for (const n of [2, 4, 8]) {
    for (let x = lastX + 1; x <= n; x++) chartPush(b, 0, [x, x]);
    lastX = n;
    b.counters.push({ label: `f(${n}) = ${n}`, steps: n, color: C_N1, active: true });
    b.counters.push({ label: `g(${n}) = ${n * n}`, steps: n * n, color: C_N3, note: `ratio f/g = 1/${n}` });
    snapshot(b, `n = ${n}: the ratio f/g = 1/${n}. It isn't just small — it keeps SHRINKING toward zero.`, [3, 4]);
    b.counters.forEach((c) => (c.active = false));
  }

  snapshot(b, `f/g → 0, so no constant can save f from being overtaken: n = o(n²). Contrast: 2n = O(n) but 2n is NOT o(n) — same growth isn't strictly slower. little-o says "a genuinely lower league".`, [5], {
    message: { text: "n = o(n²) — STRICTLY SLOWER", tone: "ok" },
  });
  return done(b, "little-o (strict upper)", { time: "o(n²)", space: "—" }, BOUND_PSEUDO_LO);
}

const BOUND_PSEUDO_LW = ["f(n) = n²,   g(n) = n", "little-ω is STRICT: for EVERY c > 0,", "  f(n) > c·g(n) eventually", "f/g = n → blows up to ∞", "→ n² = ω(n): strictly faster growth"];

function fLittleOmega(b: Builder): FoundationsProgram {
  b.counters = [];
  chartInit(b, "n² leaves n in the dust", "n", "cost", [
    { label: "f(n) = n²", color: C_N3, points: [] },
    refCurve("g(n) = n", C_N1, (x) => x, 1, 8),
  ]);
  snapshot(b, `little-ω is the strict mirror of Ω: f = ω(g) means f grows STRICTLY faster — it eventually beats c·g for EVERY constant c. Watch n² against n on the graph.`, [1, 2]);

  let lastX = 0;
  for (const n of [2, 4, 8]) {
    for (let x = lastX + 1; x <= n; x++) chartPush(b, 0, [x, x * x]);
    lastX = n;
    b.counters.push({ label: `f(${n}) = ${n * n}`, steps: n * n, color: C_N3, active: true });
    b.counters.push({ label: `g(${n}) = ${n}`, steps: n, color: C_N1, note: `ratio f/g = ${n}` });
    snapshot(b, `n = ${n}: the ratio f/g = ${n} — growing without limit.`, [3, 4]);
    b.counters.forEach((c) => (c.active = false));
  }

  snapshot(b, `f/g → ∞: pick any c you like, n² eventually leaves c·n behind — n² = ω(n). The five notations in one line: o < Ω-ish… precisely: o ⊂ O, ω ⊂ Ω, and Θ = O ∩ Ω.`, [5], {
    message: { text: "n² = ω(n) — STRICTLY FASTER", tone: "ok" },
  });
  return done(b, "little-omega (strict lower)", { time: "ω(n)", space: "—" }, BOUND_PSEUDO_LW);
}

// --- Amortized analysis ------------------------------------------------------------------

// Dynamic-array pushes with doubling: the shared example for all three methods.
function pushCosts(n: number): number[] {
  const costs: number[] = [];
  let size = 0;
  let cap = 1;
  for (let i = 0; i < n; i++) {
    if (size === cap) {
      costs.push(size + 1); // copy everything + place
      cap *= 2;
    } else costs.push(1);
    size++;
  }
  return costs;
}

const AGG_PSEUDO = ["push(x): if array is full:", "  allocate 2× space, copy everything", "place x at the end", "aggregate: TOTAL cost of n pushes ≤ 3n", "→ amortized O(1) per push"];

function fAggregate(b: Builder): FoundationsProgram {
  b.counters = [];
  chartInit(b, "spiky actual cost vs flat amortized", "push #", "cost", [
    { label: "actual cost", color: C_N3, points: [] },
    { label: "amortized ≈ 3", color: C_N1, dashed: true, points: [[1, 3], [8, 3]] },
  ]);
  snapshot(b, `Some operations are cheap, a few are expensive — is push "O(1)" or "O(n)"? Amortized analysis answers: charge the TOTAL over a sequence, not the worst single op. Aggregate method: just add everything up. The graph will show the cost SPIKES.`, [1]);

  const costs = pushCosts(8);
  let size = 0;
  let cap = 1;
  let total = 0;
  costs.forEach((c, i) => {
    const resized = c > 1;
    if (size === cap) cap *= 2;
    size++;
    total += c;
    setVar(b, "size", String(size), "number", "new");
    setVar(b, "capacity", String(cap), "number", resized ? "new" : "idle");
    b.counters!.push({ label: `push ${i + 1}`, steps: c, color: resized ? C_N3 : C_N1, note: resized ? `resize! copy ${c - 1}` : undefined });
    chartPush(b, 0, [i + 1, c]);
    snapshot(b, resized
      ? `Push ${i + 1}: the array is FULL — allocate double, copy all ${c - 1} items, then place. Cost ${c}.`
      : `Push ${i + 1}: room available — place it. Cost 1.`, resized ? [1, 2, 3] : [3]);
    calm(b);
  });

  b.counters.push({ label: "TOTAL", steps: total, color: C_N4, note: `= ${total} ≤ 3·8 = 24` });
  snapshot(b, `Add every tile: ${total} steps for 8 pushes — ${(total / 8).toFixed(1)} per push on average. The expensive resizes are RARE (each doubling buys twice as many cheap pushes), so the total stays ≤ 3n.`, [4]);
  snapshot(b, `Aggregate method: total(n) / n = amortized cost. ${total}/8 ≈ ${(total / 8).toFixed(1)} → push is amortized O(1), even though a single push can cost O(n). This is why dynamic arrays (vectors, ArrayLists) feel constant-time.`, [5], {
    message: { text: `${total} STEPS / 8 PUSHES → O(1) AMORTIZED`, tone: "ok" },
  });
  return done(b, "Aggregate Method", { time: "O(1) amortized", space: "O(n)" }, AGG_PSEUDO);
}

const ACC_PSEUDO = ["charge every push 3 coins:", "  1 coin  pays the placement", "  2 coins go into the BANK", "a resize is paid FROM the bank", "bank never goes negative → charge is valid", "→ amortized cost = 3 = O(1)"];

function fAccounting(b: Builder): FoundationsProgram {
  b.counters = [];
  chartInit(b, "the bank balance never goes negative", "push #", "coins", [
    { label: "bank balance", color: C_N1, points: [] },
    { label: "actual cost", color: C_N3, points: [] },
    { label: "flat charge 3", color: "#7a8087", dashed: true, points: [[1, 3], [8, 3]] },
  ]);
  snapshot(b, `Accounting (banker's) method: OVERCHARGE cheap operations and bank the change; expensive operations spend the savings. If the bank never goes negative, the flat charge is the true amortized cost. Watch the BANK line on the graph.`, [1]);

  const costs = pushCosts(8);
  let bank = 0;
  setVar(b, "bank", "0", "number");
  costs.forEach((c, i) => {
    const resized = c > 1;
    const fromBank = Math.max(0, c - 3);
    bank += 3 - c;
    setVar(b, "bank", String(bank), "number", resized ? "removing" : "new");
    b.counters!.push({ label: `push ${i + 1}`, steps: c, color: resized ? C_N3 : C_N1, note: resized ? `resize — bank → ${bank}` : `+2 banked → ${bank}` });
    chartPush(b, 0, [i + 1, bank]);
    chartPush(b, 1, [i + 1, c]);
    snapshot(b, resized
      ? fromBank > 0
        ? `Push ${i + 1} resizes (real cost ${c}): the 3-coin charge covers 3, the BANK pays the remaining ${fromBank} — balance drops to ${bank}, but stays ≥ 0.`
        : `Push ${i + 1} resizes (real cost ${c}): still within the 3-coin charge — balance ${bank}.`
      : `Push ${i + 1} is cheap (real cost 1): charge 3, spend 1, bank 2 — balance ${bank}. Each item saves up for its own future copy.`, resized ? [4, 5] : [1, 2, 3]);
    calm(b);
  });

  snapshot(b, `Every push was charged exactly 3, the bank never went negative — so 3 coins per push covers ALL the work forever. Amortized cost = 3 = O(1). Same answer as the aggregate method, but now with a story of WHERE the cost hides: each cheap push prepays its share of the next resize.`, [6], {
    message: { text: "FLAT CHARGE 3 WORKS → O(1) AMORTIZED", tone: "ok" },
  });
  return done(b, "Accounting Method", { time: "O(1) amortized", space: "O(n)" }, ACC_PSEUDO);
}

const POT_PSEUDO = ["Φ(state) = 2·size − capacity   // stored energy", "amortized = actual + Φafter − Φbefore", "cheap push:  1 + 2 = 3", "resize push: (k+1) + (2 − k) = 3", "Φ ≥ 0 always → every push is amortized 3", "→ O(1), by conservation of energy"];

function fPotential(b: Builder): FoundationsProgram {
  b.counters = [];
  chartInit(b, "energy Φ absorbs the spikes", "push #", "cost / Φ", [
    { label: "actual cost", color: C_N3, dashed: true, points: [] },
    { label: "Φ (stored energy)", color: C_N4, points: [] },
    { label: "amortized", color: C_N1, points: [] },
  ]);
  snapshot(b, `Potential method: define a "stored energy" Φ on the data structure. Cheap operations RAISE Φ; expensive ones RELEASE it. Amortized cost = actual + ΔΦ — and the spikes cancel out. Watch all three lines: actual spikes, Φ saw-tooths, amortized stays FLAT.`, [1, 2]);

  let size = 0;
  let cap = 1;
  const phi = () => Math.max(0, 2 * size - cap);
  setVar(b, "size", "0", "number");
  setVar(b, "capacity", "1", "number");
  setVar(b, "Φ", "0", "number");

  const costs = pushCosts(8);
  costs.forEach((c, i) => {
    const before = phi();
    const resized = c > 1;
    if (size === cap) cap *= 2;
    size++;
    const after = phi();
    const amort = c + after - before;
    setVar(b, "size", String(size), "number", "new");
    setVar(b, "capacity", String(cap), "number", resized ? "new" : "idle");
    setVar(b, "Φ", String(after), "number", resized ? "removing" : "new");
    b.counters!.push({ label: `push ${i + 1}`, steps: amort, color: resized ? C_N2 : C_N1, note: `actual ${c} + ΔΦ ${after - before >= 0 ? "+" : ""}${after - before} = ${amort}` });
    chartPush(b, 0, [i + 1, c]);
    chartPush(b, 1, [i + 1, after]);
    chartPush(b, 2, [i + 1, amort]);
    snapshot(b, resized
      ? `Push ${i + 1} resizes: actual cost ${c} is huge, but Φ CRASHES from ${before} to ${after} (capacity doubled). Amortized = ${c} + (${after} − ${before}) = ${amort}. The stored energy paid for the spike.`
      : `Push ${i + 1} is cheap: actual 1, and Φ rises ${before} → ${after} (energy stored). Amortized = 1 + ${after - before} = ${amort}.`, resized ? [1, 4] : [1, 3]);
    calm(b);
  });

  snapshot(b, `Every row is a small constant — the actual-cost spikes vanished into ΔΦ. Since Φ started at 0 and never goes negative, total actual ≤ total amortized → push is O(1) amortized. Three methods, one truth; potential is the one that scales to hard structures (splay trees, Fibonacci heaps).`, [5, 6], {
    message: { text: "amortized ≈ 3 EVERY TIME → O(1)", tone: "ok" },
  });
  return done(b, "Potential Method", { time: "O(1) amortized", space: "O(n)" }, POT_PSEUDO);
}

// --- Mathematical foundations ----------------------------------------------------------

const IND_PSEUDO = ["claim S(n):  1 + 2 + … + n = n(n+1)/2", "base:  S(1) → 1 = 1·2/2 ✓", "step:  ASSUME S(k) holds, add (k+1):", "  k(k+1)/2 + (k+1) = (k+1)(k+2)/2 ✓", "→ S(1)→S(2)→S(3)→… dominoes fall forever"];

function fInduction(b: Builder): FoundationsProgram {
  b.counters = [];
  chartInit(b, "measured sums land on the formula", "n", "1 + 2 + … + n", [
    { label: "measured sum", color: C_N1, points: [] },
    refCurve("n(n+1)/2", "#7a8087", (x) => (x * (x + 1)) / 2, 1, 6),
  ]);
  snapshot(b, `How do you prove something for EVERY n — infinitely many cases — with finite work? Induction: prove the first domino falls, and that each domino knocks over the next.`, [1]);

  b.counters.push({ label: "n = 1", steps: 1, color: C_N1, note: "= 1·2/2 = 1 ✓" });
  chartPush(b, 0, [1, 1]);
  snapshot(b, `BASE CASE: n = 1. The sum is 1; the formula says 1·2/2 = 1. First domino: down.`, [2]);

  const cases: [number, string][] = [[2, C_N2], [3, C_N3], [4, C_N4]];
  for (const [k, color] of cases) {
    const sum = (k * (k + 1)) / 2;
    b.counters.push({ label: `n = ${k}`, steps: sum, color, active: true, note: `= ${k}·${k + 1}/2 = ${sum} ✓` });
    chartPush(b, 0, [k, sum]);
    snapshot(b, `INDUCTIVE STEP: assume the formula holds for ${k - 1} (tiles above ✓). Add ${k} more tiles: ${((k - 1) * k) / 2} + ${k} = ${sum} — and the formula for ${k} predicts ${k}·${k + 1}/2 = ${sum}. It matches; domino ${k} falls because domino ${k - 1} fell.`, [3, 4]);
    b.counters.forEach((c) => (c.active = false));
  }

  snapshot(b, `The algebra in the step never used a SPECIFIC k — so it pushes every domino: S(4)→S(5)→…→S(1000000). Two finite proofs cover infinitely many statements. Induction is also why recursive code works: base case + "if it works for smaller, it works for me".`, [5], {
    message: { text: "BASE + STEP = ALL n, FOREVER", tone: "ok" },
  });
  return done(b, "Proof by Induction", { time: "—", space: "—" }, IND_PSEUDO);
}

const REC_PSEUDO = ["T(n) = T(n/2) + 1,   T(1) = 1   // binary search", "unroll:  T(8) = T(4) + 1", "         T(4) = T(2) + 1", "         T(2) = T(1) + 1", "count the +1s: how often can 8 halve? log₂8 = 3", "→ T(n) = log₂n + 1 = O(log n)"];

function fRecurrence(b: Builder): FoundationsProgram {
  b.counters = [];
  chartInit(b, "T(n) traces the log curve", "n", "T(n)", [
    { label: "measured T(n)", color: C_N1, points: [] },
    refCurve("log₂n + 1", "#7a8087", (x) => Math.log2(x) + 1, 1, 16),
  ]);
  snapshot(b, `Recursive code gets a recursive cost formula — a RECURRENCE. Binary search does 1 comparison, then recurses on HALF: T(n) = T(n/2) + 1. Solve it by unrolling.`, [1]);

  setVar(b, "n", "8", "number");
  const row: FoundCounter = { label: "the +1s", steps: 0, color: C_N1, active: true };
  b.counters.push(row);

  const levels: [number, number, number][] = [[8, 4, 2], [4, 2, 3], [2, 1, 4]];
  for (const [from, to, line] of levels) {
    row.steps += 1;
    setVar(b, "n", String(to), "number", "new");
    chartPush(b, 0, [from, Math.log2(from) + 1]);
    snapshot(b, `T(${from}) = T(${to}) + 1 — pay one comparison (one tile), and the problem HALVES: ${from} → ${to}. Point (${from}, ${Math.log2(from) + 1}) lands on the log curve.`, [line]);
    calm(b);
  }
  row.steps += 1;
  row.active = false;
  row.note = "= log₂8 + 1";
  chartPush(b, 0, [1, 1]);
  b.chart!.series[0].points.sort((p, q) => p[0] - q[0]);
  snapshot(b, `T(1) = 1 — the base case pays its single step. Count the tiles: 3 halvings + 1 base = 4 = log₂8 + 1. The measured points trace the dashed logarithm exactly.`, [5]);

  snapshot(b, `The answer was hiding in one question: "how many times can n halve before hitting 1?" — log₂n. So T(n) = O(log n). Other famous recurrences solve the same way: T(n) = 2T(n/2) + n (merge sort) unrolls to n·log n. Recurrences are how every divide-and-conquer cost in this app was derived.`, [6], {
    message: { text: "T(n) = T(n/2) + 1 → O(log n)", tone: "ok" },
  });
  return done(b, "Recurrence Relations", { time: "O(log n)", space: "—" }, REC_PSEUDO);
}

// --- Dispatch ----------------------------------------------------------------------

export interface FoundationsRunParams {
  value?: number;
  /** Custom list, e.g. from the sidebar "5, 3, 8, 1" input. */
  list?: number[];
  /** Custom text (e.g. your name for the hello program). */
  text?: string;
}

export function runFoundationsOperation(
  op: FoundationsOperationId,
  params: FoundationsRunParams = {},
): FoundationsProgram {
  const b = newB();
  const value = params.value ?? 0;
  const list = params.list;

  switch (op) {
    case "fWhatIsAProgram":
      return fWhatIsAProgram(b, params.text);
    case "fVariables":
      return fVariables(b);
    case "fDatatypes":
      return fDatatypes(b);
    case "fConditionals":
      return fConditionals(b, value || 15);
    case "fLoops":
      return fLoops(b, value || 4);
    case "fCountingSteps":
      return fCountingSteps(b, list);
    case "fBigO":
      return fBigO(b);
    case "fGrowthRates":
      return fGrowthRates(b, value || undefined);
    case "fTimeComplexity":
      return fTimeComplexity(b, list);
    case "fSpaceComplexity":
      return fSpaceComplexity(b, list);
    case "fBestCase":
      return linearSearchCase(b, "best", list);
    case "fWorstCase":
      return linearSearchCase(b, "worst", list);
    case "fAverageCase":
      return linearSearchCase(b, "average", list);
    case "fBigOBound":
      return fBigOBound(b);
    case "fBigOmega":
      return fBigOmega(b);
    case "fBigTheta":
      return fBigTheta(b);
    case "fLittleO":
      return fLittleO(b);
    case "fLittleOmega":
      return fLittleOmega(b);
    case "fAggregate":
      return fAggregate(b);
    case "fAccounting":
      return fAccounting(b);
    case "fPotential":
      return fPotential(b);
    case "fInduction":
      return fInduction(b);
    case "fRecurrence":
      return fRecurrence(b);
    default:
      return fWhatIsAProgram(b);
  }
}

export interface FoundationsOperationMeta {
  id: FoundationsOperationId;
  label: string;
  icon: string;
  params: ("value" | "list" | "text")[];
  hint: string;
}

export const FOUNDATIONS_OPERATIONS: FoundationsOperationMeta[] = [
  { id: "fWhatIsAProgram", label: "What is a Program?", icon: "smart_toy", params: ["text"], hint: "Instructions → memory → output. Type your name — the program greets YOU." },
  { id: "fVariables", label: "Variables", icon: "inventory_2", params: [], hint: "Labeled boxes; assignment overwrites." },
  { id: "fDatatypes", label: "Datatypes", icon: "category", params: [], hint: "The type decides what + means." },
  { id: "fConditionals", label: "Conditionals", icon: "alt_route", params: ["value"], hint: "A question picks the path (value = age)." },
  { id: "fLoops", label: "Loops", icon: "repeat", params: ["value"], hint: "The counter jumps backwards (value = laps)." },
  { id: "fCountingSteps", label: "Counting Steps", icon: "timer", params: ["list"], hint: "Cost = executed lines, not seconds. Paste your own list." },
  { id: "fBigO", label: "Big-O Notation", icon: "functions", params: [], hint: "Keep the growing part, drop the rest." },
  { id: "fGrowthRates", label: "Growth Rates", icon: "trending_up", params: ["value"], hint: "O(1) / O(log n) / O(n) / O(n²) race — set n (4–25)." },
  { id: "fTimeComplexity", label: "Time Complexity", icon: "schedule", params: ["list"], hint: "T(n): steps as a FUNCTION of n. Your list's length sets n." },
  { id: "fSpaceComplexity", label: "Space Complexity", icon: "memory", params: ["list"], hint: "Count extra memory boxes, not steps. Bring your own list." },
  { id: "fBestCase", label: "Best Case", icon: "sentiment_satisfied", params: ["list"], hint: "The luckiest input — Ω-style." },
  { id: "fWorstCase", label: "Worst Case", icon: "sentiment_dissatisfied", params: ["list"], hint: "The guarantee — what O(·) badges mean." },
  { id: "fAverageCase", label: "Average Case", icon: "sentiment_neutral", params: ["list"], hint: "Expected cost over typical inputs." },
  { id: "fBigOBound", label: "Big-O", icon: "vertical_align_top", params: [], hint: "Ceiling: f ≤ c·g beyond n₀." },
  { id: "fBigOmega", label: "Big-Ω", icon: "vertical_align_bottom", params: [], hint: "Floor: f ≥ c·g beyond n₀." },
  { id: "fBigTheta", label: "Big-Θ", icon: "vertical_align_center", params: [], hint: "Sandwich: O and Ω of the same g." },
  { id: "fLittleO", label: "little-o", icon: "keyboard_double_arrow_down", params: [], hint: "STRICTLY slower — f/g → 0." },
  { id: "fLittleOmega", label: "little-ω", icon: "keyboard_double_arrow_up", params: [], hint: "STRICTLY faster — f/g → ∞." },
  { id: "fAggregate", label: "Aggregate", icon: "calculate", params: [], hint: "Total over n ops ÷ n." },
  { id: "fAccounting", label: "Accounting", icon: "savings", params: [], hint: "Overcharge cheap ops; bank pays spikes." },
  { id: "fPotential", label: "Potential", icon: "battery_charging_full", params: [], hint: "Φ stores energy; spikes release it." },
  { id: "fInduction", label: "Induction", icon: "domino_mask", params: [], hint: "Base + step = all n (dominoes)." },
  { id: "fRecurrence", label: "Recurrences", icon: "all_inclusive", params: [], hint: "Unroll T(n) = T(n/2) + 1." },
];
