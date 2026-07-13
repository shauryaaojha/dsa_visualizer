import { HashVisualizerScreen } from "@/components/visualizer/HashVisualizerScreen";

export default function Page() {
  return (
    <HashVisualizerScreen
      path="/topics/hashing/hash-functions/folding-method"
      title="Folding Method"
      blurb="Chop a long key into digit groups, sum them, then mod m."
      operation="foldingMethod"
      defaultData={[123456, 987612, 20242]}
      defaultParams={{ m: 11 }}
    />
  );
}
