import { OopsVisualizerScreen } from "@/components/visualizer/OopsVisualizerScreen";

export default function Page() {
  return (
    <OopsVisualizerScreen
      path="/topics/oops/fundamentals/constructors-destructors"
      title="Constructors & Destructors"
      blurb="Objects are built base → derived, and destroyed in reverse."
      operation="constructors"
    />
  );
}
