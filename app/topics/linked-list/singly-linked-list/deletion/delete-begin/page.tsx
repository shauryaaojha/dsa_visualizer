import { LinkedListVisualizerScreen } from "@/components/visualizer/LinkedListVisualizerScreen";

export default function Page() {
  return (
    <LinkedListVisualizerScreen
      path="/topics/linked-list/singly-linked-list/deletion/delete-begin"
      title="Delete at Begin"
      blurb="Remove the head — O(1)."
      kind="singly"
      operation="deleteBegin"
      defaultData={[10, 20, 30, 40]}
    />
  );
}
