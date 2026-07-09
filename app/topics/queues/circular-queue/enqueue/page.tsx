import { QueueVisualizerScreen } from "@/components/visualizer/QueueVisualizerScreen";

export default function Page() {
  return (
    <QueueVisualizerScreen
      path="/topics/queues/circular-queue/enqueue"
      title="Enqueue"
      blurb="rear = (rear + 1) % N, then write."
      kind="circular"
      operation="cEnqueue"
      defaultData={[10, 20, 30, 40]}
      defaultParams={{ value: 99, capacity: 6 }}
    />
  );
}
