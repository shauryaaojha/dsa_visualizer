"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { GRAPH_OPERATIONS, useGraphStore } from "@/lib/graphStore";
import type { GraphOperationId } from "@/types/visualization";

type Tab = { id: GraphOperationId; label: string; icon: string; subpath: string };

const TABS: Record<string, Tab[]> = {
  representation: [
    { id: "adjMatrix", label: "Matrix", icon: "grid_on", subpath: "graph-representation/adjacency-matrix" },
    { id: "adjList", label: "List", icon: "list", subpath: "graph-representation/adjacency-list" },
  ],
  traversal: [
    { id: "bfs", label: "BFS", icon: "waves", subpath: "traversal/bfs" },
    { id: "dfs", label: "DFS", icon: "south", subpath: "traversal/dfs" },
  ],
  shortest: [
    { id: "dijkstra", label: "Dijkstra", icon: "route", subpath: "shortest-path/dijkstra" },
    { id: "bellmanFord", label: "Bellman-Ford", icon: "sync_problem", subpath: "shortest-path/bellman-ford" },
    { id: "floydWarshall", label: "Floyd-Warshall", icon: "grid_4x4", subpath: "shortest-path/floyd-warshall" },
  ],
  mst: [
    { id: "prim", label: "Prim", icon: "park", subpath: "minimum-spanning-tree/prims" },
    { id: "kruskal", label: "Kruskal", icon: "sort", subpath: "minimum-spanning-tree/kruskal" },
  ],
  connectivity: [
    { id: "bridges", label: "Bridges", icon: "remove_road", subpath: "connectivity/bridges" },
    { id: "articulation", label: "Cut Vertices", icon: "hub", subpath: "connectivity/articulation-points" },
    { id: "scc", label: "SCC", icon: "workspaces", subpath: "connectivity/strongly-connected-components" },
  ],
};

function groupOf(op: GraphOperationId): keyof typeof TABS {
  if (op === "adjMatrix" || op === "adjList") return "representation";
  if (op === "bfs" || op === "dfs") return "traversal";
  if (op === "dijkstra" || op === "bellmanFord" || op === "floydWarshall") return "shortest";
  if (op === "prim" || op === "kruskal") return "mst";
  return "connectivity";
}

const GROUP_LABEL: Record<string, string> = {
  representation: "Representation",
  traversal: "Graph Traversal",
  shortest: "Shortest Path",
  mst: "Minimum Spanning Tree",
  connectivity: "Connectivity",
};

export function GraphSidebar() {
  const router = useRouter();
  const operation = useGraphStore((s) => s.operation);
  const params = useGraphStore((s) => s.params);
  const setParams = useGraphStore((s) => s.setParams);
  const run = useGraphStore((s) => s.run);

  const group = groupOf(operation);
  const meta = GRAPH_OPERATIONS.find((o) => o.id === operation);
  const hasStart = !!meta?.params.includes("start");

  return (
    <aside className="z-40 flex h-full w-72 shrink-0 flex-col border-r border-outline-variant bg-surface-container-low/95 backdrop-blur-xl overflow-y-auto scroll-thin md:bg-surface-container-low/80">
      <div className="flex flex-1 flex-col gap-md p-md">
        <div className="flex items-center gap-2 border-b border-outline-variant pb-md">
          <Icon name="hub" className="text-[16px] text-primary" />
          <h2 className="font-label-caps text-label-caps text-primary">{GROUP_LABEL[group]}</h2>
        </div>

        <p className="font-body-sm text-[11px] text-on-surface-variant/70">
          The graph is a curated preset, hand-picked so this algorithm's key moments are easy to see.
        </p>

        {/* Quick op tabs */}
        <div>
          <label className="mb-1.5 block font-label-caps text-[10px] text-on-surface-variant">ALGORITHMS</label>
          <div className="grid grid-cols-2 gap-1">
            {TABS[group].map((t) => {
              const selected = t.id === operation;
              return (
                <button
                  key={t.id}
                  onClick={() => router.push(`/topics/graphs/${t.subpath}`)}
                  title={t.label}
                  className={`flex flex-col items-center gap-0.5 border px-1 py-1.5 transition-colors ${
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-outline-variant text-on-surface-variant hover:border-primary/60 hover:text-on-surface"
                  }`}
                >
                  <Icon name={t.icon} className="text-[16px]" />
                  <span className="text-center font-label-caps text-[8px] leading-tight">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Start node */}
        {hasStart && (
          <div>
            <label className="mb-1 block font-label-caps text-[10px] text-on-surface-variant">START NODE (A, B, C…)</label>
            <input
              value={params.start}
              maxLength={1}
              onChange={(e) => setParams({ start: e.target.value.toUpperCase() })}
              className="w-full border border-outline-variant bg-surface-container-lowest px-2 py-1.5 font-mono text-body-sm text-on-surface outline-none focus:border-primary"
              placeholder="A"
            />
          </div>
        )}

        {meta && <p className="font-body-sm text-[11px] text-on-surface-variant/70">{meta.hint}</p>}

        <button
          onClick={() => run(operation, params)}
          className="flex w-full items-center justify-center gap-2 bg-primary-container py-2.5 font-label-caps text-label-caps text-surface transition-transform hover:bg-opacity-90 active:scale-[0.98]"
        >
          <Icon name="play_circle" className="text-[18px]" /> Re-run
        </button>
      </div>
    </aside>
  );
}
