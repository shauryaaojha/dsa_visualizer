import { QueueVisualizerScreen } from "@/components/visualizer/QueueVisualizerScreen";

export default function Page() {
  return (
    <QueueVisualizerScreen
      path="/topics/queues/deque/insert-front"
      title="Insert Front"
      blurb="The op a plain queue forbids."
      kind="deque"
      operation="dqInsertFront"
      defaultData={[20, 30, 40]}
      defaultParams={{ value: 10 }}
    />
  );
}
