import { OopsVisualizerScreen } from "@/components/visualizer/OopsVisualizerScreen";

export default function Page() {
  return (
    <OopsVisualizerScreen
      path="/topics/oops/four-pillars/encapsulation"
      title="Encapsulation"
      blurb="Private data + guarded methods keep an object's invariants true."
      operation="encapsulation"
    />
  );
}
