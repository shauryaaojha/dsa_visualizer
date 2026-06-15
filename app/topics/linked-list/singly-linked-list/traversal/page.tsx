import { LinkedListVisualizerScreen } from "@/components/visualizer/LinkedListVisualizerScreen";

export default function Page() {
  return (
    <LinkedListVisualizerScreen
      path="/topics/linked-list/singly-linked-list/traversal"
      title="Traversal"
      blurb="Walk head to tail following next pointers."
      kind="singly"
      operation="traverse"
      defaultData={[10, 20, 30, 40]}
    />
  );
}
