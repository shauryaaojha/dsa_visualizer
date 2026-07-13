import { OopsVisualizerScreen } from "@/components/visualizer/OopsVisualizerScreen";

export default function Page() {
  return (
    <OopsVisualizerScreen
      path="/topics/oops/design-patterns/decorator"
      title="Decorator"
      blurb="Sugar(Milk(Espresso())) — cost() cascades in, then accumulates back out."
      operation="decorator"
    />
  );
}
