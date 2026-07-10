import { TreesVisualizerScreen } from "@/components/visualizer/TreesVisualizerScreen";

export default function Page() {
  return (
    <TreesVisualizerScreen
      path="/topics/trees/avl-tree/rotations/lr-rotation"
      title="LR Rotation"
      blurb="Zig-zag: rotate child, then pivot."
      operation="avlRotLR"
      defaultData={[]}
      defaultParams={{}}
    />
  );
}
