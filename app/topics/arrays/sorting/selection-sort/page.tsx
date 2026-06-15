import { ArrayVisualizerScreen } from "@/components/visualizer/ArrayVisualizerScreen";

export default function Page() {
  return (
    <ArrayVisualizerScreen
      path="/topics/arrays/sorting/selection-sort"
      title="Selection Sort"
      blurb="Each pass selects the minimum of the unsorted region — O(n²)."
      operation="selectionSort"
      defaultData={[5, 2, 8, 1, 9, 3, 7]}
    />
  );
}
