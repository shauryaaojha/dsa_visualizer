import { ArrayVisualizerScreen } from "@/components/visualizer/ArrayVisualizerScreen";

export default function Page() {
  return (
    <ArrayVisualizerScreen
      path="/topics/arrays/patterns/best-time-stock"
      title="Best Time to Buy & Sell Stock"
      blurb="Track the cheapest day so far and the best profit if you sell today (LeetCode #121)."
      operation="maxProfit"
      defaultData={[7, 1, 5, 3, 6, 4]}
    />
  );
}
