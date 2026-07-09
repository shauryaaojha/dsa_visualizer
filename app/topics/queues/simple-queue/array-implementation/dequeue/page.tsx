import { QueueVisualizerScreen } from "@/components/visualizer/QueueVisualizerScreen";

export default function Page() {
  return (
    <QueueVisualizerScreen
      path="/topics/queues/simple-queue/array-implementation/dequeue"
      title="Dequeue"
      blurb="Read queue[front], then front++."
      kind="simple"
      operation="dequeue"
      defaultData={[10, 20, 30, 40]}
      defaultParams={{ capacity: 6 }}
    />
  );
}
