import { ArrayVisualizerScreen } from "@/components/visualizer/ArrayVisualizerScreen";

export default function Page() {
  return (
    <ArrayVisualizerScreen
      path="/topics/arrays/advanced-array/two-pointer"
      title="Two Pointer"
      blurb="On a sorted array, converge two indices to find a pair sum in O(n). (value = target)"
      operation="twoPointer"
      defaultData={[1, 3, 4, 5, 7, 10, 11]}
      defaultParams={{ value: 15 }}
    />
  );
}
