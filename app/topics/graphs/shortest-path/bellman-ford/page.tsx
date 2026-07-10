import { GraphVisualizerScreen } from "@/components/visualizer/GraphVisualizerScreen";

export default function Page() {
  return (
    <GraphVisualizerScreen
      path="/topics/graphs/shortest-path/bellman-ford"
      title="Bellman–Ford"
      blurb="Relax all edges V−1 times; handles negatives."
      operation="bellmanFord"
      defaultParams={{}}
    />
  );
}
