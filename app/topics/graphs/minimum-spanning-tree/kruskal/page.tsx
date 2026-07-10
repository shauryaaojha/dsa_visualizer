import { GraphVisualizerScreen } from "@/components/visualizer/GraphVisualizerScreen";

export default function Page() {
  return (
    <GraphVisualizerScreen
      path="/topics/graphs/minimum-spanning-tree/kruskal"
      title="Kruskal's Algorithm"
      blurb="Cheapest edges first; skip cycle-closers."
      operation="kruskal"
      defaultParams={{}}
    />
  );
}
