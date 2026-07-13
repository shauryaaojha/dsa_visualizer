import { OopsVisualizerScreen } from "@/components/visualizer/OopsVisualizerScreen";

export default function Page() {
  return (
    <OopsVisualizerScreen
      path="/topics/oops/four-pillars/abstraction"
      title="Abstraction"
      blurb="Declare the WHAT on an abstract class; concrete subclasses supply the HOW."
      operation="abstraction"
    />
  );
}
