import { StackVisualizerScreen } from "@/components/visualizer/StackVisualizerScreen";

export default function Page() {
  return (
    <StackVisualizerScreen
      path="/topics/stacks/array-implementation/overflow-underflow"
      title="Overflow & Underflow"
      blurb="The two boundary failures of a fixed stack."
      operation="overflowUnderflow"
      defaultData={[10, 20, 30, 40]}
      defaultParams={{ value: 50, capacity: 6 }}
    />
  );
}
