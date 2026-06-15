import { LinkedListVisualizerScreen } from "@/components/visualizer/LinkedListVisualizerScreen";

export default function Page() {
  return (
    <LinkedListVisualizerScreen
      path="/topics/linked-list/doubly-linked-list/insertion/insert-position"
      title="Insert at Position"
      blurb="Splice a node at an index."
      kind="doubly"
      operation="insertPosition"
      defaultData={[10, 20, 30, 40]}
      defaultParams={{ index: 2, value: 25 }}
    />
  );
}
