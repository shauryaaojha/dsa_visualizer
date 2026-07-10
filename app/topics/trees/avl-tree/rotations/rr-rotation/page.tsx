import { TreesVisualizerScreen } from "@/components/visualizer/TreesVisualizerScreen";

export default function Page() {
  return (
    <TreesVisualizerScreen
      path="/topics/trees/avl-tree/rotations/rr-rotation"
      title="RR Rotation"
      blurb="Right-right case → one left rotation."
      operation="avlRotRR"
      defaultData={[]}
      defaultParams={{}}
    />
  );
}
