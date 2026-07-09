import { QueueVisualizerScreen } from "@/components/visualizer/QueueVisualizerScreen";

export default function Page() {
  return (
    <QueueVisualizerScreen
      path="/topics/queues/circular-queue/dequeue"
      title="Dequeue"
      blurb="Read, then front = (front + 1) % N."
      kind="circular"
      operation="cDequeue"
      defaultData={[10, 20, 30, 40]}
      defaultParams={{ capacity: 6 }}
    />
  );
}
