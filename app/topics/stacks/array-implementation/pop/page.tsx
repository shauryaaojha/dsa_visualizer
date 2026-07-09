import { StackVisualizerScreen } from "@/components/visualizer/StackVisualizerScreen";

export default function Page() {
  return (
    <StackVisualizerScreen
      path="/topics/stacks/array-implementation/pop"
      title="Pop"
      blurb="Read stack[top], then top−−."
      operation="pop"
      defaultData={[10, 20, 30, 40]}
      defaultParams={{ capacity: 6 }}
    />
  );
}
