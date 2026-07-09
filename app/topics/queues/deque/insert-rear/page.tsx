import { QueueVisualizerScreen } from "@/components/visualizer/QueueVisualizerScreen";

export default function Page() {
  return (
    <QueueVisualizerScreen
      path="/topics/queues/deque/insert-rear"
      title="Insert Rear"
      blurb="Same as a normal enqueue."
      kind="deque"
      operation="dqInsertRear"
      defaultData={[10, 20, 30]}
      defaultParams={{ value: 40 }}
    />
  );
}
