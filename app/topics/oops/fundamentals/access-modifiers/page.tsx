import { OopsVisualizerScreen } from "@/components/visualizer/OopsVisualizerScreen";

export default function Page() {
  return (
    <OopsVisualizerScreen
      path="/topics/oops/fundamentals/access-modifiers"
      title="Access Modifiers"
      blurb="public / private / protected — encapsulation's enforcement."
      operation="accessModifiers"
    />
  );
}
