import { LinkedListVisualizerScreen } from "@/components/visualizer/LinkedListVisualizerScreen";

export default function Page() {
  return (
    <LinkedListVisualizerScreen
      path="/topics/linked-list/classic-problems/palindrome-list"
      title="Palindrome Linked List"
      blurb="Compare values inward from both ends — a match all the way means a palindrome (LeetCode #234)."
      kind="singly"
      operation="palindrome"
      defaultData={[10, 20, 30, 20, 10]}
    />
  );
}
