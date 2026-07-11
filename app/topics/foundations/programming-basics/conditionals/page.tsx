import { FoundationsVisualizerScreen } from "@/components/visualizer/FoundationsVisualizerScreen";

export default function Page() {
  return (
    <FoundationsVisualizerScreen
      path="/topics/foundations/programming-basics/conditionals"
      title="Conditionals"
      blurb="A true/false question picks which lines run."
      operation="fConditionals"
      defaultParams={{ value: 15 }}
    />
  );
}
