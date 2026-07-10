import { TreesVisualizerScreen } from "@/components/visualizer/TreesVisualizerScreen";

export default function Page() {
  return (
    <TreesVisualizerScreen
      path="/topics/trees/avl-tree/insertion"
      title="AVL Insertion"
      blurb="BST insert, then rotate the first ±2 node."
      operation="avlInsert"
      defaultData={[30, 20, 40, 10]}
      defaultParams={{ value: 5 }}
    />
  );
}
