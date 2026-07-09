import { StackVisualizerScreen } from "@/components/visualizer/StackVisualizerScreen";

export default function Page() {
  return (
    <StackVisualizerScreen
      path="/topics/stacks/array-implementation/peek"
      title="Peek"
      blurb="Read the top without removing it."
      operation="peek"
      defaultData={[10, 20, 30]}
      defaultParams={{ capacity: 6 }}
    />
  );
}
