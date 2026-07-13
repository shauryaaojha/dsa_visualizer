import { OopsVisualizerScreen } from "@/components/visualizer/OopsVisualizerScreen";

export default function Page() {
  return (
    <OopsVisualizerScreen
      path="/topics/oops/advanced/static-and-final"
      title="static & final"
      blurb="One-per-class storage and write-once constants."
      operation="staticFinal"
    />
  );
}
