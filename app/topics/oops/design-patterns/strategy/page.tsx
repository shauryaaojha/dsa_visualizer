import { OopsVisualizerScreen } from "@/components/visualizer/OopsVisualizerScreen";

export default function Page() {
  return (
    <OopsVisualizerScreen
      path="/topics/oops/design-patterns/strategy"
      title="Strategy"
      blurb="Plug in an algorithm object and swap it at runtime — same call site."
      operation="strategy"
    />
  );
}
