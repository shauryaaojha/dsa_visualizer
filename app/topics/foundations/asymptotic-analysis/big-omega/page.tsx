import { FoundationsVisualizerScreen } from "@/components/visualizer/FoundationsVisualizerScreen";

export default function Page() {
  return (
    <FoundationsVisualizerScreen
      path="/topics/foundations/asymptotic-analysis/big-omega"
      title="Big-Ω (lower bound)"
      blurb="Floor: f ≥ c·g beyond n₀."
      operation="fBigOmega"
      defaultParams={{}}
    />
  );
}
