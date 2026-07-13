import { HashVisualizerScreen } from "@/components/visualizer/HashVisualizerScreen";

export default function Page() {
  return (
    <HashVisualizerScreen
      path="/topics/hashing/collision-resolution/separate-chaining"
      title="Separate Chaining"
      blurb="Every slot owns a linked list — colliding keys simply join the chain."
      operation="chaining"
      defaultData={[22, 8, 15, 44, 29]}
      defaultParams={{ m: 7 }}
    />
  );
}
