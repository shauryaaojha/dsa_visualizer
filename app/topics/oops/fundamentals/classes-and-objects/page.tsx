import { OopsVisualizerScreen } from "@/components/visualizer/OopsVisualizerScreen";

export default function Page() {
  return (
    <OopsVisualizerScreen
      path="/topics/oops/fundamentals/classes-and-objects"
      title="Classes & Objects"
      blurb="A class is a blueprint; new stamps independent objects onto the heap."
      operation="classesObjects"
    />
  );
}
