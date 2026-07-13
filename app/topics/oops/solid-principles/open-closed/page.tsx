import { OopsVisualizerScreen } from "@/components/visualizer/OopsVisualizerScreen";

export default function Page() {
  return (
    <OopsVisualizerScreen
      path="/topics/oops/solid-principles/open-closed"
      title="Open/Closed"
      blurb="Add a new shape without editing existing, tested code."
      operation="ocp"
    />
  );
}
