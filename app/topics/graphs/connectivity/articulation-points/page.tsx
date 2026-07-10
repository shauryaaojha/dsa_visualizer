import { GraphVisualizerScreen } from "@/components/visualizer/GraphVisualizerScreen";

export default function Page() {
  return (
    <GraphVisualizerScreen
      path="/topics/graphs/connectivity/articulation-points"
      title="Articulation Points"
      blurb="Nodes whose removal splits the graph."
      operation="articulation"
      defaultParams={{}}
    />
  );
}
