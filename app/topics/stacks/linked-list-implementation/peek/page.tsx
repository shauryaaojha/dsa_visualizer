import { StackVisualizerScreen } from "@/components/visualizer/StackVisualizerScreen";

export default function Page() {
  return (
    <StackVisualizerScreen
      path="/topics/stacks/linked-list-implementation/peek"
      title="Peek"
      blurb="Follow TOP and read — nothing changes."
      operation="llPeek"
      defaultData={[10, 20, 30]}
      defaultParams={{}}
    />
  );
}
