import { TreesVisualizerScreen } from "@/components/visualizer/TreesVisualizerScreen";

export default function Page() {
  return (
    <TreesVisualizerScreen
      path="/topics/trees/avl-tree/rotations/ll-rotation"
      title="LL Rotation"
      blurb="Left-left case → one right rotation."
      operation="avlRotLL"
      defaultData={[]}
      defaultParams={{}}
    />
  );
}
