import { FoundationsVisualizerScreen } from "@/components/visualizer/FoundationsVisualizerScreen";

export default function Page() {
  return (
    <FoundationsVisualizerScreen
      path="/topics/foundations/asymptotic-analysis/big-o"
      title="Big-O (upper bound)"
      blurb="Ceiling: f ≤ c·g beyond n₀."
      operation="fBigOBound"
      defaultParams={{}}
    />
  );
}
