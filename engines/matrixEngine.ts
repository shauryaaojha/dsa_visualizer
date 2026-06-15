// ---------------------------------------------------------------------------
// Matrix engine
//
// Pure step-compilers for 2-D array operations. Each returns a MatrixProgram
// (deterministic frames). A frame may show several named grids at once
// (multiplication shows A, B and the building result C).
// ---------------------------------------------------------------------------

import type {
  HighlightKind,
  MatrixCell,
  MatrixGrid,
  MatrixOperationId,
  MatrixProgram,
  MatrixStep,
} from "@/types/visualization";

let _mid = 0;
export function makeMatrixCell(value: number, note?: string): MatrixCell {
  _mid += 1;
  return { id: `m-${_mid}-${Math.random().toString(36).slice(2, 6)}`, value, note };
}

export function makeMatrix(rows: number, cols: number, fill?: (r: number, c: number) => number): MatrixCell[][] {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => makeMatrixCell(fill ? fill(r, c) : 0)),
  );
}

export function randomMatrix(rows: number, cols: number, max = 9): MatrixCell[][] {
  return makeMatrix(rows, cols, () => Math.floor(Math.random() * max) + 1);
}

/** Sparse-ish random: mostly zeros. */
export function randomSparse(rows: number, cols: number): MatrixCell[][] {
  return makeMatrix(rows, cols, () => (Math.random() < 0.7 ? 0 : Math.floor(Math.random() * 9) + 1));
}

function cloneGrid(cells: MatrixCell[][]): MatrixCell[][] {
  return cells.map((row) => row.map((c) => ({ ...c })));
}

function grid(label: string, cells: MatrixCell[][], highlights: Record<string, HighlightKind> = {}): MatrixGrid {
  return { label, cells: cloneGrid(cells), highlights };
}

function step(grids: MatrixGrid[], description: string, codeLines?: number[]): MatrixStep {
  return { grids, description, codeLines };
}

// --- Traversal -------------------------------------------------------------

function traverse(m: MatrixCell[][]): MatrixProgram {
  const steps: MatrixStep[] = [];
  const visited: Record<string, HighlightKind> = {};
  steps.push(step([grid("Matrix", m)], "Row-major traversal: walk each row left→right, top→bottom.", [1]));
  for (let r = 0; r < m.length; r++) {
    for (let c = 0; c < m[r].length; c++) {
      const cell = m[r][c];
      steps.push(
        step([grid("Matrix", m, { ...visited, [cell.id]: "active" })], `Visit (${r}, ${c}) → ${cell.value}.`, [2, 3]),
      );
      visited[cell.id] = "visited";
    }
  }
  steps.push(step([grid("Matrix", m, { ...visited })], "Traversal complete — every cell visited once.", [4]));
  return {
    steps,
    complexity: { time: "O(m·n)", space: "O(1)" },
    title: "Matrix Traversal",
    pseudocode: ["for r = 0 to m-1:", "  for c = 0 to n-1:", "    visit M[r][c]", "done"],
  };
}

// --- Rotation (90° clockwise) ---------------------------------------------

function rotation(m: MatrixCell[][]): MatrixProgram {
  const steps: MatrixStep[] = [];
  const rows = m.length;
  const cols = m[0]?.length ?? 0;
  // Result is cols x rows; result[c][rows-1-r] = m[r][c].
  const result = makeMatrix(cols, rows, () => 0);
  const srcVisited: Record<string, HighlightKind> = {};
  const dstDone: Record<string, HighlightKind> = {};

  steps.push(
    step([grid("Source", m), grid("Rotated 90° CW", result)], "Rotate 90° clockwise: M[r][c] moves to R[c][rows−1−r].", [1]),
  );
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const nr = c;
      const nc = rows - 1 - r;
      result[nr][nc] = { ...result[nr][nc], value: m[r][c].value };
      steps.push(
        step(
          [
            grid("Source", m, { ...srcVisited, [m[r][c].id]: "active" }),
            grid("Rotated 90° CW", result, { ...dstDone, [result[nr][nc].id]: "insert" }),
          ],
          `(${r}, ${c}) = ${m[r][c].value}  →  (${nr}, ${nc}).`,
          [2, 3],
        ),
      );
      srcVisited[m[r][c].id] = "visited";
      dstDone[result[nr][nc].id] = "found";
    }
  }
  steps.push(
    step([grid("Source", m, { ...srcVisited }), grid("Rotated 90° CW", result, { ...dstDone })], "Rotation complete.", [4]),
  );
  return {
    steps,
    complexity: { time: "O(m·n)", space: "O(m·n)" },
    title: "Matrix Rotation (90° CW)",
    pseudocode: ["for r in rows:", "  for c in cols:", "    R[c][rows-1-r] = M[r][c]", "done"],
  };
}

// --- Multiplication --------------------------------------------------------

function multiplication(a: MatrixCell[][], b: MatrixCell[][]): MatrixProgram {
  const steps: MatrixStep[] = [];
  const m = a.length;
  const n = a[0]?.length ?? 0; // == b.length
  const p = b[0]?.length ?? 0;
  const result = makeMatrix(m, p, () => 0);
  const done: Record<string, HighlightKind> = {};

  steps.push(
    step([grid("A", a), grid("B", b), grid("C = A×B", result)], `Multiply A(${m}×${n}) by B(${n}×${p}). Each C[i][j] is row i · column j.`, [1]),
  );

  if (n !== b.length) {
    steps.push(step([grid("A", a), grid("B", b), grid("C = A×B", result)], "Dimension mismatch: columns of A must equal rows of B.", [1]));
    return { steps, complexity: { time: "O(n³)", space: "O(n²)" }, title: "Matrix Multiplication", pseudocode: ["incompatible dimensions"] };
  }

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < p; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        const aHi: Record<string, HighlightKind> = {};
        const bHi: Record<string, HighlightKind> = {};
        // dim the whole row i of A and column j of B, spotlight the pair
        for (let x = 0; x < n; x++) aHi[a[i][x].id] = x === k ? "compare" : "active";
        for (let y = 0; y < n; y++) bHi[b[y][j].id] = y === k ? "compare" : "active";
        sum += a[i][k].value * b[k][j].value;
        result[i][j] = { ...result[i][j], value: sum };
        steps.push(
          step(
            [
              grid("A", a, aHi),
              grid("B", b, bHi),
              grid("C = A×B", result, { ...done, [result[i][j].id]: "target" }),
            ],
            `C[${i}][${j}] += A[${i}][${k}]·B[${k}][${j}] = ${a[i][k].value}·${b[k][j].value} → running sum ${sum}.`,
            [2, 3, 4],
          ),
        );
      }
      done[result[i][j].id] = "found";
      steps.push(
        step([grid("A", a), grid("B", b), grid("C = A×B", result, { ...done })], `C[${i}][${j}] = ${result[i][j].value}.`, [5]),
      );
    }
  }
  steps.push(step([grid("A", a), grid("B", b), grid("C = A×B", result, { ...done })], "Product complete.", [6]));
  return {
    steps,
    complexity: { time: "O(m·n·p)", space: "O(m·p)" },
    title: "Matrix Multiplication",
    pseudocode: ["for i in rows(A):", "  for j in cols(B):", "    for k in cols(A):", "      C[i][j] += A[i][k]*B[k][j]", "    // cell done", "done"],
  };
}

// --- Sparse representation -------------------------------------------------

function sparse(m: MatrixCell[][]): MatrixProgram {
  const steps: MatrixStep[] = [];
  const triplets: MatrixCell[][] = []; // rows of [row, col, val]
  const seen: Record<string, HighlightKind> = {};

  steps.push(
    step([grid("Matrix", m)], "Sparse matrices waste space on zeros. Store only non-zeros as (row, col, value) triplets.", [1]),
  );

  let count = 0;
  for (let r = 0; r < m.length; r++) {
    for (let c = 0; c < m[r].length; c++) {
      const cell = m[r][c];
      if (cell.value !== 0) {
        triplets.push([makeMatrixCell(r), makeMatrixCell(c), makeMatrixCell(cell.value)]);
        count++;
        steps.push(
          step(
            [grid("Matrix", m, { ...seen, [cell.id]: "found" }), grid("Triplets (row, col, val)", triplets, lastRowHi(triplets))],
            `Non-zero ${cell.value} at (${r}, ${c}) → add triplet.`,
            [2, 3],
          ),
        );
        seen[cell.id] = "visited";
      } else {
        seen[cell.id] = "visited";
        steps.push(
          step([grid("Matrix", m, { ...seen, [cell.id]: "active" }), grid("Triplets (row, col, val)", triplets)], `(${r}, ${c}) is 0 → skip.`, [2]),
        );
      }
    }
  }
  const total = m.length * (m[0]?.length ?? 0);
  steps.push(
    step([grid("Matrix", m, { ...seen }), grid("Triplets (row, col, val)", triplets)], `Stored ${count} of ${total} cells. Saved ${total - count} zero slots.`, [4]),
  );
  return {
    steps,
    complexity: { time: "O(m·n)", space: "O(k)" },
    title: "Sparse Matrix",
    pseudocode: ["for each cell (r,c):", "  if M[r][c] != 0:", "    store (r, c, value)", "// k = non-zero count"],
  };
}

/** Highlight the most-recently-added triplet row as 'insert'. */
function lastRowHi(triplets: MatrixCell[][]): Record<string, HighlightKind> {
  const h: Record<string, HighlightKind> = {};
  const last = triplets[triplets.length - 1];
  if (last) last.forEach((c) => (h[c.id] = "insert"));
  return h;
}

// --- Dispatch --------------------------------------------------------------

export function runMatrixOperation(
  op: MatrixOperationId,
  a: MatrixCell[][],
  b?: MatrixCell[][],
): MatrixProgram {
  switch (op) {
    case "traverse":
      return traverse(a);
    case "rotation":
      return rotation(a);
    case "multiplication":
      return multiplication(a, b ?? a);
    case "sparse":
      return sparse(a);
    default:
      return traverse(a);
  }
}
