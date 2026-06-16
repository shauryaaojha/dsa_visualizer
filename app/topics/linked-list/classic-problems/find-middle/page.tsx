import { LinkedListVisualizerScreen } from "@/components/visualizer/LinkedListVisualizerScreen";

export default function Page() {
  return (
    <LinkedListVisualizerScreen
      path="/topics/linked-list/classic-problems/find-middle"
      title="Middle of the Linked List"
      blurb="Tortoise & hare: slow steps 1, fast steps 2 — slow lands on the middle (LeetCode #876)."
      kind="singly"
      operation="findMiddle"
      defaultData={[10, 20, 30, 40, 50]}
    />
  );
}
