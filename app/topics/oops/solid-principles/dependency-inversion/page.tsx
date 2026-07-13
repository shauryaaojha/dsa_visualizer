import { OopsVisualizerScreen } from "@/components/visualizer/OopsVisualizerScreen";

export default function Page() {
  return (
    <OopsVisualizerScreen
      path="/topics/oops/solid-principles/dependency-inversion"
      title="Dependency Inversion"
      blurb="Introduce an interface and watch the dependency arrow flip."
      operation="dip"
    />
  );
}
