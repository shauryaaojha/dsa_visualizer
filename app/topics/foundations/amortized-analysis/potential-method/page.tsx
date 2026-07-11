import { FoundationsVisualizerScreen } from "@/components/visualizer/FoundationsVisualizerScreen";

export default function Page() {
  return (
    <FoundationsVisualizerScreen
      path="/topics/foundations/amortized-analysis/potential-method"
      title="Potential Method"
      blurb="Φ stores energy; spikes release it."
      operation="fPotential"
      defaultParams={{}}
    />
  );
}
