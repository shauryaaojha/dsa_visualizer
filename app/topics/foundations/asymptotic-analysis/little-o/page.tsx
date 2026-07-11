import { FoundationsVisualizerScreen } from "@/components/visualizer/FoundationsVisualizerScreen";

export default function Page() {
  return (
    <FoundationsVisualizerScreen
      path="/topics/foundations/asymptotic-analysis/little-o"
      title="little-o (strict upper)"
      blurb="STRICTLY slower — f/g → 0."
      operation="fLittleO"
      defaultParams={{}}
    />
  );
}
