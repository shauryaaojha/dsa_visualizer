import { QueueVisualizerScreen } from "@/components/visualizer/QueueVisualizerScreen";

export default function Page() {
  return (
    <QueueVisualizerScreen
      path="/topics/queues/circular-queue/overflow-condition"
      title="Overflow Condition"
      blurb="(rear + 1) % N == front — rear catches front."
      kind="circular"
      operation="cOverflow"
      defaultData={[10, 20]}
      defaultParams={{ value: 30, capacity: 6 }}
    />
  );
}
