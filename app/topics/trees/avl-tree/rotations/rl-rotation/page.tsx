import { TreesVisualizerScreen } from "@/components/visualizer/TreesVisualizerScreen";

export default function Page() {
  return (
    <TreesVisualizerScreen
      path="/topics/trees/avl-tree/rotations/rl-rotation"
      title="RL Rotation"
      blurb="Zig-zag: rotate child, then pivot."
      operation="avlRotRL"
      defaultData={[]}
      defaultParams={{}}
    />
  );
}
