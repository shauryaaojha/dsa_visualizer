import { LinkedListVisualizerScreen } from "@/components/visualizer/LinkedListVisualizerScreen";

export default function Page() {
  return (
    <LinkedListVisualizerScreen
      path="/topics/linked-list/circular-linked-list/traversal"
      title="Traversal"
      blurb="Walk around the circle until you return to head."
      kind="circular"
      operation="traverse"
      defaultData={[10, 20, 30, 40]}
    />
  );
}
