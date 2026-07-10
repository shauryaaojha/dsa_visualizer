import { TreesVisualizerScreen } from "@/components/visualizer/TreesVisualizerScreen";

export default function Page() {
  return (
    <TreesVisualizerScreen
      path="/topics/trees/binary-tree/traversal/inorder"
      title="In-order Traversal"
      blurb="Left → Node → Right."
      operation="btInorder"
      defaultData={[1, 2, 3, 4, 5, 6, 7]}
      defaultParams={{}}
    />
  );
}
