import { FoundationsVisualizerScreen } from "@/components/visualizer/FoundationsVisualizerScreen";

export default function Page() {
  return (
    <FoundationsVisualizerScreen
      path="/topics/foundations/time-complexity/counting-steps"
      title="Counting Steps"
      blurb="Speed isn't seconds — it's how steps grow with input."
      operation="fCountingSteps"
      defaultParams={{}}
    />
  );
}
