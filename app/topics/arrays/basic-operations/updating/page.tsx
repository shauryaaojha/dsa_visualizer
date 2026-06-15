import { ArrayVisualizerScreen } from "@/components/visualizer/ArrayVisualizerScreen";

export default function Page() {
  return (
    <ArrayVisualizerScreen
      path="/topics/arrays/basic-operations/updating"
      title="Updating"
      blurb="Direct address means overwriting a value in place is O(1)."
      operation="update"
      defaultData={[8, 3, 17, 5, 12, 1, 9, 14]}
      defaultParams={{ index: 4, value: 99 }}
    />
  );
}
