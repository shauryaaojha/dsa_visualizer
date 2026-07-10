import { GraphVisualizerScreen } from "@/components/visualizer/GraphVisualizerScreen";

export default function Page() {
  return (
    <GraphVisualizerScreen
      path="/topics/graphs/graph-representation/adjacency-list"
      title="Adjacency List"
      blurb="Neighbour lists — O(V+E) space."
      operation="adjList"
      defaultParams={{}}
    />
  );
}
