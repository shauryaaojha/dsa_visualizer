import { FoundationsVisualizerScreen } from "@/components/visualizer/FoundationsVisualizerScreen";

export default function Page() {
  return (
    <FoundationsVisualizerScreen
      path="/topics/foundations/asymptotic-analysis/big-theta"
      title="Big-Θ (tight bound)"
      blurb="Sandwich: O and Ω of the same g."
      operation="fBigTheta"
      defaultParams={{}}
    />
  );
}
