import { TreesVisualizerScreen } from "@/components/visualizer/TreesVisualizerScreen";

export default function Page() {
  return (
    <TreesVisualizerScreen
      path="/topics/trees/binary-search-tree/traversal"
      title="BST Traversal"
      blurb="In-order yields sorted output."
      operation="bstTraversal"
      defaultData={[50, 30, 70, 20, 40, 60, 80]}
      defaultParams={{}}
    />
  );
}
