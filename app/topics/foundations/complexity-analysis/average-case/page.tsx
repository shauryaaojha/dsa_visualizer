import { FoundationsVisualizerScreen } from "@/components/visualizer/FoundationsVisualizerScreen";

export default function Page() {
  return (
    <FoundationsVisualizerScreen
      path="/topics/foundations/complexity-analysis/average-case"
      title="Average Case"
      blurb="Expected cost over typical inputs — Θ(n)."
      operation="fAverageCase"
      defaultParams={{}}
    />
  );
}
