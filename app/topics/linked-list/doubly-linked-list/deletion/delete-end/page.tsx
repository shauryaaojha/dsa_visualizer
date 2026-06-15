import { LinkedListVisualizerScreen } from "@/components/visualizer/LinkedListVisualizerScreen";

export default function Page() {
  return (
    <LinkedListVisualizerScreen
      path="/topics/linked-list/doubly-linked-list/deletion/delete-end"
      title="Delete at End"
      blurb="Remove the tail node."
      kind="doubly"
      operation="deleteEnd"
      defaultData={[10, 20, 30, 40]}
    />
  );
}
