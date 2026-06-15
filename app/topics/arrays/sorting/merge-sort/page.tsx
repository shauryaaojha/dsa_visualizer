import { TreeVisualizerScreen } from "@/components/visualizer/TreeVisualizerScreen";

// Divide & conquer → recursion-tree visualizer.
export default function Page() {
  return (
    <TreeVisualizerScreen
      path="/topics/arrays/sorting/merge-sort"
      title="Merge Sort"
      blurb="Divide the array into halves down the tree, then merge them back sorted — O(n log n)."
      operation="mergeSort"
      defaultData={[38, 27, 43, 3, 9, 82, 10]}
    />
  );
}
