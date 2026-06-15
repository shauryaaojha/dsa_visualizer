import { ArrayVisualizerScreen } from "@/components/visualizer/ArrayVisualizerScreen";

export default function Page() {
  return (
    <ArrayVisualizerScreen
      path="/topics/arrays/basic-operations/insertion"
      title="Insertion"
      blurb="Shift elements right to make room, then place the value — O(n)."
      operation="insert"
      defaultData={[8, 3, 17, 5, 12, 1, 9]}
      defaultParams={{ index: 3, value: 42 }}
    />
  );
}
