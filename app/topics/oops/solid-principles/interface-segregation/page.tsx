import { OopsVisualizerScreen } from "@/components/visualizer/OopsVisualizerScreen";

export default function Page() {
  return (
    <OopsVisualizerScreen
      path="/topics/oops/solid-principles/interface-segregation"
      title="Interface Segregation"
      blurb="Split the fat Worker interface so a Robot isn't forced to eat()."
      operation="isp"
    />
  );
}
