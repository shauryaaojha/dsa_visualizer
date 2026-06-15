import { LinkedListVisualizerScreen } from "@/components/visualizer/LinkedListVisualizerScreen";

export default function Page() {
  return (
    <LinkedListVisualizerScreen
      path="/topics/linked-list/circular-linked-list/insertion/insert-begin"
      title="Insert at Begin"
      blurb="Prepend a node — O(1)."
      kind="circular"
      operation="insertBegin"
      defaultData={[10, 20, 30, 40]}
      defaultParams={{ value: 25 }}
    />
  );
}
