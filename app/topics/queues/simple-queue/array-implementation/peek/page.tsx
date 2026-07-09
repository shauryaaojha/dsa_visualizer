import { QueueVisualizerScreen } from "@/components/visualizer/QueueVisualizerScreen";

export default function Page() {
  return (
    <QueueVisualizerScreen
      path="/topics/queues/simple-queue/array-implementation/peek"
      title="Peek"
      blurb="Read the front without removing it."
      kind="simple"
      operation="qPeek"
      defaultData={[10, 20, 30]}
      defaultParams={{ capacity: 6 }}
    />
  );
}
