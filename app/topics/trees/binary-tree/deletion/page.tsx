import { TreesVisualizerScreen } from "@/components/visualizer/TreesVisualizerScreen";

export default function Page() {
  return (
    <TreesVisualizerScreen
      path="/topics/trees/binary-tree/deletion"
      title="Deletion"
      blurb="Swap with the deepest node, then remove it."
      operation="btDelete"
      defaultData={[1, 2, 3, 4, 5, 6, 7]}
      defaultParams={{ value: 3 }}
    />
  );
}
