import { QueueVisualizerScreen } from "@/components/visualizer/QueueVisualizerScreen";

export default function Page() {
  return (
    <QueueVisualizerScreen
      path="/topics/queues/deque/delete-rear"
      title="Delete Rear"
      blurb="Remove from the back — deque only."
      kind="deque"
      operation="dqDeleteRear"
      defaultData={[10, 20, 30, 40]}
      defaultParams={{}}
    />
  );
}
