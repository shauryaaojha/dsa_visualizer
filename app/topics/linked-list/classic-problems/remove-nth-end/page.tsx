import { LinkedListVisualizerScreen } from "@/components/visualizer/LinkedListVisualizerScreen";

export default function Page() {
  return (
    <LinkedListVisualizerScreen
      path="/topics/linked-list/classic-problems/remove-nth-end"
      title="Remove Nth Node From End"
      blurb="Open a gap of n between fast and slow, then unlink in one pass (LeetCode #19)."
      kind="singly"
      operation="removeNthEnd"
      defaultData={[10, 20, 30, 40, 50]}
      defaultParams={{ value: 2 }}
    />
  );
}
