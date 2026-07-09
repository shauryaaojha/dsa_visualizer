import { StackVisualizerScreen } from "@/components/visualizer/StackVisualizerScreen";

export default function Page() {
  return (
    <StackVisualizerScreen
      path="/topics/stacks/applications/infix-to-postfix"
      title="Infix → Postfix"
      blurb="Shunting-yard: operators wait by precedence."
      operation="infixToPostfix"
      defaultData={[]}
      defaultParams={{ text: "a+b*(c-d)/e" }}
    />
  );
}
