import { ArrayVisualizerScreen } from "@/components/visualizer/ArrayVisualizerScreen";

export default function Page() {
  return (
    <ArrayVisualizerScreen
      path="/topics/arrays/patterns/container-most-water"
      title="Container With Most Water"
      blurb="Two pointers from the ends; move the shorter wall inward to maximise area (LeetCode #11)."
      operation="maxArea"
      defaultData={[1, 8, 6, 2, 5, 4, 8, 3, 7]}
    />
  );
}
