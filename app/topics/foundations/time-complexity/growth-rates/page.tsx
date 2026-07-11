import { FoundationsVisualizerScreen } from "@/components/visualizer/FoundationsVisualizerScreen";

export default function Page() {
  return (
    <FoundationsVisualizerScreen
      path="/topics/foundations/time-complexity/growth-rates"
      title="Growth Rates"
      blurb="O(1) vs O(log n) vs O(n) vs O(n²) — a step-tile race."
      operation="fGrowthRates"
      defaultParams={{}}
    />
  );
}
