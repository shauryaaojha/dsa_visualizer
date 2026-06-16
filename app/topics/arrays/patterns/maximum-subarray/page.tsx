import { ArrayVisualizerScreen } from "@/components/visualizer/ArrayVisualizerScreen";

export default function Page() {
  return (
    <ArrayVisualizerScreen
      path="/topics/arrays/patterns/maximum-subarray"
      title="Maximum Subarray"
      blurb="Kadane's algorithm: the largest-sum contiguous subarray in one pass (LeetCode #53)."
      operation="kadane"
      defaultData={[-2, 1, -3, 4, -1, 2, 1, -5, 4]}
    />
  );
}
