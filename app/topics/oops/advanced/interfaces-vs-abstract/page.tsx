import { OopsVisualizerScreen } from "@/components/visualizer/OopsVisualizerScreen";

export default function Page() {
  return (
    <OopsVisualizerScreen
      path="/topics/oops/advanced/interfaces-vs-abstract"
      title="Interfaces vs Abstract Classes"
      blurb="A pure contract vs a half-built base — and mixing in many contracts."
      operation="interfacesVsAbstract"
    />
  );
}
