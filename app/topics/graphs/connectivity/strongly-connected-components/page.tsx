import { GraphVisualizerScreen } from "@/components/visualizer/GraphVisualizerScreen";

export default function Page() {
  return (
    <GraphVisualizerScreen
      path="/topics/graphs/connectivity/strongly-connected-components"
      title="Strongly Connected Components"
      blurb="Kosaraju: DFS, transpose, DFS again."
      operation="scc"
      defaultParams={{}}
    />
  );
}
