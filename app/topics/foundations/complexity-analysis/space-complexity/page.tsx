import { FoundationsVisualizerScreen } from "@/components/visualizer/FoundationsVisualizerScreen";

export default function Page() {
  return (
    <FoundationsVisualizerScreen
      path="/topics/foundations/complexity-analysis/space-complexity"
      title="Space Complexity"
      blurb="Count extra memory boxes, not seconds."
      operation="fSpaceComplexity"
      defaultParams={{}}
    />
  );
}
