import { TreesVisualizerScreen } from "@/components/visualizer/TreesVisualizerScreen";

export default function Page() {
  return (
    <TreesVisualizerScreen
      path="/topics/trees/avl-tree/deletion"
      title="AVL Deletion"
      blurb="BST delete, then rebalance the whole path."
      operation="avlDelete"
      defaultData={[30, 20, 40, 10, 25, 35, 50, 45]}
      defaultParams={{ value: 35 }}
    />
  );
}
