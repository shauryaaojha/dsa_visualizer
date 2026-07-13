import { HashVisualizerScreen } from "@/components/visualizer/HashVisualizerScreen";

export default function Page() {
  return (
    <HashVisualizerScreen
      path="/topics/hashing/hash-functions/multiplication-method"
      title="Multiplication Method"
      blurb="Multiply by Knuth's A ≈ 0.618, keep the fraction, scale to the table."
      operation="multiplicationMethod"
      defaultData={[15, 23, 88, 61]}
      defaultParams={{ m: 8 }}
    />
  );
}
