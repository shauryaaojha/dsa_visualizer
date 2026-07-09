import { QueueVisualizerScreen } from "@/components/visualizer/QueueVisualizerScreen";

export default function Page() {
  return (
    <QueueVisualizerScreen
      path="/topics/queues/deque/delete-front"
      title="Delete Front"
      blurb="Same as a normal dequeue."
      kind="deque"
      operation="dqDeleteFront"
      defaultData={[10, 20, 30, 40]}
      defaultParams={{}}
    />
  );
}
