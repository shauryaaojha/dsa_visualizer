import { StackVisualizerScreen } from "@/components/visualizer/StackVisualizerScreen";

export default function Page() {
  return (
    <StackVisualizerScreen
      path="/topics/stacks/applications/recursion-stack"
      title="Recursion Stack"
      blurb="Call frames wind up, then unwind — fact(n)."
      operation="recursionStack"
      defaultData={[]}
      defaultParams={{ value: 4 }}
    />
  );
}
