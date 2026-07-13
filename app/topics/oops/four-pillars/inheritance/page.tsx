import { OopsVisualizerScreen } from "@/components/visualizer/OopsVisualizerScreen";

export default function Page() {
  return (
    <OopsVisualizerScreen
      path="/topics/oops/four-pillars/inheritance"
      title="Inheritance"
      blurb="A Dog IS-A Animal — it reuses the parent's fields and methods."
      operation="inheritance"
    />
  );
}
