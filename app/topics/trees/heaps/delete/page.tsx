import { TreesVisualizerScreen } from "@/components/visualizer/TreesVisualizerScreen";

export default function Page() {
  return (
    <TreesVisualizerScreen
      path="/topics/trees/heaps/delete"
      title="Heap Delete"
      blurb="Take the root; last leaf sifts down."
      operation="heapDelete"
      defaultData={[90, 70, 80, 30, 60, 20]}
      defaultParams={{}}
    />
  );
}
