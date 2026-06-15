import { ArrayVisualizerScreen } from "@/components/visualizer/ArrayVisualizerScreen";

export default function Page() {
  return (
    <ArrayVisualizerScreen
      path="/topics/arrays/searching/linear-search"
      title="Linear Search"
      blurb="Scan left → right, comparing each element to the target — O(n)."
      operation="linearSearch"
      defaultData={[8, 3, 17, 5, 12, 1, 9, 14]}
      defaultParams={{ value: 12 }}
    />
  );
}
