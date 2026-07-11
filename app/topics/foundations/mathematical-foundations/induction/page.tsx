import { FoundationsVisualizerScreen } from "@/components/visualizer/FoundationsVisualizerScreen";

export default function Page() {
  return (
    <FoundationsVisualizerScreen
      path="/topics/foundations/mathematical-foundations/induction"
      title="Proof by Induction"
      blurb="Base + step = all n (dominoes)."
      operation="fInduction"
      defaultParams={{}}
    />
  );
}
