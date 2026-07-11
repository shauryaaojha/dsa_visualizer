import { FoundationsVisualizerScreen } from "@/components/visualizer/FoundationsVisualizerScreen";

export default function Page() {
  return (
    <FoundationsVisualizerScreen
      path="/topics/foundations/time-complexity/big-o-notation"
      title="Big-O Notation"
      blurb="n + 2 → O(n): keep what grows, drop the rest."
      operation="fBigO"
      defaultParams={{}}
    />
  );
}
