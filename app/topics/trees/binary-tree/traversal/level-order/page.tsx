import { TreesVisualizerScreen } from "@/components/visualizer/TreesVisualizerScreen";

export default function Page() {
  return (
    <TreesVisualizerScreen
      path="/topics/trees/binary-tree/traversal/level-order"
      title="Level Order Traversal"
      blurb="Top → bottom with a queue."
      operation="btLevelOrder"
      defaultData={[1, 2, 3, 4, 5, 6, 7]}
      defaultParams={{}}
    />
  );
}
