import { FoundationsVisualizerScreen } from "@/components/visualizer/FoundationsVisualizerScreen";

export default function Page() {
  return (
    <FoundationsVisualizerScreen
      path="/topics/foundations/amortized-analysis/accounting-method"
      title="Accounting Method"
      blurb="Overcharge cheap ops; the bank pays spikes."
      operation="fAccounting"
      defaultParams={{}}
    />
  );
}
