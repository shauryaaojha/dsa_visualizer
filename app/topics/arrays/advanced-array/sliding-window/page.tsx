import { ArrayVisualizerScreen } from "@/components/visualizer/ArrayVisualizerScreen";

export default function Page() {
  return (
    <ArrayVisualizerScreen
      path="/topics/arrays/advanced-array/sliding-window"
      title="Sliding Window"
      blurb="Slide a fixed-size window to find the best window sum in O(n). (value = window size k)"
      operation="slidingWindow"
      defaultData={[2, 1, 5, 1, 3, 2, 8, 1]}
      defaultParams={{ value: 3 }}
    />
  );
}
