import { StackVisualizerScreen } from "@/components/visualizer/StackVisualizerScreen";

export default function Page() {
  return (
    <StackVisualizerScreen
      path="/topics/stacks/applications/balanced-parentheses"
      title="Balanced Parentheses"
      blurb="Openers wait; each closer must match the top."
      operation="balancedParens"
      defaultData={[]}
      defaultParams={{ text: "{[()()]}" }}
    />
  );
}
