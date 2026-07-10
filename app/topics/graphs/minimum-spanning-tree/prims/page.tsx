import { GraphVisualizerScreen } from "@/components/visualizer/GraphVisualizerScreen";

export default function Page() {
  return (
    <GraphVisualizerScreen
      path="/topics/graphs/minimum-spanning-tree/prims"
      title="Prim's Algorithm"
      blurb="Grow one tree by the cheapest crossing edge."
      operation="prim"
      defaultParams={{ start: "A" }}
    />
  );
}
