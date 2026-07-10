import { TreesVisualizerScreen } from "@/components/visualizer/TreesVisualizerScreen";

export default function Page() {
  return (
    <TreesVisualizerScreen
      path="/topics/trees/binary-search-tree/insertion"
      title="BST Insertion"
      blurb="Attach at the NULL where the search fails."
      operation="bstInsert"
      defaultData={[50, 30, 70, 20, 40, 60, 80]}
      defaultParams={{ value: 45 }}
    />
  );
}
