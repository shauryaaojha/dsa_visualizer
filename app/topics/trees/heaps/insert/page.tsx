import { TreesVisualizerScreen } from "@/components/visualizer/TreesVisualizerScreen";

export default function Page() {
  return (
    <TreesVisualizerScreen
      path="/topics/trees/heaps/insert"
      title="Heap Insert"
      blurb="Append at the end, then sift up."
      operation="heapInsert"
      defaultData={[90, 70, 80, 30, 60]}
      defaultParams={{ value: 85 }}
    />
  );
}
