import { ArrayVisualizerScreen } from "@/components/visualizer/ArrayVisualizerScreen";

export default function Page() {
  return (
    <ArrayVisualizerScreen
      path="/topics/arrays/advanced-array/prefix-sum"
      title="Prefix Sum"
      blurb="Precompute running totals so any range sum is answered in O(1)."
      operation="prefixSum"
      defaultData={[3, 1, 4, 1, 5, 9, 2, 6]}
    />
  );
}
