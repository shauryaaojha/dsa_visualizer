import { GraphVisualizerScreen } from "@/components/visualizer/GraphVisualizerScreen";

export default function Page() {
  return (
    <GraphVisualizerScreen
      path="/topics/graphs/connectivity/bridges"
      title="Bridges"
      blurb="Edges whose removal splits the graph."
      operation="bridges"
      defaultParams={{}}
    />
  );
}
