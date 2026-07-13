import { OopsVisualizerScreen } from "@/components/visualizer/OopsVisualizerScreen";

export default function Page() {
  return (
    <OopsVisualizerScreen
      path="/topics/oops/solid-principles/single-responsibility"
      title="Single Responsibility"
      blurb="One class, one reason to change — split the God class."
      operation="srp"
    />
  );
}
