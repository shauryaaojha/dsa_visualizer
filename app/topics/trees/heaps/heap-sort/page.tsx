import { TreesVisualizerScreen } from "@/components/visualizer/TreesVisualizerScreen";

export default function Page() {
  return (
    <TreesVisualizerScreen
      path="/topics/trees/heaps/heap-sort"
      title="Heap Sort"
      blurb="Extract max n times → sorted."
      operation="heapSort"
      defaultData={[40, 90, 20, 70, 50, 80]}
      defaultParams={{}}
    />
  );
}
