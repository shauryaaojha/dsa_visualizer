import { GraphVisualizerScreen } from "@/components/visualizer/GraphVisualizerScreen";

export default function Page() {
  return (
    <GraphVisualizerScreen
      path="/topics/graphs/traversal/bfs"
      title="Breadth-First Search"
      blurb="Queue-driven, level by level."
      operation="bfs"
      defaultParams={{ start: "A" }}
    />
  );
}
