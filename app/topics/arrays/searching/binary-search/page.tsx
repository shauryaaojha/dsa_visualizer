import { TreeVisualizerScreen } from "@/components/visualizer/TreeVisualizerScreen";

export default function Page() {
  return (
    <TreeVisualizerScreen
      path="/topics/arrays/searching/binary-search"
      title="Binary Search"
      blurb="On a sorted array, halve the search range each step — O(log n)."
      operation="binarySearch"
      defaultData={[2, 5, 8, 12, 16, 23, 38, 56, 72, 91]}
      defaultTarget={23}
    />
  );
}
