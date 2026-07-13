import { OopsVisualizerScreen } from "@/components/visualizer/OopsVisualizerScreen";

export default function Page() {
  return (
    <OopsVisualizerScreen
      path="/topics/oops/fundamentals/this-and-references"
      title="this & References"
      blurb="A reference is a handle; many handles can share one object."
      operation="thisReferences"
    />
  );
}
