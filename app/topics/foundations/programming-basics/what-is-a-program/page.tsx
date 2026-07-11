import { FoundationsVisualizerScreen } from "@/components/visualizer/FoundationsVisualizerScreen";

export default function Page() {
  return (
    <FoundationsVisualizerScreen
      path="/topics/foundations/programming-basics/what-is-a-program"
      title="What is a Program?"
      blurb="Instructions → memory → output. That's all of it."
      operation="fWhatIsAProgram"
      defaultParams={{}}
    />
  );
}
