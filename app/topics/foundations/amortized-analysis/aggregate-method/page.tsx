import { FoundationsVisualizerScreen } from "@/components/visualizer/FoundationsVisualizerScreen";

export default function Page() {
  return (
    <FoundationsVisualizerScreen
      path="/topics/foundations/amortized-analysis/aggregate-method"
      title="Aggregate Method"
      blurb="Total over n ops ÷ n."
      operation="fAggregate"
      defaultParams={{}}
    />
  );
}
