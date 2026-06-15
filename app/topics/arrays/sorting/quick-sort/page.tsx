import { TreeVisualizerScreen } from "@/components/visualizer/TreeVisualizerScreen";

// Divide & conquer → recursion-tree visualizer.
export default function Page() {
  return (
    <TreeVisualizerScreen
      path="/topics/arrays/sorting/quick-sort"
      title="Quick Sort"
      blurb="Partition around a pivot, then recurse on the left and right subtrees — O(n log n) avg."
      operation="quickSort"
      defaultData={[38, 27, 43, 3, 9, 82, 10]}
    />
  );
}
