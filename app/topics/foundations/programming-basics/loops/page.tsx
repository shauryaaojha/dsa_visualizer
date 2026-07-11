import { FoundationsVisualizerScreen } from "@/components/visualizer/FoundationsVisualizerScreen";

export default function Page() {
  return (
    <FoundationsVisualizerScreen
      path="/topics/foundations/programming-basics/loops"
      title="Loops"
      blurb="The program counter jumps backwards — that's a loop."
      operation="fLoops"
      defaultParams={{ value: 4 }}
    />
  );
}
