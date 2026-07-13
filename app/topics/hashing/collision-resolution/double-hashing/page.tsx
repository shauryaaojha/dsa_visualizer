import { HashVisualizerScreen } from "@/components/visualizer/HashVisualizerScreen";

export default function Page() {
  return (
    <HashVisualizerScreen
      path="/topics/hashing/collision-resolution/double-hashing"
      title="Double Hashing"
      blurb="(h₁ + i·h₂) mod m — every key gets its own probe stride from a second hash."
      operation="doubleHashing"
      defaultData={[22, 8, 15]}
      defaultParams={{ m: 7 }}
    />
  );
}
