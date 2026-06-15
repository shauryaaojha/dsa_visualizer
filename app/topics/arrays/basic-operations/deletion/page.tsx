import { ArrayVisualizerScreen } from "@/components/visualizer/ArrayVisualizerScreen";

export default function Page() {
  return (
    <ArrayVisualizerScreen
      path="/topics/arrays/basic-operations/deletion"
      title="Deletion"
      blurb="Remove an element, then shift the rest left to close the gap — O(n)."
      operation="delete"
      defaultData={[8, 3, 17, 5, 12, 1, 9, 14]}
      defaultParams={{ index: 2 }}
    />
  );
}
