import { LinkedListVisualizerScreen } from "@/components/visualizer/LinkedListVisualizerScreen";

export default function Page() {
  return (
    <LinkedListVisualizerScreen
      path="/topics/linked-list/classic-problems/reverse-list"
      title="Reverse a Linked List"
      blurb="Walk prev/curr/next, flipping every next pointer backwards (LeetCode #206)."
      kind="singly"
      operation="reverseList"
      defaultData={[10, 20, 30, 40, 50]}
    />
  );
}
