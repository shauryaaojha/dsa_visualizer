import { ArrayVisualizerScreen } from "@/components/visualizer/ArrayVisualizerScreen";

export default function Page() {
  return (
    <ArrayVisualizerScreen
      path="/topics/arrays/sorting/bubble-sort"
      title="Bubble Sort"
      blurb="Repeatedly compare adjacent pairs and swap if out of order — O(n²)."
      operation="bubbleSort"
      defaultData={[5, 2, 8, 1, 9, 3, 7]}
    />
  );
}
