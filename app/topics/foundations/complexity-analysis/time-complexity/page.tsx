import { FoundationsVisualizerScreen } from "@/components/visualizer/FoundationsVisualizerScreen";

export default function Page() {
  return (
    <FoundationsVisualizerScreen
      path="/topics/foundations/complexity-analysis/time-complexity"
      title="Time Complexity"
      blurb="T(n): steps as a FUNCTION of input size."
      operation="fTimeComplexity"
      defaultParams={{}}
    />
  );
}
