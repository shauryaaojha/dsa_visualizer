import { ArrayVisualizerScreen } from "@/components/visualizer/ArrayVisualizerScreen";

export default function Page() {
  return (
    <ArrayVisualizerScreen
      path="/topics/arrays/basic-operations/traversal"
      title="Traversal"
      blurb="Visit every element once, left to right — O(n)."
      operation="traverse"
      defaultData={[8, 3, 17, 5, 12, 1, 9, 14]}
    />
  );
}
