import { StackVisualizerScreen } from "@/components/visualizer/StackVisualizerScreen";

export default function Page() {
  return (
    <StackVisualizerScreen
      path="/topics/stacks/array-implementation/push"
      title="Push"
      blurb="top++, then write at stack[top]."
      operation="push"
      defaultData={[10, 20, 30]}
      defaultParams={{ value: 42, capacity: 6 }}
    />
  );
}
