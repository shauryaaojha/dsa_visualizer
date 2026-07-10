import { GraphVisualizerScreen } from "@/components/visualizer/GraphVisualizerScreen";

export default function Page() {
  return (
    <GraphVisualizerScreen
      path="/topics/graphs/graph-representation/adjacency-matrix"
      title="Adjacency Matrix"
      blurb="V×V grid — O(1) lookup, O(V²) space."
      operation="adjMatrix"
      defaultParams={{}}
    />
  );
}
