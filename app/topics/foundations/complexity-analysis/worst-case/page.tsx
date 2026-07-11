import { FoundationsVisualizerScreen } from "@/components/visualizer/FoundationsVisualizerScreen";

export default function Page() {
  return (
    <FoundationsVisualizerScreen
      path="/topics/foundations/complexity-analysis/worst-case"
      title="Worst Case"
      blurb="The guarantee — what the O(·) badges mean."
      operation="fWorstCase"
      defaultParams={{}}
    />
  );
}
