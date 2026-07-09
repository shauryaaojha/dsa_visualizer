import { QueueVisualizerScreen } from "@/components/visualizer/QueueVisualizerScreen";

export default function Page() {
  return (
    <QueueVisualizerScreen
      path="/topics/queues/priority-queue/heap-implementation"
      title="Priority Queue — Heap"
      blurb="Sift-up on insert, sift-down on extract — O(log n)."
      kind="pqHeap"
      operation="pqHeapDemo"
      defaultData={[]}
      defaultParams={{ value: 85 }}
    />
  );
}
