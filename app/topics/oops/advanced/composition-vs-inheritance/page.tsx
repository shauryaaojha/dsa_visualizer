import { OopsVisualizerScreen } from "@/components/visualizer/OopsVisualizerScreen";

export default function Page() {
  return (
    <OopsVisualizerScreen
      path="/topics/oops/advanced/composition-vs-inheritance"
      title="Composition vs Inheritance"
      blurb="A Car HAS-A Engine (delegate) vs IS-A Vehicle (inherit)."
      operation="compositionVsInheritance"
    />
  );
}
