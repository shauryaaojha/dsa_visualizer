import { ArrayVisualizerScreen } from "@/components/visualizer/ArrayVisualizerScreen";

export default function Page() {
  return (
    <ArrayVisualizerScreen
      path="/topics/arrays/patterns/move-zeroes"
      title="Move Zeroes"
      blurb="Push every 0 to the end while preserving the order of non-zeros (LeetCode #283)."
      operation="moveZeroes"
      defaultData={[0, 1, 0, 3, 12, 0, 5]}
    />
  );
}
