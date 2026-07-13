import { HashVisualizerScreen } from "@/components/visualizer/HashVisualizerScreen";

export default function Page() {
  return (
    <HashVisualizerScreen
      path="/topics/hashing/collision-resolution/linear-probing"
      title="Linear Probing"
      blurb="(h+i) mod m — step right until a slot is free, and watch the cluster grow."
      operation="linearProbing"
      defaultData={[22, 8, 15, 30, 12]}
      defaultParams={{ m: 7 }}
    />
  );
}
