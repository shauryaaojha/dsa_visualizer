import { TreesVisualizerScreen } from "@/components/visualizer/TreesVisualizerScreen";

export default function Page() {
  return (
    <TreesVisualizerScreen
      path="/topics/trees/binary-tree/traversal/postorder"
      title="Post-order Traversal"
      blurb="Left → Right → Node."
      operation="btPostorder"
      defaultData={[1, 2, 3, 4, 5, 6, 7]}
      defaultParams={{}}
    />
  );
}
