import { LinkedListVisualizerScreen } from "@/components/visualizer/LinkedListVisualizerScreen";

export default function Page() {
  return (
    <LinkedListVisualizerScreen
      path="/topics/linked-list/doubly-linked-list/insertion/insert-end"
      title="Insert at End"
      blurb="Append a node at the tail."
      kind="doubly"
      operation="insertEnd"
      defaultData={[10, 20, 30, 40]}
      defaultParams={{ value: 25 }}
    />
  );
}
