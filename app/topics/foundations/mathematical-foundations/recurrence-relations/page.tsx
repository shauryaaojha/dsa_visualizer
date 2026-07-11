import { FoundationsVisualizerScreen } from "@/components/visualizer/FoundationsVisualizerScreen";

export default function Page() {
  return (
    <FoundationsVisualizerScreen
      path="/topics/foundations/mathematical-foundations/recurrence-relations"
      title="Recurrence Relations"
      blurb="Unroll T(n) = T(n/2) + 1 → O(log n)."
      operation="fRecurrence"
      defaultParams={{}}
    />
  );
}
