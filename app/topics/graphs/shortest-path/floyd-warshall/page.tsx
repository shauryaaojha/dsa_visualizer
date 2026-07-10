import { GraphVisualizerScreen } from "@/components/visualizer/GraphVisualizerScreen";

export default function Page() {
  return (
    <GraphVisualizerScreen
      path="/topics/graphs/shortest-path/floyd-warshall"
      title="Floyd–Warshall"
      blurb="All pairs, one matrix, three loops."
      operation="floydWarshall"
      defaultParams={{}}
    />
  );
}
