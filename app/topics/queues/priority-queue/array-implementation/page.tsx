import { QueueVisualizerScreen } from "@/components/visualizer/QueueVisualizerScreen";

export default function Page() {
  return (
    <QueueVisualizerScreen
      path="/topics/queues/priority-queue/array-implementation"
      title="Priority Queue — Array"
      blurb="Append O(1); dequeue scans for the max — O(n)."
      kind="pqArray"
      operation="pqArrayDemo"
      defaultData={[]}
      defaultParams={{ value: 45, priority: 4 }}
    />
  );
}
