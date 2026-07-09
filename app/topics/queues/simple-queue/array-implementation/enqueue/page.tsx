import { QueueVisualizerScreen } from "@/components/visualizer/QueueVisualizerScreen";

export default function Page() {
  return (
    <QueueVisualizerScreen
      path="/topics/queues/simple-queue/array-implementation/enqueue"
      title="Enqueue"
      blurb="rear++, then write at queue[rear]."
      kind="simple"
      operation="enqueue"
      defaultData={[10, 20, 30]}
      defaultParams={{ value: 99, capacity: 6 }}
    />
  );
}
