import { TreesVisualizerScreen } from "@/components/visualizer/TreesVisualizerScreen";

export default function Page() {
  return (
    <TreesVisualizerScreen
      path="/topics/trees/binary-search-tree/search"
      title="BST Search"
      blurb="Walk left or right by comparison — O(h)."
      operation="bstSearch"
      defaultData={[50, 30, 70, 20, 40, 60, 80]}
      defaultParams={{ value: 40 }}
    />
  );
}
