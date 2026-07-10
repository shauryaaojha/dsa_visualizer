import { TreesVisualizerScreen } from "@/components/visualizer/TreesVisualizerScreen";

export default function Page() {
  return (
    <TreesVisualizerScreen
      path="/topics/trees/binary-tree/traversal/preorder"
      title="Pre-order Traversal"
      blurb="Node → Left → Right."
      operation="btPreorder"
      defaultData={[1, 2, 3, 4, 5, 6, 7]}
      defaultParams={{}}
    />
  );
}
