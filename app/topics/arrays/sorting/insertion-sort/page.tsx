import { ArrayVisualizerScreen } from "@/components/visualizer/ArrayVisualizerScreen";

export default function Page() {
  return (
    <ArrayVisualizerScreen
      path="/topics/arrays/sorting/insertion-sort"
      title="Insertion Sort"
      blurb="Grow a sorted prefix by inserting each next element into place — O(n²)."
      operation="insertionSort"
      defaultData={[5, 2, 8, 1, 9, 3, 7]}
    />
  );
}
