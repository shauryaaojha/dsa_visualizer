import { HashVisualizerScreen } from "@/components/visualizer/HashVisualizerScreen";

export default function Page() {
  return (
    <HashVisualizerScreen
      path="/topics/hashing/collision-resolution/quadratic-probing"
      title="Quadratic Probing"
      blurb="(h+i²) mod m — +1, +4, +9: square jumps leap over the clusters."
      operation="quadraticProbing"
      defaultData={[22, 8, 15, 29]}
      defaultParams={{ m: 7 }}
    />
  );
}
