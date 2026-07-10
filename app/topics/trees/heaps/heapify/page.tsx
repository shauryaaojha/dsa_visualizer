import { TreesVisualizerScreen } from "@/components/visualizer/TreesVisualizerScreen";

export default function Page() {
  return (
    <TreesVisualizerScreen
      path="/topics/trees/heaps/heapify"
      title="Heapify"
      blurb="Bottom-up build of a heap — O(n)."
      operation="heapify"
      defaultData={[20, 60, 90, 30, 80, 70]}
      defaultParams={{}}
    />
  );
}
