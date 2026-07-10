import { GraphVisualizerScreen } from "@/components/visualizer/GraphVisualizerScreen";

export default function Page() {
  return (
    <GraphVisualizerScreen
      path="/topics/graphs/shortest-path/dijkstra"
      title="Dijkstra"
      blurb="Lock in the closest node, relax its edges."
      operation="dijkstra"
      defaultParams={{ start: "A" }}
    />
  );
}
