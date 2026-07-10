import { GraphVisualizerScreen } from "@/components/visualizer/GraphVisualizerScreen";

export default function Page() {
  return (
    <GraphVisualizerScreen
      path="/topics/graphs/traversal/dfs"
      title="Depth-First Search"
      blurb="Dive deep, backtrack when stuck."
      operation="dfs"
      defaultParams={{ start: "A" }}
    />
  );
}
