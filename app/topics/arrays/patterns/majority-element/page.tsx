import { ArrayVisualizerScreen } from "@/components/visualizer/ArrayVisualizerScreen";

export default function Page() {
  return (
    <ArrayVisualizerScreen
      path="/topics/arrays/patterns/majority-element"
      title="Majority Element"
      blurb="Boyer–Moore voting finds the value appearing more than n/2 times in O(1) space (LeetCode #169)."
      operation="majorityElement"
      defaultData={[2, 2, 1, 1, 1, 2, 2]}
    />
  );
}
