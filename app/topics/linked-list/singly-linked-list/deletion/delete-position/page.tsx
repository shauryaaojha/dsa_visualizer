import { LinkedListVisualizerScreen } from "@/components/visualizer/LinkedListVisualizerScreen";

export default function Page() {
  return (
    <LinkedListVisualizerScreen
      path="/topics/linked-list/singly-linked-list/deletion/delete-position"
      title="Delete at Position"
      blurb="Unlink the node at an index."
      kind="singly"
      operation="deletePosition"
      defaultData={[10, 20, 30, 40]}
      defaultParams={{ index: 1 }}
    />
  );
}
