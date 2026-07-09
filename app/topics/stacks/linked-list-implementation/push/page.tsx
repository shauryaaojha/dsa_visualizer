import { StackVisualizerScreen } from "@/components/visualizer/StackVisualizerScreen";

export default function Page() {
  return (
    <StackVisualizerScreen
      path="/topics/stacks/linked-list-implementation/push"
      title="Push"
      blurb="node.next = top; top = node."
      operation="llPush"
      defaultData={[10, 20, 30]}
      defaultParams={{ value: 42 }}
    />
  );
}
