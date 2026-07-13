import { HashVisualizerScreen } from "@/components/visualizer/HashVisualizerScreen";

export default function Page() {
  return (
    <HashVisualizerScreen
      path="/topics/hashing/hash-functions/division-method"
      title="Division Method"
      blurb="h(k) = k mod m — worked out as quotient and remainder, key by key."
      operation="divisionMethod"
      defaultData={[50, 700, 76, 85]}
      defaultParams={{ m: 7 }}
    />
  );
}
