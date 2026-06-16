import { ArrayVisualizerScreen } from "@/components/visualizer/ArrayVisualizerScreen";

export default function Page() {
  return (
    <ArrayVisualizerScreen
      path="/topics/arrays/patterns/sort-colors"
      title="Sort Colors"
      blurb="Dutch National Flag: partition 0s, 1s and 2s in a single pass (LeetCode #75)."
      operation="sortColors"
      defaultData={[2, 0, 2, 1, 1, 0, 1, 2]}
    />
  );
}
