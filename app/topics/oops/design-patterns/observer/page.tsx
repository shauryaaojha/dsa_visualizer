import { OopsVisualizerScreen } from "@/components/visualizer/OopsVisualizerScreen";

export default function Page() {
  return (
    <OopsVisualizerScreen
      path="/topics/oops/design-patterns/observer"
      title="Observer"
      blurb="publish() fans out to every subscriber; detach one and it's skipped."
      operation="observer"
    />
  );
}
