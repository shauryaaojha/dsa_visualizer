import { FoundationsVisualizerScreen } from "@/components/visualizer/FoundationsVisualizerScreen";

export default function Page() {
  return (
    <FoundationsVisualizerScreen
      path="/topics/foundations/complexity-analysis/best-case"
      title="Best Case"
      blurb="The luckiest input — Ω(1) for linear search."
      operation="fBestCase"
      defaultParams={{}}
    />
  );
}
