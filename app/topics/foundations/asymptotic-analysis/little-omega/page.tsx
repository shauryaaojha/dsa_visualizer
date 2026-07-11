import { FoundationsVisualizerScreen } from "@/components/visualizer/FoundationsVisualizerScreen";

export default function Page() {
  return (
    <FoundationsVisualizerScreen
      path="/topics/foundations/asymptotic-analysis/little-omega"
      title="little-ω (strict lower)"
      blurb="STRICTLY faster — f/g → ∞."
      operation="fLittleOmega"
      defaultParams={{}}
    />
  );
}
