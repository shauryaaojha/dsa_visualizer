import { LinkedListVisualizerScreen } from "@/components/visualizer/LinkedListVisualizerScreen";

export default function Page() {
  return (
    <LinkedListVisualizerScreen
      path="/topics/linked-list/doubly-linked-list/traversal"
      title="Traversal"
      blurb="Walk forward via next (prev links shown too)."
      kind="doubly"
      operation="traverse"
      defaultData={[10, 20, 30, 40]}
    />
  );
}
