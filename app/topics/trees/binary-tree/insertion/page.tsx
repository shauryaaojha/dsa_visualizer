import { TreesVisualizerScreen } from "@/components/visualizer/TreesVisualizerScreen";

export default function Page() {
  return (
    <TreesVisualizerScreen
      path="/topics/trees/binary-tree/insertion"
      title="Insertion"
      blurb="Fill the first free spot, level by level."
      operation="btInsert"
      defaultData={[1, 2, 3, 4, 5]}
      defaultParams={{ value: 6 }}
    />
  );
}
