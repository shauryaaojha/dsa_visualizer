// ---------------------------------------------------------------------------
// Graph engine — algorithm compiler over curated preset graphs
//
// Graphs are hand-placed (normalized 0–100 coords) and chosen per algorithm so
// every teaching moment is visible: Bellman-Ford's graph needs a second pass,
// the bridges graph is two triangles joined by one edge, the SCC graph has
// exactly three components, and so on. Frames carry node/edge states plus a
// data table (dist tables, adjacency matrix) and a strip (BFS queue, DFS
// stack, Kruskal's sorted edge list, Kosaraju's finish order).
// ---------------------------------------------------------------------------

import type {
  Complexity,
  GraphOperationId,
  GraphProgram,
  GraphStep,
  GraphTableCell,
  GraphVEdge,
  GraphVNode,
  SQCellState,
  TokenChip,
} from "@/types/visualization";

// --- Presets -------------------------------------------------------------------

interface PNode {
  id: string;
  x: number;
  y: number;
}
interface PEdge {
  u: string;
  v: string;
  w?: number;
}
interface Preset {
  nodes: PNode[];
  edges: PEdge[];
  directed: boolean;
}

const G_BASIC: Preset = {
  directed: false,
  nodes: [
    { id: "A", x: 18, y: 14 },
    { id: "B", x: 50, y: 8 },
    { id: "C", x: 82, y: 16 },
    { id: "D", x: 12, y: 56 },
    { id: "E", x: 46, y: 48 },
    { id: "F", x: 82, y: 58 },
    { id: "G", x: 46, y: 90 },
  ],
  edges: [
    { u: "A", v: "B" },
    { u: "B", v: "C" },
    { u: "A", v: "D" },
    { u: "B", v: "E" },
    { u: "C", v: "F" },
    { u: "D", v: "E" },
    { u: "E", v: "F" },
    { u: "D", v: "G" },
    { u: "E", v: "G" },
  ],
};

const G_WEIGHTED: Preset = {
  directed: false,
  nodes: [
    { id: "A", x: 12, y: 22 },
    { id: "B", x: 46, y: 10 },
    { id: "C", x: 84, y: 22 },
    { id: "D", x: 20, y: 74 },
    { id: "E", x: 54, y: 60 },
    { id: "F", x: 86, y: 76 },
  ],
  edges: [
    { u: "A", v: "B", w: 4 },
    { u: "B", v: "C", w: 7 },
    { u: "A", v: "D", w: 9 },
    { u: "B", v: "E", w: 3 },
    { u: "D", v: "E", w: 1 },
    { u: "C", v: "E", w: 4 },
    { u: "E", v: "F", w: 6 },
    { u: "C", v: "F", w: 5 },
  ],
};

// Crafted so pass 2 of Bellman-Ford still improves something (B→A is negative
// and comes after A's edges in the scan order).
const G_DIRNEG: Preset = {
  directed: true,
  nodes: [
    { id: "S", x: 8, y: 42 },
    { id: "A", x: 42, y: 14 },
    { id: "B", x: 42, y: 74 },
    { id: "C", x: 74, y: 14 },
    { id: "D", x: 74, y: 74 },
  ],
  edges: [
    { u: "S", v: "A", w: 6 },
    { u: "S", v: "B", w: 7 },
    { u: "A", v: "C", w: 5 },
    { u: "B", v: "A", w: -2 },
    { u: "B", v: "D", w: 4 },
    { u: "C", v: "D", w: 3 },
  ],
};

const G_FW: Preset = {
  directed: true,
  nodes: [
    { id: "A", x: 20, y: 16 },
    { id: "B", x: 80, y: 16 },
    { id: "C", x: 80, y: 80 },
    { id: "D", x: 20, y: 80 },
  ],
  edges: [
    { u: "A", v: "B", w: 8 },
    { u: "A", v: "D", w: 1 },
    { u: "B", v: "C", w: 1 },
    { u: "C", v: "A", w: 4 },
    { u: "D", v: "C", w: 9 },
    { u: "D", v: "B", w: 2 },
  ],
};

// Two triangles joined by one edge: C–D is a bridge; C and D are articulation points.
const G_BRIDGE: Preset = {
  directed: false,
  nodes: [
    { id: "A", x: 10, y: 22 },
    { id: "B", x: 10, y: 74 },
    { id: "C", x: 34, y: 48 },
    { id: "D", x: 66, y: 48 },
    { id: "E", x: 90, y: 22 },
    { id: "F", x: 90, y: 74 },
  ],
  edges: [
    { u: "A", v: "B" },
    { u: "A", v: "C" },
    { u: "B", v: "C" },
    { u: "C", v: "D" },
    { u: "D", v: "E" },
    { u: "D", v: "F" },
    { u: "E", v: "F" },
  ],
};

// Three SCCs: {A,B,C}, {D,E,F}, {G}.
const G_SCC: Preset = {
  directed: true,
  nodes: [
    { id: "A", x: 12, y: 20 },
    { id: "B", x: 40, y: 12 },
    { id: "C", x: 26, y: 50 },
    { id: "D", x: 62, y: 20 },
    { id: "E", x: 88, y: 12 },
    { id: "F", x: 74, y: 50 },
    { id: "G", x: 88, y: 82 },
  ],
  edges: [
    { u: "A", v: "B" },
    { u: "B", v: "C" },
    { u: "C", v: "A" },
    { u: "B", v: "D" },
    { u: "D", v: "E" },
    { u: "E", v: "F" },
    { u: "F", v: "D" },
    { u: "F", v: "G" },
  ],
};

// --- Builder --------------------------------------------------------------------

type Table = NonNullable<GraphStep["table"]>;

interface GB {
  steps: GraphStep[];
  preset: Preset;
  reversed: boolean; // SCC transpose
  states: Map<string, SQCellState>;
  badges: Map<string, string>;
  groups: Map<string, number>;
  rings: Set<string>;
  edgeStates: Map<string, GraphVEdge["state"]>;
  table?: Table;
  strip?: { label: string; chips: TokenChip[] };
}

function makeGB(preset: Preset): GB {
  return {
    steps: [],
    preset,
    reversed: false,
    states: new Map(),
    badges: new Map(),
    groups: new Map(),
    rings: new Set(),
    edgeStates: new Map(),
  };
}

const eid = (e: PEdge) => `${e.u}-${e.v}`;

function snapshot(gb: GB, description: string, codeLines?: number[], opts: { message?: GraphStep["message"] } = {}): void {
  const nodes: GraphVNode[] = gb.preset.nodes.map((n) => ({
    id: n.id,
    label: n.id,
    x: n.x,
    y: n.y,
    state: gb.states.get(n.id) ?? "idle",
    badge: gb.badges.get(n.id),
    group: gb.groups.get(n.id),
    ring: gb.rings.has(n.id),
  }));
  const edges: GraphVEdge[] = gb.preset.edges.map((e) => ({
    id: eid(e),
    from: gb.reversed ? e.v : e.u,
    to: gb.reversed ? e.u : e.v,
    weight: e.w,
    directed: gb.preset.directed,
    state: gb.edgeStates.get(eid(e)) ?? "idle",
  }));
  gb.steps.push({
    nodes,
    edges,
    table: gb.table
      ? { title: gb.table.title, columns: [...gb.table.columns], rows: gb.table.rows.map((r) => ({ label: r.label, cells: r.cells.map((c) => ({ ...c })) })) }
      : undefined,
    strip: gb.strip ? { label: gb.strip.label, chips: gb.strip.chips.map((c) => ({ ...c })) } : undefined,
    message: opts.message,
    description,
    codeLines,
  });
}

function done(gb: GB, title: string, complexity: Complexity, pseudocode: string[]): GraphProgram {
  return { steps: gb.steps, complexity, pseudocode, title };
}

function neighbors(gb: GB, u: string): { v: string; w: number; edge: PEdge }[] {
  const out: { v: string; w: number; edge: PEdge }[] = [];
  for (const e of gb.preset.edges) {
    if (e.u === u) out.push({ v: e.v, w: e.w ?? 1, edge: e });
    else if (!gb.preset.directed && e.v === u) out.push({ v: e.u, w: e.w ?? 1, edge: e });
  }
  return out.sort((a, z) => a.v.localeCompare(z.v));
}

function clearTableStates(t: Table | undefined): void {
  t?.rows.forEach((r) => r.cells.forEach((c) => {
    if (c.state === "changed" || c.state === "head") c.state = c.state === "changed" ? "idle" : "idle";
  }));
}

const chip = (text: string, state: TokenChip["state"] = "done"): TokenChip => ({ text, state });
const INF = "∞";

// --- Representation ----------------------------------------------------------------

const ADJM_PSEUDO = ["matrix[V][V], all zeros", "for each edge (u, v):", "  matrix[u][v] = 1", "  matrix[v][u] = 1   // undirected", "// O(V²) space — even absent edges cost a cell"];

function adjMatrix(gb: GB): GraphProgram {
  const ids = gb.preset.nodes.map((n) => n.id);
  gb.table = {
    title: "adjacency matrix",
    columns: ids,
    rows: ids.map((r) => ({ label: r, cells: ids.map(() => ({ text: "0", state: "idle" as const })) })),
  };
  snapshot(gb, `The adjacency matrix is a V×V grid of 0/1: cell [u][v] answers "is there an edge u–v?" in O(1). Start all zero.`, [1]);

  for (const e of gb.preset.edges) {
    gb.edgeStates.set(eid(e), "active");
    gb.states.set(e.u, "active");
    gb.states.set(e.v, "active");
    const ui = ids.indexOf(e.u);
    const vi = ids.indexOf(e.v);
    clearTableStates(gb.table);
    gb.table.rows[ui].cells[vi] = { text: "1", state: "changed" };
    gb.table.rows[vi].cells[ui] = { text: "1", state: "changed" };
    snapshot(gb, `Edge ${e.u}–${e.v}: set matrix[${e.u}][${e.v}] = 1 AND matrix[${e.v}][${e.u}] = 1 — an undirected edge fills two mirrored cells.`, [2, 3, 4]);
    gb.edgeStates.set(eid(e), "tree");
    gb.states.set(e.u, "visited");
    gb.states.set(e.v, "visited");
  }
  clearTableStates(gb.table);
  snapshot(gb, `Done. Lookup is O(1), but the grid costs O(V²) cells — mostly zeros here. For sparse graphs the adjacency LIST is far cheaper.`, [5], {
    message: { text: `${gb.preset.edges.length} EDGES → ${ids.length}×${ids.length} MATRIX`, tone: "ok" },
  });
  return done(gb, "Adjacency Matrix", { time: "O(1) lookup", space: "O(V²)" }, ADJM_PSEUDO);
}

const ADJL_PSEUDO = ["for each vertex u:", "  list[u] = its neighbours", "// O(V + E) space — only REAL edges stored", "// neighbour scan: O(degree), not O(V)"];

function adjList(gb: GB): GraphProgram {
  const ids = gb.preset.nodes.map((n) => n.id);
  gb.table = { title: "adjacency list", columns: ["neighbours"], rows: ids.map((r) => ({ label: r, cells: [] })) };
  snapshot(gb, `The adjacency list stores, for each vertex, just the neighbours it actually has — nothing for absent edges.`, [1]);
  for (const id of ids) {
    gb.states.set(id, "active");
    const ns = neighbors(gb, id);
    ns.forEach((n) => gb.edgeStates.set(eid(n.edge), "active"));
    clearTableStates(gb.table);
    const row = gb.table.rows[ids.indexOf(id)];
    row.cells = ns.map((n) => ({ text: n.v, state: "changed" as const }));
    snapshot(gb, `${id} → [${ns.map((n) => n.v).join(", ")}] — ${ns.length} neighbour(s), ${ns.length} list entries. Degree-many, not V-many.`, [1, 2]);
    ns.forEach((n) => gb.edgeStates.set(eid(n.edge), "idle"));
    gb.states.set(id, "visited");
  }
  clearTableStates(gb.table);
  snapshot(gb, `Done — total entries = 2·E (each undirected edge appears in both lists). O(V + E) space beats O(V²) whenever the graph is sparse, which real graphs usually are.`, [3, 4], {
    message: { text: `O(V + E) = ${ids.length} + ${2 * gb.preset.edges.length} ENTRIES`, tone: "ok" },
  });
  return done(gb, "Adjacency List", { time: "O(deg) scan", space: "O(V + E)" }, ADJL_PSEUDO);
}

// --- Traversal ------------------------------------------------------------------------

const BFS_PSEUDO = ["mark start visited; enqueue it", "while the queue is not empty:", "  u = dequeue()", "  for each neighbour v of u:", "    unvisited? mark it, enqueue it", "// explores in RINGS — fewest edges first"];

function bfs(gb: GB, start: string): GraphProgram {
  gb.strip = { label: "queue", chips: [] };
  gb.states.set(start, "target");
  gb.badges.set(start, "d=0");
  gb.strip.chips.push(chip(start, "active"));
  snapshot(gb, `BFS from ${start}. A QUEUE (FIFO) drives it: nodes are explored in the order discovered, so the search spreads out in rings of equal distance.`, [1]);

  const dist = new Map<string, number>([[start, 0]]);
  const q = [start];
  while (q.length) {
    const u = q.shift()!;
    gb.strip.chips.shift();
    gb.states.set(u, "active");
    snapshot(gb, `Dequeue ${u} (distance ${dist.get(u)}) — the oldest discovery is served first.`, [2, 3]);
    for (const { v, edge } of neighbors(gb, u)) {
      if (dist.has(v)) {
        continue;
      }
      dist.set(v, dist.get(u)! + 1);
      gb.states.set(v, "target");
      gb.badges.set(v, `d=${dist.get(v)}`);
      gb.edgeStates.set(eid(edge), "tree");
      gb.strip.chips.push(chip(v));
      q.push(v);
      snapshot(gb, `${v} is unvisited — mark it (distance ${dist.get(v)}) and enqueue it. It must WAIT behind everything already in the queue: that wait is what makes BFS level-by-level.`, [4, 5]);
    }
    gb.states.set(u, "visited");
    snapshot(gb, `${u} fully explored.`, [2]);
  }
  snapshot(gb, `Queue empty — done. Every badge is the MINIMUM number of edges from ${start}: BFS is the shortest-path algorithm for unweighted graphs.`, [6], {
    message: { text: "BFS COMPLETE", tone: "ok" },
  });
  return done(gb, `BFS from ${start}`, { time: "O(V + E)", space: "O(V)" }, BFS_PSEUDO);
}

const DFS_PSEUDO = ["dfs(u):", "  mark u visited", "  for each neighbour v of u:", "    if v unvisited: dfs(v)", "  // stuck? return = BACKTRACK", "// go deep first; the call stack remembers the way back"];

function dfs(gb: GB, start: string): GraphProgram {
  gb.strip = { label: "call stack", chips: [] };
  snapshot(gb, `DFS from ${start}: dive as deep as possible along one path, and only when stuck, BACKTRACK. The call stack remembers the way back.`, [1]);
  const visited = new Set<string>();
  let order = 0;

  const go = (u: string) => {
    visited.add(u);
    gb.states.set(u, "active");
    gb.badges.set(u, `#${++order}`);
    gb.strip!.chips.push(chip(u, "active"));
    if (gb.strip!.chips.length > 1) gb.strip!.chips[gb.strip!.chips.length - 2].state = "done";
    snapshot(gb, `Visit ${u} (${order}${order === 1 ? "st" : order === 2 ? "nd" : order === 3 ? "rd" : "th"} discovered) — push it on the stack and immediately go deeper.`, [1, 2]);
    for (const { v, edge } of neighbors(gb, u)) {
      if (visited.has(v)) continue;
      gb.edgeStates.set(eid(edge), "tree");
      go(v);
      gb.states.set(u, "active");
      snapshot(gb, `Back at ${u} — its branch through ${v} is exhausted; try the next neighbour.`, [3, 5]);
    }
    gb.states.set(u, "visited");
    gb.strip!.chips.pop();
    if (gb.strip!.chips.length) gb.strip!.chips[gb.strip!.chips.length - 1].state = "active";
    snapshot(gb, `${u} has no unvisited neighbours left — pop it and BACKTRACK.`, [5]);
  };
  go(start);
  snapshot(gb, `DFS complete. The mint edges form the DFS tree — one deep, winding path with backtracks, the exact opposite of BFS's rings.`, [6], {
    message: { text: "DFS COMPLETE", tone: "ok" },
  });
  return done(gb, `DFS from ${start}`, { time: "O(V + E)", space: "O(V)" }, DFS_PSEUDO);
}

// --- Shortest paths -----------------------------------------------------------------------

function distTable(gb: GB, cols: string[]): void {
  gb.table = {
    title: "distance table",
    columns: cols,
    rows: gb.preset.nodes.map((n) => ({ label: n.id, cells: cols.map(() => ({ text: INF, state: "idle" as const })) })),
  };
}

const DIJ_PSEUDO = ["dist[all] = ∞;  dist[start] = 0", "repeat V times:", "  u = unvisited node with SMALLEST dist", "  finalize u — its dist can never improve", "  for each neighbour v of u:", "    dist[v] = min(dist[v], dist[u] + w)"];

function dijkstra(gb: GB, start: string): GraphProgram {
  const ids = gb.preset.nodes.map((n) => n.id);
  distTable(gb, ["dist", "via"]);
  const row = (id: string) => gb.table!.rows[ids.indexOf(id)];
  const dist = new Map<string, number>(ids.map((i) => [i, Infinity]));
  const via = new Map<string, string>();
  dist.set(start, 0);
  row(start).cells[0] = { text: "0", state: "changed" };
  gb.badges.set(start, "0");
  gb.states.set(start, "target");
  snapshot(gb, `Dijkstra from ${start}: keep a best-known distance for every node (badges + table), and repeatedly LOCK IN the closest unfinished node. Works because weights are non-negative.`, [1]);

  const finalized = new Set<string>();
  while (finalized.size < ids.length) {
    let u: string | null = null;
    for (const id of ids) if (!finalized.has(id) && (u === null || dist.get(id)! < dist.get(u)!)) u = id;
    if (!u || dist.get(u) === Infinity) break;
    clearTableStates(gb.table);
    gb.states.set(u, "active");
    snapshot(gb, `The smallest unfinished distance is ${u} (${dist.get(u)}). No other path can undercut it — any detour would already start longer. Finalize ${u}.`, [2, 3, 4]);
    finalized.add(u);
    row(u).cells.forEach((c) => (c.state = "final"));
    for (const { v, w, edge } of neighbors(gb, u)) {
      if (finalized.has(v)) continue;
      gb.edgeStates.set(eid(edge), "active");
      const alt = dist.get(u)! + w;
      if (alt < dist.get(v)!) {
        const old = dist.get(v)!;
        dist.set(v, alt);
        via.set(v, u);
        row(v).cells[0] = { text: String(alt), state: "changed" };
        row(v).cells[1] = { text: u, state: "changed" };
        gb.badges.set(v, String(alt));
        gb.states.set(v, "target");
        snapshot(gb, `Relax ${u}→${v}: ${dist.get(u)} + ${w} = ${alt} beats ${old === Infinity ? "∞" : old} — a better route to ${v} found (via ${u}).`, [5, 6]);
      } else {
        snapshot(gb, `Relax ${u}→${v}: ${dist.get(u)} + ${w} = ${alt} does NOT beat the current ${dist.get(v)} — keep the old route.`, [5, 6]);
      }
      gb.edgeStates.set(eid(edge), gb.edgeStates.get(eid(edge)) === "tree" ? "tree" : "idle");
    }
    gb.states.set(u, "visited");
    // Mark the chosen route edge.
    const p = via.get(u);
    if (p) {
      const e = gb.preset.edges.find((x) => (x.u === p && x.v === u) || (x.u === u && x.v === p));
      if (e) gb.edgeStates.set(eid(e), "tree");
    }
  }
  clearTableStates(gb.table);
  snapshot(gb, `All nodes finalized — the table is the complete shortest-path answer from ${start}, and the mint edges form the shortest-path tree.`, [], {
    message: { text: "SHORTEST PATHS FOUND", tone: "ok" },
  });
  return done(gb, `Dijkstra from ${start}`, { time: "O((V+E) log V)", space: "O(V)" }, DIJ_PSEUDO);
}

const BF_PSEUDO = ["dist[start] = 0, everything else ∞", "repeat V − 1 times:", "  relax EVERY edge (u→v, w):", "    dist[v] = min(dist[v], dist[u] + w)", "one extra pass — anything still improves?", "  yes → NEGATIVE CYCLE exists"];

function bellmanFord(gb: GB, start: string): GraphProgram {
  const ids = gb.preset.nodes.map((n) => n.id);
  distTable(gb, ["dist", "via"]);
  const row = (id: string) => gb.table!.rows[ids.indexOf(id)];
  const dist = new Map<string, number>(ids.map((i) => [i, Infinity]));
  dist.set(start, 0);
  row(start).cells[0] = { text: "0", state: "changed" };
  gb.badges.set(start, "0");
  snapshot(gb, `Bellman-Ford from ${start}. Note the NEGATIVE edge (B→A, −2) — Dijkstra would break here; Bellman-Ford instead brute-force relaxes every edge, V−1 times.`, [1]);

  const V = ids.length;
  for (let pass = 1; pass <= V - 1; pass++) {
    let improved = false;
    snapshot(gb, `PASS ${pass} of ${V - 1}: sweep across ALL ${gb.preset.edges.length} edges. Why V−1 passes? A shortest path has at most V−1 edges, and each pass locks in one more hop of it.`, [2]);
    for (const e of gb.preset.edges) {
      const du = dist.get(e.u)!;
      const alt = du + (e.w ?? 1);
      gb.edgeStates.set(eid(e), "active");
      if (du !== Infinity && alt < dist.get(e.v)!) {
        const old = dist.get(e.v)!;
        dist.set(e.v, alt);
        clearTableStates(gb.table);
        row(e.v).cells[0] = { text: String(alt), state: "changed" };
        row(e.v).cells[1] = { text: e.u, state: "changed" };
        gb.badges.set(e.v, String(alt));
        gb.states.set(e.v, "target");
        snapshot(gb, `Relax ${e.u}→${e.v} (w=${e.w}): ${du} + ${e.w} = ${alt} beats ${old === Infinity ? "∞" : old}. ${pass > 1 ? "An improvement in pass " + pass + " — this is why one pass isn't enough!" : ""}`, [3, 4]);
        improved = true;
      }
      gb.edgeStates.set(eid(e), "idle");
    }
    if (!improved) {
      snapshot(gb, `Pass ${pass} changed nothing — distances have converged; we can stop early.`, [2]);
      break;
    }
  }
  // Negative-cycle check.
  let cyc = false;
  for (const e of gb.preset.edges) {
    const du = dist.get(e.u)!;
    if (du !== Infinity && du + (e.w ?? 1) < dist.get(e.v)!) cyc = true;
  }
  clearTableStates(gb.table);
  snapshot(gb, cyc
    ? `One extra pass STILL improves a distance — a negative cycle exists and "shortest path" is undefined.`
    : `One extra verification pass changes nothing — no negative cycle; the table is final. Slower than Dijkstra (O(V·E)) but immune to negative edges.`, [5, 6], {
    message: { text: cyc ? "NEGATIVE CYCLE!" : "SHORTEST PATHS FOUND", tone: cyc ? "error" : "ok" },
  });
  return done(gb, `Bellman-Ford from ${start}`, { time: "O(V·E)", space: "O(V)" }, BF_PSEUDO);
}

const FW_PSEUDO = ["dist = adjacency matrix (∞ where no edge)", "for k in vertices:      // the via-node", "  for every pair (i, j):", "    dist[i][j] = min( dist[i][j],", "        dist[i][k] + dist[k][j] )", "// after k, all paths THROUGH k are priced in"];

function floydWarshall(gb: GB): GraphProgram {
  const ids = gb.preset.nodes.map((n) => n.id);
  const n = ids.length;
  const d: number[][] = ids.map((_, i) => ids.map((_, j) => (i === j ? 0 : Infinity)));
  for (const e of gb.preset.edges) d[ids.indexOf(e.u)][ids.indexOf(e.v)] = e.w ?? 1;
  gb.table = {
    title: "dist matrix",
    columns: ids,
    rows: ids.map((r, i) => ({ label: r, cells: ids.map((_, j) => ({ text: d[i][j] === Infinity ? INF : String(d[i][j]), state: "idle" as const })) })),
  };
  snapshot(gb, `Floyd–Warshall: ALL-pairs shortest paths in one V×V matrix. Start with direct edges only (∞ = no direct edge). The star of this algorithm is the table, not the picture.`, [1]);

  for (let k = 0; k < n; k++) {
    gb.states.clear();
    gb.states.set(ids[k], "active");
    clearTableStates(gb.table);
    snapshot(gb, `k = ${ids[k]}: from now on paths are allowed to pass THROUGH ${ids[k]}. For every pair (i, j), ask: is i → ${ids[k]} → j shorter than what we have?`, [2, 3]);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const alt = d[i][k] + d[k][j];
        if (alt < d[i][j]) {
          const old = d[i][j];
          d[i][j] = alt;
          clearTableStates(gb.table);
          gb.table.rows[i].cells[j] = { text: String(alt), state: "changed" };
          snapshot(gb, `dist[${ids[i]}][${ids[j]}] = min(${old === Infinity ? "∞" : old}, ${d[i][k]} + ${d[k][j]}) = ${alt} — going via ${ids[k]} is shorter.`, [4, 5]);
        }
      }
    }
  }
  gb.states.clear();
  clearTableStates(gb.table);
  snapshot(gb, `All ${n} via-nodes processed — every cell [i][j] is the true shortest distance. Three nested loops over V: O(V³), and it handles negative edges too.`, [6], {
    message: { text: "ALL-PAIRS DONE", tone: "ok" },
  });
  return done(gb, "Floyd–Warshall", { time: "O(V³)", space: "O(V²)" }, FW_PSEUDO);
}

// --- MST -------------------------------------------------------------------------------

const PRIM_PSEUDO = ["key[all] = ∞;  key[start] = 0", "repeat V times:", "  u = cheapest node NOT yet in the tree", "  add u and its cheapest edge to the tree", "  for each neighbour v outside the tree:", "    key[v] = min(key[v], w(u,v))"];

function prim(gb: GB, start: string): GraphProgram {
  const ids = gb.preset.nodes.map((n) => n.id);
  gb.table = { title: "key table", columns: ["key", "parent"], rows: ids.map((r) => ({ label: r, cells: [{ text: INF }, { text: "—" }] })) };
  const row = (id: string) => gb.table!.rows[ids.indexOf(id)];
  const key = new Map<string, number>(ids.map((i) => [i, Infinity]));
  const parent = new Map<string, string>();
  key.set(start, 0);
  row(start).cells[0] = { text: "0", state: "changed" };
  snapshot(gb, `Prim from ${start}: GROW one tree, always by the cheapest edge that reaches a new node. key[v] = the cheapest known edge connecting v to the tree so far.`, [1]);

  const inTree = new Set<string>();
  let total = 0;
  while (inTree.size < ids.length) {
    let u: string | null = null;
    for (const id of ids) if (!inTree.has(id) && (u === null || key.get(id)! < key.get(u)!)) u = id;
    if (!u || key.get(u) === Infinity) break;
    clearTableStates(gb.table);
    gb.states.set(u, "active");
    const p = parent.get(u);
    if (p) {
      const e = gb.preset.edges.find((x) => (x.u === p && x.v === u) || (x.u === u && x.v === p))!;
      gb.edgeStates.set(eid(e), "tree");
      total += key.get(u)!;
      snapshot(gb, `${u} has the cheapest connection (${key.get(u)} via ${p}) — add it and its edge to the tree. Total so far: ${total}.`, [2, 3, 4]);
    } else {
      snapshot(gb, `Start the tree at ${u}.`, [2, 3, 4]);
    }
    inTree.add(u);
    row(u).cells.forEach((c) => (c.state = "final"));
    gb.states.set(u, "visited");
    for (const { v, w, edge } of neighbors(gb, u)) {
      if (inTree.has(v)) continue;
      gb.edgeStates.set(eid(edge), "active");
      if (w < key.get(v)!) {
        const old = key.get(v)!;
        key.set(v, w);
        parent.set(v, u);
        row(v).cells[0] = { text: String(w), state: "changed" };
        row(v).cells[1] = { text: u, state: "changed" };
        gb.states.set(v, "target");
        snapshot(gb, `Edge ${u}–${v} (w=${w}) is a cheaper way to reach ${v} than ${old === Infinity ? "anything so far" : `the previous ${old}`} — update key[${v}].`, [5, 6]);
      }
      gb.edgeStates.set(eid(edge), gb.edgeStates.get(eid(edge)) === "tree" ? "tree" : "idle");
    }
  }
  clearTableStates(gb.table);
  snapshot(gb, `Every node reached — the mint edges are a Minimum Spanning Tree with total weight ${total}: V−1 edges, no cycles, minimum possible cost.`, [], {
    message: { text: `MST COST = ${total}`, tone: "ok" },
  });
  return done(gb, `Prim from ${start}`, { time: "O(E log V)", space: "O(V)" }, PRIM_PSEUDO);
}

const KRUSKAL_PSEUDO = ["sort ALL edges by weight, cheapest first", "for each edge (u, v) in that order:", "  different components? TAKE it, merge them", "  same component? SKIP — it would close a cycle", "stop after V − 1 edges taken"];

function kruskal(gb: GB): GraphProgram {
  const ids = gb.preset.nodes.map((n) => n.id);
  ids.forEach((id, i) => gb.groups.set(id, i));
  const sorted = [...gb.preset.edges].sort((a, z) => (a.w ?? 1) - (z.w ?? 1));
  gb.strip = { label: "edges by weight", chips: sorted.map((e) => chip(`${e.u}–${e.v}:${e.w}`, "pending")) };
  snapshot(gb, `Kruskal: sort the edges by weight, then greedily take every edge that doesn't close a cycle. Each node starts as its own colored component — same color = already connected.`, [1]);

  const find = (x: string): number => gb.groups.get(x)!;
  let taken = 0;
  let total = 0;
  for (let i = 0; i < sorted.length && taken < ids.length - 1; i++) {
    const e = sorted[i];
    gb.strip.chips[i].state = "active";
    gb.edgeStates.set(eid(e), "active");
    gb.states.set(e.u, "active");
    gb.states.set(e.v, "active");
    const gu = find(e.u);
    const gv = find(e.v);
    snapshot(gb, `Next cheapest edge: ${e.u}–${e.v} (w=${e.w}). Are ${e.u} and ${e.v} in the same component? ${gu === gv ? "YES — same color." : "No — different colors."}`, [2]);
    if (gu !== gv) {
      for (const [k, g] of gb.groups) if (g === gv) gb.groups.set(k, gu);
      gb.edgeStates.set(eid(e), "tree");
      gb.strip.chips[i].state = "matched";
      taken++;
      total += e.w ?? 1;
      snapshot(gb, `TAKE it — and merge the two components (watch the colors repaint). ${taken}/${ids.length - 1} edges chosen, cost so far ${total}.`, [3]);
    } else {
      gb.edgeStates.set(eid(e), "rejected");
      gb.strip.chips[i].state = "error";
      snapshot(gb, `SKIP it — ${e.u} and ${e.v} are already connected, so this edge would close a cycle, and a tree has no cycles.`, [4]);
      gb.edgeStates.set(eid(e), "idle");
    }
    gb.states.set(e.u, "idle");
    gb.states.set(e.v, "idle");
  }
  snapshot(gb, `${taken} edges taken (V − 1) — one color remains: a Minimum Spanning Tree of total weight ${total}. Same answer as Prim, built edge-wise instead of tree-wise.`, [5], {
    message: { text: `MST COST = ${total}`, tone: "ok" },
  });
  return done(gb, "Kruskal", { time: "O(E log E)", space: "O(V)" }, KRUSKAL_PSEUDO);
}

// --- Connectivity ------------------------------------------------------------------------

const BRIDGE_PSEUDO = ["dfs(u):  disc[u] = low[u] = timer++", "for each neighbour v of u:", "  tree edge → dfs(v), then low[u] = min(low[u], low[v])", "  back edge → low[u] = min(low[u], disc[v])", "after returning: low[v] > disc[u] ?", "  → u–v is a BRIDGE (no other way around)"];

function bridgesOrArticulation(gb: GB, mode: "bridges" | "articulation"): GraphProgram {
  const isB = mode === "bridges";
  snapshot(gb, isB
    ? `Find BRIDGES: edges whose removal disconnects the graph. Badges show disc/low — disc = when DFS first saw the node; low = the OLDEST node reachable from its subtree using at most one back edge.`
    : `Find ARTICULATION POINTS: nodes whose removal disconnects the graph. Same disc/low machinery as bridges.`, [1]);

  let timer = 0;
  const disc = new Map<string, number>();
  const low = new Map<string, number>();
  const bridges: PEdge[] = [];
  const arts = new Set<string>();

  const setBadge = (u: string) => gb.badges.set(u, `${disc.get(u)}/${low.get(u)}`);

  const go = (u: string, parentEdge: PEdge | null) => {
    disc.set(u, ++timer);
    low.set(u, timer);
    setBadge(u);
    gb.states.set(u, "active");
    snapshot(gb, `Discover ${u}: disc = low = ${timer}. (low can only get smaller as we find routes to older nodes.)`, [1]);
    let children = 0;
    for (const { v, edge } of neighbors(gb, u)) {
      if (parentEdge && edge === parentEdge) continue;
      if (!disc.has(v)) {
        children++;
        gb.edgeStates.set(eid(edge), "tree");
        go(v, edge);
        low.set(u, Math.min(low.get(u)!, low.get(v)!));
        setBadge(u);
        gb.states.set(u, "active");
        snapshot(gb, `Back at ${u}: inherit low from ${v} → low[${u}] = min = ${low.get(u)}. Now the test: low[${v}] (${low.get(v)}) ${low.get(v)! > disc.get(u)! ? ">" : "≤"} disc[${u}] (${disc.get(u)}).`, [3, 5]);
        if (isB && low.get(v)! > disc.get(u)!) {
          bridges.push(edge);
          gb.edgeStates.set(eid(edge), "rejected");
          snapshot(gb, `low[${v}] > disc[${u}]: nothing in ${v}'s subtree can reach back above ${u} — the ONLY connection is this edge. ${u}–${v} is a BRIDGE.`, [6], {
            message: { text: `BRIDGE: ${u}–${v}`, tone: "error" },
          });
        }
        if (!isB && parentEdge && low.get(v)! >= disc.get(u)!) {
          arts.add(u);
          gb.rings.add(u);
          snapshot(gb, `low[${v}] ≥ disc[${u}]: ${v}'s subtree cannot bypass ${u} — remove ${u} and that subtree is stranded. ${u} is an ARTICULATION POINT.`, [6], {
            message: { text: `CUT VERTEX: ${u}`, tone: "error" },
          });
        }
      } else {
        const before = low.get(u)!;
        low.set(u, Math.min(low.get(u)!, disc.get(v)!));
        setBadge(u);
        gb.edgeStates.set(eid(edge), "special");
        snapshot(gb, `${u}–${v} is a BACK edge to an already-seen node — an alternative route into the past! low[${u}]: ${before} → ${low.get(u)}.`, [4]);
      }
    }
    if (!isB && !parentEdge && children > 1) {
      arts.add(u);
      gb.rings.add(u);
      snapshot(gb, `${u} is the DFS root with ${children} separate tree branches — removing it splits them apart. ${u} is an ARTICULATION POINT.`, [6], {
        message: { text: `CUT VERTEX: ${u}`, tone: "error" },
      });
    }
    gb.states.set(u, "visited");
  };

  for (const n of gb.preset.nodes) if (!disc.has(n.id)) go(n.id, null);

  snapshot(gb, isB
    ? bridges.length
      ? `Done — ${bridges.length} bridge(s) found (red): ${bridges.map((e) => `${e.u}–${e.v}`).join(", ")}. One DFS, O(V + E).`
      : "Done — no bridges; every edge has an alternative route around it."
    : arts.size
      ? `Done — articulation point(s): ${[...arts].join(", ")} (ringed). These are the single points of failure of the network.`
      : "Done — no articulation points; the graph survives any single node's removal.", [], {
    message: { text: isB ? `${bridges.length} BRIDGE(S)` : `${arts.size} CUT VERTEX(ES)`, tone: "ok" },
  });
  const title = isB ? "Bridges (Tarjan)" : "Articulation Points (Tarjan)";
  const pseudo = isB ? BRIDGE_PSEUDO : ART_PSEUDO;
  return done(gb, title, { time: "O(V + E)", space: "O(V)" }, pseudo);
}

const ART_PSEUDO = ["dfs(u):  disc[u] = low[u] = timer++", "for each neighbour v of u:", "  tree edge → dfs(v), then low[u] = min(low[u], low[v])", "  back edge → low[u] = min(low[u], disc[v])", "u is a CUT VERTEX if:", "  non-root: some child has low[v] ≥ disc[u]", "  root: it has 2+ tree children"];

const SCC_PSEUDO = ["1) DFS the whole graph; record FINISH order", "2) TRANSPOSE the graph — reverse every edge", "3) DFS again, in REVERSE finish order:", "   every tree the 2nd DFS grows = one SCC", "// a cycle survives reversal — a one-way path doesn't"];

function scc(gb: GB): GraphProgram {
  snapshot(gb, `Strongly Connected Components (Kosaraju): find the groups where every node can reach every other FOLLOWING the arrows. Two DFS passes and one trick: reversing the arrows.`, [1]);

  // Pass 1: DFS, record finish order.
  gb.strip = { label: "finish order", chips: [] };
  const visited = new Set<string>();
  const finish: string[] = [];
  const out = (u: string) => gb.preset.edges.filter((e) => e.u === u).map((e) => ({ v: e.v, edge: e }));
  const inn = (u: string) => gb.preset.edges.filter((e) => e.v === u).map((e) => ({ v: e.u, edge: e }));

  const dfs1 = (u: string) => {
    visited.add(u);
    gb.states.set(u, "active");
    snapshot(gb, `Pass 1 — visit ${u} and explore everything it can reach.`, [1]);
    for (const { v, edge } of out(u)) {
      if (!visited.has(v)) {
        gb.edgeStates.set(eid(edge), "active");
        dfs1(v);
      }
    }
    gb.states.set(u, "visited");
    finish.push(u);
    gb.strip!.chips.push(chip(u, "done"));
    snapshot(gb, `${u} is FINISHED (all its descendants done) — record it. Finish order sorts nodes so that "upstream" components finish LAST.`, [1]);
  };
  for (const n of gb.preset.nodes) if (!visited.has(n.id)) dfs1(n.id);

  // Transpose.
  gb.states.clear();
  gb.edgeStates.clear();
  gb.reversed = true;
  snapshot(gb, `Pass 2 setup — TRANSPOSE: every arrow flips direction. Inside a cycle nothing changes (you can still go around); but one-way roads between components now point the WRONG way, fencing each component in.`, [2]);

  // Pass 2: DFS on transpose in reverse finish order.
  const groupOf = new Map<string, number>();
  let g = 0;
  const dfs2 = (u: string, gi: number) => {
    groupOf.set(u, gi);
    gb.groups.set(u, gi);
    gb.states.set(u, "active");
    snapshot(gb, `${u} joins SCC #${gi + 1}.`, [3, 4]);
    for (const { v, edge } of inn(u)) {
      // on the transpose, original in-edges are out-edges
      if (!groupOf.has(v)) {
        gb.edgeStates.set(eid(edge), "tree");
        dfs2(v, gi);
      }
    }
    gb.states.set(u, "visited");
  };
  for (let i = finish.length - 1; i >= 0; i--) {
    const u = finish[i];
    if (groupOf.has(u)) continue;
    gb.strip.chips[i].state = "active";
    snapshot(gb, `Take the LATEST unfinished node from the finish order: ${u}. Everything the reversed DFS reaches from here is exactly one SCC — the flipped arrows stop it from leaking into other components.`, [3]);
    dfs2(u, g);
    g++;
    snapshot(gb, `SCC #${g} complete (one color).`, [4]);
  }
  snapshot(gb, `${g} strongly connected components found — each color is a set of mutually reachable nodes. Two DFS passes: O(V + E).`, [5], {
    message: { text: `${g} SCCs FOUND`, tone: "ok" },
  });
  return done(gb, "Strongly Connected Components", { time: "O(V + E)", space: "O(V)" }, SCC_PSEUDO);
}

// --- Dispatch ------------------------------------------------------------------------------

export interface GraphRunParams {
  start?: string;
}

const PRESET_FOR: Record<GraphOperationId, Preset> = {
  adjMatrix: G_BASIC,
  adjList: G_BASIC,
  bfs: G_BASIC,
  dfs: G_BASIC,
  dijkstra: G_WEIGHTED,
  bellmanFord: G_DIRNEG,
  floydWarshall: G_FW,
  prim: G_WEIGHTED,
  kruskal: G_WEIGHTED,
  bridges: G_BRIDGE,
  articulation: G_BRIDGE,
  scc: G_SCC,
};

export function runGraphOperation(op: GraphOperationId, params: GraphRunParams = {}): GraphProgram {
  const preset = PRESET_FOR[op] ?? G_BASIC;
  const gb = makeGB(preset);
  const validStart = preset.nodes.some((n) => n.id === (params.start ?? "").toUpperCase());
  const start = validStart ? params.start!.toUpperCase() : preset.nodes[0].id;

  switch (op) {
    case "adjMatrix":
      return adjMatrix(gb);
    case "adjList":
      return adjList(gb);
    case "bfs":
      return bfs(gb, start);
    case "dfs":
      return dfs(gb, start);
    case "dijkstra":
      return dijkstra(gb, start);
    case "bellmanFord":
      return bellmanFord(gb, "S");
    case "floydWarshall":
      return floydWarshall(gb);
    case "prim":
      return prim(gb, start);
    case "kruskal":
      return kruskal(gb);
    case "bridges":
      return bridgesOrArticulation(gb, "bridges");
    case "articulation":
      return bridgesOrArticulation(gb, "articulation");
    case "scc":
      return scc(gb);
    default:
      return bfs(gb, start);
  }
}

export interface GraphOperationMeta {
  id: GraphOperationId;
  label: string;
  icon: string;
  params: "start"[];
  hint: string;
}

export const GRAPH_OPERATIONS: GraphOperationMeta[] = [
  { id: "adjMatrix", label: "Adj Matrix", icon: "grid_on", params: [], hint: "V×V grid: O(1) lookup, O(V²) space." },
  { id: "adjList", label: "Adj List", icon: "list", params: [], hint: "Per-node neighbour lists: O(V+E) space." },
  { id: "bfs", label: "BFS", icon: "waves", params: ["start"], hint: "Queue-driven — explores in distance rings." },
  { id: "dfs", label: "DFS", icon: "south", params: ["start"], hint: "Dive deep, backtrack when stuck." },
  { id: "dijkstra", label: "Dijkstra", icon: "route", params: ["start"], hint: "Lock in the closest node, relax its edges." },
  { id: "bellmanFord", label: "Bellman-Ford", icon: "sync_problem", params: [], hint: "Relax ALL edges V−1 times; handles negatives." },
  { id: "floydWarshall", label: "Floyd-Warshall", icon: "grid_4x4", params: [], hint: "All pairs via the k-loop matrix update." },
  { id: "prim", label: "Prim", icon: "park", params: ["start"], hint: "Grow one tree by the cheapest crossing edge." },
  { id: "kruskal", label: "Kruskal", icon: "sort", params: [], hint: "Cheapest edges first; skip cycle-closers." },
  { id: "bridges", label: "Bridges", icon: "remove_road", params: [], hint: "disc/low DFS — low[v] > disc[u]." },
  { id: "articulation", label: "Cut Vertices", icon: "hub", params: [], hint: "disc/low DFS — low[v] ≥ disc[u]." },
  { id: "scc", label: "SCC", icon: "workspaces", params: [], hint: "Kosaraju: DFS, transpose, DFS again." },
];
