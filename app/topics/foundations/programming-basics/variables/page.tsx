import { FoundationsVisualizerScreen } from "@/components/visualizer/FoundationsVisualizerScreen";

export default function Page() {
  return (
    <FoundationsVisualizerScreen
      path="/topics/foundations/programming-basics/variables"
      title="Variables"
      blurb="Labeled boxes; assignment overwrites, copies don't follow."
      operation="fVariables"
      defaultParams={{}}
    />
  );
}
