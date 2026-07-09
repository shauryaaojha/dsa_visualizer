import { StackVisualizerScreen } from "@/components/visualizer/StackVisualizerScreen";

export default function Page() {
  return (
    <StackVisualizerScreen
      path="/topics/stacks/linked-list-implementation/pop"
      title="Pop"
      blurb="top = top.next; free the old node."
      operation="llPop"
      defaultData={[10, 20, 30, 40]}
      defaultParams={{}}
    />
  );
}
