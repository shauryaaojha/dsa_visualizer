import { LinkedListVisualizerScreen } from "@/components/visualizer/LinkedListVisualizerScreen";

export default function Page() {
  return (
    <LinkedListVisualizerScreen
      path="/topics/linked-list/applications/josephus-problem"
      title="Josephus Problem"
      blurb="Eliminate every k-th node around a circle."
      kind="circular"
      operation="josephus"
      defaultData={[1, 2, 3, 4, 5, 6, 7]}
      defaultParams={{ value: 3 }}
    />
  );
}
