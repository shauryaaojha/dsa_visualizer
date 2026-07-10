import { TreesVisualizerScreen } from "@/components/visualizer/TreesVisualizerScreen";

export default function Page() {
  return (
    <TreesVisualizerScreen
      path="/topics/trees/binary-search-tree/deletion"
      title="BST Deletion"
      blurb="Leaf, one child, or two children (successor)."
      operation="bstDelete"
      defaultData={[50, 30, 70, 20, 40, 60, 80]}
      defaultParams={{ value: 30 }}
    />
  );
}
