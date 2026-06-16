import { ArrayVisualizerScreen } from "@/components/visualizer/ArrayVisualizerScreen";

export default function Page() {
  return (
    <ArrayVisualizerScreen
      path="/topics/arrays/patterns/remove-duplicates"
      title="Remove Duplicates from Sorted Array"
      blurb="A write pointer compacts the sorted array to its unique prefix in place (LeetCode #26)."
      operation="removeDuplicates"
      defaultData={[1, 1, 2, 2, 2, 3, 4, 4]}
    />
  );
}
