import { StackVisualizerScreen } from "@/components/visualizer/StackVisualizerScreen";

export default function Page() {
  return (
    <StackVisualizerScreen
      path="/topics/stacks/applications/postfix-evaluation"
      title="Postfix Evaluation"
      blurb="Numbers push; operators pop two, push one."
      operation="postfixEval"
      defaultData={[]}
      defaultParams={{ text: "5 3 + 8 2 - *" }}
    />
  );
}
